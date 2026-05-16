# Research Reader - 科研文献阅读和批注工具

一个功能完整的在线科研文献阅读和批注管理系统，支持PDF阅读、批注管理、文献信息管理、知识提炼和阅读统计。

## 功能特性

### 📄 PDF阅读模块
- **三种阅读模式**：单页模式、双页模式、连续滚动模式
- **缩放控制**：50% - 200% 无级缩放
- **文本选中操作**：
  - 高亮标注（4种颜色可选）
  - 添加笔记
  - 复制引用格式
- **阅读位置记忆**：自动记录上次阅读位置，下次打开直接跳转
- **阅读进度追踪**：实时显示阅读百分比

### ✏️ 批注管理模块
- **聚合视图**：按颜色分类查看所有高亮批注
- **全文搜索**：跨所有文献搜索批注内容
- **导出功能**：一键导出Markdown格式批注文件，保留上下文和页码
- **编辑删除**：支持批注内容编辑和删除

### 📚 文献信息管理模块
- **元数据自动抓取**：
  - 通过DOI抓取CrossRef文献元数据
  - 通过ArXiv ID抓取预印本信息
- **阅读状态管理**：未读 → 阅读中 → 已完成 → 精读完成
- **个人评分**：1-5星评分系统
- **阅读心得**：记录个人阅读笔记和思考

### 💡 知识提炼模块
- **结构化提取**：
  - 🔍 研究问题
  - 🛠️ 研究方法
  - 📝 主要结论
  - ⚠️ 局限性
- **笔记卡片**：从批注一键创建关联笔记
- **文献关联**：手动标注文献间关系（相互支持/相互矛盾/相关工作）

### 📊 统计功能
- **月度阅读量统计**：柱状图展示每月阅读文献数量
- **阅读状态分布**：饼图展示各状态文献占比
- **发表年份分布**：柱状图展示文献发表年份分布
- **核心指标卡片**：总文献数、总批注数、正在阅读、已完成

## 技术栈

### 后端
- **Node.js** + **Express.js** - Web服务框架
- **SQLite3** - 轻量级关系数据库
- **Multer** - 文件上传处理
- **Axios** - HTTP客户端
- **xml2js** - XML解析（用于ArXiv API）

### 前端
- **React 18** - UI框架
- **React Router** - 路由管理
- **React-PDF** - PDF渲染引擎
- **Chart.js** + **react-chartjs-2** - 数据可视化
- **Axios** - HTTP客户端

## 项目结构

```
research-reader/
├── server/                    # 后端服务
│   ├── src/
│   │   ├── index.js          # 服务入口
│   │   ├── db.js             # 数据库初始化和连接
│   │   ├── routes/           # API路由
│   │   │   ├── papers.js     # 文献管理API
│   │   │   ├── annotations.js # 批注管理API
│   │   │   ├── notes.js      # 笔记管理API
│   │   │   ├── insights.js   # 知识提炼API
│   │   │   ├── relations.js  # 文献关联API
│   │   │   └── stats.js      # 统计API
│   │   └── services/
│   │       └── metadataService.js # 元数据抓取服务
│   ├── uploads/              # PDF文件存储目录
│   ├── data/                 # 数据库文件目录
│   └── package.json
├── client/                    # 前端应用
│   ├── public/
│   ├── src/
│   │   ├── index.js          # 应用入口
│   │   ├── App.js            # 主应用组件
│   │   ├── index.css         # 全局样式
│   │   ├── services/
│   │   │   └── api.js        # API服务封装
│   │   ├── components/
│   │   │   ├── Navbar.js     # 导航栏
│   │   │   ├── AddPaperModal.js    # 添加文献弹窗
│   │   │   └── PaperDetailModal.js # 文献详情弹窗
│   │   └── pages/
│   │       ├── Papers.js     # 文献库页面
│   │       ├── PDFReader.js  # PDF阅读器页面
│   │       ├── Annotations.js # 批注管理页面
│   │       └── Stats.js      # 统计页面
│   └── package.json
├── package.json               # 根项目配置
└── README.md
```

## 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 安装根目录依赖（用于并发运行）
npm install

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 运行项目

#### 方式一：同时运行前后端（推荐）
```bash
# 在项目根目录
npm run dev
```
- 后端服务运行在 http://localhost:3001
- 前端开发服务运行在 http://localhost:3000

#### 方式二：分别运行

```bash
# 运行后端服务（端口3001）
cd server
npm run dev

# 运行前端服务（端口3000，新开终端）
cd client
npm start
```

### 访问应用
打开浏览器访问: http://localhost:3000

## 使用指南

### 1. 添加文献
1. 点击首页右上角「+ 添加文献」按钮
2. 选择添加方式：
   - **上传PDF**：选择本地PDF文件上传
   - **元数据抓取**：输入DOI或ArXiv ID自动抓取
   - **手动输入**：手动填写文献信息
3. 填写文献信息后点击「添加」

### 2. 阅读和批注
1. 在文献列表点击一篇文献进入阅读器
2. 使用顶部工具栏切换阅读模式、调整缩放、翻页
3. 选中PDF文本：
   - 选择高亮颜色，点击「高亮」添加标注
   - 点击「笔记」添加批注说明
   - 点击「复制引用」复制引用格式

