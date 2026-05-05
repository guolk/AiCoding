import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas import (
    ManualGrading, SubmissionResponse, PaginatedResponse
)
from app.auth import get_current_active_user, require_role
from app.database import get_db, get_first_value

router = APIRouter()


@router.get("/grading/pending", response_model=PaginatedResponse)
async def get_pending_submissions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    exam_id: Optional[int] = Query(None),
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    query = '''
        SELECT s.*, e.title as exam_title, u.username, u.real_name
        FROM submissions s
        JOIN exams e ON s.exam_id = e.id
        JOIN users u ON s.user_id = u.id
        WHERE s.status IN ('submitted', 'pending_grading')
    '''
    params = []
    
    if exam_id:
        query += " AND s.exam_id = ?"
        params.append(exam_id)
    
    count_query = query.replace(
        "SELECT s.*, e.title as exam_title, u.username, u.real_name",
        "SELECT COUNT(*)"
    )
    cursor.execute(count_query, params)
    count_result = cursor.fetchone()
    total = get_first_value(count_result)
    
    offset = (page - 1) * page_size
    query += " ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?"
    params.extend([page_size, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    db.close()
    
    items = []
    for row in rows:
        items.append({
            "id": row["id"],
            "exam_id": row["exam_id"],
            "exam_title": row["exam_title"],
            "user_id": row["user_id"],
            "username": row["username"],
            "real_name": row["real_name"],
            "status": row["status"],
            "total_score": row["total_score"],
            "submitted_at": row["submitted_at"]
        })
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/grading/submission/{submission_id}")
async def get_submission_for_grading(
    submission_id: int,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT s.*, e.title as exam_title, u.username, u.real_name
        FROM submissions s
        JOIN exams e ON s.exam_id = e.id
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
    ''', (submission_id,))
    submission = cursor.fetchone()
    
    if not submission:
        db.close()
        raise HTTPException(status_code=404, detail="提交不存在")
    
    cursor.execute('''
        SELECT a.*, q.title, q.type, q.question_data, pq.score as max_score
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        JOIN paper_questions pq ON pq.question_id = q.id
        JOIN exams e ON e.paper_id = pq.paper_id
        WHERE a.submission_id = ?
        ORDER BY pq.sort_order
    ''', (submission_id,))
    
    answer_rows = cursor.fetchall()
    db.close()
    
    questions = []
    for ans in answer_rows:
        q_data = json.loads(ans["question_data"]) if ans["question_data"] else {}
        user_answer = json.loads(ans["answer"]) if ans["answer"] else None
        
        questions.append({
            "question_id": ans["question_id"],
            "title": ans["title"],
            "type": ans["type"],
            "max_score": ans["max_score"],
            "current_score": ans["score"],
            "is_graded": bool(ans["is_graded"]),
            "user_answer": user_answer,
            "reference_answer": q_data.get("reference_answer") or q_data.get("correct_answer"),
            "test_cases": q_data.get("test_cases"),
            "test_results": json.loads(ans["test_results"]) if ans["test_results"] else None,
            "manual_comment": ans.get("manual_comment")
        })
    
    return {
        "submission_id": submission["id"],
        "exam_title": submission["exam_title"],
        "student": {
            "id": submission["user_id"],
            "username": submission["username"],
            "real_name": submission["real_name"]
        },
        "status": submission["status"],
        "total_score": submission["total_score"],
        "submitted_at": submission["submitted_at"],
        "questions": questions
    }


@router.post("/grading/grade")
async def grade_question(
    grading_data: ManualGrading,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT a.*, pq.score as max_score, s.exam_id
        FROM answers a
        JOIN submissions s ON a.submission_id = s.id
        JOIN paper_questions pq ON pq.question_id = a.question_id
        JOIN exams e ON e.paper_id = pq.paper_id
        WHERE a.submission_id = ? AND a.question_id = ?
    ''', (grading_data.submission_id, grading_data.question_id))
    
    answer = cursor.fetchone()
    
    if not answer:
        db.close()
        raise HTTPException(status_code=404, detail="答案记录不存在")
    
    if grading_data.score > answer["max_score"]:
        db.close()
        raise HTTPException(
            status_code=400, 
            detail=f"分数不能超过满分 {answer['max_score']}"
        )
    
    cursor.execute('''
        UPDATE answers 
        SET score = ?, manual_comment = ?, is_graded = 1, updated_at = CURRENT_TIMESTAMP
        WHERE submission_id = ? AND question_id = ?
    ''', (grading_data.score, grading_data.comment, grading_data.submission_id, grading_data.question_id))
    
    cursor.execute('''
        SELECT SUM(score) as total, COUNT(*) as graded_count
        FROM answers 
        WHERE submission_id = ? AND is_graded = 1
    ''', (grading_data.submission_id,))
    graded_result = cursor.fetchone()
    
    cursor.execute('''
        SELECT COUNT(*) as total_count
        FROM answers 
        WHERE submission_id = ?
    ''', (grading_data.submission_id,))
    total_result = cursor.fetchone()
    
    total_score = graded_result["total"] if graded_result and graded_result["total"] else 0
    all_graded = graded_result and graded_result["graded_count"] == total_result["total_count"]
    
    if all_graded:
        cursor.execute('''
            UPDATE submissions 
            SET status = 'graded', total_score = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (total_score, grading_data.submission_id))
    
    db.commit()
    db.close()
    
    return {
        "message": "评分成功",
        "submission_id": grading_data.submission_id,
        "question_id": grading_data.question_id,
        "score": grading_data.score,
        "all_graded": all_graded,
        "total_score": total_score if all_graded else None
    }


@router.post("/grading/submission/{submission_id}/complete")
async def complete_grading(
    submission_id: int,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT SUM(score) as total_score
        FROM answers 
        WHERE submission_id = ?
    ''', (submission_id,))
    result = cursor.fetchone()
    
    total_score = result["total_score"] if result and result["total_score"] else 0
    
    cursor.execute('''
        UPDATE submissions 
        SET status = 'graded', total_score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (total_score, submission_id))
    
    db.commit()
    db.close()
    
    return {
        "message": "批阅完成",
        "submission_id": submission_id,
        "total_score": total_score,
        "status": "graded"
    }
