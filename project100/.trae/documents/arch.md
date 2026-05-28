
## 1. 技术选型

| 分类 | 技术选项 | 说明 |
|------|----------|------|
| 框架 | React 18 | 现代化前端框架，组件化开发 |
| 语言 | TypeScript | 类型安全，提升代码可维护性 |
| UI组件库 | Ant Design 5 | 企业级UI组件库，功能完善 |
| 样式方案 | CSS Modules + Ant Design | 组件隔离样式 + 主题定制 |
| 图表库 | ECharts 5 | 功能强大的数据可视化库 |
| 状态管理 | React Context API + useState | 轻量级状态管理 |
| 路由 | React Router 6 | 单页应用路由管理 |
| 构建工具 | Vite | 快速的开发构建工具 |
| 数据存储 | LocalStorage | 浏览器本地存储模拟后端数据 |

## 2. 架构设计

### 2.1 架构风格
采用单页应用（SPA）架构，组件化设计，前后端分离。

### 2.2 模块划分
```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
├── pages/           # 页面组件
├── services/        # API服务
├── hooks/           # 自定义Hooks
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
├── context/         # Context上下文
└── App.tsx          # 应用入口
```

### 2.3 核心模块职责
- **题库管理模块**：管理题目CRUD、分类、难度、有效期
- **竞赛活动模块**：竞赛创建、答题、实时排行
- **评估测试模块**：测试答题、证书生成与管理
- **数据分析模块**：数据统计与可视化
- **活动运营模块**：通知推送、表彰展示、成绩档案

## 3. 核心数据结构

### 3.1 题目数据结构
```typescript
interface Question {
  id: string;
  category: 'product' | 'regulation' | 'industry' | 'safety';
  difficulty: 'basic' | 'advanced' | 'expert';
  type: 'single' | 'multiple' | 'judgment';
  content: string;
  options: string[];
  correctAnswers: number[];
  validityStart: string;
  validityEnd: string;
  isActive: boolean;
  stats: {
    totalAttempts: number;
    correctAttempts: number;
  };
}
```

### 3.2 竞赛数据结构
```typescript
interface Competition {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  questionCount: number;
  randomQuestions: boolean;
  shuffleOptions: boolean;
  noBacktrack: boolean;
  participants: string[];
  leaderboard: LeaderboardItem[];
}
```

### 3.3 用户数据结构
```typescript
interface User {
  id: string;
  name: string;
  department: string;
  position: string;
  avatar: string;
  certificates: Certificate[];
  competitionHistory: CompetitionHistory[];
  knowledgeRadar: { [key: string]: number };
}
```

## 4. 核心功能实现方案

### 4.1 题库管理
- 使用表格组件展示题目列表
- 支持多选分类、难度等筛选条件
- 批量操作支持作废和替换题目
- 时间选择器设置有效期

### 4.2 竞赛答题
- 倒计时组件控制答题时间
- 选项随机打乱算法
- 禁止回退机制实现
- WebSocket模拟实时排行更新

### 4.3 证书生成
- Canvas绘制证书背景
- 动态填充用户信息和证书编号
- 支持下载为图片

### 4.4 数据可视化
- ECharts实现雷达图展示知识掌握情况
- 柱状图对比部门知识水平
- 饼图展示题目正确率分布

## 5. 技术实现路径

### 5.1 项目初始化
- 使用Vite创建React+TypeScript项目
- 配置Ant Design主题
- 安装ECharts等依赖

### 5.2 基础功能实现
- 搭建路由结构和页面框架
- 实现Mock数据服务
- 开发公共组件

### 5.3 核心模块开发
- 按优先级顺序实现各功能模块
- 实现数据可视化
- 完善交互体验

### 5.4 测试与优化
- 功能测试
- 性能优化
- 响应式适配
