import asyncio
import websockets
import json
import numpy as np
from datetime import datetime
from config import Config


class StockDataSimulator:
    def __init__(self):
        self.current_prices = Config.INITIAL_PRICE.copy()
        self.volatility = 0.002
    
    def generate_tick(self, symbol):
        current_price = self.current_prices[symbol]
        change = np.random.normal(0, self.volatility) * current_price
        new_price = current_price + change
        
        bid = new_price * (1 - np.random.uniform(0.0001, 0.0005))
        ask = new_price * (1 + np.random.uniform(0.0001, 0.0005))
        volume = int(np.random.exponential(1000))
        
        self.current_prices[symbol] = new_price
        
        return {
            'symbol': symbol,
            'timestamp': datetime.now().isoformat(),
            'price': round(new_price, 4),
            'bid': round(bid, 4),
            'ask': round(ask, 4),
            'volume': volume,
            'price_change': round(change, 4),
            'price_change_percent': round(change / current_price * 100, 6)
        }
    
    def generate_all_ticks(self):
        ticks = []
        for symbol in Config.STOCK_SYMBOLS:
            ticks.append(self.generate_tick(symbol))
        return ticks


async def handle_connection(websocket):
    print(f"New client connected: {websocket.remote_address}")
    simulator = StockDataSimulator()
    
    try:
        while True:
            ticks = simulator.generate_all_ticks()
            for tick in ticks:
                await websocket.send(json.dumps(tick))
            await asyncio.sleep(Config.UPDATE_INTERVAL_MS / 1000)
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")


async def main():
    server = await websockets.serve(
        handle_connection, 
        "localhost", 
        Config.WEBSOCKET_PORT
    )
    print(f"WebSocket server running on ws://localhost:{Config.WEBSOCKET_PORT}")
    await server.wait_closed()


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    finally:
        loop.close()
