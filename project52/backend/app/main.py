from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, content_planning, data_aggregation, content_production, monetization, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="自媒体内容创作者运营工具箱",
    description="完整的自媒体运营平台，包含内容规划、数据聚合、内容生产、变现管理和成长分析等模块",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(content_planning.router)
app.include_router(data_aggregation.router)
app.include_router(content_production.router)
app.include_router(monetization.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {
        "message": "欢迎使用自媒体内容创作者运营工具箱",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            {"auth": "用户认证相关接口"},
            {"content-planning": "内容规划模块"},
            {"data-aggregation": "多平台数据聚合"},
            {"content-production": "内容生产辅助"},
            {"monetization": "变现管理"},
            {"analytics": "成长分析"}
        ]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
