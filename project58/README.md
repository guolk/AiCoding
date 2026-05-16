# 个人订阅服务管理和消费追踪工具

一个功能完整的订阅管理应用，帮助您管理所有订阅服务、追踪消费、优化支出。

## ✨ 功能特性

### 📋 订阅管理模块
- **统一录入**: 服务名称、月费/年费、下次扣款日期、付款方式、账号信息（加密存储）
- **状态分类**: 活跃/暂停/已取消 三种状态管理
- **提前提醒**: 扣款前N天发送桌面通知，避免忘记续费

### 📊 消费分析模块
- **实时汇总**: 月度总支出、年度总支出、活跃订阅数量
- **占比分析**: 各类订阅（娱乐/工具/学习/云服务等）的支出占比饼图
- **价值评估**: 基于使用频率的ROI评分（优秀/良好/一般/低/待评估），每次使用成本计算

### 💡 优化建议模块
- **长期未使用标记**: 自动标记超过30天未记录使用的服务
- **相似功能合并建议**: 同类工具有多个订阅时提醒合并
- **年付优惠提示**: 对比年付vs月付能节省的具体金额和百分比

### ⏱️ 使用追踪模块
- **快速打卡**: 一键记录使用某个订阅服务
- **热力图**: 可视化展示哪天/哪个时段使用最多
- **试用期倒计时**: 免费试用即将到期提醒

### 📜 历史记录模块
- **月度趋势图**: 折线图展示支出变化趋势
- **已取消存档**: 历史取消订阅记录，便于未来参考
- **年度总结**: 年度订阅支出总结报告

## 🏗️ 技术架构

### 后端
- **Node.js + Express**: Web服务器
- **SQLite**: 轻量级数据库
- **CryptoJS**: 账号信息加密存储
- **node-cron**: 定时任务提醒
- **node-notifier**: 桌面通知

### 前端
- **React 18**: UI框架
- **React Router**: 路由管理
- **Recharts**: 数据可视化图表
- **Axios**: HTTP客户端
- **Day.js**: 日期处理

## 🚀 快速开始

### 前置要求
- Node.js >= 14.0.0
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..

# 或者一键安装所有依赖
npm run install-all
```

### 启动应用

```bash
# 开发模式（同时启动前后端）
npm run dev

# 或者分别启动
# 启动后端 (端口 3001)
npm run server

# 启动前端 (端口 3000)
cd client && npm start
```

### 生产构建
```bash
cd client
npm run build
cd ..
npm start
```

## 📁 项目结构

```
subscription-manager/
├── server/                 # 后端代码
│   ├── index.js           # 服务器入口
│   ├── database.js        # 数据库操作
│   ├── routes.js          # API路由
│   └── reminders.js       # 提醒功能
├── client/                # 前端代码
│   ├── public/            # 静态资源
│   └── src/               # React源码
│       ├── App.js         # 主应用组件
│       ├── App.css        # 样式文件
│       └── index.js       # 入口文件
├── data/                  # SQLite数据库目录
├── package.json           # 后端依赖配置
└── README.md              # 项目说明
```

## 🔌 API 接口

### 订阅管理
- `GET /api/subscriptions` - 获取所有订阅
- `GET /api/subscriptions/:id` - 获取单个订阅
- `POST /api/subscriptions` - 创建订阅
- `PUT /api/subscriptions/:id` - 更新订阅
- `DELETE /api/subscriptions/:id` - 删除订阅

### 使用记录
- `GET /api/usage` - 获取使用记录
- `POST /api/usage` - 记录使用

### 数据分析
- `GET /api/analytics/summary` - 获取汇总数据
- `GET /api/analytics/category-breakdown` - 分类分析
- `GET /api/analytics/roi-scores` - ROI评分

### 优化建议
- `GET /api/recommendations` - 获取优化建议

### 历史记录
- `GET /api/history/monthly-trend` - 月度趋势
- `GET /api/history/cancelled` - 已取消订阅

### 提醒
- `GET /api/upcoming-reminders` - 即将到来的提醒

## 🔒 数据安全

- 账号信息使用AES加密存储
- 数据库文件本地存储，不上传云端
- 所有数据仅保存在您的设备上

## 🎯 使用建议

1. **定期打卡**: 每次使用订阅服务后及时打卡，确保ROI计算准确
2. **设置提醒**: 为重要订阅设置提前提醒，避免不必要的自动续费
3. **定期审核**: 每月查看优化建议，及时取消长期未使用的订阅
4. **利用年付**: 对于常用且稳定的订阅，优先考虑年付节省费用

## 📝 更新日志

### v1.0.0 (2026-05-16)
- ✨ 初始版本发布
- ✅ 完整的订阅管理功能
- ✅ 消费分析和数据可视化
- ✅ 智能优化建议
- ✅ 使用追踪和热力图
- ✅ 桌面通知提醒
- ✅ 历史记录和年度总结

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
