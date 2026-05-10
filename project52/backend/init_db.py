from app.database import Base, engine
from app import models

print("正在创建数据库表...")

Base.metadata.create_all(bind=engine)

print("数据库表创建完成！")
