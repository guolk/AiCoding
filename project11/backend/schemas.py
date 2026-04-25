from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ArticleBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    is_pinned: bool = False


class ArticleCreate(ArticleBase):
    tags: List[str] = []


class ArticleUpdate(ArticleBase):
    tags: List[str] = []


class Article(ArticleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    tags: List[Tag] = []

    class Config:
        orm_mode = True


class ArticleList(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    tags: List[Tag] = []

    class Config:
        orm_mode = True


class PaginatedResponse(BaseModel):
    items: List[ArticleList]
    total: int
    page: int
    page_size: int
    total_pages: int


class TagWithCount(Tag):
    article_count: int

    class Config:
        orm_mode = True
