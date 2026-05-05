import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas import (
    ExamAnalytics, ScoreDistribution, QuestionStats, KnowledgePointStats
)
from app.auth import get_current_active_user, require_role
from app.database import get_db

router = APIRouter()


@router.get("/analytics/exam/{exam_id}", response_model=ExamAnalytics)
async def get_exam_analytics(
    exam_id: int,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM exams WHERE id = ?", (exam_id,))
    exam = cursor.fetchone()
    
    if not exam:
        db.close()
        raise HTTPException(status_code=404, detail="考试不存在")
    
    cursor.execute('''
        SELECT COUNT(*) as count
        FROM submissions s
        WHERE s.exam_id = ? AND s.status IN ('submitted', 'graded')
    ''', (exam_id,))
    submissions_count = cursor.fetchone()
    total_submissions = submissions_count["count"] if submissions_count else 0
    
    cursor.execute('''
        SELECT 
            AVG(total_score) as avg_score,
            MAX(total_score) as max_score,
            MIN(total_score) as min_score
        FROM submissions s
        WHERE s.exam_id = ? AND s.status = 'graded' AND s.total_score IS NOT NULL
    ''', (exam_id,))
    score_stats = cursor.fetchone()
    
    avg_score = score_stats["avg_score"] if score_stats and score_stats["avg_score"] else 0
    max_score = score_stats["max_score"] if score_stats and score_stats["max_score"] else 0
    min_score = score_stats["min_score"] if score_stats and score_stats["min_score"] else 0
    
    cursor.execute('''
        SELECT COUNT(*) as total,
               SUM(CASE WHEN total_score >= 60 THEN 1 ELSE 0 END) as passed
        FROM submissions s
        WHERE s.exam_id = ? AND s.status = 'graded' AND s.total_score IS NOT NULL
    ''', (exam_id,))
    pass_stats = cursor.fetchone()
    
    pass_rate = 0.0
    if pass_stats and pass_stats["total"] > 0:
        pass_rate = (pass_stats["passed"] / pass_stats["total"]) * 100 if pass_stats["passed"] else 0
    
    score_distribution = []
    ranges = [
        (0, 59, "0-59"),
        (60, 69, "60-69"),
        (70, 79, "70-79"),
        (80, 89, "80-89"),
        (90, 100, "90-100")
    ]
    
    for min_s, max_s, range_name in ranges:
        cursor.execute('''
            SELECT COUNT(*) as count
            FROM submissions s
            WHERE s.exam_id = ? AND s.status = 'graded'
            AND s.total_score >= ? AND s.total_score <= ?
        ''', (exam_id, min_s, max_s))
        result = cursor.fetchone()
        count = result["count"] if result else 0
        score_distribution.append(ScoreDistribution(range=range_name, count=count))
    
    cursor.execute('''
        SELECT q.id, q.title,
               COUNT(a.id) as total_attempts,
               SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
               AVG(a.score) as avg_score,
               pq.score as max_score
        FROM questions q
        JOIN paper_questions pq ON q.id = pq.question_id
        JOIN exams e ON e.paper_id = pq.paper_id
        LEFT JOIN answers a ON a.question_id = q.id
        LEFT JOIN submissions s ON s.id = a.submission_id
        WHERE e.id = ? AND s.status = 'graded'
        GROUP BY q.id, q.title, pq.score
        ORDER BY pq.sort_order
    ''', (exam_id,))
    
    question_rows = cursor.fetchall()
    
    question_stats = []
    for row in question_rows:
        correct_rate = 0.0
        if row["total_attempts"] > 0 and row["correct_count"]:
            correct_rate = (row["correct_count"] / row["total_attempts"]) * 100
        
        question_stats.append(QuestionStats(
            question_id=row["id"],
            question_title=row["title"],
            correct_rate=correct_rate,
            avg_score=row["avg_score"] if row["avg_score"] else 0,
            total_attempts=row["total_attempts"]
        ))
    
    cursor.execute('''
        SELECT q.knowledge_points,
               COUNT(DISTINCT q.id) as total_questions,
               AVG(a.score) as avg_score,
               SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
               COUNT(a.id) as total_attempts
        FROM questions q
        JOIN paper_questions pq ON q.id = pq.question_id
        JOIN exams e ON e.paper_id = pq.paper_id
        LEFT JOIN answers a ON a.question_id = q.id
        LEFT JOIN submissions s ON s.id = a.submission_id
        WHERE e.id = ? AND s.status = 'graded'
        GROUP BY q.knowledge_points
    ''', (exam_id,))
    
    kp_rows = cursor.fetchall()
    db.close()
    
    kp_stats_dict = {}
    for row in kp_rows:
        kp_list = json.loads(row["knowledge_points"]) if row["knowledge_points"] else []
        correct_rate = 0.0
        if row["total_attempts"] > 0 and row["correct_count"]:
            correct_rate = (row["correct_count"] / row["total_attempts"]) * 100
        
        for kp in kp_list:
            if kp not in kp_stats_dict:
                kp_stats_dict[kp] = {
                    "name": kp,
                    "total_questions": 0,
                    "correct_count": 0,
                    "total_attempts": 0,
                    "avg_score_sum": 0.0
                }
            kp_stats_dict[kp]["total_questions"] += row["total_questions"]
            kp_stats_dict[kp]["correct_count"] += row["correct_count"] or 0
            kp_stats_dict[kp]["total_attempts"] += row["total_attempts"] or 0
            kp_stats_dict[kp]["avg_score_sum"] += row["avg_score"] or 0.0
    
    knowledge_stats = []
    for kp, stats in kp_stats_dict.items():
        cr = 0.0
        if stats["total_attempts"] > 0:
            cr = (stats["correct_count"] / stats["total_attempts"]) * 100
        
        avg_sc = 0.0
        if stats["total_questions"] > 0:
            avg_sc = stats["avg_score_sum"] / stats["total_questions"]
        
        knowledge_stats.append(KnowledgePointStats(
            name=kp,
            correct_rate=cr,
            total_questions=stats["total_questions"],
            avg_score=avg_sc
        ))
    
    return ExamAnalytics(
        exam_id=exam["id"],
        exam_title=exam["title"],
        total_submissions=total_submissions,
        avg_score=avg_score,
        max_score=max_score,
        min_score=min_score,
        pass_rate=pass_rate,
        score_distribution=score_distribution,
        question_stats=question_stats,
        knowledge_stats=knowledge_stats
    )


@router.get("/analytics/exam/{exam_id}/heatmap")
async def get_knowledge_heatmap(
    exam_id: int,
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT q.knowledge_points, q.difficulty,
               SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
               COUNT(a.id) as total_attempts,
               AVG(a.score) as avg_score
        FROM questions q
        JOIN paper_questions pq ON q.id = pq.question_id
        JOIN exams e ON e.paper_id = pq.paper_id
        LEFT JOIN answers a ON a.question_id = q.id
        LEFT JOIN submissions s ON s.id = a.submission_id
        WHERE e.id = ? AND s.status = 'graded'
        GROUP BY q.knowledge_points, q.difficulty
    ''', (exam_id,))
    
    rows = cursor.fetchall()
    db.close()
    
    heatmap_data = []
    for row in rows:
        kp_list = json.loads(row["knowledge_points"]) if row["knowledge_points"] else []
        correct_rate = 0.0
        if row["total_attempts"] > 0 and row["correct_count"]:
            correct_rate = (row["correct_count"] / row["total_attempts"]) * 100
        
        for kp in kp_list:
            heatmap_data.append({
                "knowledge_point": kp,
                "difficulty": row["difficulty"] or "medium",
                "correct_rate": correct_rate,
                "total_attempts": row["total_attempts"] or 0,
                "avg_score": row["avg_score"] or 0.0
            })
    
    return {"heatmap_data": heatmap_data}


@router.get("/analytics/student/{user_id}")
async def get_student_analytics(
    user_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    is_self = current_user.get("id") == user_id
    is_teacher = current_user.get("role") in ["admin", "teacher"]
    
    if not is_self and not is_teacher:
        raise HTTPException(status_code=403, detail="无权限查看此用户的成绩")
    
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT s.*, e.title as exam_title, e.duration,
               p.total_score as max_score
        FROM submissions s
        JOIN exams e ON s.exam_id = e.id
        JOIN papers p ON e.paper_id = p.id
        WHERE s.user_id = ? AND s.status = 'graded'
        ORDER BY s.submitted_at DESC
    ''', (user_id,))
    
    submission_rows = cursor.fetchall()
    
    exam_stats = []
    total_score_sum = 0.0
    max_score_sum = 0.0
    exam_count = 0
    
    for row in submission_rows:
        if row["total_score"] is not None:
            total_score_sum += row["total_score"]
            max_score_sum += row["max_score"]
            exam_count += 1
        
        exam_stats.append({
            "exam_id": row["exam_id"],
            "exam_title": row["exam_title"],
            "score": row["total_score"],
            "max_score": row["max_score"],
            "percentage": (row["total_score"] / row["max_score"] * 100) if row["max_score"] and row["total_score"] is not None else None,
            "submitted_at": row["submitted_at"]
        })
    
    avg_percentage = 0.0
    if max_score_sum > 0:
        avg_percentage = (total_score_sum / max_score_sum) * 100
    
    cursor.execute('''
        SELECT q.knowledge_points,
               SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
               COUNT(a.id) as total_attempts
        FROM answers a
        JOIN submissions s ON a.submission_id = s.id
        JOIN questions q ON a.question_id = q.id
        WHERE s.user_id = ? AND s.status = 'graded'
        GROUP BY q.knowledge_points
    ''', (user_id,))
    
    kp_rows = cursor.fetchall()
    db.close()
    
    knowledge_analysis = []
    for row in kp_rows:
        kp_list = json.loads(row["knowledge_points"]) if row["knowledge_points"] else []
        for kp in kp_list:
            correct_rate = 0.0
            if row["total_attempts"] > 0 and row["correct_count"]:
                correct_rate = (row["correct_count"] / row["total_attempts"]) * 100
            knowledge_analysis.append({
                "knowledge_point": kp,
                "correct_rate": correct_rate,
                "total_attempts": row["total_attempts"] or 0
            })
    
    return {
        "user_id": user_id,
        "total_exams": exam_count,
        "avg_percentage": avg_percentage,
        "exam_history": exam_stats,
        "knowledge_analysis": knowledge_analysis
    }
