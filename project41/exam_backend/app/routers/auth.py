from datetime import timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from app.schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    PaginatedResponse
)
from app.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_active_user, require_role, get_user_by_id
)
from app.config import settings
from app.database import get_db, get_first_value

router = APIRouter()


@router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT id FROM users WHERE username = ?", (user_data.username,))
    if cursor.fetchone():
        db.close()
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    cursor.execute("SELECT id FROM users WHERE email = ?", (user_data.email,))
    if cursor.fetchone():
        db.close()
        raise HTTPException(status_code=400, detail="邮箱已注册")
    
    hashed_password = get_password_hash(user_data.password)
    
    cursor.execute('''
        INSERT INTO users (username, email, real_name, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
    ''', (user_data.username, user_data.email, user_data.real_name, hashed_password, user_data.role))
    
    user_id = cursor.lastrowid
    db.commit()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    db.close()
    
    return UserResponse(**dict(row))


@router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (login_data.username,))
    row = cursor.fetchone()
    db.close()
    
    if not row or not verify_password(login_data.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not row["is_active"]:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    
    user_dict = dict(row)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["id"], "role": user_dict["role"]},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        user=UserResponse(**user_dict)
    )


@router.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: Dict[str, Any] = Depends(get_current_active_user)):
    return UserResponse(**current_user)


@router.get("/users", response_model=PaginatedResponse)
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_role("admin", "teacher"))
):
    db = get_db()
    cursor = db.cursor()
    
    query = "SELECT * FROM users WHERE 1=1"
    params = []
    
    if role:
        query += " AND role = ?"
        params.append(role)
    
    if search:
        query += " AND (username LIKE ? OR email LIKE ? OR real_name LIKE ?)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term])
    
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
    
    items = [UserResponse(**dict(row)) for row in rows]
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    is_active: bool,
    current_user: Dict[str, Any] = Depends(require_role("admin"))
):
    if user_id == current_user.get("id"):
        raise HTTPException(status_code=400, detail="不能禁用自己的账户")
    
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="用户不存在")
    
    cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (is_active, user_id))
    db.commit()
    db.close()
    
    return {"message": "用户状态已更新", "is_active": is_active}
