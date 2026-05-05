import json
import random
import subprocess
import tempfile
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from app.schemas import (
    DraftSave, AnswerSubmit, SubmissionResponse, SubmissionDetailResponse,
    QuestionResult, QuestionType
)
from app.auth import get_current_active_user, require_role
from app.database import get_db, parse_datetime

router = APIRouter()


@router.post("/exams/{exam_id}/start")
async def start_exam(
    exam_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM exams WHERE id = ?", (exam_id,))
    exam = cursor.fetchone()
    
    if not exam:
        db.close()
        raise HTTPException(status_code=404, detail="考试不存在")
    
    cursor.execute("SELECT id FROM submissions WHERE exam_id = ? AND user_id = ?", 
                   (exam_id, current_user.get("id")))
    existing = cursor.fetchone()
    
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="您已经开始了这次考试")
    
    cursor.execute('''
        INSERT INTO submissions (exam_id, user_id, status, created_at)
        VALUES (?, ?, 'draft', CURRENT_TIMESTAMP)
    ''', (exam_id, current_user.get("id")))
    
    submission_id = cursor.lastrowid
    
    cursor.execute('''
        INSERT OR IGNORE INTO exam_participants (exam_id, user_id, tab_switch_count, join_time)
        VALUES (?, ?, 0, CURRENT_TIMESTAMP)
    ''', (exam_id, current_user.get("id")))
    
    cursor.execute('''
        SELECT pq.*, q.title, q.type, q.difficulty, q.question_data
        FROM paper_questions pq
        JOIN questions q ON pq.question_id = q.id
        JOIN exams e ON e.paper_id = pq.paper_id
        WHERE e.id = ?
        ORDER BY pq.sort_order
    ''', (exam_id,))
    
    question_rows = cursor.fetchall()
    questions = []
    
    for q in question_rows:
        q_data = json.loads(q["question_data"]) if q["question_data"] else {}
        
        if exam["shuffle_options"] and q["type"] in ["single_choice", "multiple_choice"]:
            options = q_data.get("options", [])
            if options:
                indices = list(range(len(options)))
                random.shuffle(indices)
                shuffled_options = [options[i] for i in indices]
                
                if q["type"] == "single_choice":
                    correct_idx = q_data.get("correct_answer", 0)
                    q_data["correct_answer"] = indices.index(correct_idx) if correct_idx in indices else 0
                elif q["type"] == "multiple_choice":
                    correct_indices = q_data.get("correct_answers", [])
                    q_data["correct_answers"] = [indices.index(i) for i in correct_indices if i in indices]
                
                q_data["options"] = shuffled_options
        
        questions.append({
            "id": q["question_id"],
            "title": q["title"],
            "type": q["type"],
            "difficulty": q["difficulty"],
            "score": q["score"],
            "question_data": q_data
        })
    
    if exam["shuffle_questions"]:
        random.shuffle(questions)
    
    db.commit()
    db.close()
    
    return {
        "submission_id": submission_id,
        "questions": questions,
        "duration": exam["duration"],
        "anti_cheat_enabled": bool(exam["anti_cheat_enabled"]),
        "max_tab_switch_count": exam["max_tab_switch_count"]
    }


