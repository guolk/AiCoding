## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React 18 单页应用"] --> A1["路由管理 (React Router)"]
        A --> A2["状态管理 (Context API)"]
        A --> A3["UI组件库 (自定义 + Tailwind)"]
        A --> A4["图表可视化 (Recharts)"]
        A --> A5["数据模拟 (Mock Data)"]
    end
    
    subgraph "数据层"
        B["LocalStorage 持久化"] --> B1["赛事数据"]
        B --> B2["参赛者数据"]
        B --> B3["成绩数据"]
        B --> B4["奖项数据"]
    end
    
    subgraph "服务层"
        C["工具函数模块"] --> C1["时间计算"]
        C --> C2["成绩排名算法"]
        C --> C3["CSV解析"]
        C --> C4["数据统计"]
    end
```

## 2. 技术描述

- **前端框架**：React@18 + Vite@5 + TypeScript
- **样式方案**：TailwindCSS@3 + 自定义CSS变量主题系统
- **状态管理**：React Context API + useReducer 实现集中状态管理
- **路由管理**：React Router DOM@6
- **图表库**：Recharts@2（柱状图、折线图、饼图等）
- **图标库**：@tabler/icons-react
- **数据持久化**：LocalStorage + 内置完整Mock数据
- **构建工具**：Vite@5
- **代码规范**：ESLint + TypeScript 严格模式

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| /dashboard | 首页仪表盘，展示赛事概览和数据指标 |
| /event/info | 赛事管理-基础信息设置 |
| /event/route | 赛事管理-路线规划 |
| /event/volunteers | 赛事管理-志愿者管理 |
| /registration/list | 报名管理-参赛者列表 |
| /registration/bibs | 报名管理-号码布分配 |
| /registration/pickup | 报名管理-参赛包领取 |
| /timing/record | 计时成绩-计时记录 |
| /timing/results | 计时成绩-成绩榜单 |
| /awards/settings | 奖项管理-奖项设置 |
| /awards/winners | 奖项管理-获奖名单与颁奖流程 |
| /awards/prizes | 奖项管理-奖品发放 |
| /analysis/finish | 赛后分析-完赛率统计 |
| /analysis/timing | 赛后分析-完赛时间分布 |
| /analysis/survey | 赛后分析-满意度调查 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    EVENT ||--o{ CATEGORY : "包含"
    EVENT ||--o{ ROUTE_POINT : "包含"
    EVENT ||--o{ VOLUNTEER : "招募"
    EVENT ||--o{ PARTICIPANT : "拥有"
    PARTICIPANT ||--o| BIB_NUMBER : "分配"
    PARTICIPANT ||--o| PICKUP_RECORD : "领取"
    PARTICIPANT ||--o| TIME_RECORD : "记录"
    PARTICIPANT ||--o| RESULT : "生成"
    CATEGORY ||--o{ AWARD : "设置"
    AWARD ||--o| WINNER : "颁发"
    EVENT ||--o{ PRIZE : "拥有"
    PRIZE ||--o{ PRIZE_DISTRIBUTION : "发放"
    
    EVENT {
        string id PK
        string name
        date date
        string location
        number distance_km
        string description
        string status
    }
    
    CATEGORY {
        string id PK
        string event_id FK
        string name
        string gender
        number age_min
        number age_max
        number fee
        string bib_prefix
        number bib_start
    }
    
    ROUTE_POINT {
        string id PK
        string event_id FK
        string type
        string name
        number position_x
        number position_y
        string cut_off_time
    }
    
    VOLUNTEER {
        string id PK
        string event_id FK
        string name
        string phone
        string role
        string status
    }
    
    PARTICIPANT {
        string id PK
        string event_id FK
        string category_id FK
        string name
        string gender
        date birth_date
        string phone
        string emergency_contact
        string emergency_phone
        boolean health_declaration
        datetime registered_at
    }
    
    BIB_NUMBER {
        string id PK
        string participant_id FK
        string category_id FK
        number number
    }
    
    PICKUP_RECORD {
        string id PK
        string participant_id FK
        boolean picked
        datetime picked_at
        string operator
    }
    
    TIME_RECORD {
        string id PK
        string participant_id FK
        datetime start_time
        datetime finish_time
        string source
    }
    
    RESULT {
        string id PK
        string participant_id FK
        string category_id FK
        string gun_time
        string net_time
        number avg_speed
        number overall_rank
        number category_rank
        string status
    }
    
    AWARD {
        string id PK
        string event_id FK
        string category_id FK
        string name
        number rank_from
        number rank_to
        string prize_id FK
    }
    
    WINNER {
        string id PK
        string award_id FK
        string participant_id FK
        datetime presented_at
    }
    
    PRIZE {
        string id PK
        string event_id FK
        string name
        number total_quantity
        number distributed
    }
    
    PRIZE_DISTRIBUTION {
        string id PK
        string prize_id FK
        string participant_id FK
        datetime distributed_at
        string operator
    }
```

### 4.2 数据初始化

应用内置完整的Mock数据，包括：
- 1个示例赛事（2026环湖自行车挑战赛）
- 4个参赛组别（男子精英组、男子公开组、女子组、体验组）
- 路线节点数据（起点、3个补给站、终点）
- 50+名参赛者报名数据
- 15名志愿者信息
- 号码布分配记录
- 参赛包领取记录
- 完整的计时成绩数据
- 奖项设置与获奖名单
- 奖品发放记录
- 满意度调查样本数据

