## 1. 架构设计

```mermaid
graph TD
    A["前端 React + TypeScript"] --> B["Vite 构建工具"]
    A --> C["Tailwind CSS 样式"]
    A --> D["Zustand 状态管理"]
    A --> E["React Router 路由"]
    A --> F["Recharts 图表库"]
    A --> G["Lucide React 图标"]
    H["后端 Express + TypeScript"] --> I["RESTful API"]
    H --> J["SQLite 数据库"]
    H --> K["文件上传处理"]
    A -->|HTTP| I
```

## 2. 技术描述

- 前端：React@18 + TypeScript + Tailwind CSS@3 + Vite
- 初始化工具：vite-init
- 后端：Express@4 + TypeScript
- 数据库：SQLite（本地存储，便于演示）
- 状态管理：Zustand
- 路由：React Router DOM
- 图表：Recharts
- 图标：Lucide React

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 首页仪表盘 |
| /students | 学生列表 |
| /students/:id | 学生档案详情 |
| /students/:id/portfolio | 作品收藏 |
| /students/:id/assessment | 能力评估 |
| /students/:id/report | 学习档案报告 |

## 4. API 定义

### 学生相关接口
```typescript
interface Student {
  id: number;
  name: string;
  grade: number;
  className: string;
  avatar: string;
  interests: string;
  learningStyle: string;
  familyBackground: string;
  shortTermGoals: string;
  longTermGoals: string;
  createdAt: string;
}

interface ParentCommunication {
  id: number;
  studentId: number;
  date: string;
  type: 'home_visit' | 'parent_meeting';
  content: string;
  teacher: string;
}

// GET /api/students - 获取学生列表
// GET /api/students/:id - 获取学生详情
// POST /api/students - 创建学生
// PUT /api/students/:id - 更新学生信息
// GET /api/students/:id/communications - 获取家长沟通记录
// POST /api/students/:id/communications - 添加沟通记录
```

### 作品相关接口
```typescript
interface Portfolio {
  id: number;
  studentId: number;
  title: string;
  category: 'art' | 'writing' | 'math' | 'science';
  description: string;
  fileUrl: string;
  thumbnail: string;
  grade: number;
  semester: number;
  isFeatured: boolean;
  createdAt: string;
}

// GET /api/students/:id/portfolio - 获取作品列表
// POST /api/students/:id/portfolio - 上传作品
// PUT /api/portfolio/:id/feature - 标注优秀作品
// DELETE /api/portfolio/:id - 删除作品
```

### 能力评估相关接口
```typescript
interface Intelligence {
  linguistic: number;
  logicalMathematical: number;
  spatial: number;
  musical: number;
  bodilyKinesthetic: number;
  interpersonal: number;
  intrapersonal: number;
}

interface KeySkills {
  criticalThinking: number;
  creativity: number;
  collaboration: number;
  learningHabits: number;
}

interface Milestone {
  id: number;
  studentId: number;
  title: string;
  description: string;
  date: string;
  badge: string;
}

interface Assessment {
  id: number;
  studentId: number;
  semester: string;
  intelligence: Intelligence;
  keySkills: KeySkills;
  teacherComment: string;
  createdAt: string;
}

// GET /api/students/:id/assessments - 获取评估列表
// POST /api/students/:id/assessments - 创建评估
// GET /api/students/:id/milestones - 获取里程碑
// POST /api/students/:id/milestones - 添加里程碑
```

### 报告相关接口
```typescript
interface Report {
  id: number;
  studentId: number;
  semester: string;
  featuredWorks: number[];
  assessmentId: number;
  teacherComment: string;
  highlights: string[];
  createdAt: string;
}

// GET /api/students/:id/reports - 获取报告列表
// POST /api/students/:id/reports - 生成报告
// GET /api/reports/:id/parent-version - 家长分享版本
// GET /api/students/:id/growth-comparison - 多学期对比数据
```

## 5. 服务器架构

```mermaid
graph TD
    A["客户端请求"] --> B["Express 中间件"]
    B --> C["CORS / 解析"]
    C --> D["路由层 Controllers"]
    D --> E["业务层 Services"]
    E --> F["数据层 Models"]
    F --> G["SQLite 数据库"]
    H["文件上传"] --> I["Multer 中间件"]
    I --> J["本地存储"]
```

## 6. 数据模型

### 6.1 ER 图
```mermaid
erDiagram
    STUDENT ||--o{ PARENT_COMMUNICATION : has
    STUDENT ||--o{ PORTFOLIO : has
    STUDENT ||--o{ ASSESSMENT : has
    STUDENT ||--o{ MILESTONE : has
    STUDENT ||--o{ REPORT : has
    ASSESSMENT ||--o{ REPORT : referenced
    PORTFOLIO ||--o{ REPORT : featured_in

    STUDENT {
        int id PK
        string name
        int grade
        string class_name
        string avatar
        string interests
        string learning_style
        string family_background
        string short_term_goals
        string long_term_goals
        datetime created_at
    }

    PARENT_COMMUNICATION {
        int id PK
        int student_id FK
        date date
        string type
        text content
        string teacher
    }

    PORTFOLIO {
        int id PK
        int student_id FK
        string title
        string category
        text description
        string file_url
        string thumbnail
        int grade
        int semester
        boolean is_featured
        datetime created_at
    }

    ASSESSMENT {
        int id PK
        int student_id FK
        string semester
        int linguistic
        int logical_mathematical
        int spatial
        int musical
        int bodily_kinesthetic
        int interpersonal
        int intrapersonal
        int critical_thinking
        int creativity
        int collaboration
        int learning_habits
        text teacher_comment
        datetime created_at
    }

    MILESTONE {
        int id PK
        int student_id FK
        string title
        text description
        date date
        string badge
    }

    REPORT {
        int id PK
        int student_id FK
        string semester
        text featured_works
        int assessment_id FK
        text teacher_comment
        text highlights
        datetime created_at
    }
```

### 6.2 DDL 语句

```sql
-- 学生表
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  grade INTEGER NOT NULL,
  class_name VARCHAR(50),
  avatar VARCHAR(255),
  interests TEXT,
  learning_style TEXT,
  family_background TEXT,
  short_term_goals TEXT,
  long_term_goals TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 家长沟通记录表
CREATE TABLE parent_communications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id),
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  teacher VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 作品表
CREATE TABLE portfolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL,
  description TEXT,
  file_url VARCHAR(255),
  thumbnail VARCHAR(255),
  grade INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  is_featured BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评估表
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id),
  semester VARCHAR(20) NOT NULL,
  linguistic INTEGER,
  logical_mathematical INTEGER,
  spatial INTEGER,
  musical INTEGER,
  bodily_kinesthetic INTEGER,
  interpersonal INTEGER,
  intrapersonal INTEGER,
  critical_thinking INTEGER,
  creativity INTEGER,
  collaboration INTEGER,
  learning_habits INTEGER,
  teacher_comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 里程碑表
CREATE TABLE milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  badge VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 报告表
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id),
  semester VARCHAR(20) NOT NULL,
  featured_works TEXT,
  assessment_id INTEGER REFERENCES assessments(id),
  teacher_comment TEXT,
  highlights TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
