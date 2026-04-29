import asyncio
import websockets
import json
import threading
import time
from datetime import datetime
from bokeh.layouts import column, row
from bokeh.models import (
    ColumnDataSource, DatetimeTickFormatter, HoverTool, Div,
    Select, Button, TextInput, Span
)
from bokeh.plotting import figure, curdoc
from bokeh.models.widgets import Tabs, Panel
from bokeh.events import ButtonClick
from data_manager import OptimizedDataManager
from config import Config


class OptimizedStockDashboard:
    def __init__(self):
        self.data_manager = OptimizedDataManager(max_points=Config.MAX_DATA_POINTS)
        
        self.raw_data_sources = {}
        self.candle_data_sources = {}
        self.latest_prices = {}
        
        for symbol in Config.STOCK_SYMBOLS:
            self.raw_data_sources[symbol] = ColumnDataSource(data={
                'timestamp': [],
                'price': [],
                'volume': [],
                'bid': [],
                'ask': []
            })
            self.candle_data_sources[symbol] = ColumnDataSource(data={
                'timestamp': [],
                'open': [],
                'high': [],
                'low': [],
                'close': [],
                'volume': []
            })
            self.latest_prices[symbol] = Config.INITIAL_PRICE[symbol]
        
        self.websocket_thread = None
        self.message_queue = asyncio.Queue()
        
        self.current_aggregation = Config.DEFAULT_AGGREGATION
        self.show_raw_data = True
        
        self.stats = {
            'updates_count': 0,
            'start_time': time.time(),
            'last_memory_check': time.time()
        }
        
        self.pending_raw_updates = {}
        self.pending_candle_updates = {}
        for symbol in Config.STOCK_SYMBOLS:
            self.pending_raw_updates[symbol] = []
            self.pending_candle_updates[symbol] = []
    
    def create_raw_price_plots(self):
        plots = []
        for symbol in Config.STOCK_SYMBOLS:
            p = figure(
                title=f'{symbol} - Real-time Tick Price (Streaming)',
                x_axis_type='datetime',
                width=900,
                height=300,
                tools='pan,box_zoom,reset,save,wheel_zoom'
            )
            
            p.line(
                x='timestamp', y='price',
                source=self.raw_data_sources[symbol],
                line_width=1.5, color='#1f77b4', legend_label='Price',
                name='price_line'
            )
            
            p.circle(
                x='timestamp', y='price',
                source=self.raw_data_sources[symbol],
                size=3, color='#ff7f0e', alpha=0.6, legend_label='Ticks'
            )
            
            hover = HoverTool(
                tooltips=[
                    ('Time', '@timestamp{%H:%M:%S.%3f}'),
                    ('Price', '@price{0.0000}'),
                    ('Volume', '@volume'),
                    ('Bid', '@bid{0.0000}'),
                    ('Ask', '@ask{0.0000}')
                ],
                formatters={'@timestamp': 'datetime'},
                mode='vline'
            )
            p.add_tools(hover)
            
            p.xaxis.formatter = DatetimeTickFormatter(
                seconds="%H:%M:%S",
                minutes="%H:%M:%S",
                hours="%H:%M:%S",
                days="%H:%M:%S"
            )
            p.legend.location = 'top_left'
            p.xaxis.axis_label = 'Time'
            p.yaxis.axis_label = 'Price'
            p.toolbar.autohide = True
            
            plots.append(p)
        
        return plots
    
    def create_candlestick_plots(self):
        plots = []
        for symbol in Config.STOCK_SYMBOLS:
            p = figure(
                title=f'{symbol} - Candlestick Chart (Aggregated)',
                x_axis_type='datetime',
                width=900,
                height=350,
                tools='pan,box_zoom,reset,save,wheel_zoom'
            )
            
            source = self.candle_data_sources[symbol]
            
            inc = lambda data: data['close'] >= data['open']
            dec = lambda data: data['close'] < data['open']
            
            p.segment(
                x0='timestamp', y0='high', x1='timestamp', y1='low',
                source=source, color='black', line_width=1
            )
            
            bar_width = self._get_bar_width()
            
            p.vbar(
                x='timestamp', width=bar_width, top='open', bottom='close',
                source=source,
                fill_color='#2ca02c', line_color='black',
                legend_label='Bullish',
                name='bullish_bars'
            )
            
            p.vbar(
                x='timestamp', width=bar_width, top='close', bottom='open',
                source=source,
                fill_color='#d62728', line_color='black',
                legend_label='Bearish',
                name='bearish_bars'
            )
            
            p.line(
                x='timestamp', y='close',
                source=source,
                line_width=1, color='#1f77b4', alpha=0.5,
                legend_label='Close'
            )
            
            hover = HoverTool(
                tooltips=[
                    ('Time', '@timestamp{%H:%M:%S}'),
                    ('Open', '@open{0.0000}'),
                    ('High', '@high{0.0000}'),
                    ('Low', '@low{0.0000}'),
                    ('Close', '@close{0.0000}'),
                    ('Volume', '@volume')
                ],
                formatters={'@timestamp': 'datetime'},
                mode='vline'
            )
            p.add_tools(hover)
            
            p.xaxis.formatter = DatetimeTickFormatter(
                seconds="%H:%M:%S",
                minutes="%H:%M:%S",
                hours="%H:%M:%S",
                days="%H:%M:%S"
            )
            p.legend.location = 'top_left'
            p.xaxis.axis_label = 'Time'
            p.yaxis.axis_label = 'Price'
            p.toolbar.autohide = True
            
            plots.append(p)
        
        return plots
    
    def _get_bar_width(self):
        window_seconds = Config.AGGREGATION_WINDOW_SECONDS.get(self.current_aggregation, 1)
        return window_seconds * 1000 * 0.6
    
    def create_info_panel(self):
        info_divs = []
        for symbol in Config.STOCK_SYMBOLS:
            price = self.latest_prices.get(symbol, Config.INITIAL_PRICE[symbol])
            div = Div(
                text=f"<h3 style='color: #1f77b4; margin: 0;'>{symbol}</h3>"
                     f"<p style='font-size: 18px; font-weight: bold; margin: 0;'>${price:.4f}</p>",
                width=120,
                height=60
            )
            info_divs.append(div)
        return row(*info_divs)
    
    def create_control_panel(self):
        aggregation_select = Select(
            title='Aggregation Window:',
            value=Config.DEFAULT_AGGREGATION,
            options=list(Config.AGGREGATION_WINDOW_SECONDS.keys()),
            width=150
        )
        aggregation_select.on_change('value', self.on_aggregation_change)
        
        stats_div = Div(
            text="<h4>Performance Stats:</h4>"
                 "<p>Updates: 0</p>"
                 "<p>Raw Data Points: 0</p>"
                 "<p>Candles: 0</p>"
                 "<p>Uptime: 0s</p>",
            width=200,
            height=100
        )
        
        return row(
            aggregation_select,
            stats_div,
            sizing_mode='fixed'
        )
    
    def on_aggregation_change(self, attr, old, new):
        self.current_aggregation = new
        window_seconds = Config.AGGREGATION_WINDOW_SECONDS[new]
        self.data_manager.set_aggregation_window(window_seconds)
        
        for symbol in Config.STOCK_SYMBOLS:
            candle_data = self.data_manager.get_candle_data_for_stream(symbol)
            self.candle_data_sources[symbol].data = candle_data
    
    async def connect_websocket(self):
        uri = f"ws://localhost:{Config.WEBSOCKET_PORT}"
        try:
            async with websockets.connect(uri) as websocket:
                while True:
                    message = await websocket.recv()
                    await self.message_queue.put(json.loads(message))
        except Exception as e:
            print(f"WebSocket connection error: {e}")
    
    def start_websocket_thread(self):
        def run_async_loop():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.connect_websocket())
        
        self.websocket_thread = threading.Thread(target=run_async_loop, daemon=True)
        self.websocket_thread.start()
    
    def process_messages(self):
        while not self.message_queue.empty():
            try:
                tick = self.message_queue.get_nowait()
                symbol = tick['symbol']
                
                timestamp = datetime.fromisoformat(tick['timestamp'])
                tick_data = {
                    'timestamp': timestamp,
                    'price': tick['price'],
                    'volume': tick['volume'],
                    'bid': tick['bid'],
                    'ask': tick['ask']
                }
                
                completed_candle, is_full = self.data_manager.add_tick(symbol, tick_data)
                
                self.pending_raw_updates[symbol].append(tick_data)
                
                if completed_candle:
                    self.pending_candle_updates[symbol].append(completed_candle)
                
                self.latest_prices[symbol] = tick['price']
                self.stats['updates_count'] += 1
                
            except asyncio.QueueEmpty:
                break
    
    def update_plots(self):
        self.process_messages()
        
        for symbol in Config.STOCK_SYMBOLS:
            if self.pending_raw_updates[symbol]:
                updates = self.pending_raw_updates[symbol]
                stream_data = {
                    'timestamp': [u['timestamp'] for u in updates],
                    'price': [u['price'] for u in updates],
                    'volume': [u['volume'] for u in updates],
                    'bid': [u['bid'] for u in updates],
                    'ask': [u['ask'] for u in updates]
                }
                
                self.raw_data_sources[symbol].stream(
                    stream_data,
                    rollover=Config.MAX_DATA_POINTS
                )
                
                self.pending_raw_updates[symbol] = []
            
            if self.pending_candle_updates[symbol]:
                updates = self.pending_candle_updates[symbol]
                stream_data = {
                    'timestamp': [u['timestamp'] for u in updates],
                    'open': [u['open'] for u in updates],
                    'high': [u['high'] for u in updates],
                    'low': [u['low'] for u in updates],
                    'close': [u['close'] for u in updates],
                    'volume': [u['volume'] for u in updates]
                }
                
                self.candle_data_sources[symbol].stream(
                    stream_data,
                    rollover=Config.MAX_DATA_POINTS
                )
                
                self.pending_candle_updates[symbol] = []
            
            current_candle = self.data_manager.aggregator.get_current_candle(symbol)
            if current_candle:
                candle_len = self.data_manager.get_candle_data_length(symbol)
                if candle_len > 0:
                    existing_data = self.candle_data_sources[symbol].data
                    if existing_data['timestamp']:
                        last_idx = len(existing_data['timestamp']) - 1
                        last_time = existing_data['timestamp'][last_idx]
                        
                        if isinstance(last_time, datetime):
                            last_ts = last_time
                        else:
                            last_ts = datetime.fromtimestamp(last_time / 1000)
                        
                        current_ts = current_candle['timestamp']
                        
                        if last_ts == current_ts:
                            updated_data = dict(existing_data)
                            updated_data['open'][last_idx] = current_candle['open']
                            updated_data['high'][last_idx] = current_candle['high']
                            updated_data['low'][last_idx] = current_candle['low']
                            updated_data['close'][last_idx] = current_candle['close']
                            updated_data['volume'][last_idx] = current_candle['volume']
                            self.candle_data_sources[symbol].data = updated_data
    
    def get_stats_text(self):
        uptime = int(time.time() - self.stats['start_time'])
        hours = uptime // 3600
        minutes = (uptime % 3600) // 60
        seconds = uptime % 60
        
        sample_symbol = Config.STOCK_SYMBOLS[0]
        raw_count = self.data_manager.get_raw_data_length(sample_symbol)
        candle_count = self.data_manager.get_candle_data_length(sample_symbol)
        
        return (
            f"<h4>Performance Stats:</h4>"
            f"<p>Total Updates: {self.stats['updates_count']:,}</p>"
            f"<p>Raw Data Points: {raw_count:,} (rolling @ {Config.MAX_DATA_POINTS:,})</p>"
            f"<p>Candles ({self.current_aggregation}): {candle_count:,}</p>"
            f"<p>Uptime: {hours}h {minutes}m {seconds}s</p>"
            f"<p style='color: #2ca02c; font-weight: bold;'>Mode: Streaming + Rolling Window</p>"
        )


dashboard = OptimizedStockDashboard()
dashboard.start_websocket_thread()

raw_plots = dashboard.create_raw_price_plots()
candle_plots = dashboard.create_candlestick_plots()
info_panel = dashboard.create_info_panel()
control_panel = dashboard.create_control_panel()

raw_tab = Panel(child=column(*raw_plots), title="Raw Tick Data (Streaming)")
candle_tab = Panel(child=column(*candle_plots), title="Candlestick (Aggregated)")
tabs = Tabs(tabs=[raw_tab, candle_tab])

header = Div(
    text="<h1 style='color: #1f77b4; margin-bottom: 5px;'>Optimized Real-time Stock Dashboard</h1>"
         "<p style='color: #2ca02c; font-size: 14px;'>"
         "Features: Rolling Window, Stream Updates, Data Aggregation</p>",
    width=900
)

layout = column(
    header,
    control_panel,
    info_panel,
    tabs,
    sizing_mode='fixed'
)

curdoc().add_root(layout)
curdoc().title = "Optimized Stock Dashboard"

curdoc().add_periodic_callback(dashboard.update_plots, 50)
