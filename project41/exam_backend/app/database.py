import os
import sqlite3
import json
from datetime import datetime
from contextlib import contextmanager
from app.config import settings

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.DATABASE_URL)


def parse_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            if 'T' in value:
                return datetime.strptime(value, '%Y-%m-%dT%H:%M:%S')
            return datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
        except (ValueError, TypeError):
            try:
                return datetime.strptime(value.split('.')[0], '%Y-%m-%d %H:%M:%S')
            except:
                return value
    return value


def get_first_value(row_result):
    if row_result is None:
        return 0
    if isinstance(row_result, (tuple, list)):
        return row_result[0] if row_result else 0
    if isinstance(row_result, sqlite3.Row):
        return row_result[0] if len(row_result) > 0 else 0
    try:
        return int(row_result)
    except (TypeError, ValueError):
        return 0


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


@contextmanager
def get_db_cursor():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    try:
        yield conn.cursor()
        conn.commit()
    finally:
        conn.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            real_name TEXT,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            difficulty TEXT DEFAULT 'medium',
            tags TEXT DEFAULT '[]',
            score REAL DEFAULT 1.0,
            explanation TEXT,
            knowledge_points TEXT DEFAULT '[]',
            question_data TEXT DEFAULT '{}',
            creator_id INTEGER,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            mode TEXT DEFAULT 'manual',
            creator_id INTEGER,
            total_score REAL DEFAULT 0,
            question_count INTEGER DEFAULT 0,
            tags TEXT DEFAULT '[]',
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS paper_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paper_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            sort_order INTEGER NOT NULL,
            score REAL NOT NULL,
            FOREIGN KEY (paper_id) REFERENCES papers (id),
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            paper_id INTEGER NOT NULL,
            creator_id INTEGER,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP NOT NULL,
            duration INTEGER NOT NULL,
            status TEXT DEFAULT 'draft',
            shuffle_questions INTEGER DEFAULT 0,
            shuffle_options INTEGER DEFAULT 0,
            allow_late_submit INTEGER DEFAULT 0,
            auto_submit INTEGER DEFAULT 1,
            anti_cheat_enabled INTEGER DEFAULT 1,
            max_tab_switch_count INTEGER DEFAULT 3,
            allowed_users TEXT,
            allowed_roles TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (paper_id) REFERENCES papers (id),
            FOREIGN KEY (creator_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exam_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            tab_switch_count INTEGER DEFAULT 0,
            join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (exam_id) REFERENCES exams (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE (exam_id, user_id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            status TEXT DEFAULT 'draft',
            total_score REAL,
            submitted_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (exam_id) REFERENCES exams (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            answer TEXT,
            score REAL,
            is_correct INTEGER,
            is_graded INTEGER DEFAULT 0,
            is_draft INTEGER DEFAULT 1,
            manual_comment TEXT,
            test_results TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (submission_id) REFERENCES submissions (id),
            FOREIGN KEY (question_id) REFERENCES questions (id),
            UNIQUE (submission_id, question_id)
        )
    ''')
    
    try:
        from app.auth import get_password_hash
        
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        if not cursor.fetchone():
            admin_hash = get_password_hash('admin123')
            teacher_hash = get_password_hash('teacher123')
            student_hash = get_password_hash('student123')
            
            cursor.execute('''
                INSERT INTO users (username, email, real_name, password_hash, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ('admin', 'admin@example.com', '系统管理员', admin_hash, 'admin', 1))
            
            cursor.execute('''
                INSERT INTO users (username, email, real_name, password_hash, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ('teacher', 'teacher@example.com', '张老师', teacher_hash, 'teacher', 1))
            
            cursor.execute('''
                INSERT INTO users (username, email, real_name, password_hash, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ('student', 'student@example.com', '李学生', student_hash, 'student', 1))
        
        conn.commit()
    except Exception as e:
        print(f"创建默认用户失败: {e}")
    
    conn.close()
