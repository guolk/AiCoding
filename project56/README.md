# 个人图书馆和阅读追踪系统 (Personal Library and Reading Tracker)

一个完整的个人图书管理系统，包含书籍管理、阅读追踪、笔记系统、书单分享和年度阅读报告等功能。

## 功能特性

### 📚 书库管理模块
- **ISBN一键获取书籍信息** - 通过Open Library API自动获取书籍封面、作者、出版社、简介等信息
- **书籍多状态管理** - 想读/在读/已读/放弃，以及多读了几遍的记录
- **标签和分类** - 按主题/作者/出版年代的多维度组织
- **书籍搜索和筛选** - 按状态、标签、关键词等进行筛选

### 📖 阅读追踪模块
- **阅读进度记录** - 当前读到第几页，自动计算完成百分比
- **阅读时长打卡记录** - 每次阅读的开始时间和结束时间
- **阅读速度分析** - 平均每分钟阅读多少页，预测读完剩余内容需要多久
- **阅读统计** - 阅读 streak、累计页数、阅读速度等

### 📝 笔记系统模块
- **书中金句划线摘录** - 关联到具体页码
- **阅读笔记分章节整理** - 按章节组织笔记
- **跨书笔记主题聚合** - 将不同书中的相关笔记汇聚在同一主题下
- **笔记类型区分** - 高亮/普通笔记

### 📋 书单和推荐模块
- **自定义书单创建和分享** - 生成公开链接，他人可以查看书单并导入自己的书库
- **基于已读书籍的相似推荐** - 调用Open Library的相似书籍API
- **年度阅读报告自动生成** - 全年阅读数量/总页数/最爱类型/最长坚持连续阅读天数

## 技术栈

### 后端
- **Node.js** + **Express** - Web服务框架
- **TypeScript** - 类型安全
- **SQLite3** - 轻量级数据库
- **Open Library API** - 书籍元数据获取

### 前端
- **React 18** + **TypeScript** - UI框架
- **React Router** - 路由管理
- **Tailwind CSS** - 样式框架
- **Recharts** - 数据可视化
- **Axios** - HTTP客户端

## 安装和运行

### 前置要求
- Node.js >= 16
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

或者使用一键安装：
```bash
npm run install:all
```

### 开发模式运行

1. 启动后端服务 (端口 3001)
```bash
npm run dev
```

2. 在另一个终端启动前端 (端口 3000)
```bash
npm run client
```

3. 打开浏览器访问 http://localhost:3000

### 生产模式构建

```bash
# 构建后端
npm run build

# 构建前端
cd client
npm run build

# 启动服务
npm start
```

## API 接口文档

### 书籍相关
- `GET /api/books` - 获取所有书籍
- `GET /api/books/:id` - 获取单本书籍详情
- `POST /api/books` - 创建书籍
- `POST /api/books/isbn/:isbn` - 通过ISBN创建书籍
- `PATCH /api/books/:id/status` - 更新书籍状态
- `PATCH /api/books/:id/progress` - 更新阅读进度
- `DELETE /api/books/:id` - 删除书籍

### 标签相关
- `GET /api/tags` - 获取所有标签
- `POST /api/tags` - 创建标签
- `POST /api/books/:bookId/tags/:tagId` - 给书籍添加标签
- `DELETE /api/books/:bookId/tags/:tagId` - 移除书籍标签
- `GET /api/tags/:tagId/books` - 获取标签下的所有书籍

### 阅读相关
- `POST /api/reading/sessions` - 开始阅读会话
- `PATCH /api/reading/sessions/:id/end` - 结束阅读会话
- `GET /api/books/:bookId/sessions` - 获取书籍的阅读会话
- `GET /api/reading/stats` - 获取阅读统计
- `GET /api/reading/annual-report/:year` - 获取年度报告

### 笔记相关
- `GET /api/books/:bookId/notes` - 获取书籍笔记
- `POST /api/notes` - 创建笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记
- `GET /api/topics` - 获取所有笔记主题
- `GET /api/topics/:topic/notes` - 获取主题下的所有笔记

### 书单相关
- `GET /api/reading-lists` - 获取所有书单
- `GET /api/reading-lists/:id` - 获取书单详情
- `GET /api/shared-lists/:token` - 通过分享token访问公开书单
- `POST /api/reading-lists` - 创建书单
- `PUT /api/reading-lists/:id` - 更新书单
- `DELETE /api/reading-lists/:id` - 删除书单
- `POST /api/reading-lists/:listId/books/:bookId` - 给书单添加书籍
- `DELETE /api/reading-lists/:listId/books/:bookId` - 从书单移除书籍
- `POST /api/reading-lists/:id/regenerate-token` - 重新生成分享token

### 搜索和推荐
- `GET /api/search/isbn/:isbn` - ISBN搜索
- `GET /api/search/books?q=...` - 书籍搜索
- `GET /api/recommendations` - 获取推荐书籍

## 项目结构

```
personal-library-tracker/
├── src/                          # 后端源码
│   ├── database/                 # 数据库相关
│   │   └── db.ts                # 数据库初始化和连接
│   ├── services/                 # 业务逻辑服务
│   │   ├── bookService.ts       # 书籍管理服务
│   │   ├── readingService.ts    # 阅读追踪服务
│   │   ├── noteService.ts       # 笔记系统服务
│   │   ├── listService.ts       # 书单服务
│   │   └── openLibraryService.ts # Open Library API 集成
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts
│   └── server.ts                 # 服务器入口文件
├── client/                        # 前端源码
│   ├── public/                   # 静态资源
│   ├── src/
│   │   ├── pages/                # 页面组件
│   │   │   ├── Dashboard.tsx    # 仪表板
│   │   │   ├── Books.tsx        # 书籍列表
│   │   │   ├── BookDetail.tsx   # 书籍详情
│   │   │   ├── Notes.tsx        # 笔记页面
│   │   │   ├── ReadingLists.tsx # 书单页面
│   │   │   ├── Stats.tsx        # 统计页面
│   │   │   └── AnnualReport.tsx # 年度报告
│   │   ├── api/                  # API客户端
│   │   │   └── client.ts
│   │   ├── types/                # 类型定义
│   │   │   └── index.ts
│   │   ├── App.tsx               # 主应用组件
│   │   └── index.tsx             # 前端入口
│   ├── package.json
│   └── tsconfig.json
├── package.json
├── tsconfig.json
└── README.md
```

## 数据库设计

主要数据表：
- **books** - 书籍信息表
- **tags** - 标签表
- **book_tags** - 书籍-标签关联表
- **reading_sessions** - 阅读会话表
- **notes** - 笔记表
- **note_topics** - 笔记-主题关联表
- **reading_lists** - 书单表
- **reading_list_books** - 书单-书籍关联表
- **read_history** - 阅读历史表

## 开发计划

- [x] 项目基础架构搭建
- [x] 数据库模型设计
- [x] Open Library API 集成
- [x] 书库管理模块
- [x] 阅读追踪模块
- [x] 笔记系统模块
- [x] 书单和推荐模块
- [x] 后端API服务器
- [x] 前端Web界面
- [ ] 用户认证系统
- [ ] 数据导出功能
- [ ] 移动端适配优化

## 许可证

MIT License
