from fastapi import FastAPI, Depends, HTTPException, Query, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from .database import get_db, init_db
from . import crud, schemas

app = FastAPI(title="轻量级个人博客系统")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "dist")
INDEX_HTML = os.path.join(STATIC_DIR, "index.html")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/")
    async def root():
        if os.path.exists(INDEX_HTML):
            return FileResponse(INDEX_HTML)
        return JSONResponse({"message": "API服务运行中"})

    @app.get("/favicon.ico")
    async def favicon():
        favicon_path = os.path.join(STATIC_DIR, "favicon.ico")
        if os.path.exists(favicon_path):
            return FileResponse(favicon_path)
        return JSONResponse({"error": "Not found"}, status_code=404)

    @app.get("/article/{article_id}")
    async def article_page(article_id: int):
        if os.path.exists(INDEX_HTML):
            return FileResponse(INDEX_HTML)
        return JSONResponse({"message": "API服务运行中"})

    @app.get("/tags")
    async def tags_page():
        if os.path.exists(INDEX_HTML):
            return FileResponse(INDEX_HTML)
        return JSONResponse({"message": "API服务运行中"})

    @app.get("/tag/{tag_name}")
    async def tag_page(tag_name: str):
        if os.path.exists(INDEX_HTML):
            return FileResponse(INDEX_HTML)
        return JSONResponse({"message": "API服务运行中"})


@app.on_event("startup")
def startup_event():
    init_db()


@app.post("/api/articles/", response_model=schemas.Article)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    return crud.create_article(db=db, article=article)


@app.get("/api/articles/", response_model=schemas.PaginatedResponse)
def read_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    tag: Optional[str] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    articles = crud.get_articles(db, skip=skip, limit=page_size, tag=tag, keyword=keyword)
    total = crud.get_articles_count(db, tag=tag, keyword=keyword)
    total_pages = (total + page_size - 1) // page_size
    
    return schemas.PaginatedResponse(
        items=articles,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@app.get("/api/articles/{article_id}", response_model=schemas.Article)
def read_article(article_id: int, db: Session = Depends(get_db)):
    db_article = crud.get_article(db, article_id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return db_article


@app.put("/api/articles/{article_id}", response_model=schemas.Article)
def update_article(article_id: int, article: schemas.ArticleUpdate, db: Session = Depends(get_db)):
    db_article = crud.update_article(db, article_id=article_id, article=article)
    if db_article is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return db_article


@app.delete("/api/articles/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    success = crud.delete_article(db, article_id=article_id)
    if not success:
        raise HTTPException(status_code=404, detail="文章不存在")
    return {"message": "删除成功"}


@app.get("/api/tags/", response_model=List[dict])
def read_tags(db: Session = Depends(get_db)):
    return crud.get_tag_with_count(db)


@app.post("/api/tags/")
def create_tag(name: str = Body(..., embed=True), db: Session = Depends(get_db)):
    tag = crud.create_tag(db, name)
    if not tag:
        raise HTTPException(status_code=400, detail="标签已存在")
    return {"message": "创建成功", "tag": {"id": tag.id, "name": tag.name}}


@app.delete("/api/tags/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    success = crud.delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=400, detail="标签不存在或存在关联文章")
    return {"message": "删除成功"}
