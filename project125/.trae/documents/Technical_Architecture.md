## 1. Architecture Design

纯前端应用，使用 React + TypeScript + Vite + Tailwind CSS，数据本地存储。

```mermaid
graph TD
    A[React Frontend] --> B[Zustand State Management]
    A --> C[Utility Functions (配速计算等)]
    A --> D[Recharts 数据可视化]
    B --> E[LocalStorage 数据持久化]
    C --> F[跑步计算公式引擎]
```

## 2. Technology Description

- Frontend: React@18 + TypeScript + Vite
- CSS: Tailwind CSS@3
- State Management: Zustand
- Data Visualization: Recharts
- Icons: Lucide React
- Data Storage: LocalStorage (本地存储)
- 无后端，纯前端应用

## 3. Route Definitions

| Route | Purpose |
|-------|---------|
| / | 首页，功能导航入口 |
| /pace-calculator | 配速计算模块 |
| /race-strategy | 比赛策略规划模块 |
| /training | 训练配速管理模块 |
| /race-review | 比赛复盘模块 |
| /prediction | 成绩预测模块 |

## 4. State Management

使用 Zustand 管理全局状态：

```typescript
interface AppState {
  userProfile: {
    recent5kTime: number;
    recent10kTime: number;
    halfMarathonTime: number;
    fullMarathonTime: number;
    restingHeartRate: number;
    maxHeartRate: number;
    age: number;
  };
  racePlans: RacePlan[];
  trainingRecords: TrainingRecord[];
  raceReviews: RaceReview[];
}
```

## 5. Core Utility Functions

### 5.1 配速计算函数

```typescript
interface PaceResult {
  pacePerKm: string;
  speedKmh: number;
  splits: SplitData[];
}

interface SplitData {
  kilometer: number;
  time: string;
  cumulativeTime: string;
  pace: string;
}

function calculatePaceFromFinishTime(
  distance: '10km' | 'half' | 'full',
  finishTime: { hours: number; minutes: number; seconds: number }
): PaceResult;

function calculateGradientAdjustment(
  basePace: number,
  gradientPercent: number
): number;

function calculateEnvironmentAdjustment(
  basePace: number,
  temperature: number,
  humidity: number
): number;
```

### 5.2 Jack Daniels 公式预测

```typescript
interface DanielsPrediction {
  vdot: number;
  predictedTimes: {
    '5k': string;
    '10k': string;
    'half': string;
    'full': string;
  };
  trainingPaces: {
    easy: { min: string; max: string };
    marathon: string;
    threshold: string;
    interval: { min: string; max: string };
    repetition: { min: string; max: string };
  };
}

function calculateDanielsVDOT(
  raceDistance: string,
  raceTime: number
): DanielsPrediction;
```

### 5.3 训练配速区间计算

```typescript
interface TrainingZone {
  type: 'easy' | 'marathon' | 'threshold' | 'interval' | 'repetition';
  name: string;
  description: string;
  paceRange: { min: string; max: string };
  heartRateRange: { min: number; max: number };
  perceivedEffort: string;
}

function calculateTrainingZones(
  vdot: number,
  maxHeartRate: number
): TrainingZone[];
```

## 6. Data Model (LocalStorage)

### 6.1 用户配置数据

```typescript
interface UserProfile {
  recent5kTime?: number;
  recent10kTime?: number;
  halfMarathonTime?: number;
  fullMarathonTime?: number;
  restingHeartRate: number;
  maxHeartRate: number;
  age: number;
  weight: number;
}
```

### 6.2 训练记录

```typescript
interface TrainingRecord {
  id: string;
  date: string;
  type: 'easy' | 'marathon' | 'threshold' | 'interval' | 'repetition' | 'long';
  distance: number;
  targetPace: string;
  actualPace: string;
  targetHeartRate: number;
  actualHeartRate: number;
  notes: string;
}
```

### 6.3 比赛复盘

```typescript
interface RaceReview {
  id: string;
  date: string;
  raceName: string;
  distance: '10km' | 'half' | 'full' | 'other';
  totalTime: string;
  splits: {
    km: number;
    time: string;
    pace: string;
    elevation: number;
    heartRate: number;
  }[];
  weather: {
    temperature: number;
    humidity: number;
  };
  strategyNotes: string;
  lessonsLearned: string;
}
```

### 6.4 比赛策略

```typescript
interface RacePlan {
  id: string;
  raceName: string;
  date: string;
  distance: '10km' | 'half' | 'full';
  targetFinishTime: string;
  segments: {
    name: string;
    startKm: number;
    endKm: number;
    targetPace: string;
    notes: string;
  }[];
  aidStations: {
    km: number;
    water: boolean;
    gel: boolean;
    electrolytes: boolean;
    notes: string;
  }[];
  emergencyPlan: string;
}
```

## 7. Component Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Sidebar.tsx
│   ├── PaceCalculator/
│   │   ├── FinishTimeCalculator.tsx
│   │   ├── GradientAdjustment.tsx
│   │   └── EnvironmentAdjustment.tsx
│   ├── RaceStrategy/
│   │   ├── SegmentPlan.tsx
│   │   ├── AidStationPlan.tsx
│   │   └── EmergencyPlan.tsx
│   ├── Training/
│   │   ├── TrainingZones.tsx
│   │   ├── TrainingComparison.tsx
│   │   └── SeasonalAdjustment.tsx
│   ├── RaceReview/
│   │   ├── DataImport.tsx
│   │   ├── PaceChart.tsx
│   │   └── StrategyEvaluation.tsx
│   ├── Prediction/
│   │   └── DanielsPredictor.tsx
│   └── common/
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Button.tsx
│       └── PaceDisplay.tsx
├── pages/
│   ├── Home.tsx
│   ├── PaceCalculator.tsx
│   ├── RaceStrategy.tsx
│   ├── Training.tsx
│   ├── RaceReview.tsx
│   └── Prediction.tsx
├── utils/
│   ├── paceCalculations.ts
│   ├── danielsFormula.ts
│   ├── trainingZones.ts
│   ├── gpxParser.ts
│   └── formatters.ts
├── store/
│   └── useAppStore.ts
├── types/
│   └── index.ts
└── App.tsx
```
