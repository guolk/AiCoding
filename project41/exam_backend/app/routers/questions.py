import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas import (
    QuestionCreate, QuestionUpdate, QuestionResponse,
    QuestionType, DifficultyLevel, PaginatedResponse
)
from app.auth import get_current_active_user, require_role
from app.database import get_db, parse_datetime, get_first_value

router = APIRouter()


@router.post("/questions", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        INSERT INTO questions (title, type, difficulty, tags, score, explanation, 
                              knowledge_points, question_data, creator_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ''', (
        question_data.title,
        question_data.type.value,
        question_data.difficulty.value,
        json.dumps(question_data.tags, ensure_ascii=False),
        question_data.score,
        question_data.explanation,
        json.dumps(question_data.knowledge_points, ensure_ascii=False),
        json.dumps(question_data.question_data, ensure_ascii=False),
        current_user.get("id")
    ))
    
    question_id = cursor.lastrowid
    db.commit()
    
    cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
    row = cursor.fetchone()
    db.close()
    
    return QuestionResponse(
        id=row["id"],
        title=row["title"],
        type=QuestionType(row["type"]),
        difficulty=DifficultyLevel(row["difficulty"]),
        tags=json.loads(row["tags"]) if row["tags"] else [],
        score=row["score"],
        explanation=row["explanation"],
        knowledge_points=json.loads(row["knowledge_points"]) if row["knowledge_points"] else [],
        creator_id=row["creator_id"],
        created_at=parse_datetime(row["created_at"]),
        updated_at=parse_datetime(row["updated_at"]),
        is_active=bool(row["is_active"]),
        question_data=json.loads(row["question_data"]) if row["question_data"] else {}
    )


@router.get("/questions", response_model=PaginatedResponse)
async def get_questions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    type: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    query = "SELECT * FROM questions WHERE is_active = 1"
    params = []
    
    if type:
        query += " AND type = ?"
        params.append(type)
    
    if difficulty:
        query += " AND difficulty = ?"
        params.append(difficulty)
    
    if search:
        query += " AND title LIKE ?"
        params.append(f"%{search}%")
    
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
        items.append(QuestionResponse(
            id=row["id"],
            title=row["title"],
            type=QuestionType(row["type"]),
            difficulty=DifficultyLevel(row["difficulty"]),
            tags=json.loads(row["tags"]) if row["tags"] else [],
            score=row["score"],
            explanation=row["explanation"],
            knowledge_points=json.loads(row["knowledge_points"]) if row["knowledge_points"] else [],
            creator_id=row["creator_id"],
            created_at=parse_datetime(row["created_at"]),
            updated_at=parse_datetime(row["updated_at"]),
            is_active=bool(row["is_active"]),
            question_data=json.loads(row["question_data"]) if row["question_data"] else {}
        ))
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/questions/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM questions WHERE id = ? AND is_active = 1", (question_id,))
    row = cursor.fetchone()
    db.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    return QuestionResponse(
        id=row["id"],
        title=row["title"],
        type=QuestionType(row["type"]),
        difficulty=DifficultyLevel(row["difficulty"]),
        tags=json.loads(row["tags"]) if row["tags"] else [],
        score=row["score"],
        explanation=row["explanation"],
        knowledge_points=json.loads(row["knowledge_points"]) if row["knowledge_points"] else [],
        creator_id=row["creator_id"],
        created_at=parse_datetime(row["created_at"]),
        updated_at=parse_datetime(row["updated_at"]),
        is_active=bool(row["is_active"]),
        question_data=json.loads(row["question_data"]) if row["question_data"] else {}
    )


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
    row = cursor.fetchone()
    
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="题目不存在")
    
    update_fields = []
    params = []
    
    if question_data.title is not None:
        update_fields.append("title = ?")
        params.append(question_data.title)
    if question_data.type is not None:
        update_fields.append("type = ?")
        params.append(question_data.type.value)
    if question_data.difficulty is not None:
        update_fields.append("difficulty = ?")
        params.append(question_data.difficulty.value)
    if question_data.tags is not None:
        update_fields.append("tags = ?")
        params.append(json.dumps(question_data.tags, ensure_ascii=False))
    if question_data.score is not None:
        update_fields.append("score = ?")
        params.append(question_data.score)
    if question_data.explanation is not None:
        update_fields.append("explanation = ?")
        params.append(question_data.explanation)
    if question_data.knowledge_points is not None:
        update_fields.append("knowledge_points = ?")
        params.append(json.dumps(question_data.knowledge_points, ensure_ascii=False))
    if question_data.question_data is not None:
        update_fields.append("question_data = ?")
        params.append(json.dumps(question_data.question_data, ensure_ascii=False))
    if question_data.is_active is not None:
        update_fields.append("is_active = ?")
        params.append(1 if question_data.is_active else 0)
    
    if update_fields:
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        query = "UPDATE questions SET " + ", ".join(update_fields) + " WHERE id = ?"
        params.append(question_id)
        cursor.execute(query, params)
        db.commit()
    
    cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
    row = cursor.fetchone()
    db.close()
    
    return QuestionResponse(
        id=row["id"],
        title=row["title"],
        type=QuestionType(row["type"]),
        difficulty=DifficultyLevel(row["difficulty"]),
        tags=json.loads(row["tags"]) if row["tags"] else [],
        score=row["score"],
        explanation=row["explanation"],
        knowledge_points=json.loads(row["knowledge_points"]) if row["knowledge_points"] else [],
        creator_id=row["creator_id"],
        created_at=parse_datetime(row["created_at"]),
        updated_at=parse_datetime(row["updated_at"]),
        is_active=bool(row["is_active"]),
        question_data=json.loads(row["question_data"]) if row["question_data"] else {}
    )


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT id FROM questions WHERE id = ?", (question_id,))
    if not cursor.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="题目不存在")
    
    cursor.execute("UPDATE questions SET is_active = 0 WHERE id = ?", (question_id,))
    db.commit()
    db.close()
    
    return {"message": "题目已删除"}
