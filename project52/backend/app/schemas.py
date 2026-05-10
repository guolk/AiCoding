from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


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


class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class ContentCalendarBase(BaseModel):
    title: str
    description: Optional[str] = None
    platform: PlatformEnum
    topic: Optional[str] = None
    content_type: Optional[ContentTypeEnum] = ContentTypeEnum.VIDEO
    publish_date: date
    publish_time: Optional[str] = None
    status: Optional[ContentStatusEnum] = ContentStatusEnum.IDEA
    tags: Optional[List[str]] = []
    notes: Optional[str] = None


class ContentCalendarCreate(ContentCalendarBase):
    pass


class ContentCalendarUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    platform: Optional[PlatformEnum] = None
    topic: Optional[str] = None
    content_type: Optional[ContentTypeEnum] = None
    publish_date: Optional[date] = None
    publish_time: Optional[str] = None
    status: Optional[ContentStatusEnum] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class ContentCalendar(ContentCalendarBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TopicIdeaBase(BaseModel):
    title: str
    description: Optional[str] = None
    traffic_potential: int = Field(3, ge=1, le=5)
    production_difficulty: int = Field(3, ge=1, le=5)
    estimated_reach: Optional[int] = None
    estimated_engagement: Optional[float] = None
    tags: Optional[List[str]] = []
    status: Optional[str] = "pending"
    priority: int = 0


class TopicIdeaCreate(TopicIdeaBase):
    pass


class TopicIdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    traffic_potential: Optional[int] = None
    production_difficulty: Optional[int] = None
    estimated_reach: Optional[int] = None
    estimated_engagement: Optional[float] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    priority: Optional[int] = None


class TopicIdea(TopicIdeaBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CompetitorBase(BaseModel):
    name: str
    platform: PlatformEnum
    account_url: Optional[str] = None
    description: Optional[str] = None
    niche: Optional[str] = None


class CompetitorCreate(CompetitorBase):
    pass


class CompetitorUpdate(BaseModel):
    name: Optional[str] = None
    platform: Optional[PlatformEnum] = None
    account_url: Optional[str] = None
    description: Optional[str] = None
    niche: Optional[str] = None


class CompetitorData(BaseModel):
    id: int
    competitor_id: int
    follower_count: int = 0
    avg_views: int = 0
    avg_likes: int = 0
    avg_comments: int = 0
    avg_shares: int = 0
    engagement_rate: float = 0.0
    posting_frequency: float = 0.0
    recent_topics: List[str] = []
    content_formats: List[str] = []
    record_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class Competitor(CompetitorBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    recent_data: Optional[CompetitorData] = None

    class Config:
        from_attributes = True


class PlatformAccountBase(BaseModel):
    platform: PlatformEnum
    account_name: Optional[str] = None
    account_url: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    is_active: bool = True


class PlatformAccountCreate(PlatformAccountBase):
    pass


class PlatformAccountUpdate(BaseModel):
    account_name: Optional[str] = None
    account_url: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    is_active: Optional[bool] = None


class PlatformAccount(PlatformAccountBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PlatformAnalyticsBase(BaseModel):
    date: date
    follower_count: int = 0
    follower_gain: int = 0
    follower_loss: int = 0
    total_views: int = 0
    total_likes: int = 0
    total_comments: int = 0
    total_shares: int = 0
    avg_engagement_rate: float = 0.0
    content_published: int = 0
    revenue: float = 0.0


class PlatformAnalyticsCreate(PlatformAnalyticsBase):
    pass


class PlatformAnalytics(PlatformAnalyticsBase):
    id: int
    account_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContentPerformanceBase(BaseModel):
    platform: PlatformEnum
    content_url: Optional[str] = None
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    watch_time: int = 0
    click_through_rate: float = 0.0
    engagement_rate: float = 0.0
    completion_rate: float = 0.0
    new_followers: int = 0
    publish_date: date


class ContentPerformanceCreate(ContentPerformanceBase):
    pass


class ContentPerformance(ContentPerformanceBase):
    id: int
    calendar_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ScriptTemplateBase(BaseModel):
    name: str
    content_type: Optional[ContentTypeEnum] = ContentTypeEnum.VIDEO
    platform: Optional[PlatformEnum] = None
    opening: Optional[str] = None
    main_content: Optional[str] = None
    closing: Optional[str] = None
    call_to_action: Optional[str] = None
    duration_estimate: Optional[int] = None
    is_public: bool = False


class ScriptTemplateCreate(ScriptTemplateBase):
    pass


class ScriptTemplateUpdate(BaseModel):
    name: Optional[str] = None
    content_type: Optional[ContentTypeEnum] = None
    platform: Optional[PlatformEnum] = None
    opening: Optional[str] = None
    main_content: Optional[str] = None
    closing: Optional[str] = None
    call_to_action: Optional[str] = None
    duration_estimate: Optional[int] = None
    is_public: Optional[bool] = None


class ScriptTemplate(ScriptTemplateBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class KeywordResearchBase(BaseModel):
    keyword: str
    platform: PlatformEnum
    search_volume: int = 0
    competition_level: str = "medium"
    trend: str = "stable"
    related_keywords: List[str] = []
    top_content: List[Dict[str, Any]] = []


class KeywordResearchCreate(KeywordResearchBase):
    pass


class KeywordResearch(KeywordResearchBase):
    id: int
    user_id: int
    research_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class CoverTemplateBase(BaseModel):
    name: str
    platform: PlatformEnum
    width: int = 1280
    height: int = 720
    background_color: str = "#ffffff"
    text_color: str = "#000000"
    accent_color: str = "#3498db"
    font_family: str = "sans-serif"
    layout: str = "center"
    is_public: bool = False


class CoverTemplateCreate(CoverTemplateBase):
    pass


class CoverTemplateUpdate(BaseModel):
    name: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    background_color: Optional[str] = None
    text_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    layout: Optional[str] = None
    is_public: Optional[bool] = None


class CoverTemplate(CoverTemplateBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RevenueRecordBase(BaseModel):
    platform: PlatformEnum
    revenue_type: RevenueTypeEnum
    amount: float = 0.0
    currency: str = "CNY"
    description: Optional[str] = None
    record_date: date
    is_recurring: bool = False


class RevenueRecordCreate(RevenueRecordBase):
    pass


class RevenueRecordUpdate(BaseModel):
    platform: Optional[PlatformEnum] = None
    revenue_type: Optional[RevenueTypeEnum] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    record_date: Optional[date] = None
    is_recurring: Optional[bool] = None


class RevenueRecord(RevenueRecordBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BusinessCooperationBase(BaseModel):
    client_name: str
    client_contact: Optional[str] = None
    project_name: Optional[str] = None
    platform: Optional[PlatformEnum] = None
    content_type: Optional[ContentTypeEnum] = None
    follower_count: int = 0
    engagement_rate: float = 0.0
    quoted_price: float = 0.0
    agreed_price: float = 0.0
    status: str = "pending"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    contract_file: Optional[str] = None
    description: Optional[str] = None


class BusinessCooperationCreate(BusinessCooperationBase):
    pass


class BusinessCooperationUpdate(BaseModel):
    client_name: Optional[str] = None
    client_contact: Optional[str] = None
    project_name: Optional[str] = None
    platform: Optional[PlatformEnum] = None
    content_type: Optional[ContentTypeEnum] = None
    follower_count: Optional[int] = None
    engagement_rate: Optional[float] = None
    quoted_price: Optional[float] = None
    agreed_price: Optional[float] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    contract_file: Optional[str] = None
    description: Optional[str] = None


class BusinessCooperation(BusinessCooperationBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PriceRecommendation(BaseModel):
    platform: PlatformEnum
    content_type: ContentTypeEnum
    follower_count: int
    engagement_rate: float
    suggested_price: float
    min_price: float
    max_price: float
    breakdown: Dict[str, Any]


class FollowerInsightsBase(BaseModel):
    date: date
    age_distribution: Dict[str, Any] = {}
    gender_distribution: Dict[str, Any] = {}
    location_distribution: Dict[str, Any] = {}
    interest_tags: List[str] = []
    active_hours: List[int] = []


class FollowerInsights(FollowerInsightsBase):
    id: int
    account_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContentInsightBase(BaseModel):
    platform: PlatformEnum
    topic: Optional[str] = None
    content_type: Optional[ContentTypeEnum] = None
    publish_hour: Optional[int] = None
    publish_day: Optional[str] = None
    avg_views: int = 0
    avg_engagement: float = 0.0
    sample_size: int = 0


class ContentInsight(ContentInsightBase):
    id: int
    user_id: int
    analyzed_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class PlatformComparison(BaseModel):
    platform: PlatformEnum
    total_followers: int = 0
    follower_growth_rate: float = 0.0
    avg_views: float = 0.0
    avg_engagement: float = 0.0
    total_revenue: float = 0.0
    content_count: int = 0


class DashboardOverview(BaseModel):
    total_followers: int = 0
    total_views: int = 0
    total_revenue: float = 0.0
    active_platforms: int = 0
    content_published_this_week: int = 0
    upcoming_content: int = 0
    platform_comparison: List[PlatformComparison] = []
    recent_performance: List[Dict[str, Any]] = []
