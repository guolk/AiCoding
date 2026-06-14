## 1. 架构设计

```mermaid
graph TD
    A["用户界面层<br/>React + React Router"] --> B["状态管理层<br/>React Context + useState"]
    B --> C["业务逻辑层<br/>自定义Hooks + Service"]
    C --> D["数据访问层<br/>LocalStorage + Mock API"]
    
    E["组件库<br/>TailwindCSS + 自定义组件"] --> A
    F["图表库<br/>ECharts for React"] --> A
    G["图标库<br/>Material Icons"] --> A
    
    style A fill:#2E7D32,color:#fff
    style B fill:#66BB6A,color:#fff
    style C fill:#81C784,color:#fff
    style D fill:#A5D6A7,color:#fff
```

## 2. 技术描述

- **前端框架**：React@18 + TypeScript，提供类型安全和更好的开发体验
- **构建工具**：Vite@5，提供快速的开发服务器和构建性能
- **样式方案**：TailwindCSS@3，原子化CSS，快速构建UI
- **路由管理**：React Router@6，单页应用路由导航
- **图表可视化**：echarts@5 + echarts-for-react，数据图表展示
- **图标方案**：@mui/icons-material + @mui/material，Material Design图标库
- **状态管理**：React Context + useState，轻量级状态管理
- **数据持久化**：LocalStorage，前端本地存储
- **UI组件**：基于TailwindCSS自定义组件库
- **日期处理**：dayjs，轻量级日期处理库
- **后端**：无后端，使用Mock数据 + LocalStorage模拟数据持久化

## 3. 路由定义

