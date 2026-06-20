## 1. 架构设计

```mermaid
graph TD
    A["浏览器前端"] --> B["React 18 + TypeScript"]
    B --> C["Zustand 状态管理"]
    B --> D["React Router 路由"]
    B --> E["Tailwind CSS 样式"]
    B --> F["Lucide React 图标"]
    B --> G["Recharts 图表库"]
    B --> H["localStorage 本地持久化"]
    A --> I["Mock 数据层"]
    I --> J["活动数据"]
    I --> K["宾客数据"]
    I --> L["供应商数据"]
    I --> M["预算数据"]
```

## 2. 技术描述
- 前端：React@18 + TypeScript + Vite@5
- 样式：TailwindCSS@3
- 状态管理：Zustand
- 路由：React Router DOM@6
- 图表：Recharts@2
- 图标：Lucide React
- 数据持久化：localStorage + Mock数据
- 构建工具：Vite@5

## 3. 路由定义
| 路由 | 页面 | 用途 |
|-------|------|------|
| / | Dashboard | 首页仪表盘，活动概览与统计 |
| /planning | EventPlanning | 活动策划模块 |
| /planning/schedule | EventSchedule | 日程精细化排期 |
| /planning/versions | PlanVersions | 方案版本管理 |
| /guests | GuestManagement | 宾客名单管理 |
| /guests/seating | SeatingArrangement | 可视化桌位安排 |
| /guests/invitations | InvitationTracking | 请柬发送与追踪 |
| /vendors | VendorManagement | 供应商管理 |
| /vendors/comparison | VendorComparison | 供应商比价 |
| /budget | BudgetControl | 预算控制模块 |
| /post-event | PostEventManagement | 后续管理模块 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    EVENT ||--o{ PLAN_VERSION : "has"
    EVENT ||--o{ SCHEDULE_ITEM : "has"
    EVENT ||--o{ GUEST : "has"
    EVENT ||--o{ TABLE : "has"
    TABLE ||--o{ GUEST : "seats"
    EVENT ||--o{ INVITATION : "has"
    EVENT ||--o{ VENDOR : "has"
    VENDOR ||--o{ CONTRACT : "has"
    VENDOR ||--o{ PAYMENT : "has"
    VENDOR ||--o{ REVIEW : "has"
    EVENT ||--o{ BUDGET_CATEGORY : "has"
    BUDGET_CATEGORY ||--o{ EXPENSE : "has"
    EVENT ||--o{ GIFT_RECORD : "has"
    EVENT ||--o{ THANK_YOU : "has"
    EVENT {
        string id
        string type
        string title
        string theme
        datetime date
        string location
        number estimatedGuests
        number totalBudget
        string status
    }
    PLAN_VERSION {
        string id
        string name
        string content
        datetime createdAt
        string status
    }
    SCHEDULE_ITEM {
        string id
        string title
        datetime startTime
        datetime endTime
        string location
        string description
        number order
    }
    GUEST {
        string id
        string name
        string relation
        string phone
        string email
        string dietaryRestrictions
        string tableId
        string rsvpStatus
    }
    TABLE {
        string id
        string name
        number capacity
        string shape
        number x
        number y
    }
    INVITATION {
        string id
        string guestId
        string status
        datetime sentAt
        datetime respondedAt
    }
    VENDOR {
        string id
        string category
        string name
        string contact
        string phone
        string email
    }
    CONTRACT {
        string id
        string vendorId
        string status
        number amount
        date signedDate
    }
    PAYMENT {
        string id
        string vendorId
        string milestone
        number amount
        date dueDate
        string status
    }
    REVIEW {
        string id
        string vendorId
        number rating
        string comment
    }
    BUDGET_CATEGORY {
        string id
        string name
        number budgeted
        string notes
    }
    EXPENSE {
        string id
        string categoryId
        string description
        number amount
        date date
        string vendorId
    }
    GIFT_RECORD {
        string id
        string type
        string guestName
        number amount
        string description
        date date
    }
    THANK_YOU {
        string id
        string guestId
        string status
        datetime sentAt
        string template
    }
```

## 5. 项目结构

```
src/
├── components/          # 可复用组件
│   ├── layout/       # 布局组件
│   ├── ui/           # 基础UI组件
│   └── forms/        # 表单组件
│   └── charts/       # 图表组件
├── pages/               # 页面组件
├── store/              # Zustand状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── data/               # Mock数据
├── hooks/              # 自定义Hooks
├── App.tsx
└── main.tsx
```
