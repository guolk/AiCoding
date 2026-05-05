import sys
import os
import asyncio

if not hasattr(asyncio, 'current_task'):
    def _current_task(loop=None):
        if loop is None:
            loop = asyncio.get_event_loop()
        return asyncio.Task.current_task(loop)
    asyncio.current_task = _current_task

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import init_db

print("正在初始化数据库...")
init_db()
print("数据库初始化完成")

print("启动服务器，访问 http://localhost:8000/api/docs 查看 API 文档")

import uvicorn

config = uvicorn.Config(
    "main:app",
    host="0.0.0.0",
    port=8000,
    log_level="info"
)
server = uvicorn.Server(config)

loop = asyncio.get_event_loop()
try:
    loop.run_until_complete(server.serve())
except KeyboardInterrupt:
    print("\n服务器已停止")
