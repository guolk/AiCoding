from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from .. import models, schemas, auth, database

router = APIRouter(prefix="/api/monetization", tags=["变现管理"])


@router.get("/revenue", response_model=List[schemas.RevenueRecord])
def get_revenue(
    platform: Optional[schemas.PlatformEnum] = None,
    revenue_type: Optional[schemas.RevenueTypeEnum] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.RevenueRecord).filter(
        models.RevenueRecord.user_id == current_user.id
    )
    
    if platform:
        query = query.filter(models.RevenueRecord.platform == platform)
    if revenue_type:
        query = query.filter(models.RevenueRecord.revenue_type == revenue_type)
    if start_date:
        query = query.filter(models.RevenueRecord.record_date >= start_date)
    if end_date:
        query = query.filter(models.RevenueRecord.record_date <= end_date)
    
    return query.order_by(models.RevenueRecord.record_date.desc()).all()


@router.post("/revenue", response_model=schemas.RevenueRecord)
def create_revenue(
    revenue: schemas.RevenueRecordCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_revenue = models.RevenueRecord(**revenue.model_dump(), user_id=current_user.id)
    db.add(db_revenue)
    db.commit()
    db.refresh(db_revenue)
    return db_revenue


@router.put("/revenue/{revenue_id}", response_model=schemas.RevenueRecord)
def update_revenue(
    revenue_id: int,
    revenue_update: schemas.RevenueRecordUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    revenue = db.query(models.RevenueRecord).filter(
        models.RevenueRecord.id == revenue_id,
        models.RevenueRecord.user_id == current_user.id
    ).first()
    if not revenue:
        raise HTTPException(status_code=404, detail="收益记录不存在")
    
    update_data = revenue_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(revenue, key, value)
    
    db.commit()
    db.refresh(revenue)
    return revenue


@router.delete("/revenue/{revenue_id}")
def delete_revenue(
    revenue_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    revenue = db.query(models.RevenueRecord).filter(
        models.RevenueRecord.id == revenue_id,
        models.RevenueRecord.user_id == current_user.id
    ).first()
    if not revenue:
        raise HTTPException(status_code=404, detail="收益记录不存在")
    
    db.delete(revenue)
    db.commit()
    return {"message": "删除成功"}


@router.get("/revenue/summary")
def get_revenue_summary(
    period: str = "month",
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    today = date.today()
    
    if period == "week":
        start_date = today - timedelta(days=7)
    elif period == "month":
        start_date = today.replace(day=1)
    elif period == "quarter":
        quarter = (today.month - 1) // 3
        start_date = today.replace(month=quarter * 3 + 1, day=1)
    elif period == "year":
        start_date = today.replace(month=1, day=1)
    else:
        start_date = today - timedelta(days=30)
    
    revenues = db.query(models.RevenueRecord).filter(
        models.RevenueRecord.user_id == current_user.id,
        models.RevenueRecord.record_date >= start_date
    ).all()
    
    total_amount = sum(r.amount for r in revenues)
    
    by_platform = {}
    by_type = {}
    
    for revenue in revenues:
        platform = revenue.platform.value
        revenue_type = revenue.revenue_type.value
        
        if platform not in by_platform:
            by_platform[platform] = 0
        by_platform[platform] += revenue.amount
        
        if revenue_type not in by_type:
            by_type[revenue_type] = 0
        by_type[revenue_type] += revenue.amount
    
    return {
        "period": period,
        "start_date": start_date,
        "end_date": today,
        "total_amount": total_amount,
        "by_platform": by_platform,
        "by_type": by_type,
        "record_count": len(revenues)
    }


@router.post("/revenue/price-recommendation", response_model=schemas.PriceRecommendation)
def get_price_recommendation(
    platform: schemas.PlatformEnum,
    content_type: schemas.ContentTypeEnum,
    follower_count: int,
    engagement_rate: float,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    base_prices = {
        "bilibili": {
            "video": 0.05,
            "short_video": 0.03,
            "live": 0.08
        },
        "douyin": {
            "video": 0.04,
            "short_video": 0.02,
            "live": 0.06
        },
        "xiaohongshu": {
            "article": 0.06,
            "video": 0.05,
            "short_video": 0.03
        },
        "wechat": {
            "article": 0.08,
            "video": 0.05,
            "short_video": 0.03
        },
        "youtube": {
            "video": 0.10,
            "short_video": 0.04,
            "live": 0.15
        }
    }
    
    platform_base = base_prices.get(platform.value, {})
    base_price_per_1000 = platform_base.get(content_type.value, 0.05)
    
    base_price = (follower_count / 1000) * base_price_per_1000
    
    engagement_multiplier = 1.0
    if engagement_rate > 10:
        engagement_multiplier = 1.5
    elif engagement_rate > 5:
        engagement_multiplier = 1.2
    elif engagement_rate > 3:
        engagement_multiplier = 1.0
    elif engagement_rate > 1:
        engagement_multiplier = 0.8
    else:
        engagement_multiplier = 0.6
    
    suggested_price = base_price * engagement_multiplier
    
    tier_factors = {
        "bilibili": [
            {"min": 0, "max": 10000, "factor": 1.0},
            {"min": 10000, "max": 100000, "factor": 1.2},
            {"min": 100000, "max": 500000, "factor": 1.5},
            {"min": 500000, "max": 1000000, "factor": 2.0},
            {"min": 1000000, "max": float("inf"), "factor": 3.0}
        ]
    }
    
    tiers = tier_factors.get(platform.value, tier_factors["bilibili"])
    tier_factor = 1.0
    for tier in tiers:
        if tier["min"] <= follower_count < tier["max"]:
            tier_factor = tier["factor"]
            break
    
    suggested_price *= tier_factor
    
    min_price = suggested_price * 0.7
    max_price = suggested_price * 1.5
    
    return schemas.PriceRecommendation(
        platform=platform,
        content_type=content_type,
        follower_count=follower_count,
        engagement_rate=engagement_rate,
        suggested_price=round(suggested_price, 2),
        min_price=round(min_price, 2),
        max_price=round(max_price, 2),
        breakdown={
            "base_price_per_1000": base_price_per_1000,
            "engagement_multiplier": engagement_multiplier,
            "tier_factor": tier_factor,
            "formula": f"({follower_count}/1000) × {base_price_per_1000} × {engagement_multiplier} × {tier_factor}"
        }
    )


@router.get("/cooperations", response_model=List[schemas.BusinessCooperation])
def get_cooperations(
    status: Optional[str] = None,
    platform: Optional[schemas.PlatformEnum] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.BusinessCooperation).filter(
        models.BusinessCooperation.user_id == current_user.id
    )
    
    if status:
        query = query.filter(models.BusinessCooperation.status == status)
    if platform:
        query = query.filter(models.BusinessCooperation.platform == platform)
    
    return query.order_by(models.BusinessCooperation.created_at.desc()).all()


@router.post("/cooperations", response_model=schemas.BusinessCooperation)
def create_cooperation(
    cooperation: schemas.BusinessCooperationCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_cooperation = models.BusinessCooperation(**cooperation.model_dump(), user_id=current_user.id)
    db.add(db_cooperation)
    db.commit()
    db.refresh(db_cooperation)
    return db_cooperation


@router.get("/cooperations/{coop_id}", response_model=schemas.BusinessCooperation)
def get_cooperation(
    coop_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    cooperation = db.query(models.BusinessCooperation).filter(
        models.BusinessCooperation.id == coop_id,
        models.BusinessCooperation.user_id == current_user.id
    ).first()
    if not cooperation:
        raise HTTPException(status_code=404, detail="合作项目不存在")
    return cooperation


@router.put("/cooperations/{coop_id}", response_model=schemas.BusinessCooperation)
def update_cooperation(
    coop_id: int,
    coop_update: schemas.BusinessCooperationUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    cooperation = db.query(models.BusinessCooperation).filter(
        models.BusinessCooperation.id == coop_id,
        models.BusinessCooperation.user_id == current_user.id
    ).first()
    if not cooperation:
        raise HTTPException(status_code=404, detail="合作项目不存在")
    
    update_data = coop_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cooperation, key, value)
    
    db.commit()
    db.refresh(cooperation)
    return cooperation


@router.delete("/cooperations/{coop_id}")
def delete_cooperation(
    coop_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    cooperation = db.query(models.BusinessCooperation).filter(
        models.BusinessCooperation.id == coop_id,
        models.BusinessCooperation.user_id == current_user.id
    ).first()
    if not cooperation:
        raise HTTPException(status_code=404, detail="合作项目不存在")
    
    db.delete(cooperation)
    db.commit()
    return {"message": "删除成功"}
