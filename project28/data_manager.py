from collections import deque
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Deque
import pandas as pd
from config import Config


class RollingWindowBuffer:
    def __init__(self, max_size: int = Config.MAX_DATA_POINTS):
        self.max_size = max_size
        self._buffer: Dict[str, Deque] = {}
        
        for symbol in Config.STOCK_SYMBOLS:
            self._buffer[symbol] = deque(maxlen=max_size)
    
    def add(self, symbol: str, data: dict) -> None:
        if symbol not in self._buffer:
            self._buffer[symbol] = deque(maxlen=self.max_size)
        self._buffer[symbol].append(data)
    
    def get_all(self, symbol: str) -> List[dict]:
        return list(self._buffer.get(symbol, []))
    
    def get_length(self, symbol: str) -> int:
        return len(self._buffer.get(symbol, []))
    
    def is_full(self, symbol: str) -> bool:
        return len(self._buffer.get(symbol, [])) >= self.max_size
    
    def get_latest(self, symbol: str) -> Optional[dict]:
        buffer = self._buffer.get(symbol)
        if buffer:
            return buffer[-1]
        return None
    
    def get_column(self, symbol: str, column: str) -> List:
        return [item[column] for item in self._buffer.get(symbol, []) if column in item]


class CandleData:
    def __init__(self, timestamp: datetime, open_price: float):
        self.timestamp = timestamp
        self.open = open_price
        self.high = open_price
        self.low = open_price
        self.close = open_price
        self.volume = 0
        self.count = 0
    
    def update(self, price: float, volume: int) -> None:
        self.high = max(self.high, price)
        self.low = min(self.low, price)
        self.close = price
        self.volume += volume
        self.count += 1
    
    def to_dict(self) -> dict:
        return {
            'timestamp': self.timestamp,
            'open': round(self.open, 4),
            'high': round(self.high, 4),
            'low': round(self.low, 4),
            'close': round(self.close, 4),
            'volume': self.volume,
            'count': self.count
        }


class DataAggregator:
    def __init__(self, window_seconds: int = 1):
        self.window_seconds = window_seconds
        self._current_candles: Dict[str, CandleData] = {}
        self._aggregated_buffer: Dict[str, Deque] = {}
        self._window_start: Dict[str, datetime] = {}
        self.max_candles = Config.MAX_DATA_POINTS
        
        for symbol in Config.STOCK_SYMBOLS:
            self._aggregated_buffer[symbol] = deque(maxlen=self.max_candles)
    
    def set_window_seconds(self, window_seconds: int) -> None:
        self.window_seconds = window_seconds
        self._current_candles.clear()
        self._window_start.clear()
    
    def _get_window_start(self, timestamp: datetime, symbol: str) -> datetime:
        seconds = int(timestamp.timestamp())
        window_start_seconds = (seconds // self.window_seconds) * self.window_seconds
        return datetime.fromtimestamp(window_start_seconds)
    
    def add_tick(self, symbol: str, timestamp: datetime, price: float, volume: int) -> Optional[dict]:
        window_start = self._get_window_start(timestamp, symbol)
        
        if symbol not in self._current_candles or symbol not in self._window_start:
            self._current_candles[symbol] = CandleData(window_start, price)
            self._window_start[symbol] = window_start
            self._current_candles[symbol].update(price, volume)
            return None
        
        if window_start != self._window_start[symbol]:
            completed_candle = self._current_candles[symbol].to_dict()
            
            if symbol not in self._aggregated_buffer:
                self._aggregated_buffer[symbol] = deque(maxlen=self.max_candles)
            self._aggregated_buffer[symbol].append(completed_candle)
            
            self._current_candles[symbol] = CandleData(window_start, price)
            self._window_start[symbol] = window_start
            self._current_candles[symbol].update(price, volume)
            
            return completed_candle
        else:
            self._current_candles[symbol].update(price, volume)
            return None
    
    def get_all_aggregated(self, symbol: str) -> List[dict]:
        result = list(self._aggregated_buffer.get(symbol, []))
        if symbol in self._current_candles and self._current_candles[symbol].count > 0:
            result.append(self._current_candles[symbol].to_dict())
        return result
    
    def get_aggregated_length(self, symbol: str) -> int:
        length = len(self._aggregated_buffer.get(symbol, []))
        if symbol in self._current_candles and self._current_candles[symbol].count > 0:
            length += 1
        return length
    
    def get_current_candle(self, symbol: str) -> Optional[dict]:
        if symbol in self._current_candles and self._current_candles[symbol].count > 0:
            return self._current_candles[symbol].to_dict()
        return None


class OptimizedDataManager:
    def __init__(self, max_points: int = Config.MAX_DATA_POINTS):
        self.rolling_buffer = RollingWindowBuffer(max_points)
        self.aggregator = DataAggregator(window_seconds=1)
        self._max_points = max_points
    
    def set_aggregation_window(self, window_seconds: int) -> None:
        self.aggregator.set_window_seconds(window_seconds)
    
    def add_tick(self, symbol: str, tick_data: dict) -> tuple:
        self.rolling_buffer.add(symbol, tick_data)
        
        timestamp = tick_data['timestamp']
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp)
        
        completed_candle = self.aggregator.add_tick(
            symbol,
            timestamp,
            tick_data['price'],
            tick_data['volume']
        )
        
        is_rolling_full = self.rolling_buffer.is_full(symbol)
        
        return completed_candle, is_rolling_full
    
    def get_raw_data_for_stream(self, symbol: str) -> dict:
        buffer = self.rolling_buffer.get_all(symbol)
        if not buffer:
            return {
                'timestamp': [],
                'price': [],
                'volume': [],
                'bid': [],
                'ask': []
            }
        
        return {
            'timestamp': [item['timestamp'] for item in buffer],
            'price': [item['price'] for item in buffer],
            'volume': [item['volume'] for item in buffer],
            'bid': [item['bid'] for item in buffer],
            'ask': [item['ask'] for item in buffer]
        }
    
    def get_candle_data_for_stream(self, symbol: str) -> dict:
        candles = self.aggregator.get_all_aggregated(symbol)
        if not candles:
            return {
                'timestamp': [],
                'open': [],
                'high': [],
                'low': [],
                'close': [],
                'volume': []
            }
        
        return {
            'timestamp': [c['timestamp'] for c in candles],
            'open': [c['open'] for c in candles],
            'high': [c['high'] for c in candles],
            'low': [c['low'] for c in candles],
            'close': [c['close'] for c in candles],
            'volume': [c['volume'] for c in candles]
        }
    
    def get_latest_price(self, symbol: str) -> Optional[float]:
        latest = self.rolling_buffer.get_latest(symbol)
        if latest:
            return latest['price']
        return None
    
    def get_raw_data_length(self, symbol: str) -> int:
        return self.rolling_buffer.get_length(symbol)
    
    def get_candle_data_length(self, symbol: str) -> int:
        return self.aggregator.get_aggregated_length(symbol)
