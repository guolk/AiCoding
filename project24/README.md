在线电路图绘制工具
============================

## 项目简介

这是一个功能完整的在线电路图绘制工具，支持元件拖拽摆放、导线连接、SPICE仿真和结果可视化。

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 下一代前端构建工具

### 后端
- **FastAPI** - 高性能Python Web框架
- **PySpice** - ngspice的Python封装
- **uvicorn** - ASGI服务器

## 功能特性

### 元件库
- 电阻 (Resistor)
- 电容 (Capacitor)
- 电感 (Inductor)
- 二极管 (Diode)
- 三极管 (Transistor)
- 运算放大器 (Op-Amp)
- 电压源 (Voltage Source)
- 电流源 (Current Source)
- 接地 (Ground)

### 画布操作
- 元件拖拽摆放
- 元件旋转 (R键)
- 元件删除 (Delete键)
- 导线连接 (点击引脚开始连接)
- 自动吸附到引脚
- 网格对齐

### 仿真功能
- 瞬态分析 (Transient Analysis)
- 频率扫描 (AC Analysis)
- 节点电压显示
- 支路电流显示
- 颜色热图展示

### 导出功能
- 导出为SVG图片
- 保存为SPICE Netlist格式

## 安装步骤

### 1. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
pip install -r requirements.txt
```

### 2. 安装ngspice (可选但推荐)

PySpice需要ngspice作为后端。

**Windows:**
```bash
# 使用chocolatey安装
choco install ngspice

# 或者从官网下载: http://ngspice.sourceforge.net/
```

**Linux:**
```bash
sudo apt-get install ngspice
```

**macOS:**
```bash
brew install ngspice
```

## 运行项目

### 1. 启动后端服务

```bash
cd backend
uvicorn app.main:app --reload
```

后端服务将在 http://localhost:8000 启动

### 2. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端服务将在 http://localhost:3000 启动

### 3. 访问应用

打开浏览器访问 http://localhost:3000

## 使用指南

### 绘制电路图

1. **添加元件**: 从左侧元件库拖拽元件到画布
2. **选择元件**: 点击元件进行选择
3. **移动元件**: 拖拽选中的元件
4. **旋转元件**: 选中元件后按 R 键，或在属性面板中选择角度
5. **删除元件**: 选中元件后按 Delete 键
6. **编辑参数**: 选中元件后在右侧属性面板编辑参数

### 连接导线

1. 点击一个元件的引脚开始绘制导线
2. 点击另一个元件的引脚完成连接
3. 按 ESC 取消绘制

### 运行仿真

1. 在顶部工具栏选择仿真模式:
   - **瞬态分析**: 分析时域响应
   - **频率扫描**: 分析频域响应

2. 点击"运行仿真"按钮

3. 仿真结果将以颜色热图和数值标注的形式显示在电路图上

### 导出文件

1. **导出SVG**: 点击"导出SVG"按钮，下载SVG图片
2. **保存Netlist**: 点击"保存Netlist"按钮，下载SPICE网表文件

## 项目结构

```
project24/
├── frontend/                    # 前端Vue项目
│   ├── src/
│   │   ├── components/         # Vue组件
│   │   │   ├── CircuitCanvas.vue      # 画布组件
│   │   │   ├── ComponentLibrary.vue   # 元件库组件
│   │   │   ├── ComponentSymbol.vue    # 元件符号渲染
│   │   │   ├── PropertyPanel.vue      # 属性面板
│   │   │   └── WireComponent.vue      # 导线组件
│   │   ├── types/              # TypeScript类型定义
│   │   ├── utils/              # 工具函数
│   │   ├── App.vue             # 根组件
│   │   ├── main.ts             # 入口文件
│   │   └── style.css           # 全局样式
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                     # 后端FastAPI项目
│   ├── app/
│   │   ├── routers/           # API路由
│   │   │   └── api.py
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI应用入口
│   │   ├── schemas.py          # Pydantic数据模型
│   │   ├── netlist_generator.py # SPICE网表生成器
│   │   ├── simulation_service.py # 仿真服务
│   │   └── svg_exporter.py     # SVG导出服务
│   ├── requirements.txt
│   └── pyproject.toml
└── package.json                # 根目录配置
```

## API接口

### POST /api/simulate
运行电路仿真

**请求体:**
```json
{
  "components": [...],
  "wires": [...],
  "config": {
    "mode": "transient",
    "transient": {
      "startTime": 0,
      "endTime": 0.01,
      "timeStep": 1e-5
    }
  }
}
```

### POST /api/export/netlist
导出SPICE网表

### POST /api/export/svg
导出SVG图片

### GET /api/health
健康检查

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| R | 旋转选中元件 |
| Delete | 删除选中元件 |
| ESC | 取消操作/取消选择 |

## 注意事项

1. **ngspice安装**: 完整的仿真功能需要安装ngspice。如果未安装，仿真服务将使用模拟数据进行演示。

2. **元件值格式**: 支持以下单位后缀:
   - p (皮, 1e-12)
   - n (纳, 1e-9)
   - u (微, 1e-6)
   - m (毫, 1e-3)
   - k (千, 1e3)
   - M (兆, 1e6)
   - G (吉, 1e9)

3. **接地要求**: 建议在电路图中至少包含一个接地元件，以确保仿真能够正常运行。

## 开发计划

- [ ] 添加更多元件类型
- [ ] 实现撤销/重做功能
- [ ] 添加波形图表显示
- [ ] 支持元件库自定义
- [ ] 优化仿真性能
- [ ] 添加多标签页支持
- [ ] 实现电路保存/加载功能

## 许可证

MIT License
