from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
import random

SECRET_KEY = "creator-toolbox-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(data_dir, exist_ok=True)

DATABASE_URL = "sqlite:///" + os.path.join(data_dir, "creator_toolbox.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100))
    hashed_password = Column(String(255))
    full_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db: Session, username: str):
    return db.query(UserDB).filter(UserDB.username == username).first()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user

app = FastAPI(title="自媒体创作者工具箱", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None

    class Config:
        orm_mode = True

@app.post("/api/auth/register", response_model=UserResponse)
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="用户名已存在")
    hashed_password = get_password_hash(user.password)
    db_user = UserDB(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def read_users_me(current_user: UserDB = Depends(get_current_user)):
    return current_user

@app.get("/")
def root():
    return {"message": "自媒体创作者运营工具箱", "version": "1.0.0", "docs": "/docs"}

@app.get("/api/data-aggregation/dashboard")
def get_dashboard(current_user: UserDB = Depends(get_current_user)):
    return {
        "total_followers": 125800,
        "total_views": 2580000,
        "total_revenue": 15680.50,
        "active_platforms": 4,
        "content_published_this_week": 12,
        "upcoming_content": 5,
        "platform_comparison": [
            {"platform": "bilibili", "total_followers": 52000, "follower_growth_rate": 3.5, "avg_views": 15000, "avg_engagement": 6.8, "total_revenue": 8500, "content_count": 156},
            {"platform": "douyin", "total_followers": 38500, "follower_growth_rate": 5.2, "avg_views": 45000, "avg_engagement": 4.2, "total_revenue": 3200, "content_count": 89},
            {"platform": "xiaohongshu", "total_followers": 21300, "follower_growth_rate": 4.1, "avg_views": 8500, "avg_engagement": 8.5, "total_revenue": 2800, "content_count": 45},
            {"platform": "youtube", "total_followers": 14000, "follower_growth_rate": 2.8, "avg_views": 12000, "avg_engagement": 5.5, "total_revenue": 1180.50, "content_count": 32}
        ],
        "recent_performance": [
            {"title": "2024年技术趋势分析", "platform": "bilibili", "publish_date": "2024-01-15", "views": 25600, "engagement_rate": 7.2},
            {"title": "Python入门教程", "platform": "douyin", "publish_date": "2024-01-14", "views": 89000, "engagement_rate": 5.1},
            {"title": "好物推荐：我的桌面setup", "platform": "xiaohongshu", "publish_date": "2024-01-13", "views": 12500, "engagement_rate": 9.8},
            {"title": "如何高效学习编程", "platform": "bilibili", "publish_date": "2024-01-12", "views": 18900, "engagement_rate": 6.5}
        ]
    }

@app.get("/api/content-planning/calendar")
def get_calendar(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "title": "Python入门教程第5期", "platform": "bilibili", "topic": "编程教学", "content_type": "video", "publish_date": "2024-01-20", "status": "production", "tags": ["Python", "教程"], "user_id": 1},
        {"id": 2, "title": "2024年AI工具推荐", "platform": "xiaohongshu", "topic": "科技", "content_type": "short_video", "publish_date": "2024-01-22", "status": "planning", "tags": ["AI", "工具"], "user_id": 1},
        {"id": 3, "title": "我的年度总结vlog", "platform": "douyin", "topic": "生活", "content_type": "video", "publish_date": "2024-01-25", "status": "idea", "tags": ["vlog", "总结"], "user_id": 1}
    ]

