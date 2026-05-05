import json
import random
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas import (
    PaperCreate, PaperResponse, PaperDetailResponse,
    PaperQuestionItem, RandomRule, QuestionType, DifficultyLevel,
    PaginatedResponse
)
from app.auth import get_current_active_user, require_role
from app.database import get_db, parse_datetime, get_first_value

router = APIRouter()


@router.post("/papers", response_model=PaperResponse)
async def create_paper(
    paper_data: PaperCreate,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    if paper_data.mode == "manual" and not paper_data.questions:
        raise HTTPException(status_code=400, detail="手动组卷需要提供题目列表")
    
    if paper_data.mode == "random" and not paper_data.random_rules:
        raise HTTPException(status_code=400, detail="随机组卷需要提供抽题规则")
    
    cursor.execute('''
        INSERT INTO papers (title, description, mode, creator_id, total_score, tags, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
    ''', (
        paper_data.title,
        paper_data.description,
        paper_data.mode.value if hasattr(paper_data.mode, 'value') else paper_data.mode,
        current_user.get("id"),
        0,
        json.dumps(paper_data.tags, ensure_ascii=False)
    ))
    
    paper_id = cursor.lastrowid
    
    questions = []
    total_score = 0
    
    if paper_data.mode == "manual" and paper_data.questions:
        for item in paper_data.questions:
            cursor.execute("SELECT id, score FROM questions WHERE id = ? AND is_active = 1", (item.question_id,))
            q = cursor.fetchone()
            if not q:
                db.close()
                raise HTTPException(status_code=404, detail=f"题目 {item.question_id} 不存在")
            
            score = item.score if item.score is not None else q["score"]
            questions.append({"question_id": item.question_id, "score": score})
            total_score += score
    
    elif paper_data.mode == "random" and paper_data.random_rules:
        for rule in paper_data.random_rules:
            query = "SELECT id, score FROM questions WHERE type = ? AND is_active = 1"
            params = [rule.question_type.value]
            
            if rule.difficulty:
                query += " AND difficulty = ?"
                params.append(rule.difficulty.value)
            
            cursor.execute(query, params)
            available_questions = cursor.fetchall()
            
            if len(available_questions) < rule.count:
                db.close()
                raise HTTPException(
                    status_code=400,
                    detail=f"{rule.question_type.value} 类型题目不足，需要 {rule.count} 道，现有 {len(available_questions)} 道"
                )
            
            selected = random.sample(available_questions, rule.count)
            for q in selected:
                questions.append({"question_id": q["id"], "score": rule.score_per_question})
                total_score += rule.score_per_question
    
    for idx, q in enumerate(questions):
        cursor.execute('''
            INSERT INTO paper_questions (paper_id, question_id, sort_order, score)
            VALUES (?, ?, ?, ?)
        ''', (paper_id, q["question_id"], idx, q["score"]))
    
    cursor.execute("UPDATE papers SET total_score = ?, question_count = ? WHERE id = ?",
                   (total_score, len(questions), paper_id))
    
    db.commit()
    
    cursor.execute("SELECT * FROM papers WHERE id = ?", (paper_id,))
    row = cursor.fetchone()
    db.close()
    
    return PaperResponse(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        mode=row["mode"],
        creator_id=row["creator_id"],
        created_at=parse_datetime(row["created_at"]),
        updated_at=parse_datetime(row["updated_at"]),
        total_score=row["total_score"],
        question_count=row["question_count"],
        tags=json.loads(row["tags"]) if row["tags"] else [],
        is_active=bool(row["is_active"])
    )


@router.get("/papers", response_model=PaginatedResponse)
async def get_papers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    query = "SELECT * FROM papers WHERE is_active = 1"
    params = []
    
    if search:
        query += " AND title LIKE ?"
        params.append(f"%{search}%")
    
    if current_user.get("role") not in ["admin", "teacher"]:
        query += " AND creator_id = ?"
        params.append(current_user.get("id"))
    
    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    cursor.execute(count_query, params)
    count_result = cursor.fetchone()
    total = get_first_value(count_result)
    
    offset = (page - 1) * page_size
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([page_size, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    db.close()
    
    items = []
    for row in rows:
        items.append(PaperResponse(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            mode=row["mode"],
            creator_id=row["creator_id"],
            created_at=parse_datetime(row["created_at"]),
            updated_at=parse_datetime(row["updated_at"]),
            total_score=row["total_score"],
            question_count=row["question_count"],
            tags=json.loads(row["tags"]) if row["tags"] else [],
            is_active=bool(row["is_active"])
        ))
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/papers/{paper_id}", response_model=PaperDetailResponse)
async def get_paper(
    paper_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM papers WHERE id = ?", (paper_id,))
    row = cursor.fetchone()
    
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="试卷不存在")
    
    cursor.execute('''
        SELECT pq.*, q.title, q.type, q.difficulty, q.question_data
        FROM paper_questions pq
        JOIN questions q ON pq.question_id = q.id
        WHERE pq.paper_id = ?
        ORDER BY pq.sort_order
    ''', (paper_id,))
    question_rows = cursor.fetchall()
    db.close()
    
    questions = []
    for q in question_rows:
        questions.append({
            "id": q["question_id"],
            "title": q["title"],
            "type": q["type"],
            "difficulty": q["difficulty"],
            "score": q["score"],
            "sort_order": q["sort_order"],
            "question_data": json.loads(q["question_data"]) if q["question_data"] else {}
        })
    
    return PaperDetailResponse(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        mode=row["mode"],
        creator_id=row["creator_id"],
        created_at=parse_datetime(row["created_at"]),
        updated_at=parse_datetime(row["updated_at"]),
        total_score=row["total_score"],
        question_count=row["question_count"],
        tags=json.loads(row["tags"]) if row["tags"] else [],
        is_active=bool(row["is_active"]),
        questions=questions
    )


@router.delete("/papers/{paper_id}")
async def delete_paper(
    paper_id: int,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT creator_id FROM papers WHERE id = ?", (paper_id,))
    row = cursor.fetchone()
    
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="试卷不存在")
    
    if current_user.get("role") != "admin" and row["creator_id"] != current_user.get("id"):
        db.close()
        raise HTTPException(status_code=403, detail="无权限删除此试卷")
    
    cursor.execute("UPDATE papers SET is_active = 0 WHERE id = ?", (paper_id,))
    db.commit()
    db.close()
    
    return {"message": "试卷已删除"}
