from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth, database
import random

router = APIRouter(prefix="/api/content-production", tags=["内容生产"])


@router.get("/script-templates", response_model=List[schemas.ScriptTemplate])
def get_script_templates(
    content_type: Optional[schemas.ContentTypeEnum] = None,
    platform: Optional[schemas.PlatformEnum] = None,
    include_public: bool = True,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.ScriptTemplate).filter(
        (models.ScriptTemplate.user_id == current_user.id) |
        (include_public & (models.ScriptTemplate.is_public == True))
    )
    
    if content_type:
        query = query.filter(models.ScriptTemplate.content_type == content_type)
    if platform:
        query = query.filter(models.ScriptTemplate.platform == platform)
    
    return query.all()


@router.post("/script-templates", response_model=schemas.ScriptTemplate)
def create_script_template(
    template: schemas.ScriptTemplateCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_template = models.ScriptTemplate(**template.model_dump(), user_id=current_user.id)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.get("/script-templates/{template_id}", response_model=schemas.ScriptTemplate)
def get_script_template(
    template_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    template = db.query(models.ScriptTemplate).filter(
        models.ScriptTemplate.id == template_id,
        (models.ScriptTemplate.user_id == current_user.id) |
        (models.ScriptTemplate.is_public == True)
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="脚本模板不存在")
    return template


@router.put("/script-templates/{template_id}", response_model=schemas.ScriptTemplate)
def update_script_template(
    template_id: int,
    template_update: schemas.ScriptTemplateUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    template = db.query(models.ScriptTemplate).filter(
        models.ScriptTemplate.id == template_id,
        models.ScriptTemplate.user_id == current_user.id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="脚本模板不存在")
    
    update_data = template_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)
    
    db.commit()
    db.refresh(template)
    return template


@router.delete("/script-templates/{template_id}")
def delete_script_template(
    template_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    template = db.query(models.ScriptTemplate).filter(
        models.ScriptTemplate.id == template_id,
        models.ScriptTemplate.user_id == current_user.id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="脚本模板不存在")
    
    db.delete(template)
    db.commit()
    return {"message": "删除成功"}


@router.post("/script-templates/{template_id}/generate")
def generate_script(
    template_id: int,
    topic: str,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    template = db.query(models.ScriptTemplate).filter(
        models.ScriptTemplate.id == template_id,
        (models.ScriptTemplate.user_id == current_user.id) |
        (models.ScriptTemplate.is_public == True)
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="脚本模板不存在")
    
    opening = template.opening.replace("{topic}", topic) if template.opening else ""
    main_content = template.main_content.replace("{topic}", topic) if template.main_content else ""
    closing = template.closing.replace("{topic}", topic) if template.closing else ""
    call_to_action = template.call_to_action if template.call_to_action else ""
    
    return {
        "template_name": template.name,
        "topic": topic,
        "opening": opening,
        "main_content": main_content,
        "closing": closing,
        "call_to_action": call_to_action,
        "full_script": f"{opening}\n\n{main_content}\n\n{closing}\n\n{call_to_action}"
    }


@router.get("/keyword-research", response_model=List[schemas.KeywordResearch])
def get_keyword_research(
    platform: Optional[schemas.PlatformEnum] = None,
    keyword: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.KeywordResearch).filter(
        models.KeywordResearch.user_id == current_user.id
    )
    
    if platform:
        query = query.filter(models.KeywordResearch.platform == platform)
    if keyword:
        query = query.filter(models.KeywordResearch.keyword.contains(keyword))
    
    return query.order_by(models.KeywordResearch.research_date.desc()).all()


@router.post("/keyword-research", response_model=schemas.KeywordResearch)
def create_keyword_research(
    research: schemas.KeywordResearchCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_research = models.KeywordResearch(**research.model_dump(), user_id=current_user.id)
    db.add(db_research)
    db.commit()
    db.refresh(db_research)
    return db_research


@router.post("/keyword-research/analyze")
def analyze_keyword(
    keyword: str,
    platform: schemas.PlatformEnum,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    search_volume = random.randint(1000, 100000)
    
    if search_volume > 50000:
        competition_level = "high"
    elif search_volume > 10000:
        competition_level = "medium"
    else:
        competition_level = "low"
    
    trend_options = ["rising", "stable", "declining"]
    trend = random.choice(trend_options)
    
    related_keywords = [
        f"{keyword}教程",
        f"{keyword}是什么",
        f"{keyword}推荐",
        f"2024{keyword}",
        f"最新{keyword}"
    ]
    
    top_content = []
    for i in range(5):
        top_content.append({
            "title": f"关于{keyword}的第{i+1}个热门内容",
            "views": random.randint(10000, 1000000),
            "likes": random.randint(1000, 50000),
            "engagement_rate": round(random.uniform(2, 15), 2)
        })
    
    return {
        "keyword": keyword,
        "platform": platform,
        "search_volume": search_volume,
        "competition_level": competition_level,
        "trend": trend,
        "related_keywords": related_keywords,
        "top_content": top_content,
        "recommendation": f"关键词'{keyword}'在{platform}平台搜索量{search_volume}，竞争{competition_level}，趋势{trend}"
    }


@router.get("/cover-templates", response_model=List[schemas.CoverTemplate])
def get_cover_templates(
    platform: Optional[schemas.PlatformEnum] = None,
    include_public: bool = True,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.CoverTemplate).filter(
        (models.CoverTemplate.user_id == current_user.id) |
        (include_public & (models.CoverTemplate.is_public == True))
    )
    
    if platform:
        query = query.filter(models.CoverTemplate.platform == platform)
    
    return query.all()


@router.post("/cover-templates", response_model=schemas.CoverTemplate)
def create_cover_template(
    template: schemas.CoverTemplateCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_template = models.CoverTemplate(**template.model_dump(), user_id=current_user.id)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.put("/cover-templates/{template_id}", response_model=schemas.CoverTemplate)
def update_cover_template(
    template_id: int,
    template_update: schemas.CoverTemplateUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    template = db.query(models.CoverTemplate).filter(
        models.CoverTemplate.id == template_id,
        models.CoverTemplate.user_id == current_user.id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="封面模板不存在")
    
    update_data = template_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)
    
    db.commit()
    db.refresh(template)
    return template


@router.delete("/cover-templates/{template_id}")
def delete_cover_template(
    template_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    template = db.query(models.CoverTemplate).filter(
        models.CoverTemplate.id == template_id,
        models.CoverTemplate.user_id == current_user.id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="封面模板不存在")
    
    db.delete(template)
    db.commit()
    return {"message": "删除成功"}


@router.post("/cover-templates/{template_id}/generate")
def generate_cover(
    template_id: int,
    title: str,
    subtitle: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    template = db.query(models.CoverTemplate).filter(
        models.CoverTemplate.id == template_id,
        (models.CoverTemplate.user_id == current_user.id) |
        (models.CoverTemplate.is_public == True)
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="封面模板不存在")
    
    return {
        "template_name": template.name,
        "platform": template.platform,
        "dimensions": f"{template.width}x{template.height}",
        "title": title,
        "subtitle": subtitle,
        "styles": {
            "background_color": template.background_color,
            "text_color": template.text_color,
            "accent_color": template.accent_color,
            "font_family": template.font_family,
            "layout": template.layout
        },
        "preview": {
            "type": "canvas",
            "width": template.width,
            "height": template.height,
            "elements": [
                {
                    "type": "background",
                    "color": template.background_color
                },
                {
                    "type": "text",
                    "content": title,
                    "x": template.width / 2,
                    "y": template.height / 2 - 40,
                    "color": template.text_color,
                    "font_size": 48,
                    "font_weight": "bold",
                    "text_align": "center"
                },
                {
                    "type": "text",
                    "content": subtitle or "",
                    "x": template.width / 2,
                    "y": template.height / 2 + 20,
                    "color": template.accent_color,
                    "font_size": 24,
                    "text_align": "center"
                }
            ]
        }
    }


@router.get("/platform-sizes")
def get_platform_sizes():
    return {
        "bilibili": {
            "video_cover": {"width": 1920, "height": 1080, "name": "视频封面 16:9"},
            "vertical_video": {"width": 1080, "height": 1920, "name": "竖版视频 9:16"}
        },
        "douyin": {
            "video_cover": {"width": 1080, "height": 1920, "name": "视频封面 9:16"},
            "profile_video": {"width": 1080, "height": 1920, "name": "主页视频 9:16"}
        },
        "xiaohongshu": {
            "note_image": {"width": 1242, "height": 1660, "name": "笔记图片 3:4"},
            "square_image": {"width": 1080, "height": 1080, "name": "方形图片 1:1"}
        },
        "wechat": {
            "article_cover": {"width": 900, "height": 383, "name": "文章封面 2.35:1"},
            "video_cover": {"width": 1080, "height": 1920, "name": "视频号封面 9:16"}
        },
        "youtube": {
            "video_cover": {"width": 1280, "height": 720, "name": "视频封面 16:9"},
            "thumbnail": {"width": 1280, "height": 720, "name": "缩略图 16:9"}
        }
    }
