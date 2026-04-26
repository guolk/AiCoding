import sys
import asyncio
sys.path.insert(0, '.')

from app.main import app

if __name__ == '__main__':
    import uvicorn
    
    config = uvicorn.Config(app, host='0.0.0.0', port=8000)
    server = uvicorn.Server(config)
    
    if hasattr(asyncio, 'run'):
        asyncio.run(server.serve())
    else:
        loop = asyncio.get_event_loop()
        try:
            loop.run_until_complete(server.serve())
        finally:
            loop.close()
