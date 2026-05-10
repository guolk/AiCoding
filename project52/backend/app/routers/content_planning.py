from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas, auth, database

router = APIRouter(prefix="/api/content-planning", tags=["内容规划"])


@router.get("/calendar", response_model=List[schemas.ContentCalendar])
def get_calendar(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    platform: Optional[schemas.PlatformEnum] = None,
    status: Optional[schemas.ContentStatusEnum] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.ContentCalendar).filter(models.ContentCalendar.user_id == current_user.id)
    
    if start_date:
        query = query.filter(models.ContentCalendar.publish_date >= start_date)
    if end_date:
        query = query.filter(models.ContentCalendar.publish_date <= end_date)
    if platform:
        query = query.filter(models.ContentCalendar.platform == platform)
    if status:
        query = query.filter(models.ContentCalendar.status == status)
    
    return query.order_by(models.ContentCalendar.publish_date).all()


@router.post("/calendar", response_model=schemas.ContentCalendar)
def create_calendar_item(
    item: schemas.ContentCalendarCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_item = models.ContentCalendar(**item.model_dump(), user_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/calendar/{item_id}", response_model=schemas.ContentCalendar)
def get_calendar_item(
    item_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    item = db.query(models.ContentCalendar).filter(
        models.ContentCalendar.id == item_id,
        models.ContentCalendar.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="内容日历项不存在")
    return item


@router.put("/calendar/{item_id}", response_model=schemas.ContentCalendar)
def update_calendar_item(
    item_id: int,
    item_update: schemas.ContentCalendarUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    item = db.query(models.ContentCalendar).filter(
        models.ContentCalendar.id == item_id,
        models.ContentCalendar.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="内容日历项不存在")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item


@router.delete("/calendar/{item_id}")
def delete_calendar_item(
    item_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    item = db.query(models.ContentCalendar).filter(
        models.ContentCalendar.id == item_id,
        models.ContentCalendar.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="内容日历项不存在")
    
    db.delete(item)
    db.commit()
    return {"message": "删除成功"}


@router.get("/topics", response_model=List[schemas.TopicIdea])
def get_topics(
    status: Optional[str] = None,
    min_traffic: Optional[int] = None,
    max_difficulty: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.TopicIdea).filter(models.TopicIdea.user_id == current_user.id)
    
    if status:
        query = query.filter(models.TopicIdea.status == status)
    if min_traffic:
        query = query.filter(models.TopicIdea.traffic_potential >= min_traffic)
    if max_difficulty:
        query = query.filter(models.TopicIdea.production_difficulty <= max_difficulty)
    
    return query.order_by(models.TopicIdea.priority.desc(), models.TopicIdea.created_at.desc()).all()


@router.post("/topics", response_model=schemas.TopicIdea)
def create_topic(
    topic: schemas.TopicIdeaCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_topic = models.TopicIdea(**topic.model_dump(), user_id=current_user.id)
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic


@router.get("/topics/{topic_id}", response_model=schemas.TopicIdea)
def get_topic(
    topic_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(models.TopicIdea).filter(
        models.TopicIdea.id == topic_id,
        models.TopicIdea.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="选题不存在")
    return topic


@router.put("/topics/{topic_id}", response_model=schemas.TopicIdea)
def update_topic(
    topic_id: int,
    topic_update: schemas.TopicIdeaUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(models.TopicIdea).filter(
        models.TopicIdea.id == topic_id,
        models.TopicIdea.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="选题不存在")
    
    update_data = topic_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(topic, key, value)
    
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/topics/{topic_id}")
def delete_topic(
    topic_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    topic = db.query(models.TopicIdea).filter(
        models.TopicIdea.id == topic_id,
        models.TopicIdea.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="选题不存在")
    
    db.delete(topic)
    db.commit()
    return {"message": "删除成功"}


@router.get("/competitors", response_model=List[schemas.Competitor])
def get_competitors(
    platform: Optional[schemas.PlatformEnum] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Competitor).filter(models.Competitor.user_id == current_user.id)
    
    if platform:
        query = query.filter(models.Competitor.platform == platform)
    
    competitors = query.all()
    
    for competitor in competitors:
        recent_data = db.query(models.CompetitorData).filter(
            models.CompetitorData.competitor_id == competitor.id
        ).order_by(models.CompetitorData.record_date.desc()).first()
        if recent_data:
            competitor.recent_data = recent_data
    
    return competitors


@router.post("/competitors", response_model=schemas.Competitor)
def create_competitor(
    competitor: schemas.CompetitorCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_competitor = models.Competitor(**competitor.model_dump(), user_id=current_user.id)
    db.add(db_competitor)
    db.commit()
    db.refresh(db_competitor)
    return db_competitor


@router.get("/competitors/{competitor_id}", response_model=schemas.Competitor)
def get_competitor(
    competitor_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    competitor = db.query(models.Competitor).filter(
        models.Competitor.id == competitor_id,
        models.Competitor.user_id == current_user.id
    ).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="竞品不存在")
    
    recent_data = db.query(models.CompetitorData).filter(
        models.CompetitorData.competitor_id == competitor_id
    ).order_by(models.CompetitorData.record_date.desc()).first()
    if recent_data:
        competitor.recent_data = recent_data
    
    return competitor


@router.put("/competitors/{competitor_id}", response_model=schemas.Competitor)
def update_competitor(
    competitor_id: int,
    competitor_update: schemas.CompetitorUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    competitor = db.query(models.Competitor).filter(
        models.Competitor.id == competitor_id,
        models.Competitor.user_id == current_user.id
    ).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="竞品不存在")
    
    update_data = competitor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(competitor, key, value)
    
    db.commit()
    db.refresh(competitor)
    return competitor


@router.delete("/competitors/{competitor_id}")
def delete_competitor(
    competitor_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    competitor = db.query(models.Competitor).filter(
        models.Competitor.id == competitor_id,
        models.Competitor.user_id == current_user.id
    ).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="竞品不存在")
    
    db.query(models.CompetitorData).filter(models.CompetitorData.competitor_id == competitor_id).delete()
    
    db.delete(competitor)
    db.commit()
    return {"message": "删除成功"}


@router.get("/competitors/{competitor_id}/data", response_model=List[schemas.CompetitorData])
def get_competitor_data(
    competitor_id: int,
    limit: int = 30,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    competitor = db.query(models.Competitor).filter(
        models.Competitor.id == competitor_id,
        models.Competitor.user_id == current_user.id
    ).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="竞品不存在")
    
    return db.query(models.CompetitorData).filter(
        models.CompetitorData.competitor_id == competitor_id
    ).order_by(models.CompetitorData.record_date.desc()).limit(limit).all()


@router.post("/competitors/{competitor_id}/data", response_model=schemas.CompetitorData)
def add_competitor_data(
    competitor_id: int,
    data: dict,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    competitor = db.query(models.Competitor).filter(
        models.Competitor.id == competitor_id,
        models.Competitor.user_id == current_user.id
    ).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="竞品不存在")
    
    db_data = models.CompetitorData(
        competitor_id=competitor_id,
        follower_count=data.get("follower_count", 0),
        avg_views=data.get("avg_views", 0),
        avg_likes=data.get("avg_likes", 0),
        avg_comments=data.get("avg_comments", 0),
        avg_shares=data.get("avg_shares", 0),
        engagement_rate=data.get("engagement_rate", 0.0),
        posting_frequency=data.get("posting_frequency", 0.0),
        recent_topics=data.get("recent_topics", []),
        content_formats=data.get("content_formats", [])
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data