### 3. 管理批注
1. 点击导航栏「批注管理」
2. 使用搜索框搜索批注内容
3. 使用颜色筛选器按颜色分类查看
4. 点击「编辑」修改笔记内容，点击「删除」移除批注

### 4. 文献详情和知识提炼
1. 在文献列表点击「编辑详情」
2. 切换标签页：
   - **基本信息**：编辑元数据、设置阅读状态、评分、阅读心得
   - **知识提炼**：填写研究问题、方法、结论、局限性
   - **文献关联**：添加与其他文献的关联关系

### 5. 查看统计
1. 点击导航栏「阅读统计」
2. 查看核心指标、月度阅读趋势、状态分布和年份分布

## API接口文档

### 文献管理 (Papers)
- `GET /api/papers` - 获取文献列表（支持搜索和状态筛选）
- `GET /api/papers/:id` - 获取单篇文献详情
- `POST /api/papers` - 创建新文献
- `PUT /api/papers/:id` - 更新文献信息
- `DELETE /api/papers/:id` - 删除文献
- `POST /api/papers/fetch-metadata` - 通过DOI/ArXiv ID抓取元数据
- `PUT /api/papers/:id/progress` - 更新阅读进度

### 批注管理 (Annotations)
- `GET /api/annotations` - 获取批注列表（支持颜色和搜索筛选）
- `POST /api/annotations` - 创建新批注
- `PUT /api/annotations/:id` - 更新批注
- `DELETE /api/annotations/:id` - 删除批注
- `GET /api/annotations/export/:paper_id` - 导出文献批注

### 笔记管理 (Notes)
- `GET /api/notes` - 获取笔记列表
- `POST /api/notes` - 创建笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记

### 知识提炼 (Insights)
- `GET /api/insights/:paper_id` - 获取文献知识提炼
- `PUT /api/insights/:paper_id` - 更新知识提炼内容

### 文献关联 (Relations)
- `GET /api/relations` - 获取文献关联列表
- `POST /api/relations` - 创建文献关联
- `DELETE /api/relations/:id` - 删除文献关联

### 统计 (Stats)
- `GET /api/stats/summary` - 获取核心统计指标
- `GET /api/stats/monthly-reading` - 获取月度阅读数据
- `GET /api/stats/status-distribution` - 获取阅读状态分布
- `GET /api/stats/year-distribution` - 获取发表年份分布

### 文件上传
- `POST /api/upload` - 上传PDF文件（multipart/form-data）
- `GET /uploads/:filename` - 访问已上传的PDF文件

## 数据库设计

### papers 表（文献表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| title | TEXT | 标题 |
| authors | TEXT | 作者（逗号分隔） |
| abstract | TEXT | 摘要 |
| year | INTEGER | 发表年份 |
| doi | TEXT | DOI编号（唯一） |
| arxiv_id | TEXT | ArXiv ID（唯一） |
| journal | TEXT | 期刊/会议名称 |
| file_path | TEXT | PDF文件路径 |
| status | TEXT | 阅读状态（unread/reading/completed/mastered） |
| rating | INTEGER | 评分（1-5） |
| notes | TEXT | 阅读心得 |
| reading_progress | REAL | 阅读进度百分比 |
| last_read_page | INTEGER | 上次阅读页码 |
| last_read_at | DATETIME | 最后阅读时间 |
| created_at | DATETIME | 创建时间 |

### annotations 表（批注表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| paper_id | INTEGER | 关联文献ID |
| type | TEXT | 类型（highlight/note） |
| content | TEXT | 笔记内容 |
| page | INTEGER | 页码 |
| color | TEXT | 高亮颜色 |
| selected_text | TEXT | 选中文本内容 |
| context_before | TEXT | 上文上下文 |
| context_after | TEXT | 下文上下文 |
| created_at | DATETIME | 创建时间 |

### notes 表（笔记表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| paper_id | INTEGER | 关联文献ID |
| annotation_id | INTEGER | 关联批注ID |
| title | TEXT | 笔记标题 |
| content | TEXT | 笔记内容 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### key_insights 表（知识提炼表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| paper_id | INTEGER | 关联文献ID |
| research_question | TEXT | 研究问题 |
| methods | TEXT | 研究方法 |
| conclusions | TEXT | 主要结论 |
| limitations | TEXT | 局限性 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### paper_relations 表（文献关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| paper_id1 | INTEGER | 文献1 ID |
| paper_id2 | INTEGER | 文献2 ID |
| relation_type | TEXT | 关联类型（support/contradict/related） |
| description | TEXT | 关联说明 |
| created_at | DATETIME | 创建时间 |

## 开发计划

### 待实现功能
- [ ] 用户系统和权限管理
- [ ] 批注在PDF上的可视化展示
- [ ] 支持Word格式批注导出
- [ ] 文献引用格式生成（BibTeX/APA/MLA等）
- [ ] 标签系统和文献分类
- [ ] 全文搜索（文献内容搜索）
- [ ] 文献推荐系统
- [ ] 团队协作功能
- [ ] 数据备份和导入导出
- [ ] 移动端适配优化

### 已知问题
- 大型PDF文件渲染性能有待优化
- 中文文本选择偶尔出现断行问题
- 双页模式下批注位置需要调整

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License
