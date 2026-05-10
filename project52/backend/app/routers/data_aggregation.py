from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from .. import models, schemas, auth, database

router = APIRouter(prefix="/api/data-aggregation", tags=["数据聚合"])


@router.get("/accounts", response_model=List[schemas.PlatformAccount])
def get_accounts(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.PlatformAccount).filter(
        models.PlatformAccount.user_id == current_user.id
    ).all()


@router.post("/accounts", response_model=schemas.PlatformAccount)
def create_account(
    account: schemas.PlatformAccountCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_account = models.PlatformAccount(**account.model_dump(), user_id=current_user.id)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


@router.put("/accounts/{account_id}", response_model=schemas.PlatformAccount)
def update_account(
    account_id: int,
    account_update: schemas.PlatformAccountUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    account = db.query(models.PlatformAccount).filter(
        models.PlatformAccount.id == account_id,
        models.PlatformAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="账号不存在")
    
    update_data = account_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(account, key, value)
    
    db.commit()
    db.refresh(account)
    return account


@router.delete("/accounts/{account_id}")
def delete_account(
    account_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    account = db.query(models.PlatformAccount).filter(
        models.PlatformAccount.id == account_id,
        models.PlatformAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="账号不存在")
    
    db.delete(account)
    db.commit()
    return {"message": "删除成功"}


@router.get("/analytics/{account_id}", response_model=List[schemas.PlatformAnalytics])
def get_analytics(
    account_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    account = db.query(models.PlatformAccount).filter(
        models.PlatformAccount.id == account_id,
        models.PlatformAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="账号不存在")
    
    query = db.query(models.PlatformAnalytics).filter(
        models.PlatformAnalytics.account_id == account_id
    )
    
    if start_date:
        query = query.filter(models.PlatformAnalytics.date >= start_date)
    if end_date:
        query = query.filter(models.PlatformAnalytics.date <= end_date)
    
    return query.order_by(models.PlatformAnalytics.date).all()


@router.post("/analytics/{account_id}", response_model=schemas.PlatformAnalytics)
def add_analytics(
    account_id: int,
    analytics: schemas.PlatformAnalyticsCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    account = db.query(models.PlatformAccount).filter(
        models.PlatformAccount.id == account_id,
        models.PlatformAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="账号不存在")
    
    db_analytics = models.PlatformAnalytics(**analytics.model_dump(), account_id=account_id)
    db.add(db_analytics)
    db.commit()
    db.refresh(db_analytics)
    return db_analytics


@router.get("/content-performance", response_model=List[schemas.ContentPerformance])
def get_content_performance(
    platform: Optional[schemas.PlatformEnum] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    accounts = db.query(models.PlatformAccount).filter(
        models.PlatformAccount.user_id == current_user.id
    ).all()
    account_ids = [a.id for a in accounts]
    
    calendar_ids = db.query(models.ContentCalendar.id).filter(
        models.ContentCalendar.user_id == current_user.id
    ).all()
    calendar_ids = [c[0] for c in calendar_ids]
    
    query = db.query(models.ContentPerformance).filter(
        models.ContentPerformance.calendar_id.in_(calendar_ids)
    )
    
    if platform:
        query = query.filter(models.ContentPerformance.platform == platform)
    if start_date:
        query = query.filter(models.ContentPerformance.publish_date >= start_date)
    if end_date:
        query = query.filter(models.ContentPerformance.publish_date <= end_date)
    
    return query.order_by(models.ContentPerformance.publish_date.desc()).all()


@router.post("/content-performance", response_model=schemas.ContentPerformance)
def add_content_performance(
    performance: schemas.ContentPerformanceCreate,
    calendar_id: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    if calendar_id:
        calendar = db.query(models.ContentCalendar).filter(
            models.ContentCalendar.id == calendar_id,
            models.ContentCalendar.user_id == current_user.id
        ).first()
        if not calendar:
            raise HTTPException(status_code=404, detail="内容日历项不存在")
    
    db_performance = models.ContentPerformance(
        **performance.model_dump(),
        calendar_id=calendar_id
    )
    db.add(db_performance)
    db.commit()
    db.refresh(db_performance)
    return db_performance


@router.get("/dashboard", response_model=schemas.DashboardOverview)
def get_dashboard_overview(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    accounts = db.query(models.PlatformAccount).filter(
        models.PlatformAccount.user_id == current_user.id,
        models.PlatformAccount.is_active == True
    ).all()
    
    total_followers = 0
    total_views = 0
    total_revenue = 0.0
    platform_comparison = []
    
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    for account in accounts:
        latest_analytics = db.query(models.PlatformAnalytics).filter(
            models.PlatformAnalytics.account_id == account.id
        ).order_by(models.PlatformAnalytics.date.desc()).first()
        
        week_analytics = db.query(models.PlatformAnalytics).filter(
            models.PlatformAnalytics.account_id == account.id,
            models.PlatformAnalytics.date >= week_ago
        ).all()
        
        if latest_analytics:
            total_followers += latest_analytics.follower_count
        
        week_views = sum(a.total_views for a in week_analytics)
        week_revenue = sum(a.revenue for a in week_analytics)
        total_views += week_views
        total_revenue += week_revenue
        
        if latest_analytics:
            platform_comparison.append(schemas.PlatformComparison(
                platform=account.platform,
                total_followers=latest_analytics.follower_count,
                follower_growth_rate=sum(a.follower_gain for a in week_analytics) / max(1, latest_analytics.follower_count - sum(a.follower_gain for a in week_analytics)) * 100,
                avg_views=week_views / max(1, len(week_analytics)),
                avg_engagement=sum(a.avg_engagement_rate for a in week_analytics) / max(1, len(week_analytics)),
                total_revenue=week_revenue,
                content_count=sum(a.content_published for a in week_analytics)
            ))
    
    content_published_this_week = db.query(models.ContentCalendar).filter(
        models.ContentCalendar.user_id == current_user.id,
        models.ContentCalendar.publish_date >= week_ago,
        models.ContentCalendar.publish_date <= today,
        models.ContentCalendar.status == schemas.ContentStatusEnum.PUBLISHED
    ).count()
    
    upcoming_content = db.query(models.ContentCalendar).filter(
        models.ContentCalendar.user_id == current_user.id,
        models.ContentCalendar.publish_date > today
    ).count()
    
    recent_performance = []
    content_calendars = db.query(models.ContentCalendar).filter(
        models.ContentCalendar.user_id == current_user.id
    ).order_by(models.ContentCalendar.publish_date.desc()).limit(10).all()
    
    for calendar in content_calendars:
        performance = db.query(models.ContentPerformance).filter(
            models.ContentPerformance.calendar_id == calendar.id
        ).first()
        if performance:
            recent_performance.append({
                "title": calendar.title,
                "platform": calendar.platform,
                "publish_date": calendar.publish_date,
                "views": performance.views,
                "engagement_rate": performance.engagement_rate
            })
    
    return schemas.DashboardOverview(
        total_followers=total_followers,
        total_views=total_views,
        total_revenue=total_revenue,
        active_platforms=len(accounts),
        content_published_this_week=content_published_this_week,
        upcoming_content=upcoming_content,
        platform_comparison=platform_comparison,
        recent_performance=recent_performance
    )