| 路由路径 | 页面名称 | 模块归属 |
|----------|----------|----------|
| / | 首页仪表板 | 数据概览 |
| /projects | 项目列表 | 项目档案 |
| /projects/new | 新建项目 | 项目档案 |
| /projects/:id | 项目详情 | 项目档案 |
| /projects/:id/edit | 编辑项目 | 项目档案 |
| /projects/:id/progress | 实施进度 | 实施进度 |
| /projects/:id/milestones | 里程碑管理 | 实施进度 |
| /projects/:id/visits | 走访记录 | 实施进度 |
| /projects/:id/photos | 照片时间轴 | 实施进度 |
| /projects/:id/effects | 成效数据 | 成效数据 |
| /projects/:id/effects/input | 指标录入 | 成效数据 |
| /projects/:id/effects/analysis | 对比分析 | 成效数据 |
| /projects/:id/effects/cases | 受益案例 | 成效数据 |
| /projects/:id/risks | 问题与风险 | 问题风险 |
| /projects/:id/risks/issues | 问题管理 | 问题风险 |
| /projects/:id/risks/warnings | 风险预警 | 问题风险 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    PROJECT ||--o{ QUANTITATIVE_TARGET : has
    PROJECT ||--o{ BUDGET_ITEM : has
    PROJECT ||--o{ MILESTONE : has
    PROJECT ||--o{ VISIT_RECORD : has
    PROJECT ||--o{ PHOTO_GROUP : has
    PROJECT ||--o{ EFFECT_DATA : has
    PROJECT ||--o{ BENEFIT_CASE : has
    PROJECT ||--o{ ISSUE : has
    PROJECT ||--o{ RISK : has
    PHOTO_GROUP ||--o{ PHOTO : has
    ISSUE ||--o{ ISSUE_HISTORY : has
    RISK ||--o{ RISK_MEASURE : has
    
    PROJECT {
        string id PK
        string name
        string village
        string type
        string fundSource
        string startDate
        string endDate
        string responsibleUnit
        string responsiblePerson
        string status
        string description
        string createTime
        string updateTime
    }
    
    QUANTITATIVE_TARGET {
        string id PK
        string projectId FK
        string indicatorName
        float baselineValue
        float targetValue
        string unit
        string description
    }
    
    BUDGET_ITEM {
        string id PK
        string projectId FK
        string subProjectName
        float budgetAmount
        float actualAmount
        string description
    }
    
    MILESTONE {
        string id PK
        string projectId FK
        string name
        string plannedDate
        string actualDate
        string status
        float progress
        string description
    }
    
    VISIT_RECORD {
        string id PK
        string projectId FK
        string visitDate
        string visitor
        string problemsFound
        string measuresTaken
        string remarks
    }
    
    PHOTO_GROUP {
        string id PK
        string projectId FK
        string stage
        string date
        string description
    }
    
    PHOTO {
        string id PK
        string groupId FK
        string type
        string url
        string caption
    }
    
    EFFECT_DATA {
        string id PK
        string projectId FK
        string indicatorName
        string period
        float value
        string unit
        string recordDate
        string recorder
    }
    
    BENEFIT_CASE {
        string id PK
        string projectId FK
        string farmerName
        string village
        int familyMembers
        string photo
        string story
        float incomeIncrease
        string createTime
    }
    
    ISSUE {
        string id PK
        string projectId FK
        string title
        string type
        string level
        string description
        string status
        string createTime
        string resolveTime
    }
    
    ISSUE_HISTORY {
        string id PK
        string issueId FK
        string action
        string operator
        string time
        string remarks
    }
    
    RISK {
        string id PK
        string projectId FK
        string title
        string type
        string level
        string description
        string impactAnalysis
        string status
        string createTime
    }
    
    RISK_MEASURE {
        string id PK
        string riskId FK
        string measure
        string responsiblePerson
        string deadline
        string status
    }
```

### 4.2 数据结构定义（TypeScript）

```typescript
// 项目基本信息
interface Project {
  id: string;
  name: string;
  village: string;
  type: 'infrastructure' | 'industry' | 'training' | 'environment' | 'other';
  fundSource: string;
  startDate: string;
  endDate: string;
  responsibleUnit: string;
  responsiblePerson: string;
  status: 'planning' | 'ongoing' | 'completed' | 'suspended';
  description: string;
  createTime: string;
  updateTime: string;
}

// 量化目标
interface QuantitativeTarget {
  id: string;
  projectId: string;
  indicatorName: string;
  baselineValue: number;
  targetValue: number;
  unit: string;
  description: string;
}

// 预算分配
interface BudgetItem {
  id: string;
  projectId: string;
  subProjectName: string;
  budgetAmount: number;
  actualAmount: number;
  description: string;
}

// 里程碑
interface Milestone {
  id: string;
  projectId: string;
  name: string;
  plannedDate: string;
  actualDate: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  description: string;
}

// 走访记录
interface VisitRecord {
  id: string;
  projectId: string;
  visitDate: string;
  visitor: string;
  problemsFound: string;
  measuresTaken: string;
  remarks: string;
}

// 照片
interface Photo {
  id: string;
  groupId: string;
  type: 'before' | 'during' | 'after';
  url: string;
  caption: string;
}

// 照片组
interface PhotoGroup {
  id: string;
  projectId: string;
  stage: string;
  date: string;
  description: string;
  photos: Photo[];
}

// 成效数据
interface EffectData {
  id: string;
  projectId: string;
  indicatorName: string;
  period: string;
  value: number;
  unit: string;
  recordDate: string;
  recorder: string;
}

// 受益案例
interface BenefitCase {
  id: string;
  projectId: string;
  farmerName: string;
  village: string;
  familyMembers: number;
  photo: string;
  story: string;
  incomeIncrease: number;
  createTime: string;
}

// 问题记录
interface Issue {
  id: string;
  projectId: string;
  title: string;
  type: 'policy' | 'fund' | 'participation' | 'technology' | 'other';
  level: 'high' | 'medium' | 'low';
  description: string;
  status: 'open' | 'processing' | 'resolved' | 'closed';
  createTime: string;
  resolveTime: string | null;
  history: IssueHistory[];
}

// 问题处理历史
interface IssueHistory {
  id: string;
  issueId: string;
  action: string;
  operator: string;
  time: string;
  remarks: string;
}

// 风险
interface Risk {
  id: string;
  projectId: string;
  title: string;
  type: 'policy' | 'economic' | 'natural' | 'social' | 'other';
  level: 'high' | 'medium' | 'low';
  description: string;
  impactAnalysis: string;
  status: 'identified' | 'monitoring' | 'mitigated' | 'occurred';
  createTime: string;
  measures: RiskMeasure[];
}

// 风险应对措施
interface RiskMeasure {
  id: string;
  riskId: string;
  measure: string;
  responsiblePerson: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}
```

### 4.3 Mock数据初始化

```typescript
// 初始Mock数据 - 示例项目
const mockProjects: Project[] = [
  {
    id: '1',
    name: '生态农业示范基地建设',
    village: '和平村',
    type: 'industry',
    fundSource: '中央财政乡村振兴专项资金',
    startDate: '2024-03-01',
    endDate: '2025-12-31',
    responsibleUnit: '县农业农村局',
    responsiblePerson: '张三',
    status: 'ongoing',
    description: '建设1000亩生态农业示范基地，推广有机种植技术，带动村民增收。',
    createTime: '2024-02-15',
    updateTime: '2024-06-10'
  }
];
```

## 5. 项目目录结构

```
project173/
├── .trae/
│   └── documents/
├── src/
│   ├── components/           # 公共组件
│   │   ├── Layout/          # 布局组件
│   │   ├── UI/              # 基础UI组件
│   │   └── Charts/          # 图表组件
│   ├── pages/               # 页面组件
│   │   ├── Dashboard/       # 首页仪表板
│   │   ├── Project/         # 项目档案模块
│   │   ├── Progress/        # 实施进度模块
│   │   ├── Effect/          # 成效数据模块
│   │   └── Risk/            # 问题风险模块
│   ├── context/             # React Context
│   ├── hooks/               # 自定义Hooks
│   ├── types/               # TypeScript类型定义
│   ├── data/                # Mock数据
│   ├── utils/               # 工具函数
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```
