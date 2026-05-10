from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean, Date, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from .database import Base


class PlatformEnum(str, Enum):
    BILIBILI = "bilibili"
    DOUYIN = "douyin"
    XIAOHONGSHU = "xiaohongshu"
    WECHAT = "wechat"
    YOUTUBE = "youtube"


class ContentTypeEnum(str, Enum):
    VIDEO = "video"
    ARTICLE = "article"
    SHORT_VIDEO = "short_video"
    LIVE = "live"
    AUDIO = "audio"


class ContentStatusEnum(str, Enum):
    IDEA = "idea"
    PLANNING = "planning"
    PRODUCTION = "production"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class RevenueTypeEnum(str, Enum):
    AD = "ad"
    COOPERATION = "cooperation"
    PAID_CONTENT = "paid_content"
    TIP = "tip"
    COMMISSION = "commission"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ContentCalendar(Base):
    __tablename__ = "content_calendar"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    platform = Column(SQLEnum(PlatformEnum), nullable=False)
    topic = Column(String(100))
    content_type = Column(SQLEnum(ContentTypeEnum), default=ContentTypeEnum.VIDEO)
    publish_date = Column(Date, nullable=False)
    publish_time = Column(String(20))
    status = Column(SQLEnum(ContentStatusEnum), default=ContentStatusEnum.IDEA)
    tags = Column(JSON, default=list)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TopicIdea(Base):
    __tablename__ = "topic_ideas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    traffic_potential = Column(Integer, default=3)
    production_difficulty = Column(Integer, default=3)
    estimated_reach = Column(Integer)
    estimated_engagement = Column(Float)
    tags = Column(JSON, default=list)
    status = Column(String(20), default="pending")
    priority = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    platform = Column(SQLEnum(PlatformEnum), nullable=False)
    account_url = Column(String(500))
    description = Column(Text)
    niche = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CompetitorData(Base):
    __tablename__ = "competitor_data"

    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id"))
    follower_count = Column(Integer, default=0)
    avg_views = Column(Integer, default=0)
    avg_likes = Column(Integer, default=0)
    avg_comments = Column(Integer, default=0)
    avg_shares = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    posting_frequency = Column(Float, default=0.0)
    recent_topics = Column(JSON, default=list)
    content_formats = Column(JSON, default=list)
    record_date = Column(DateTime(timezone=True), server_default=func.now())


class PlatformAccount(Base):
    __tablename__ = "platform_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    platform = Column(SQLEnum(PlatformEnum), nullable=False)
    account_name = Column(String(100))
    account_url = Column(String(500))
    api_key = Column(String(255))
    api_secret = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PlatformAnalytics(Base):
    __tablename__ = "platform_analytics"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("platform_accounts.id"))
    date = Column(Date, nullable=False)
    follower_count = Column(Integer, default=0)
    follower_gain = Column(Integer, default=0)
    follower_loss = Column(Integer, default=0)
    total_views = Column(Integer, default=0)
    total_likes = Column(Integer, default=0)
    total_comments = Column(Integer, default=0)
    total_shares = Column(Integer, default=0)
    avg_engagement_rate = Column(Float, default=0.0)
    content_published = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ContentPerformance(Base):
    __tablename__ = "content_performance"

    id = Column(Integer, primary_key=True, index=True)
    calendar_id = Column(Integer, ForeignKey("content_calendar.id"))
    platform = Column(SQLEnum(PlatformEnum), nullable=False)
    content_url = Column(String(500))
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    watch_time = Column(Integer, default=0)
    click_through_rate = Column(Float, default=0.0)
    engagement_rate = Column(Float, default=0.0)
    completion_rate = Column(Float, default=0.0)
    new_followers = Column(Integer, default=0)
    publish_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ScriptTemplate(Base):
    __tablename__ = "script_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    content_type = Column(SQLEnum(ContentTypeEnum), default=ContentTypeEnum.VIDEO)
    platform = Column(SQLEnum(PlatformEnum))
    opening = Column(Text)
    main_content = Column(Text)
    closing = Column(Text)
    call_to_action = Column(Text)
    duration_estimate = Column(Integer)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class KeywordResearch(Base):
    __tablename__ = "keyword_research"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    keyword = Column(String(200), nullable=False)
    platform = Column(SQLEnum(PlatformEnum), nullable=False)
    search_volume = Column(Integer, default=0)
    competition_level = Column(String(20), default="medium")
    trend = Column(String(20), default="stable")
    related_keywords = Column(JSON, default=list)
    top_content = Column(JSON, default=list)
    research_date = Column(DateTime(timezone=True), server_default=func.now())


class CoverTemplate(Base):
    __tablename__ = "cover_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    platform = Column(SQLEnum(PlatformEnum), nullable=False)
    width = Column(Integer, default=1280)
    height = Column(Integer, default=720)
    background_color = Column(String(20), default="#ffffff")
    text_color = Column(String(20), default="#000000")
    accent_color = Column(String(20), default="#3498db")
    font_family = Column(String(100), default="sans-serif")
    layout = Column(String(50), default="center")
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RevenueRecord(Base):
    __tablename__ = "revenue_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    platform = Column(SQLEnum(PlatformEnum), nullable=False)
    revenue_type = Column(SQLEnum(RevenueTypeEnum), nullable=False)
    amount = Column(Float, default=0.0)
    currency = Column(String(10), default="CNY")
    description = Column(Text)
    record_date = Column(Date, nullable=False)
    is_recurring = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BusinessCooperation(Base):
    __tablename__ = "business_cooperations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    client_name = Column(String(200), nullable=False)
    client_contact = Column(String(100))
    project_name = Column(String(200))
    platform = Column(SQLEnum(PlatformEnum))
    content_type = Column(SQLEnum(ContentTypeEnum))
    follower_count = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    quoted_price = Column(Float, default=0.0)
    agreed_price = Column(Float, default=0.0)
    status = Column(String(20), default="pending")
    start_date = Column(Date)
    end_date = Column(Date)
    contract_file = Column(String(500))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FollowerInsights(Base):
    __tablename__ = "follower_insights"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("platform_accounts.id"))
    date = Column(Date, nullable=False)
    age_distribution = Column(JSON, default=dict)
    gender_distribution = Column(JSON, default=dict)
    location_distribution = Column(JSON, default=dict)
    interest_tags = Column(JSON, default=list)
    active_hours = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ContentInsight(Base):
    __tablename__ = "content_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    platform = Column(SQLEnum(PlatformEnum), nullable=False)
    topic = Column(String(100))
    content_type = Column(SQLEnum(ContentTypeEnum))
    publish_hour = Column(Integer)
    publish_day = Column(String(10))
    avg_views = Column(Integer, default=0)
    avg_engagement = Column(Float, default=0.0)
    sample_size = Column(Integer, default=0)
    analyzed_date = Column(DateTime(timezone=True), server_default=func.now())
