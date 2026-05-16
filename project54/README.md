# 在线会议纪要生成和行动追踪系统

一个功能完整的会议管理系统，支持会议记录、音频转录、AI摘要、待办事项追踪、决策时间线以及全文搜索。

## 功能特性

### 📋 会议记录模块
- **会议信息结构化录入**：支持会议标题、日期、参会人员、议程等信息录入
- **富文本编辑器**：支持@提及参与者、#话题标签
- **快速格式化块**：一键插入决策/待办/风险的格式化块
- **音频录音**：浏览器端录音功能
- **Whisper API集成**：音频自动转录为文字，支持识别不同发言人

### 🤖 智能处理模块
- **AI智能摘要**：自动提取关键决策点、待办事项、遗留问题
- **自动关联负责人**：智能识别并分配任务负责人
- **议题组织**：按议题自动组织会议内容
- **邮件草稿生成**：一键生成会议纪要邮件，自动填充参会人邮箱

### ✅ 行动追踪模块
- **待办自动提取**：从会议纪要中提取待办事项
- **状态追踪**：支持待办事项的完成/未完成状态
- **负责人关联**：每个待办项关联到具体负责人
- **截止日期管理**：支持设置和查看截止日期
- **待办清单视图**：统一查看所有待办事项及其来源会议

### 📚 知识积累模块
- **全文搜索**：支持按关键词、日期范围、参与者搜索历史会议
- **决策时间线**：项目维度下所有会议决策的时间线视图
- **统计分析**：
  - 总会议数
  - 近30天会议数
  - 待办事项统计
  - 已完成待办统计
  - 活跃参与者排行

### 💾 数据存储与导出
- **本地SQLite数据库**：所有数据本地存储
- **Markdown导出**：会议纪要导出为Markdown格式
- **Word导出**：会议纪要导出为Word文档（.docx格式）

## 技术栈

- **后端**：Python 3 + Flask
- **前端**：HTML5 + CSS3 + JavaScript (原生)
- **数据库**：SQLite + SQLAlchemy ORM
- **文档导出**：python-docx
- **音频处理**：浏览器 MediaRecorder API

## 安装与运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 启动后端服务

```bash
python app.py
```

服务将在 `http://localhost:5000` 启动。

### 3. 访问系统

在浏览器中打开 `http://localhost:5000` 即可使用系统。

## 使用指南

### 快速开始

1. **添加参与者**：进入「参与者管理」页面，添加参会人员信息
2. **创建会议**：进入「新建会议」页面，填写会议信息并选择参会人员
3. **记录会议**：进入会议详情页，使用富文本编辑器记录会议内容
4. **录音与转录**：在「音频转录」标签页进行录音并生成转录文本
5. **生成摘要**：在「智能摘要」标签页生成AI会议摘要
6. **添加议题、决策、待办**：在各个标签页管理会议内容
7. **导出/发送**：导出为Markdown/Word或生成邮件草稿

### 主要页面说明

- **仪表盘**：查看会议统计、最近会议、活跃参与者
- **会议列表**：查看所有历史会议，点击进入会议详情
- **新建会议**：创建新会议
- **待办事项**：查看和管理所有待办任务，标记完成状态
- **决策记录**：以时间线方式查看所有会议决策
- **参与者管理**：添加和管理参与者信息
- **会议搜索**：按关键词、日期、参与者搜索会议

## API接口

### 参与者
- `GET /api/participants` - 获取所有参与者
- `POST /api/participants` - 添加新参与者

### 会议
- `GET /api/meetings` - 获取所有会议列表
- `POST /api/meetings` - 创建新会议
- `GET /api/meetings/<id>` - 获取会议详情
- `PUT /api/meetings/<id>` - 更新会议信息
- `DELETE /api/meetings/<id>` - 删除会议

### 议题
- `POST /api/meetings/<id>/topics` - 为会议添加议题

### 决策
- `GET /api/decisions` - 获取所有决策
- `POST /api/meetings/<id>/decisions` - 为会议添加决策

### 待办事项
- `GET /api/todos` - 获取所有待办
- `GET /api/meetings/<id>/todos` - 获取会议的待办
- `POST /api/meetings/<id>/todos` - 添加待办
- `PUT /api/todos/<id>` - 更新待办状态

### 搜索
- `GET /api/search?keyword=xxx&start_date=xxx&end_date=xxx&participant_id=xxx` - 搜索会议

### 统计
- `GET /api/statistics` - 获取统计数据

### 导出
- `GET /api/meetings/<id>/export/markdown` - 导出为Markdown
- `GET /api/meetings/<id>/export/word` - 导出为Word文档

### 邮件
- `GET /api/meetings/<id>/email-draft` - 生成邮件草稿

## 项目结构

```
project54/
├── app.py                 # Flask后端应用
├── index.html             # 前端单页应用
├── requirements.txt       # Python依赖
├── README.md             # 项目文档
└── meeting_system.db     # SQLite数据库（自动生成）
```

## 扩展开发

### 集成真实Whisper API

当前系统包含录音功能模拟，如需接入真实的OpenAI Whisper API：

1. 安装openai包：`pip install openai`
2. 在app.py中添加OpenAI客户端初始化
3. 修改录音上传和转录接口，调用Whisper API

### 接入真实AI摘要服务

当前系统使用模拟摘要生成，如需接入真实的AI服务（如GPT）：

1. 在后端添加调用LLM API的逻辑
2. 将转录文本或会议内容发送给LLM
3. 解析返回结果，提取决策、待办等结构化信息

## 注意事项

1. 录音功能需要HTTPS环境或localhost才能正常工作
2. 浏览器会请求麦克风权限，请确保允许
3. 数据库文件会自动创建在项目根目录
4. 建议定期备份数据库文件

## 许可证

MIT License
