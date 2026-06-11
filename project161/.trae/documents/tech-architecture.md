## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React 18 + TypeScript"]
        B["Tailwind CSS"]
        C["React Router"]
        D["Zustand 状态管理"]
        E["Recharts 图表库"]
    end
    subgraph "数据层"
        F["Mock数据服务"]
        G["LocalStorage 持久化"]
    end
    A --> C
    A --> D
    A --> E
    A --> F
    F --> G
```

## 2. 技术说明

- 前端：React@18 + TailwindCSS@3 + Vite
- 初始化工具：vite-init
- 后端：无（纯前端项目，使用Mock数据）
- 数据库：无（使用LocalStorage持久化 + Mock数据）
- 图表：Recharts（数据可视化）
- 地图：简化版SVG地图（无需外部地图API）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 首页仪表盘，关键数据概览 |
| /archives | 古树档案列表页 |
| /archives/:id | 古树档案详情页 |
| /archives/new | 新增古树档案 |
| /archives/:id/edit | 编辑古树档案 |
| /health | 健康评估列表页 |
| /health/:id | 健康评估详情页 |
| /health/new | 新增健康评估 |
| /survey | 普查网格管理页 |
| /survey/progress | 普查进度追踪页 |
| /survey/review | 数据质量审核页 |
| /analysis | 数据分析总览页 |

## 4. API定义

无后端API，使用前端Mock数据和LocalStorage。

## 5. 服务器架构图

不适用

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    "Tree" {
        string id PK
        string species
        string scientificName
        number dbh
        number height
        number crownWidth
        number estimatedAge
        string gpsLatitude
        string gpsLongitude
        string location
        string ownership
        string healthStatus
        string createdAt
        string updatedAt
    }
    "CulturalRecord" {
        string id PK
        string treeId FK
        string type
        string title
        string content
        string period
    }
    "MediaAsset" {
        string id PK
        string treeId FK
        string category
        string url
        string description
        string uploadedAt
    }
    "HealthAssessment" {
        string id PK
        string treeId FK
        string assessmentDate
        number overallScore
        string trunkDecay
        string hollowStatus
        string breakStatus
        string pestDisease
        string soilCompaction
        number rootProtectionScore
        number lightConditionScore
        number soilQualityScore
        string assessor
        string createdAt
    }
    "ProtectionMeasure" {
        string id PK
        string assessmentId FK
        string type
        string description
        string operationDate
        string operator
        string effect
    }
    "SurveyGrid" {
        string id PK
        string name
        string boundary
        string assignee
        string status
    }
    "AuditRecord" {
        string id PK
        string treeId FK
        string auditor
        string coordinateAccuracy
        string photoQuality
        string dataCompleteness
        string result
        string comment
        string auditedAt
    }
    "Tree" ||--o{ "CulturalRecord" : "拥有"
    "Tree" ||--o{ "MediaAsset" : "拥有"
    "Tree" ||--o{ "HealthAssessment" : "拥有"
    "Tree" ||--o{ "AuditRecord" : "拥有"
    "HealthAssessment" ||--o{ "ProtectionMeasure" : "包含"
```

### 6.2 数据定义语言

使用TypeScript类型定义代替SQL DDL：

```typescript
interface Tree {
  id: string;
  species: string;
  scientificName: string;
  dbh: number;
  height: number;
  crownWidth: number;
  estimatedAge: number;
  gpsLatitude: string;
  gpsLongitude: string;
  location: string;
  ownership: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  createdAt: string;
  updatedAt: string;
}

interface CulturalRecord {
  id: string;
  treeId: string;
  type: 'historical' | 'celebrity' | 'legend';
  title: string;
  content: string;
  period: string;
}

interface MediaAsset {
  id: string;
  treeId: string;
  category: 'full' | 'trunk' | 'leaf' | 'fruit' | 'video';
  url: string;
  description: string;
  uploadedAt: string;
}

interface HealthAssessment {
  id: string;
  treeId: string;
  assessmentDate: string;
  overallScore: number;
  trunkDecay: string;
  hollowStatus: string;
  breakStatus: string;
  pestDisease: string;
  soilCompaction: string;
  rootProtectionScore: number;
  lightConditionScore: number;
  soilQualityScore: number;
  assessor: string;
  createdAt: string;
}

interface ProtectionMeasure {
  id: string;
  assessmentId: string;
  type: 'filling' | 'support' | 'fertilization' | 'other';
  description: string;
  operationDate: string;
  operator: string;
  effect: string;
}

interface SurveyGrid {
  id: string;
  name: string;
  boundary: { lat: number; lng: number }[];
  assignee: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface AuditRecord {
  id: string;
  treeId: string;
  auditor: string;
  coordinateAccuracy: 'accurate' | 'approximate' | 'inaccurate';
  photoQuality: 'clear' | 'acceptable' | 'poor';
  dataCompleteness: 'complete' | 'partial' | 'incomplete';
  result: 'approved' | 'rejected' | 'pending';
  comment: string;
  auditedAt: string;
}
```