@router.post("/submissions/{submission_id}/draft")
async def save_draft(
    submission_id: int,
    draft_data: DraftSave,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,))
    submission = cursor.fetchone()
    
    if not submission:
        db.close()
        raise HTTPException(status_code=404, detail="提交不存在")
    
    if submission["user_id"] != current_user.get("id"):
        db.close()
        raise HTTPException(status_code=403, detail="无权限操作此提交")
    
    for answer in draft_data.answers:
        answer_json = json.dumps(answer.answer, ensure_ascii=False) if answer.answer else None
        
        cursor.execute('''
            INSERT INTO answers (submission_id, question_id, answer, is_draft, created_at, updated_at)
            VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT(submission_id, question_id) 
            DO UPDATE SET answer = ?, is_draft = 1, updated_at = CURRENT_TIMESTAMP
        ''', (submission_id, answer.question_id, answer_json, answer_json))
    
    cursor.execute("UPDATE submissions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (submission_id,))
    db.commit()
    db.close()
    
    return {"message": "草稿已保存", "saved_at": datetime.now().isoformat()}


@router.post("/submissions/{submission_id}/submit")
async def submit_exam(
    submission_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,))
    submission = cursor.fetchone()
    
    if not submission:
        db.close()
        raise HTTPException(status_code=404, detail="提交不存在")
    
    if submission["user_id"] != current_user.get("id"):
        db.close()
        raise HTTPException(status_code=403, detail="无权限操作此提交")
    
    if submission["status"] == "submitted":
        db.close()
        raise HTTPException(status_code=400, detail="您已经提交了这次考试")
    
    cursor.execute('''
        SELECT a.*, q.type, q.question_data, pq.score as max_score
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        JOIN paper_questions pq ON pq.question_id = q.id
        JOIN exams e ON e.paper_id = pq.paper_id
        JOIN submissions s ON s.exam_id = e.id
        WHERE s.id = ?
    ''', (submission_id,))
    
    answers = cursor.fetchall()
    
    total_score = 0.0
    has_subjective = False
    
    for ans in answers:
        if not ans["answer"]:
            continue
        
        q_type = ans["type"]
        q_data = json.loads(ans["question_data"]) if ans["question_data"] else {}
        user_answer = json.loads(ans["answer"]) if ans["answer"] else None
        max_score = ans["max_score"]
        
        score = 0.0
        is_correct = None
        is_graded = 0
        
        if q_type == "single_choice":
            correct_answer = q_data.get("correct_answer")
            if user_answer == correct_answer:
                score = max_score
                is_correct = True
            else:
                is_correct = False
            is_graded = 1
        
        elif q_type == "multiple_choice":
            correct_answers = set(q_data.get("correct_answers", []))
            user_answers = set(user_answer) if isinstance(user_answer, list) else set()
            if user_answers == correct_answers:
                score = max_score
                is_correct = True
            else:
                is_correct = False
            is_graded = 1
        
        elif q_type == "true_false":
            correct_answer = q_data.get("correct_answer")
            if user_answer == correct_answer:
                score = max_score
                is_correct = True
            else:
                is_correct = False
            is_graded = 1
        
        elif q_type == "fill_blank":
            blanks = q_data.get("blanks", [])
            user_blanks = user_answer if isinstance(user_answer, list) else []
            correct_count = 0
            
            for i, blank in enumerate(blanks):
                if i >= len(user_blanks):
                    continue
                correct_answers = blank.get("answers", []) if isinstance(blank, dict) else [blank]
                if user_blanks[i] in correct_answers:
                    correct_count += 1
            
            if blanks:
                score = max_score * (correct_count / len(blanks))
                is_correct = (correct_count == len(blanks))
                is_graded = 1
        
        elif q_type in ["short_answer", "programming"]:
            has_subjective = True
        
        if is_graded:
            total_score += score
        
        cursor.execute('''
            UPDATE answers 
            SET score = ?, is_correct = ?, is_graded = ?, is_draft = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (score, 1 if is_correct else 0 if is_correct is not None else None, is_graded, ans["id"]))
    
    cursor.execute('''
        UPDATE submissions 
        SET status = ?, total_score = ?, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', ("graded" if not has_subjective else "submitted", total_score if not has_subjective else None, submission_id))
    
    db.commit()
    db.close()
    
    return {
        "message": "考试已提交",
        "submission_id": submission_id,
        "total_score": total_score if not has_subjective else None,
        "status": "graded" if not has_subjective else "pending_grading"
    }


@router.get("/submissions/{submission_id}", response_model=SubmissionDetailResponse)
async def get_submission_detail(
    submission_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,))
    submission = cursor.fetchone()
    
    if not submission:
        db.close()
        raise HTTPException(status_code=404, detail="提交不存在")
    
    is_owner = submission["user_id"] == current_user.get("id")
    is_teacher = current_user.get("role") in ["admin", "teacher"]
    
    if not is_owner and not is_teacher:
        db.close()
        raise HTTPException(status_code=403, detail="无权限查看此提交")
    
    cursor.execute('''
        SELECT a.*, q.type, q.question_data, pq.score as max_score, q.title
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        JOIN paper_questions pq ON pq.question_id = q.id
        JOIN exams e ON e.paper_id = pq.paper_id
        JOIN submissions s ON s.exam_id = e.id
        WHERE s.id = ?
        ORDER BY pq.sort_order
    ''', (submission_id,))
    
    answer_rows = cursor.fetchall()
    db.close()
    
    results = []
    for ans in answer_rows:
        q_data = json.loads(ans["question_data"]) if ans["question_data"] else {}
        user_answer = json.loads(ans["answer"]) if ans["answer"] else None
        
        correct_answer = None
        if ans["type"] == "single_choice":
            correct_answer = q_data.get("correct_answer")
        elif ans["type"] == "multiple_choice":
            correct_answer = q_data.get("correct_answers")
        elif ans["type"] == "true_false":
            correct_answer = q_data.get("correct_answer")
        elif ans["type"] == "fill_blank":
            correct_answer = q_data.get("blanks")
        elif ans["type"] == "short_answer":
            correct_answer = q_data.get("reference_answer")
        
        results.append(QuestionResult(
            question_id=ans["question_id"],
            question_type=QuestionType(ans["type"]),
            score=ans["score"] if ans["score"] is not None else 0.0,
            max_score=ans["max_score"],
            is_correct=bool(ans["is_correct"]) if ans["is_correct"] is not None else None,
            user_answer=user_answer,
            correct_answer=correct_answer,
            manual_comment=ans.get("manual_comment")
        ))
    
    return SubmissionDetailResponse(
        id=submission["id"],
        exam_id=submission["exam_id"],
        user_id=submission["user_id"],
        status=submission["status"],
        total_score=submission["total_score"],
        submitted_at=parse_datetime(submission["submitted_at"]),
        created_at=parse_datetime(submission["created_at"]),
        updated_at=parse_datetime(submission["updated_at"]),
        results=results
    )


@router.post("/exams/{exam_id}/tab-switch")
async def record_tab_switch(
    exam_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        UPDATE exam_participants 
        SET tab_switch_count = tab_switch_count + 1 
        WHERE exam_id = ? AND user_id = ?
    ''', (exam_id, current_user.get("id")))
    
    cursor.execute('''
        SELECT tab_switch_count, e.max_tab_switch_count
        FROM exam_participants p
        JOIN exams e ON p.exam_id = e.id
        WHERE p.exam_id = ? AND p.user_id = ?
    ''', (exam_id, current_user.get("id")))
    
    result = cursor.fetchone()
    db.commit()
    db.close()
    
    if result:
        count = result["tab_switch_count"]
        max_count = result["max_tab_switch_count"]
        is_warning = count >= max_count
        
        return {
            "tab_switch_count": count,
            "max_allowed": max_count,
            "is_warning": is_warning,
            "message": "已记录标签页切换" if not is_warning else "警告：已超过最大切换次数限制"
        }
    
    return {"tab_switch_count": 0, "max_allowed": 3, "is_warning": False}
