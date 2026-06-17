## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层"
        A["React 18 应用"] --> B["React Router 路由"]
        B --> C["页面组件"]
        C --> D["Zustand 状态管理"]
        D --> E["LocalStorage 持久化"]
    end

    subgraph "数据层"
        F["账号安全数据"]
        G["设备安全数据"]
        H["安全习惯数据"]
        I["事件记录数据"]
    end

    D --> F
    D --> G
    D --> H
    D --> I
```

## 2. 技术说明
- 前端：React@18 + Tailwind CSS@3 + Vite + TypeScript
- 初始化工具：vite-init (react-ts 模板)
- 后端：无（纯前端应用，数据存储于浏览器 LocalStorage）
- 数据库：LocalStorage（通过 Zustand persist 中间件自动持久化）
- 图表：recharts（轻量级React图表库）

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 安全仪表盘首页，展示综合评分和风险概览 |
| /accounts | 账号安全审计模块主页 |
| /devices | 设备安全管理模块主页 |
| /habits | 网络安全习惯追踪模块主页 |
| /incidents | 事件记录模块主页 |

## 4. API定义
无后端API，所有数据通过 Zustand store 管理，使用 persist 中间件自动同步到 LocalStorage。

## 5. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    "Account" {
        string id PK
        string name
        string platform
        boolean twoFactorEnabled
        string passwordStrength
        string lastPasswordChange
        boolean phoneValid
        boolean emailValid
        string status
        string createdAt
        string updatedAt
    }
    "LoginAnomaly" {
        string id PK
        string accountId FK
        string time
        string location
        string device
        string riskLevel
        string description
    }
    "AccountDeletion" {
        string id PK
        string accountId FK
        string status
        string requestDate
        string completionDate
        string notes
    }
    "Device" {
        string id PK
        string name
        string type
        string osVersion
        boolean osUpdated
        boolean antivirusActive
        boolean screenLockEnabled
        boolean diskEncrypted
        string createdAt
    }
    "AppPermission" {
        string id PK
        string deviceId FK
        string appName
        string permission
        boolean isNecessary
        string riskLevel
    }
    "DeviceLending" {
        string id PK
        string deviceId FK
        string lentTo
        string lentDate
        string returnDate
        boolean returned
        string notes
    }
    "SecurityHabit" {
        string id PK
        string name
        string category
        string frequency
        string lastChecked
        boolean isCompleted
        string streak
    }
    "Vulnerability" {
        string id PK
        string title
        string severity
        string description
        string status
        string discoveredDate
        string fixedDate
    }
    "LearningRecord" {
        string id PK
        string title
        string category
        string content
        string learnedDate
        string source
    }
    "SecurityIncident" {
        string id PK
        string type
        string severity
        string description
        string occurredDate
        string resolution
        string lessons
        string[] followUpMeasures
        string status
    }

    "Account" ||--o{ "LoginAnomaly" : "has"
    "Account" ||--o{ "AccountDeletion" : "has"
    "Device" ||--o{ "AppPermission" : "has"
    "Device" ||--o{ "DeviceLending" : "has"
```

### 6.2 数据定义语言
使用 TypeScript 接口定义数据结构，通过 Zustand store 管理状态，persist 中间件自动序列化到 LocalStorage。无需SQL DDL。
