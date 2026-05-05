from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import auth, questions, papers, exams, submissions, grading, analytics

app = FastAPI(
    title="在线考试系统 API",
    description="支持多种题型、自动评分、防作弊的在线考试系统",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["认证"])
app.include_router(questions.router, prefix="/api", tags=["题目管理"])
app.include_router(papers.router, prefix="/api", tags=["试卷管理"])
app.include_router(exams.router, prefix="/api", tags=["考试管理"])
app.include_router(submissions.router, prefix="/api", tags=["答题提交"])
app.include_router(grading.router, prefix="/api", tags=["评分管理"])
app.include_router(analytics.router, prefix="/api", tags=["成绩分析"])


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/")
async def root():
    return {
        "name": "在线考试系统",
        "version": "1.0.0",
        "docs": "/api/docs"
    }



