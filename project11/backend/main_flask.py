from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from sqlalchemy import create_engine, or_, desc, Column, Integer, String, Text, DateTime, Boolean, Table, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import sys

app = Flask(__name__, static_folder=None)
CORS(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'backend', 'blog.db')}"
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "dist")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

article_tag = Table(
    'article_tag',
    Base.metadata,
    Column('article_id', Integer, ForeignKey('articles.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tags = relationship("Tag", secondary=article_tag, back_populates="articles")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    articles = relationship("Article", secondary=article_tag, back_populates="tags")


def get_db():
    db = SessionLocal()
    return db


def init_db():
    Base.metadata.create_all(bind=engine)


@app.route('/')
def index():
    if os.path.exists(os.path.join(STATIC_DIR, 'index.html')):
        return send_file(os.path.join(STATIC_DIR, 'index.html'))
    return jsonify({"message": "API服务运行中"})


@app.route('/favicon.ico')
def favicon():
    favicon_path = os.path.join(STATIC_DIR, 'favicon.ico')
    if os.path.exists(favicon_path):
        return send_file(favicon_path)
    return jsonify({"error": "Not found"}), 404


@app.route('/assets/<path:filename>')
def serve_assets(filename):
    assets_dir = os.path.join(STATIC_DIR, 'assets')
    return send_from_directory(assets_dir, filename)


@app.route('/article/<int:id>')
def article_page(id):
    if os.path.exists(os.path.join(STATIC_DIR, 'index.html')):
        return send_file(os.path.join(STATIC_DIR, 'index.html'))
    return jsonify({"message": "API服务运行中"})


@app.route('/tags')
def tags_page():
    if os.path.exists(os.path.join(STATIC_DIR, 'index.html')):
        return send_file(os.path.join(STATIC_DIR, 'index.html'))
    return jsonify({"message": "API服务运行中"})


@app.route('/tag/<tag_name>')
def tag_page(tag_name):
    if os.path.exists(os.path.join(STATIC_DIR, 'index.html')):
        return send_file(os.path.join(STATIC_DIR, 'index.html'))
    return jsonify({"message": "API服务运行中"})


@app.route('/editor')
def editor_page():
    if os.path.exists(os.path.join(STATIC_DIR, 'index.html')):
        return send_file(os.path.join(STATIC_DIR, 'index.html'))
    return jsonify({"message": "API服务运行中"})


@app.route('/editor/<int:id>')
def editor_edit_page(id):
    if os.path.exists(os.path.join(STATIC_DIR, 'index.html')):
        return send_file(os.path.join(STATIC_DIR, 'index.html'))
    return jsonify({"message": "API服务运行中"})


@app.route('/admin')
def admin_page():
    if os.path.exists(os.path.join(STATIC_DIR, 'index.html')):
        return send_file(os.path.join(STATIC_DIR, 'index.html'))
    return jsonify({"message": "API服务运行中"})


def article_to_dict(article):
    return {
        "id": article.id,
        "title": article.title,
        "summary": article.summary,
        "content": article.content,
        "is_pinned": article.is_pinned,
        "created_at": article.created_at.isoformat() if article.created_at else None,
        "updated_at": article.updated_at.isoformat() if article.updated_at else None,
        "tags": [{"id": t.id, "name": t.name, "created_at": t.created_at.isoformat() if t.created_at else None} 
                for t in article.tags]
    }


def get_or_create_tag(db, tag_name):
    tag = db.query(Tag).filter(Tag.name == tag_name).first()
    if not tag:
        tag = Tag(name=tag_name, created_at=datetime.utcnow())
        db.add(tag)
        db.commit()
        db.refresh(tag)
    return tag


@app.route('/api/articles/', methods=['GET'])
def get_articles():
    db = get_db()
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        tag = request.args.get('tag')
        keyword = request.args.get('keyword')
        
        skip = (page - 1) * page_size
        
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
        
        total = query.count()
        
        query = query.order_by(desc(Article.is_pinned), desc(Article.created_at))
        articles = query.offset(skip).limit(page_size).all()
        
        total_pages = (total + page_size - 1) // page_size
        
        return jsonify({
            "items": [article_to_dict(a) for a in articles],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        })
    finally:
        db.close()


@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    db = get_db()
    try:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            return jsonify({"detail": "文章不存在"}), 404
        return jsonify(article_to_dict(article))
    finally:
        db.close()


@app.route('/api/articles/', methods=['POST'])
def create_article():
    db = get_db()
    try:
        data = request.get_json()
        
        article = Article(
            title=data.get('title'),
            content=data.get('content'),
            summary=data.get('summary'),
            is_pinned=data.get('is_pinned', False),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        for tag_name in data.get('tags', []):
            tag = get_or_create_tag(db, tag_name)
            article.tags.append(tag)
        
        db.add(article)
        db.commit()
        db.refresh(article)
        
        return jsonify(article_to_dict(article))
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500
    finally:
        db.close()


@app.route('/api/articles/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    db = get_db()
    try:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            return jsonify({"detail": "文章不存在"}), 404
        
        data = request.get_json()
        
        article.title = data.get('title', article.title)
        article.content = data.get('content', article.content)
        article.summary = data.get('summary', article.summary)
        article.is_pinned = data.get('is_pinned', article.is_pinned)
        article.updated_at = datetime.utcnow()
        
        if 'tags' in data:
            article.tags = []
            for tag_name in data.get('tags', []):
                tag = get_or_create_tag(db, tag_name)
                article.tags.append(tag)
        
        db.commit()
        db.refresh(article)
        
        return jsonify(article_to_dict(article))
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500
    finally:
        db.close()


@app.route('/api/articles/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    db = get_db()
    try:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            return jsonify({"detail": "文章不存在"}), 404
        
        db.delete(article)
        db.commit()
        
        return jsonify({"message": "删除成功"})
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500
    finally:
        db.close()


@app.route('/api/tags/', methods=['GET'])
def get_tags():
    db = get_db()
    try:
        tags = db.query(Tag).all()
        result = []
        for tag in tags:
            result.append({
                "id": tag.id,
                "name": tag.name,
                "created_at": tag.created_at.isoformat() if tag.created_at else None,
                "article_count": len(tag.articles)
            })
        return jsonify(result)
    finally:
        db.close()


@app.route('/api/tags/', methods=['POST'])
def create_tag():
    db = get_db()
    try:
        data = request.get_json()
        tag_name = data.get('name', '').strip()
        
        if not tag_name:
            return jsonify({"detail": "标签名称不能为空"}), 400
        
        existing = db.query(Tag).filter(Tag.name == tag_name).first()
        if existing:
            return jsonify({"detail": "标签已存在"}), 400
        
        tag = Tag(name=tag_name, created_at=datetime.utcnow())
        db.add(tag)
        db.commit()
        db.refresh(tag)
        
        return jsonify({
            "message": "创建成功",
            "tag": {"id": tag.id, "name": tag.name}
        })
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500
    finally:
        db.close()


@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    db = get_db()
    try:
        tag = db.query(Tag).filter(Tag.id == tag_id).first()
        if not tag:
            return jsonify({"detail": "标签不存在"}), 404
        
        if len(tag.articles) > 0:
            return jsonify({"detail": "标签存在关联文章，无法删除"}), 400
        
        db.delete(tag)
        db.commit()
        
        return jsonify({"message": "删除成功"})
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        return jsonify({"detail": str(e)}), 500
    finally:
        db.close()


init_db()

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
