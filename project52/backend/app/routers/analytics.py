from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, timedelta
from collections import defaultdict
from .. import models, schemas, auth, database

router = APIRouter(prefix="/api/analytics", tags=["成长分析"])


@router.get("/content-attribution")
def get_content_attribution(
    platform: Optional[schemas.PlatformEnum] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    today = date.today()
    if not start_date:
        start_date = today - timedelta(days=90)
    if not end_date:
        end_date = today
    
    calendar_query = db.query(models.ContentCalendar).filter(
        models.ContentCalendar.user_id == current_user.id,
        models.ContentCalendar.publish_date >= start_date,
        models.ContentCalendar.publish_date <= end_date
    )
    
    if platform:
        calendar_query = calendar_query.filter(models.ContentCalendar.platform == platform)
    
    calendars = calendar_query.all()
    calendar_ids = [c.id for c in calendars]
    
    performance_query = db.query(models.ContentPerformance).filter(
        models.ContentPerformance.calendar_id.in_(calendar_ids)
    )
    performances = performance_query.all()
    
    perf_dict = {p.calendar_id: p for p in performances}
    
    topic_stats = defaultdict(lambda: {"views": 0, "engagement": 0.0, "count": 0})
    type_stats = defaultdict(lambda: {"views": 0, "engagement": 0.0, "count": 0})
    time_stats = defaultdict(lambda: {"views": 0, "engagement": 0.0, "count": 0})
    day_stats = defaultdict(lambda: {"views": 0, "engagement": 0.0, "count": 0})
    
    for calendar in calendars:
        perf = perf_dict.get(calendar.id)
        if not perf:
            continue
        
        if calendar.topic:
            topic_stats[calendar.topic]["views"] += perf.views
            topic_stats[calendar.topic]["engagement"] += perf.engagement_rate
            topic_stats[calendar.topic]["count"] += 1
        
        if calendar.content_type:
            type_stats[calendar.content_type.value]["views"] += perf.views
            type_stats[calendar.content_type.value]["engagement"] += perf.engagement_rate
            type_stats[calendar.content_type.value]["count"] += 1
        
        if calendar.publish_time:
            try:
                hour = int(calendar.publish_time.split(":")[0])
                time_slot = f"{hour:02d}:00-{hour+1:02d}:00"
                time_stats[time_slot]["views"] += perf.views
                time_stats[time_slot]["engagement"] += perf.engagement_rate
                time_stats[time_slot]["count"] += 1
            except:
                pass
        
        day_name = calendar.publish_date.strftime("%A")
        day_stats[day_name]["views"] += perf.views
        day_stats[day_name]["engagement"] += perf.engagement_rate
        day_stats[day_name]["count"] += 1
    
    def calc_avg(stats_dict):
        result = []
        for key, stat in stats_dict.items():
            if stat["count"] > 0:
                result.append({
                    "category": key,
                    "avg_views": round(stat["views"] / stat["count"]),
                    "avg_engagement": round(stat["engagement"] / stat["count"], 2),
                    "sample_size": stat["count"],
                    "total_views": stat["views"]
                })
        return sorted(result, key=lambda x: x["avg_engagement"], reverse=True)
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "by_topic": calc_avg(topic_stats),
        "by_content_type": calc_avg(type_stats),
        "by_publish_time": calc_avg(time_stats),
        "by_publish_day": calc_avg(day_stats),
        "recommendations": generate_recommendations(calc_avg(topic_stats), calc_avg(type_stats), calc_avg(time_stats), calc_avg(day_stats))
    }


