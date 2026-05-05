import json
import random
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas import (
    ExamCreate, ExamResponse, ExamForStudentResponse,
    ExamStatus, PaginatedResponse
)
from app.auth import get_current_active_user, require_role
from app.database import get_db, parse_datetime, get_first_value

router = APIRouter()


@router.post("/exams", response_model=ExamResponse)
async def create_exam(
    exam_data: ExamCreate,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT id FROM papers WHERE id = ? AND is_active = 1", (exam_data.paper_id,))
    if not cursor.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="试卷不存在")
    
    cursor.execute('''
        INSERT INTO exams (
            title, paper_id, creator_id, start_time, end_time, duration,
            status, shuffle_questions, shuffle_options, allow_late_submit,
            auto_submit, anti_cheat_enabled, max_tab_switch_count,
            allowed_users, allowed_roles
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        exam_data.title,
        exam_data.paper_id,
        current_user.get("id"),
        exam_data.start_time.isoformat() if hasattr(exam_data.start_time, 'isoformat') else exam_data.start_time,
        exam_data.end_time.isoformat() if hasattr(exam_data.end_time, 'isoformat') else exam_data.end_time,
        exam_data.duration,
        "draft",
        1 if exam_data.shuffle_questions else 0,
        1 if exam_data.shuffle_options else 0,
        1 if exam_data.allow_late_submit else 0,
        1 if exam_data.auto_submit else 0,
        1 if exam_data.anti_cheat_enabled else 0,
        exam_data.max_tab_switch_count,
        json.dumps(exam_data.allowed_users, ensure_ascii=False) if exam_data.allowed_users else None,
        json.dumps([r.value for r in exam_data.allowed_roles], ensure_ascii=False) if exam_data.allowed_roles else None
    ))
    
    exam_id = cursor.lastrowid
    db.commit()
    
    cursor.execute("SELECT * FROM exams WHERE id = ?", (exam_id,))
    row = cursor.fetchone()
    db.close()
    
    return ExamResponse(
        id=row["id"],
        title=row["title"],
        paper_id=row["paper_id"],
        creator_id=row["creator_id"],
        start_time=parse_datetime(row["start_time"]),
        end_time=parse_datetime(row["end_time"]),
        duration=row["duration"],
        status=ExamStatus(row["status"]),
        shuffle_questions=bool(row["shuffle_questions"]),
        shuffle_options=bool(row["shuffle_options"]),
        anti_cheat_enabled=bool(row["anti_cheat_enabled"]),
        max_tab_switch_count=row["max_tab_switch_count"],
        created_at=parse_datetime(row["created_at"]),
        updated_at=parse_datetime(row["updated_at"])
    )


@router.get("/exams", response_model=PaginatedResponse)
async def get_exams(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    query = "SELECT * FROM exams WHERE 1=1"
    params = []
    
    if status:
        query += " AND status = ?"
        params.append(status)
    
    if search:
        query += " AND title LIKE ?"
        params.append(f"%{search}%")
    
    if current_user.get("role") not in ["admin", "teacher"]:
        query += " AND (allowed_users IS NULL OR json_extract(allowed_users, '$') LIKE ?)"
        params.append(f"%{current_user.get('id')}%")
    
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
        items.append(ExamResponse(
            id=row["id"],
            title=row["title"],
            paper_id=row["paper_id"],
            creator_id=row["creator_id"],
            start_time=parse_datetime(row["start_time"]),
            end_time=parse_datetime(row["end_time"]),
            duration=row["duration"],
            status=ExamStatus(row["status"]),
            shuffle_questions=bool(row["shuffle_questions"]),
            shuffle_options=bool(row["shuffle_options"]),
            anti_cheat_enabled=bool(row["anti_cheat_enabled"]),
            max_tab_switch_count=row["max_tab_switch_count"],
            created_at=parse_datetime(row["created_at"]),
            updated_at=parse_datetime(row["updated_at"])
        ))
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/exams/student", response_model=List[ExamForStudentResponse])
async def get_student_exams(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT e.*, p.title as paper_title, p.total_score
        FROM exams e
        JOIN papers p ON e.paper_id = p.id
        WHERE e.status IN ('published', 'in_progress', 'ended')
        AND (e.allowed_users IS NULL OR json_extract(e.allowed_users, '$') LIKE ?)
        ORDER BY e.start_time DESC
    ''', (f"%{current_user.get('id')}%",))
    
    rows = cursor.fetchall()
    db.close()
    
    items = []
    for row in rows:
        items.append(ExamForStudentResponse(
            id=row["id"],
            title=row["title"],
            start_time=parse_datetime(row["start_time"]),
            end_time=parse_datetime(row["end_time"]),
            duration=row["duration"],
            status=ExamStatus(row["status"]),
            paper_title=row["paper_title"],
            total_score=row["total_score"]
        ))
    
    return items


@router.put("/exams/{exam_id}/publish")
async def publish_exam(
    exam_id: int,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM exams WHERE id = ?", (exam_id,))
    row = cursor.fetchone()
    
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="考试不存在")
    
    cursor.execute("UPDATE exams SET status = 'published' WHERE id = ?", (exam_id,))
    db.commit()
    db.close()
    
    return {"message": "考试已发布", "status": "published"}


@router.get("/exams/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM exams WHERE id = ?", (exam_id,))
    row = cursor.fetchone()
    db.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="考试不存在")
    
    return ExamResponse(
        id=row["id"],
        title=row["title"],
        paper_id=row["paper_id"],
        creator_id=row["creator_id"],
        start_time=parse_datetime(row["start_time"]),
        end_time=parse_datetime(row["end_time"]),
        duration=row["duration"],
        status=ExamStatus(row["status"]),
        shuffle_questions=bool(row["shuffle_questions"]),
        shuffle_options=bool(row["shuffle_options"]),
        anti_cheat_enabled=bool(row["anti_cheat_enabled"]),
        max_tab_switch_count=row["max_tab_switch_count"],
        created_at=parse_datetime(row["created_at"]),
        updated_at=parse_datetime(row["updated_at"])
    )


@router.delete("/exams/{exam_id}")
async def delete_exam(
    exam_id: int,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT id FROM exams WHERE id = ?", (exam_id,))
    if not cursor.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="考试不存在")
    
    cursor.execute("DELETE FROM exams WHERE id = ?", (exam_id,))
    db.commit()
    db.close()
    
    return {"message": "考试已删除"}
