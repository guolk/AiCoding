## 1. 架构设计

```mermaid
graph TD
    A["前端 React 应用"] --> B["状态管理 Zustand"]
    A --> C["路由 React Router"]
    A --> D["UI 组件库 Tailwind CSS"]
    A --> E["图表库 Recharts"]
    A --> F["图标库 Lucide React"]
    B --> G["本地存储 LocalStorage"]
    B --> H["模拟数据 Mock Data"]
    
    subgraph "数据层"
        G
        H
    end
    
    subgraph "页面层"
        I["首页概览"]
        J["水族箱档案"]
        K["水质监测"]
        L["生物管理"]
        M["日常维护"]
    end
    
    A --> I
    A --> J
    A --> K
    A --> L
    A --> M
```

## 2. 技术描述

- **前端框架**：React@18 + TypeScript
- **构建工具**：Vite@5
- **路由管理**：react-router-dom@6
- **状态管理**：zustand@4
- **样式方案**：Tailwind CSS@3
- **图表组件**：Recharts@2
- **图标组件**：lucide-react@0.344
- **数据持久化**：LocalStorage（前端存储）
- **开发语言**：TypeScript@5
- **初始化工具**：vite-init

## 3. 路由定义

| 路径 | 页面名称 | 说明 |
|------|---------|------|
| `/` | 首页概览 | 水族箱列表、指标看板、快捷操作 |
| `/tanks` | 水族箱列表 | 所有水族箱卡片展示 |
| `/tanks/:id` | 水族箱详情 | 包含档案、水质、生物、维护四个标签页 |
| `/tanks/:id/profile` | 水族箱档案 | 缸体参数、生物配置、照片时间轴 |
| `/tanks/:id/water` | 水质监测 | 数据录入、趋势图表、异常处理 |
| `/tanks/:id/life` | 生物管理 | 生长、疾病、繁殖记录 |
| `/tanks/:id/maintenance` | 日常维护 | 换水、施肥、CO2、设备维护记录 |
| `/tanks/new` | 新建水族箱 | 创建新的水族箱档案表单 |

## 4. 数据模型

### 4.1 实体关系图

```mermaid
erDiagram
    AQUARIUM ||--o{ WATER_TEST : has
    AQUARIUM ||--o{ PLANT : contains
    AQUARIUM ||--o{ FISH : contains
    AQUARIUM ||--o{ PHOTO : has
    AQUARIUM ||--o{ WATER_CHANGE : has
    AQUARIUM ||--o{ FERTILIZATION : has
    AQUARIUM ||--o{ CO2_LOG : has
    AQUARIUM ||--o{ EQUIPMENT_MAINT : has
    AQUARIUM ||--o{ ANOMALY : has
    PLANT ||--o{ GROWTH_LOG : has
    FISH ||--o{ DISEASE_RECORD : has
    FISH ||--o{ BREEDING_RECORD : has
    ANOMALY ||--o{ TREATMENT_STEP : has

    AQUARIUM {
        string id PK
        string name
        number length
        number width
        number height
        number volume
        string filter_type
        string lighting
        string substrate
        string aquascape_style
        date setup_date
        string status
    }

    WATER_TEST {
        string id PK
        string tank_id FK
        date test_date
        number ph
        number ammonia
        number nitrite
        number nitrate
        number gh
        number kh
        string notes
    }

    PLANT {
        string id PK
        string tank_id FK
        string name
        string scientific_name
        number quantity
        date add_date
        string source
        string status
    }

    FISH {
        string id PK
        string tank_id FK
        string name
        string scientific_name
        number quantity
        date add_date
        string source
        string status
    }

    PHOTO {
        string id PK
        string tank_id FK
        string url
        date date
        string notes
    }

    WATER_CHANGE {
        string id PK
        string tank_id FK
        date date
        number amount
        string water_source
        string notes
    }

    FERTILIZATION {
        string id PK
        string tank_id FK
        date date
        string fertilizer_type
        number dosage
        string notes
    }

    CO2_LOG {
        string id PK
        string tank_id FK
        date date
        number bubbles_per_second
        number duration_hours
        string effect
        string notes
    }

    EQUIPMENT_MAINT {
        string id PK
        string tank_id FK
        date date
        string equipment
        string action
        string notes
    }

    ANOMALY {
        string id PK
        string tank_id FK
        date detect_date
        string description
        string severity
        string status
    }

    TREATMENT_STEP {
        string id PK
        string anomaly_id FK
        string stage
        string content
        date date
        string result
    }

    GROWTH_LOG {
        string id PK
        string plant_id FK
        date date
        string event_type
        string description
    }

    DISEASE_RECORD {
        string id PK
        string fish_id FK
        date detect_date
        string symptoms
        string diagnosis
        string medication
        date recover_date
        string result
    }

    BREEDING_RECORD {
        string id PK
        string fish_id FK
        date spawn_date
        number egg_count
        number hatch_days
        number fry_count
        number survival_count
        string notes
    }
```