def generate_recommendations(topics, types, times, days):
    recommendations = []
    
    if topics:
        best_topic = topics[0]
        recommendations.append({
            "type": "topic",
            "message": f"建议增加'{best_topic['category']}'主题的内容，平均互动率{best_topic['avg_engagement']}%",
            "priority": "high" if best_topic["avg_engagement"] > 5 else "medium"
        })
    
    if types:
        best_type = types[0]
        recommendations.append({
            "type": "content_type",
            "message": f"{best_type['category']}格式表现最佳，平均浏览量{best_type['avg_views']}",
            "priority": "high" if best_type["avg_engagement"] > 5 else "medium"
        })
    
    if times:
        best_time = times[0]
        recommendations.append({
            "type": "publish_time",
            "message": f"最佳发布时间段：{best_time['category']}",
            "priority": "medium"
        })
    
    if days:
        best_day = days[0]
        recommendations.append({
            "type": "publish_day",
            "message": f"最佳发布日期：{best_day['category']}",
            "priority": "medium"
        })
    
    return recommendations


@router.get("/follower-insights")
def get_follower_insights(
    platform: Optional[schemas.PlatformEnum] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    accounts = db.query(models.PlatformAccount).filter(
        models.PlatformAccount.user_id == current_user.id
    )
    if platform:
        accounts = accounts.filter(models.PlatformAccount.platform == platform)
    accounts = accounts.all()
    
    result = []
    for account in accounts:
        latest_insight = db.query(models.FollowerInsights).filter(
            models.FollowerInsights.account_id == account.id
        ).order_by(models.FollowerInsights.date.desc()).first()
        
        result.append({
            "platform": account.platform.value,
            "account_name": account.account_name,
            "follower_insight": latest_insight,
            "simulated_data": generate_simulated_follower_data(account.platform.value)
        })
    
    return {
        "accounts": result,
        "cross_platform_analysis": analyze_cross_platform(result)
    }


def generate_simulated_follower_data(platform):
    return {
        "age_distribution": {
            "18-24": random_percent(20, 40),
            "25-34": random_percent(25, 45),
            "35-44": random_percent(15, 30),
            "45-54": random_percent(5, 15),
            "55+": random_percent(2, 10)
        },
        "gender_distribution": {
            "male": random_percent(40, 60),
            "female": random_percent(40, 60)
        },
        "location_distribution": {
            "北京": random_percent(10, 20),
            "上海": random_percent(10, 20),
            "广东": random_percent(10, 20),
            "江苏": random_percent(5, 15),
            "浙江": random_percent(5, 15),
            "其他": random_percent(20, 40)
        },
        "interest_tags": ["科技", "生活", "娱乐", "教育", "美食", "旅行", "美妆", "健身"][:random_percent(3, 6)],
        "active_hours": sorted(random.sample(range(6, 24), random_percent(4, 8)))
    }


import random
def random_percent(min_val, max_val):
    return random.randint(min_val, max_val)


def analyze_cross_platform(accounts_data):
    if len(accounts_data) < 2:
        return {
            "has_multiple_platforms": False,
            "message": "需要至少两个平台的数据进行跨平台分析"
        }
    
    platforms = [a["platform"] for a in accounts_data]
    
    return {
        "has_multiple_platforms": True,
        "platforms": platforms,
        "overlap_analysis": {
            "estimated_overlap_percent": random_percent(10, 40),
            "interpretation": f"估计约{random_percent(10, 40)}%的粉丝在多个平台关注你",
            "recommendation": "建议为不同平台定制差异化内容，最大化触达"
        },
        "comparison": {
            "by_age": compare_attribute(accounts_data, "age_distribution"),
            "by_gender": compare_attribute(accounts_data, "gender_distribution"),
            "by_location": compare_attribute(accounts_data, "location_distribution")
        }
    }


def compare_attribute(accounts_data, attr):
    comparison = {}
    for account in accounts_data:
        platform = account["platform"]
        data = account.get("simulated_data", {}).get(attr, {})
        comparison[platform] = data
    return comparison


@router.get("/growth-trend")
def get_growth_trend(
    period: str = "30d",
    platform: Optional[schemas.PlatformEnum] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    today = date.today()
    
    if period == "7d":
        days = 7
    elif period == "30d":
        days = 30
    elif period =="90d":
        days = 90
    else:
        days = 30
    
    start_date = today - timedelta(days=days)
    
    accounts = db.query(models.PlatformAccount).filter(
        models.PlatformAccount.user_id == current_user.id
    )
    if platform:
        accounts = accounts.filter(models.PlatformAccount.platform == platform)
    accounts = accounts.all()
    
    trend_data = []
    for account in accounts:
        analytics = db.query(models.PlatformAnalytics).filter(
            models.PlatformAnalytics.account_id == account.id,
            models.PlatformAnalytics.date >= start_date
        ).order_by(models.PlatformAnalytics.date).all()
        
        trend_data.append({
            "platform": account.platform.value,
            "account_name": account.account_name,
            "daily_data": [
                {
                    "date": a.date.isoformat(),
                    "followers": a.follower_count,
                    "follower_gain": a.follower_gain,
                    "views": a.total_views,
                    "engagement": a.avg_engagement_rate,
                    "revenue": a.revenue
                }
                for a in analytics
            ],
            "summary": calculate_summary(analytics)
        })
    
    return {
        "period": period,
        "start_date": start_date,
        "end_date": today,
        "trends": trend_data
    }


def calculate_summary(analytics):
    if not analytics:
        return {
            "total_follower_gain": 0,
            "total_views": 0,
            "avg_engagement": 0,
            "total_revenue": 0,
            "growth_rate": 0
        }
    
    total_follower_gain = sum(a.follower_gain for a in analytics)
    total_views = sum(a.total_views for a in analytics)
    avg_engagement = sum(a.avg_engagement_rate for a in analytics) / len(analytics) if analytics else 0
    total_revenue = sum(a.revenue for a in analytics)
    
    if analytics:
        start_followers = analytics[0].follower_count - analytics[0].follower_gain
        growth_rate = (total_follower_gain / start_followers * 100) if start_followers > 0 else 0
    else:
        growth_rate = 0
    
    return {
        "total_follower_gain": total_follower_gain,
        "total_views": total_views,
        "avg_engagement": round(avg_engagement, 2),
        "total_revenue": round(total_revenue, 2),
        "growth_rate": round(growth_rate, 2)
    }


@router.get("/top-performing-content")
def get_top_performing_content(
    limit: int = 10,
    platform: Optional[schemas.PlatformEnum] = None,
    metric: str = "engagement",
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    calendars = db.query(models.ContentCalendar).filter(
        models.ContentCalendar.user_id == current_user.id
    )
    if platform:
        calendars = calendars.filter(models.ContentCalendar.platform == platform)
    calendars = calendars.all()
    
    calendar_ids = [c.id for c in calendars]
    
    performances = db.query(models.ContentPerformance).filter(
        models.ContentPerformance.calendar_id.in_(calendar_ids)
    ).all()
    
    perf_dict = {p.calendar_id: p for p in performances}
    
    results = []
    for calendar in calendars:
        perf = perf_dict.get(calendar.id)
        if not perf:
            continue
        
        results.append({
            "id": calendar.id,
            "title": calendar.title,
            "platform": calendar.platform.value,
            "content_type": calendar.content_type.value if calendar.content_type else None,
            "topic": calendar.topic,
            "publish_date": calendar.publish_date.isoformat(),
            "views": perf.views,
            "likes": perf.likes,
            "comments": perf.comments,
            "shares": perf.shares,
            "engagement_rate": perf.engagement_rate,
            "watch_time": perf.watch_time,
            "completion_rate": perf.completion_rate
        })
    
    if metric == "engagement":
        results.sort(key=lambda x: x["engagement_rate"], reverse=True)
    elif metric == "views":
        results.sort(key=lambda x: x["views"], reverse=True)
    elif metric == "likes":
        results.sort(key=lambda x: x["likes"], reverse=True)
    elif metric == "shares":
        results.sort(key=lambda x: x["shares"], reverse=True)
    
    return {
        "metric": metric,
        "limit": limit,
        "content": results[:limit]
    }
