import asyncio
import websockets
import json
import threading
from datetime import datetime
from bokeh.layouts import column, row
from bokeh.models import ColumnDataSource, DatetimeTickFormatter, HoverTool, Div
from bokeh.plotting import figure, curdoc
from bokeh.models.widgets import Select, TextInput
from config import Config


class NaiveStockDashboard:
    def __init__(self):
        self.data_sources = {}
        self.plots = {}
        self.latest_prices = {}
        
        for symbol in Config.STOCK_SYMBOLS:
            self.data_sources[symbol] = ColumnDataSource(data={
                'timestamp': [],
                'price': [],
                'volume': [],
                'bid': [],
                'ask': []
            })
            self.latest_prices[symbol] = Config.INITIAL_PRICE[symbol]
        
        self.websocket_thread = None
        self.message_queue = asyncio.Queue()
        
    def create_plots(self):
        plots = []
        for symbol in Config.STOCK_SYMBOLS:
            p = figure(
                title=f'{symbol} - Real-time Price',
                x_axis_type='datetime',
                width=800,
                height=300,
                tools='pan,box_zoom,reset,save'
            )
            
            p.line(
                x='timestamp', y='price',
                source=self.data_sources[symbol],
                line_width=2, color='blue', legend_label='Price'
            )
            
            p.circle(
                x='timestamp', y='price',
                source=self.data_sources[symbol],
                size=4, color='red', alpha=0.5
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
                hours="%H:%M:%S"
            )
            p.legend.location = 'top_left'
            p.xaxis.axis_label = 'Time'
            p.yaxis.axis_label = 'Price'
            
            plots.append(p)
            self.plots[symbol] = p
        
        return plots
    
    def create_info_panel(self):
        info_divs = []
        for symbol in Config.STOCK_SYMBOLS:
            div = Div(
                text=f"<h3>{symbol}: ${self.latest_prices[symbol]:.4f}</h3>",
                width=200,
                height=50
            )
            info_divs.append(div)
        return row(*info_divs)
    
    async def connect_websocket(self):
        uri = f"ws://localhost:{Config.WEBSOCKET_PORT}"
        async with websockets.connect(uri) as websocket:
            while True:
                message = await websocket.recv()
                await self.message_queue.put(json.loads(message))
    
    def start_websocket_thread(self):
        def run_async_loop():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.connect_websocket())
        
        self.websocket_thread = threading.Thread(target=run_async_loop, daemon=True)
        self.websocket_thread.start()
    
    def update_data(self):
        while not self.message_queue.empty():
            try:
                tick = self.message_queue.get_nowait()
                symbol = tick['symbol']
                
                timestamp = datetime.fromisoformat(tick['timestamp'])
                new_data = {
                    'timestamp': [timestamp],
                    'price': [tick['price']],
                    'volume': [tick['volume']],
                    'bid': [tick['bid']],
                    'ask': [tick['ask']]
                }
                
                existing_data = self.data_sources[symbol].data
                
                updated_data = {
                    'timestamp': list(existing_data['timestamp']) + new_data['timestamp'],
                    'price': list(existing_data['price']) + new_data['price'],
                    'volume': list(existing_data['volume']) + new_data['volume'],
                    'bid': list(existing_data['bid']) + new_data['bid'],
                    'ask': list(existing_data['ask']) + new_data['ask']
                }
                
                self.data_sources[symbol].data = updated_data
                
                self.latest_prices[symbol] = tick['price']
                
                print(f"[{symbol}] Data points: {len(updated_data['timestamp'])} - "
                      f"Memory: This approach will cause OOM at scale!")
                      
            except asyncio.QueueEmpty:
                break


dashboard = NaiveStockDashboard()
dashboard.start_websocket_thread()

plots = dashboard.create_plots()
info_panel = dashboard.create_info_panel()

layout = column(
    Div(text="<h1>Naive Stock Dashboard (Full Push - For Comparison)</h1>"),
    Div(text="<p style='color: red;'>WARNING: This version uses FULL data push and will cause memory issues!</p>"),
    info_panel,
    *plots
)

curdoc().add_root(layout)
curdoc().title = "Naive Stock Dashboard"
curdoc().add_periodic_callback(dashboard.update_data, 50)
