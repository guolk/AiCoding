# 3D打印项目管理和耗材追踪工具

一个完整的在线3D打印项目管理系统，包含项目管理、耗材追踪、打印机维护、切片参数库和成本核算五大功能模块。

## 功能特性

### 1. 打印项目管理模块
- 📋 打印项目档案管理（STL文件来源、切片参数、打印机型号、打印时长、成功率）
- ❌ 打印失败原因记录和解决方案（翘边、断丝、层错位等常见问题）
- ⭐ 打印成品满意度评分
- 🔍 项目搜索和状态筛选

### 2. 耗材管理模块
- 📦 不同品牌/型号/颜色耗材的库存追踪
- ⚖️ 剩余克数估算和库存预警
- 📊 每次打印的耗材消耗记录
- 📝 耗材打印效果评价（附着力、强度、翘边率、打印质量）
- 📈 耗材使用历史记录

### 3. 打印机维护模块
- 🔧 打印机各部件的维护记录（喷嘴更换、热床调平、皮带紧张度调整）
- ⏰ 维护里程碑提醒（每500小时检查一次风扇等）
- 📖 打印机故障排查日记
- 📋 快速添加维护模板

### 4. 切片参数库模块
- 📝 不同耗材的最佳切片参数收藏
- 🔧 温度、速度、回抽、支撑等完整参数配置
- 🎯 不同模型类型的参数策略（功能件vs装饰件）
- 📋 参数配置复制功能
- 🏷️ 默认配置标记

### 5. 成本核算模块
- 💰 每个项目的成本估算（耗材费+电费+磨损分摊）
- 💡 打印服务定价参考
- ⚙️ 可配置的成本参数
- 🧮 便捷的成本计算器
- 📊 统计汇总和项目成本明细

## 技术栈

- **后端**: Node.js + Express + SQLite
- **前端**: React + React Router + Tailwind CSS
- **图标**: Lucide React
- **HTTP客户端**: Axios

## 安装和运行

### 前置要求

- Node.js (推荐 v16 或更高版本)
- npm 或 yarn

### 安装步骤

1. **安装后端依赖**
```bash
npm install
```

2. **安装前端依赖**
```bash
cd client
npm install
cd ..
```

或者使用一键安装命令：
```bash
npm run install-all
```

### 运行方式

#### 方式一：同时运行前后端（推荐）
```bash
npm run dev
```
- 后端服务运行在 http://localhost:5000
- 前端应用运行在 http://localhost:3000

#### 方式二：单独运行后端
```bash
npm run server
```
后端服务运行在 http://localhost:5000

#### 方式三：单独运行前端
```bash
cd client
npm start
```
前端应用运行在 http://localhost:3000

#### 方式四：生产模式（仅后端）
```bash
npm start
```

## 项目结构

```
project90/
├── server/                 # 后端代码
│   ├── index.js           # 服务入口
│   ├── database.js        # 数据库初始化
│   └── routes/            # API路由
│       ├── projects.js    # 项目管理API
│       ├── filaments.js   # 耗材管理API
│       ├── printers.js    # 打印机管理API
│       ├── profiles.js    # 切片参数API
│       └── costs.js       # 成本核算API
├── client/                # 前端代码
│   ├── public/
│   │   └── index.html     # HTML入口
│   └── src/
│       ├── index.js       # React入口
│       ├── App.js         # 主应用组件
│       ├── services/      # API服务
│       │   └── api.js     # API封装
│       └── pages/         # 页面组件
│           ├── Dashboard.js
│           ├── Projects.js
│           ├── ProjectDetail.js
│           ├── Filaments.js
│           ├── Printers.js
│           ├── PrinterDetail.js
│           ├── Profiles.js
│           └── Costs.js
├── data/                  # 数据库文件目录（自动创建）
├── uploads/               # 上传文件目录（自动创建）
├── package.json           # 根目录package.json
└── README.md             # 本文档
```

## 数据库结构

系统使用SQLite数据库，包含以下数据表：

1. **printers** - 打印机信息
2. **filaments** - 耗材信息
3. **print_projects** - 打印项目
4. **failure_records** - 失败记录
5. **maintenance_records** - 维护记录
6. **maintenance_milestones** - 维护里程碑
7. **troubleshooting_logs** - 故障排查日记
8. **slice_profiles** - 切片参数配置
9. **cost_settings** - 成本设置

## 使用说明

### 首次使用

1. 启动应用后，系统会自动创建数据库和初始数据
2. 默认创建一台示例打印机（Ender 3 V2）
3. 默认成本设置：电费0.6元/度，打印机功率300W，设备寿命5000小时

### 工作流程建议

1. **添加打印机** - 先在"打印机"页面添加您的打印机
2. **添加耗材** - 在"耗材管理"页面录入您的耗材库存
3. **创建切片参数** - 在"切片参数"页面保存您的最佳配置
4. **记录打印项目** - 每次打印后在"打印项目"记录详情
5. **追踪维护** - 定期记录打印机维护情况
6. **核算成本** - 在"成本核算"页面查看打印成本和定价参考

## API接口

后端提供RESTful API接口：

- `GET /api/projects` - 获取所有项目
- `POST /api/projects` - 创建项目
- `GET /api/filaments` - 获取所有耗材
- `POST /api/filaments` - 添加耗材
- `GET /api/printers` - 获取所有打印机
- `POST /api/printers` - 添加打印机
- `GET /api/profiles` - 获取所有切片配置
- `POST /api/profiles` - 创建切片配置
- `GET /api/costs/calculate/:projectId` - 计算项目成本
- `GET /api/costs/settings` - 获取成本设置

## 注意事项

- 数据库文件存储在 `data/` 目录下，请定期备份
- 上传文件存储在 `uploads/` 目录下
- 首次运行会自动创建数据库表结构
- 建议使用 Node.js 16+ 版本以获得最佳兼容性

## License

MIT