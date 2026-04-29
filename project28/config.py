class Config:
    STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']
    
    WEBSOCKET_PORT = 8765
    BOKEH_PORT = 5006
    
    INITIAL_PRICE = {
        'AAPL': 175.0,
        'GOOGL': 140.0,
        'MSFT': 380.0,
        'AMZN': 155.0,
        'TSLA': 170.0
    }
    
    UPDATE_INTERVAL_MS = 100
    
    MAX_DATA_POINTS = 1000
    
    AGGREGATION_WINDOW_SECONDS = {
        '1s': 1,
        '5s': 5,
        '15s': 15,
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '1h': 3600
    }
    
    DEFAULT_AGGREGATION = '1s'
    
    TEST_DURATION_SECONDS = 3600
    
    MEMORY_CHECK_INTERVAL_SECONDS = 60
    
    MAX_ALLOWED_MEMORY_MB = 500