@app.post("/api/content-planning/calendar")
def create_calendar(item: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": random.randint(100, 999), **item, "user_id": 1}

@app.get("/api/content-planning/topics")
def get_topics(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "title": "AI工具实战：从零到一", "description": "教大家如何使用AI工具提升工作效率", "traffic_potential": 5, "production_difficulty": 3, "status": "pending", "priority": 1, "user_id": 1},
        {"id": 2, "title": "Python 3.12新特性解析", "description": "深入讲解Python最新版本的更新", "traffic_potential": 4, "production_difficulty": 2, "status": "approved", "priority": 1, "user_id": 1},
        {"id": 3, "title": "我的创业故事", "description": "分享创业过程中的心得体会", "traffic_potential": 3, "production_difficulty": 1, "status": "pending", "priority": 0, "user_id": 1},
        {"id": 4, "title": "程序员的一天vlog", "description": "记录程序员的日常工作生活", "traffic_potential": 4, "production_difficulty": 2, "status": "in_progress", "priority": 0, "user_id": 1},
        {"id": 5, "title": "高难度算法精讲", "description": "深入讲解常见算法题", "traffic_potential": 2, "production_difficulty": 5, "status": "pending", "priority": 0, "user_id": 1}
    ]

@app.post("/api/content-planning/topics")
def create_topic(topic: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": random.randint(100, 999), **topic, "user_id": 1}

@app.delete("/api/content-planning/topics/{topic_id}")
def delete_topic(topic_id: int, current_user: UserDB = Depends(get_current_user)):
    return {"message": "删除成功"}

@app.put("/api/content-planning/topics/{topic_id}")
def update_topic(topic_id: int, topic: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": topic_id, **topic, "user_id": 1}

@app.get("/api/content-planning/competitors")
def get_competitors(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "name": "技术老王", "platform": "bilibili", "niche": "科技", "user_id": 1, "recent_data": {"follower_count": 256000, "avg_views": 45000, "avg_likes": 3500, "avg_comments": 280, "engagement_rate": 8.5, "posting_frequency": 2.5}},
        {"id": 2, "name": "编程小能手", "platform": "douyin", "niche": "编程教学", "user_id": 1, "recent_data": {"follower_count": 520000, "avg_views": 125000, "avg_likes": 8500, "avg_comments": 520, "engagement_rate": 7.2, "posting_frequency": 4.0}},
        {"id": 3, "name": "效率达人", "platform": "xiaohongshu", "niche": "效率工具", "user_id": 1, "recent_data": {"follower_count": 185000, "avg_views": 15000, "avg_likes": 2800, "avg_comments": 180, "engagement_rate": 19.8, "posting_frequency": 3.0}}
    ]

@app.post("/api/content-planning/competitors")
def create_competitor(competitor: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": random.randint(100, 999), **competitor, "user_id": 1}

@app.delete("/api/content-planning/competitors/{comp_id}")
def delete_competitor(comp_id: int, current_user: UserDB = Depends(get_current_user)):
    return {"message": "删除成功"}

@app.put("/api/content-planning/competitors/{comp_id}")
def update_competitor(comp_id: int, competitor: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": comp_id, **competitor, "user_id": 1}

@app.get("/api/data-aggregation/accounts")
def get_accounts(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "platform": "bilibili", "account_name": "技术小哥", "is_active": True, "user_id": 1},
        {"id": 2, "platform": "douyin", "account_name": "技术小哥Official", "is_active": True, "user_id": 1},
        {"id": 3, "platform": "xiaohongshu", "account_name": "技术小哥", "is_active": True, "user_id": 1},
        {"id": 4, "platform": "youtube", "account_name": "TechBrother", "is_active": True, "user_id": 1}
    ]

@app.post("/api/data-aggregation/accounts")
def create_account(account: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": random.randint(100, 999), **account, "user_id": 1}

@app.get("/api/data-aggregation/analytics/{account_id}")
def get_analytics(account_id: int, current_user: UserDB = Depends(get_current_user)):
    data = []
    for i in range(30):
        base_date = datetime.now() - timedelta(days=29-i)
        data.append({
            "date": base_date.strftime("%Y-%m-%d"),
            "follower_count": 50000 + i*500 + random.randint(0, 500),
            "follower_gain": random.randint(200, 800),
            "total_views": random.randint(5000, 50000),
            "avg_engagement_rate": round(random.uniform(3, 10), 2),
            "revenue": round(random.uniform(50, 500), 2)
        })
    return data

@app.get("/api/data-aggregation/content-performance")
def get_content_performance(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "platform": "bilibili", "publish_date": "2024-01-15", "views": 25600, "likes": 2100, "comments": 185, "shares": 120, "engagement_rate": 7.2, "completion_rate": 68.5},
        {"id": 2, "platform": "douyin", "publish_date": "2024-01-14", "views": 89000, "likes": 5200, "comments": 420, "shares": 890, "engagement_rate": 5.1, "completion_rate": 42.3},
        {"id": 3, "platform": "xiaohongshu", "publish_date": "2024-01-13", "views": 12500, "likes": 1850, "comments": 256, "shares": 98, "engagement_rate": 9.8, "completion_rate": 85.2}
    ]

@app.get("/api/content-production/script-templates")
def get_script_templates(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "name": "产品评测模板", "content_type": "video", "opening": "大家好，今天来测评一下{topic}...", "main_content": "首先看外观设计...\n\n然后看功能表现...\n\n最后总结优缺点...", "closing": "以上就是今天的测评内容", "call_to_action": "喜欢的话记得点赞关注！", "user_id": 1},
        {"id": 2, "name": "教程类模板", "content_type": "video", "opening": "今天教大家{topic}的正确做法...", "main_content": "第一步：准备工作\n\n第二步：核心操作\n\n第三步：注意事项", "closing": "学会了吗？动手试试吧！", "call_to_action": "有问题评论区留言", "user_id": 1},
        {"id": 3, "name": "生活vlog模板", "content_type": "short_video", "opening": "Hi，今天带大家看看{topic}...", "main_content": "记录一下日常...", "closing": "这就是今天的分享", "call_to_action": "点赞收藏不迷路", "user_id": 1}
    ]

@app.post("/api/content-production/script-templates")
def create_script_template(template: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": random.randint(100, 999), **template, "user_id": 1}

@app.post("/api/content-production/script-templates/{template_id}/generate")
def generate_script(template_id: int, topic: str, current_user: UserDB = Depends(get_current_user)):
    return {
        "template_name": "动态生成脚本",
        "topic": topic,
        "opening": f"大家好，今天我们来聊一聊{topic}...",
        "main_content": f"首先，让我们了解一下{topic}的基本概念。\n\n接下来，我将详细讲解{topic}的核心要点。\n\n最后，总结一下{topic}的关键内容。",
        "closing": f"以上就是关于{topic}的全部内容，希望对你有所帮助。",
        "call_to_action": "如果喜欢这个视频，记得点赞关注收藏哦！有什么问题欢迎在评论区留言。",
        "full_script": f"大家好，今天我们来聊一聊{topic}...\n\n首先，让我们了解一下{topic}的基本概念。\n\n接下来，我将详细讲解{topic}的核心要点。\n\n最后，总结一下{topic}的关键内容。\n\n以上就是关于{topic}的全部内容，希望对你有所帮助。\n\n如果喜欢这个视频，记得点赞关注收藏哦！有什么问题欢迎在评论区留言。"
    }

@app.delete("/api/content-production/script-templates/{tid}")
def delete_script_template(tid: int, current_user: UserDB = Depends(get_current_user)):
    return {"message": "删除成功"}

@app.put("/api/content-production/script-templates/{tid}")
def update_script_template(tid: int, template: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": tid, **template, "user_id": 1}

@app.post("/api/content-production/keyword-research/analyze")
def analyze_keyword(keyword: str, platform: str, current_user: UserDB = Depends(get_current_user)):
    search_volume = random.randint(1000, 100000)
    competition = "high" if search_volume > 50000 else "medium" if search_volume > 10000 else "low"
    trends = ["rising", "stable", "declining"]
    trend = random.choice(trends)
    
    return {
        "keyword": keyword,
        "platform": platform,
        "search_volume": search_volume,
        "competition_level": competition,
        "trend": trend,
        "related_keywords": [f"{keyword}教程", f"{keyword}是什么", f"{keyword}推荐", f"2024{keyword}", f"最新{keyword}"],
        "top_content": [
            {"title": f"关于{keyword}的热门内容1", "views": random.randint(10000, 1000000), "likes": random.randint(1000, 50000), "engagement_rate": round(random.uniform(2, 15), 2)},
            {"title": f"关于{keyword}的热门内容2", "views": random.randint(10000, 1000000), "likes": random.randint(1000, 50000), "engagement_rate": round(random.uniform(2, 15), 2)},
            {"title": f"关于{keyword}的热门内容3", "views": random.randint(10000, 1000000), "likes": random.randint(1000, 50000), "engagement_rate": round(random.uniform(2, 15), 2)}
        ],
        "recommendation": f"关键词'{keyword}'在{platform}平台搜索量{search_volume}，竞争{competition}，趋势{trend}"
    }

@app.get("/api/content-production/keyword-research")
def get_keyword_history(current_user: UserDB = Depends(get_current_user)):
    return []

@app.get("/api/content-production/cover-templates")
def get_cover_templates(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "name": "简约白底蓝调", "platform": "bilibili", "width": 1280, "height": 720, "background_color": "#ffffff", "text_color": "#1a1a1a", "accent_color": "#1890ff", "layout": "center", "user_id": 1},
        {"id": 2, "name": "深色科技风", "platform": "douyin", "width": 1080, "height": 1920, "background_color": "#1a1a2e", "text_color": "#ffffff", "accent_color": "#00d4ff", "layout": "center", "user_id": 1}
    ]

@app.post("/api/content-production/cover-templates")
def create_cover_template(template: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": random.randint(100, 999), **template, "user_id": 1}

@app.delete("/api/content-production/cover-templates/{tid}")
def delete_cover_template(tid: int, current_user: UserDB = Depends(get_current_user)):
    return {"message": "删除成功"}

@app.put("/api/content-production/cover-templates/{tid}")
def update_cover_template(tid: int, template: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": tid, **template, "user_id": 1}

@app.post("/api/content-production/cover-templates/{tid}/generate")
def generate_cover(tid: int, title: str, subtitle: Optional[str] = None, current_user: UserDB = Depends(get_current_user)):
    return {
        "template_name": "动态预览",
        "platform": "通用",
        "dimensions": "1280×720",
        "title": title,
        "subtitle": subtitle or "",
        "styles": {"background_color": "#ffffff", "text_color": "#000000", "accent_color": "#1890ff"}
    }

@app.get("/api/content-production/platform-sizes")
def get_platform_sizes(current_user: UserDB = Depends(get_current_user)):
    return {
        "bilibili": {"video_cover": {"width": 1920, "height": 1080, "name": "视频封面 16:9"}, "vertical_video": {"width": 1080, "height": 1920, "name": "竖版视频 9:16"}},
        "douyin": {"video_cover": {"width": 1080, "height": 1920, "name": "视频封面 9:16"}},
        "xiaohongshu": {"note_image": {"width": 1242, "height": 1660, "name": "笔记图片 3:4"}, "square_image": {"width": 1080, "height": 1080, "name": "方形图片 1:1"}},
        "wechat": {"article_cover": {"width": 900, "height": 383, "name": "文章封面 2.35:1"}},
        "youtube": {"video_cover": {"width": 1280, "height": 720, "name": "视频封面 16:9"}}
    }

@app.get("/api/monetization/revenue")
def get_revenue(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "platform": "bilibili", "revenue_type": "ad", "amount": 2500.00, "record_date": "2024-01-01", "description": "B站广告分成", "user_id": 1},
        {"id": 2, "platform": "douyin", "revenue_type": "cooperation", "amount": 5000.00, "record_date": "2024-01-05", "description": "品牌合作推广", "user_id": 1},
        {"id": 3, "platform": "xiaohongshu", "revenue_type": "tip", "amount": 350.50, "record_date": "2024-01-10", "description": "粉丝打赏", "user_id": 1},
        {"id": 4, "platform": "youtube", "revenue_type": "ad", "amount": 1200.00, "record_date": "2024-01-15", "description": "YouTube广告收益", "user_id": 1}
    ]

@app.post("/api/monetization/revenue")
def create_revenue(revenue: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": random.randint(100, 999), **revenue, "user_id": 1}

@app.delete("/api/monetization/revenue/{rid}")
def delete_revenue(rid: int, current_user: UserDB = Depends(get_current_user)):
    return {"message": "删除成功"}

@app.put("/api/monetization/revenue/{rid}")
def update_revenue(rid: int, revenue: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": rid, **revenue, "user_id": 1}

@app.get("/api/monetization/revenue/summary")
def get_revenue_summary(period: str = "month", current_user: UserDB = Depends(get_current_user)):
    return {
        "period": period,
        "total_amount": 15680.50,
        "by_platform": {"bilibili": 8500.00, "douyin": 3200.00, "xiaohongshu": 2800.00, "youtube": 1180.50},
        "by_type": {"ad": 5500.00, "cooperation": 8000.00, "tip": 680.50, "paid_content": 1500.00},
        "record_count": 12
    }

@app.post("/api/monetization/revenue/price-recommendation")
def get_price_recommendation(platform: str, content_type: str, follower_count: int, engagement_rate: float, current_user: UserDB = Depends(get_current_user)):
    base_price = follower_count * 0.05
    multiplier = 1.2 if engagement_rate > 5 else 1.0
    suggested = base_price * multiplier
    
    return {
        "platform": platform,
        "content_type": content_type,
        "follower_count": follower_count,
        "engagement_rate": engagement_rate,
        "suggested_price": round(suggested, 2),
        "min_price": round(suggested * 0.7, 2),
        "max_price": round(suggested * 1.5, 2),
        "breakdown": {
            "base_price_per_1000": 0.05,
            "engagement_multiplier": multiplier,
            "tier_factor": 1.0,
            "formula": f"{follower_count} × 0.05 × {multiplier}"
        }
    }

@app.get("/api/monetization/cooperations")
def get_cooperations(current_user: UserDB = Depends(get_current_user)):
    return [
        {"id": 1, "client_name": "某科技公司", "project_name": "产品推广视频", "platform": "bilibili", "content_type": "video", "quoted_price": 8000.00, "agreed_price": 7500.00, "status": "in_progress", "start_date": "2024-01-10", "end_date": "2024-01-25", "user_id": 1},
        {"id": 2, "client_name": "电商品牌", "project_name": "直播带货", "platform": "douyin", "content_type": "live", "quoted_price": 15000.00, "agreed_price": 0, "status": "negotiating", "user_id": 1},
        {"id": 3, "client_name": "教育机构", "project_name": "课程合作", "platform": "bilibili", "content_type": "video", "quoted_price": 25000.00, "agreed_price": 22000.00, "status": "completed", "start_date": "2024-01-01", "end_date": "2024-01-08", "user_id": 1}
    ]

@app.post("/api/monetization/cooperations")
def create_cooperation(coop: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": random.randint(100, 999), **coop, "user_id": 1}

@app.delete("/api/monetization/cooperations/{cid}")
def delete_cooperation(cid: int, current_user: UserDB = Depends(get_current_user)):
    return {"message": "删除成功"}

@app.put("/api/monetization/cooperations/{cid}")
def update_cooperation(cid: int, coop: Dict[str, Any], current_user: UserDB = Depends(get_current_user)):
    return {"id": cid, **coop, "user_id": 1}

@app.get("/api/analytics/content-attribution")
def get_content_attribution(current_user: UserDB = Depends(get_current_user)):
    return {
        "period": {"start_date": "2024-01-01", "end_date": "2024-01-15"},
        "by_topic": [
            {"category": "编程教学", "avg_views": 35000, "avg_engagement": 8.5, "sample_size": 12, "total_views": 420000},
            {"category": "科技测评", "avg_views": 28000, "avg_engagement": 7.2, "sample_size": 8, "total_views": 224000},
            {"category": "生活vlog", "avg_views": 15000, "avg_engagement": 10.5, "sample_size": 5, "total_views": 75000},
            {"category": "效率工具", "avg_views": 22000, "avg_engagement": 6.8, "sample_size": 6, "total_views": 132000}
        ],
        "by_content_type": [
            {"category": "video", "avg_views": 32000, "avg_engagement": 7.5, "sample_size": 20, "total_views": 640000},
            {"category": "short_video", "avg_views": 85000, "avg_engagement": 4.2, "sample_size": 10, "total_views": 850000}
        ],
        "by_publish_time": [
            {"category": "19:00-20:00", "avg_views": 45000, "avg_engagement": 9.2, "sample_size": 8, "total_views": 360000},
            {"category": "20:00-21:00", "avg_views": 38000, "avg_engagement": 8.5, "sample_size": 10, "total_views": 380000},
            {"category": "21:00-22:00", "avg_views": 32000, "avg_engagement": 7.8, "sample_size": 7, "total_views": 224000}
        ],
        "by_publish_day": [
            {"category": "Saturday", "avg_views": 52000, "avg_engagement": 9.5, "sample_size": 6, "total_views": 312000},
            {"category": "Sunday", "avg_views": 48000, "avg_engagement": 8.8, "sample_size": 5, "total_views": 240000},
            {"category": "Friday", "avg_views": 35000, "avg_engagement": 7.5, "sample_size": 8, "total_views": 280000}
        ],
        "recommendations": [
            {"type": "topic", "message": "建议增加'生活vlog'主题的内容，平均互动率10.5%", "priority": "high"},
            {"type": "publish_time", "message": "最佳发布时间段：19:00-20:00", "priority": "medium"},
            {"type": "publish_day", "message": "最佳发布日期：周六", "priority": "medium"}
        ]
    }

@app.get("/api/analytics/follower-insights")
def get_follower_insights(current_user: UserDB = Depends(get_current_user)):
    return {
        "accounts": [
            {
                "platform": "bilibili",
                "account_name": "技术小哥",
                "simulated_data": {
                    "age_distribution": {"18-24": 35, "25-34": 40, "35-44": 15, "45-54": 7, "55+": 3},
                    "gender_distribution": {"male": 65, "female": 35},
                    "location_distribution": {"北京": 18, "上海": 15, "广东": 12, "江苏": 10, "浙江": 8, "其他": 37},
                    "interest_tags": ["科技", "编程", "效率工具", "数码"],
                    "active_hours": [19, 20, 21, 22, 23]
                }
            },
            {
                "platform": "douyin",
                "account_name": "技术小哥Official",
                "simulated_data": {
                    "age_distribution": {"18-24": 45, "25-34": 35, "35-44": 12, "45-54": 5, "55+": 3},
                    "gender_distribution": {"male": 55, "female": 45},
                    "location_distribution": {"广东": 20, "上海": 12, "北京": 10, "四川": 8, "浙江": 7, "其他": 43},
                    "interest_tags": ["生活", "科技", "搞笑", "学习"],
                    "active_hours": [12, 18, 19, 20, 21]
                }
            },
            {
                "platform": "xiaohongshu",
                "account_name": "技术小哥",
                "simulated_data": {
                    "age_distribution": {"18-24": 40, "25-34": 38, "35-44": 15, "45-54": 5, "55+": 2},
                    "gender_distribution": {"male": 45, "female": 55},
                    "location_distribution": {"上海": 18, "北京": 15, "广东": 12, "浙江": 10, "江苏": 8, "其他": 37},
                    "interest_tags": ["效率工具", "生活方式", "职场", "学习"],
                    "active_hours": [10, 12, 20, 21, 22]
                }
            }
        ],
        "cross_platform_analysis": {
            "has_multiple_platforms": True,
            "platforms": ["bilibili", "douyin", "xiaohongshu"],
            "overlap_analysis": {
                "estimated_overlap_percent": 28,
                "interpretation": "估计约28%的粉丝在多个平台关注你",
                "recommendation": "建议为不同平台定制差异化内容，最大化触达"
            },
            "comparison": {}
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