### 4.2 数据类型定义

```typescript
// 水族箱
interface Aquarium {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  volume: number;
  filterType: string;
  lighting: string;
  substrate: string;
  aquascapeStyle: string;
  setupDate: string;
  status: 'running' | 'cycling' | 'offline';
  coverImage?: string;
}

// 水质检测
interface WaterTest {
  id: string;
  tankId: string;
  testDate: string;
  ph: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  gh: number;
  kh: number;
  notes?: string;
}

// 水草
interface Plant {
  id: string;
  tankId: string;
  name: string;
  scientificName?: string;
  quantity: number;
  addDate: string;
  source?: string;
  status: 'healthy' | 'growing' | 'melting' | 'dead';
}

// 鱼类
interface Fish {
  id: string;
  tankId: string;
  name: string;
  scientificName?: string;
  quantity: number;
  addDate: string;
  source?: string;
  status: 'healthy' | 'observing' | 'sick' | 'dead';
}

// 照片
interface Photo {
  id: string;
  tankId: string;
  url: string;
  date: string;
  notes?: string;
}

// 换水记录
interface WaterChange {
  id: string;
  tankId: string;
  date: string;
  amount: number;
  waterSource: string;
  notes?: string;
}

// 施肥记录
interface Fertilization {
  id: string;
  tankId: string;
  date: string;
  fertilizerType: string;
  dosage: number;
  notes?: string;
}

// CO2记录
interface CO2Log {
  id: string;
  tankId: string;
  date: string;
  bubblesPerSecond: number;
  durationHours: number;
  effect: string;
  notes?: string;
}

// 设备维护
interface EquipmentMaintenance {
  id: string;
  tankId: string;
  date: string;
  equipment: string;
  action: string;
  notes?: string;
}

// 水质异常
interface Anomaly {
  id: string;
  tankId: string;
  detectDate: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'analyzing' | 'treating' | 'verified' | 'resolved';
  steps: TreatmentStep[];
}

// 处理步骤
interface TreatmentStep {
  id: string;
  stage: 'detection' | 'analysis' | 'action' | 'verification';
  content: string;
  date: string;
  result?: string;
}

// 生长记录
interface GrowthLog {
  id: string;
  plantId: string;
  date: string;
  eventType: 'new_leaf' | 'propagation' | 'flowering' | 'melting' | 'pruning';
  description: string;
}

// 疾病记录
interface DiseaseRecord {
  id: string;
  fishId: string;
  detectDate: string;
  symptoms: string;
  diagnosis: string;
  medication: string;
  recoverDate?: string;
  result: 'recovered' | 'ongoing' | 'deceased';
}

// 繁殖记录
interface BreedingRecord {
  id: string;
  fishId: string;
  spawnDate: string;
  eggCount: number;
  hatchDays: number;
  fryCount: number;
  survivalCount: number;
  notes?: string;
}
```

## 5. 项目结构

```
project148/
├── src/
│   ├── components/          # 通用组件
│   │   ├── Layout.tsx       # 布局组件
│   │   ├── Sidebar.tsx      # 侧边导航
│   │   ├── TankCard.tsx     # 水族箱卡片
│   │   ├── StatCard.tsx     # 统计卡片
│   │   ├── Timeline.tsx     # 时间轴组件
│   │   ├── StatusBadge.tsx  # 状态标签
│   │   ├── Modal.tsx        # 弹窗组件
│   │   └── Form/            # 表单组件
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx    # 首页概览
│   │   ├── TankList.tsx     # 水族箱列表
│   │   ├── TankNew.tsx      # 新建水族箱
│   │   └── TankDetail/      # 水族箱详情页
│   │       ├── index.tsx
│   │       ├── Profile.tsx  # 档案模块
│   │       ├── Water.tsx    # 水质模块
│   │       ├── Life.tsx     # 生物模块
│   │       └── Maintenance.tsx # 维护模块
│   ├── store/               # 状态管理
│   │   └── useStore.ts
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── storage.ts
│   │   ├── mock.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .trae/
│   └── documents/
│       ├── prd.md
│       └── technical-architecture.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 6. 关键技术点

### 6.1 状态管理方案

使用 Zustand 管理全局状态，包含：
- 水族箱列表数据
- 当前选中水族箱详情
- 各类记录数据（水质、生物、维护）
- 持久化到 LocalStorage

### 6.2 图表实现

使用 Recharts 实现水质趋势图：
- 多参数折线图
- 交互式 Tooltip
- 时间范围筛选
- 异常点高亮标记

### 6.3 表单处理

使用受控组件实现表单：
- 实时数据校验
- 参数范围提示
- 提交状态反馈

### 6.4 照片管理

使用图片 URL 存储：
- 支持本地图片预览
- 时间轴排序展示
- 渐进式加载

### 6.5 模拟数据

预置完整的模拟数据：
- 2个示例水族箱
- 30天水质检测历史
- 完整的生物配置
- 各类维护记录
- 异常处理案例
