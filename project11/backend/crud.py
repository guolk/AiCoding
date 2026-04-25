from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from .models import Article, Tag
from .schemas import ArticleCreate, ArticleUpdate


def get_or_create_tag(db: Session, tag_name: str) -> Tag:
    tag = db.query(Tag).filter(Tag.name == tag_name).first()
    if not tag:
        tag = Tag(name=tag_name)
        db.add(tag)
        db.commit()
        db.refresh(tag)
    return tag


def create_article(db: Session, article: ArticleCreate) -> Article:
    db_article = Article(
        title=article.title,
        content=article.content,
        summary=article.summary,
        is_pinned=article.is_pinned
    )
    
    for tag_name in article.tags:
        tag = get_or_create_tag(db, tag_name)
        db_article.tags.append(tag)
    
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


def get_article(db: Session, article_id: int) -> Optional[Article]:
    return db.query(Article).filter(Article.id == article_id).first()


def get_articles(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    tag: Optional[str] = None,
    keyword: Optional[str] = None
) -> List[Article]:
    query = db.query(Article)
    
    if tag:
        query = query.join(Article.tags).filter(Tag.name == tag)
    
    if keyword:
        query = query.filter(
            or_(
                Article.title.contains(keyword),
                Article.content.contains(keyword),
                Article.summary.contains(keyword)
            )
        )
    
    query = query.order_by(desc(Article.is_pinned), desc(Article.created_at))
    return query.offset(skip).limit(limit).all()


def get_articles_count(
    db: Session,
    tag: Optional[str] = None,
    keyword: Optional[str] = None
) -> int:
    query = db.query(Article)
    
    if tag:
        query = query.join(Article.tags).filter(Tag.name == tag)
    
    if keyword:
        query = query.filter(
            or_(
                Article.title.contains(keyword),
                Article.content.contains(keyword),
                Article.summary.contains(keyword)
            )
        )
    
    return query.count()


def update_article(db: Session, article_id: int, article: ArticleUpdate) -> Optional[Article]:
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        return None
    
    db_article.title = article.title
    db_article.content = article.content
    db_article.summary = article.summary
    db_article.is_pinned = article.is_pinned
    
    db_article.tags = []
    for tag_name in article.tags:
        tag = get_or_create_tag(db, tag_name)
        db_article.tags.append(tag)
    
    db.commit()
    db.refresh(db_article)
    return db_article


def delete_article(db: Session, article_id: int) -> bool:
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        return False
    
    db.delete(db_article)
    db.commit()
    return True


def get_all_tags(db: Session) -> List[Tag]:
    return db.query(Tag).order_by(Tag.name).all()


def get_tag_with_count(db: Session):
    tags = db.query(Tag).all()
    result = []
    for tag in tags:
        result.append({
            "id": tag.id,
            "name": tag.name,
            "created_at": tag.created_at,
            "article_count": len(tag.articles)
        })
    return result


def delete_tag(db: Session, tag_id: int) -> bool:
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        return False
    
    if len(tag.articles) > 0:
        return False
    
    db.delete(tag)
    db.commit()
    return True


def get_tag_by_name(db: Session, tag_name: str) -> Optional[Tag]:
    return db.query(Tag).filter(Tag.name == tag_name).first()


def create_tag(db: Session, tag_name: str) -> Optional[Tag]:
    existing = db.query(Tag).filter(Tag.name == tag_name).first()
    if existing:
        return None
    
    tag = Tag(name=tag_name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag
