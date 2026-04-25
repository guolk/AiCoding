# Electron Notes 跨平台问题修复方案

> 文档版本: 1.0  
> 最后更新: 2026-04-25  
> 作者: 开发团队

---

## 目录

1. [概述](#1-概述)
2. [问题一：macOS 关闭窗口后应用未完全退出](#2-问题一macos-关闭窗口后应用未完全退出)
3. [问题二：Retina 屏幕截图分辨率问题](#3-问题二retina-屏幕截图分辨率问题)
4. [代码修改总结](#4-代码修改总结)
5. [最佳实践建议](#5-最佳实践建议)

---

## 1. 概述

本文档详细记录了 Electron 笔记应用在跨平台开发中遇到的两个关键问题及其修复方案：

| 问题 | 影响平台 | 严重程度 | 修复状态 |
|------|----------|----------|----------|
| 关闭窗口后应用未完全退出 | macOS | 高 | ✅ 已修复 |
| Retina 屏幕截图分辨率低 | macOS (高 DPI) | 高 | ✅ 已修复 |

---

## 2. 问题一：macOS 关闭窗口后应用未完全退出

### 2.1 问题描述

**现象**：
在 macOS 上，用户关闭主窗口后：
- 应用进程没有完全退出
- Dock 栏图标仍然显示
- 活动监视器中仍能看到应用进程
- 有时用户想要完全退出应用却无法做到

**对比 Windows 行为**：
在 Windows 上，关闭最后一个窗口后应用通常完全退出，这与 macOS 的默认行为不同。

### 2.2 问题根因分析

#### 2.2.1 平台差异本质

macOS 和 Windows 在应用生命周期管理上存在根本的设计哲学差异：

| 特性 | macOS | Windows/Linux |
|------|-------|---------------|
| 应用与窗口关系 | 应用和窗口是分离的概念 | 窗口等同于应用 |
| 关闭窗口行为 | 隐藏窗口，应用继续运行 | 关闭窗口，应用退出 |
| Dock/任务栏 | 图标始终显示（运行中） | 图标在窗口关闭后消失 |
| 恢复方式 | 点击 Dock 图标或 Cmd+Tab | 重新启动应用 |

#### 2.2.2 常见错误代码

**错误实现 1：简单关闭即退出**

```javascript
// ❌ 错误：这会导致 macOS 行为异常
app.on('window-all-closed', () => {
  app.quit();  // macOS 上不应该这样做！
});
```

**问题**：
- 在 macOS 上，这违反了用户的预期
- 用户习惯关闭窗口后应用仍在后台
- 类似 Safari、Pages、Keynote 等原生应用都遵循"关闭窗口≠退出应用"的行为

**错误实现 2：完全不处理退出**

```javascript
// ❌ 错误：用户无法正常退出应用
// 没有实现 will-quit 或 before-quit 的正确处理
```

**问题**：
- 用户点击"退出"菜单时应用可能不响应
- Cmd+Q 快捷键可能无法正常工作
- 可能导致进程残留

#### 2.2.3 关键事件分析

Electron 中与窗口和应用生命周期相关的关键事件：

```
用户操作 → 触发事件 → 应用行为
```

**窗口相关事件**：

| 事件 | 触发时机 | 默认行为 |
|------|----------|----------|
| `close` | 窗口即将关闭时 | 窗口关闭 |
| `closed` | 窗口已关闭后 | 无 |
| `window-all-closed` | 所有窗口都关闭后 | 无（除了 macOS） |

**应用相关事件**：

| 事件 | 触发时机 | 说明 |
|------|----------|------|
| `before-quit` | 应用即将退出前 | 可以阻止退出 |
| `will-quit` | 应用即将退出 | 无法阻止 |
| `quit` | 应用已退出 | 清理工作 |
| `activate` | 应用被激活（macOS 特有） | 点击 Dock 图标时触发 |

#### 2.2.4 问题场景重现

**场景 1：用户关闭窗口**

```
1. 用户点击窗口红色关闭按钮（或 Cmd+W）
2. 触发 BrowserWindow 的 'close' 事件
3. 如果没有阻止默认行为，窗口关闭
4. 触发 'window-all-closed' 事件
5. 如果代码调用了 app.quit()，应用退出 ❌（macOS 不期望）
```

**场景 2：用户主动退出应用**

```
1. 用户点击菜单"退出"（或 Cmd+Q）
2. 触发 app 的 'before-quit' 事件
3. 应用尝试关闭所有窗口
4. 触发每个窗口的 'close' 事件
5. 窗口关闭后应用退出 ✅（期望行为）
```

**核心问题**：代码无法区分"用户只是关闭窗口"和"用户想要退出应用"两种场景。

### 2.3 修复方案

#### 2.3.1 设计思路

**核心原则**：

1. **区分退出方式**：使用标志位区分"主动退出"和"关闭窗口"
2. **遵循平台规范**：macOS 上保持应用运行，Windows/Linux 上退出
3. **支持恢复窗口**：实现 `activate` 事件处理，让用户可以恢复窗口

**状态机设计**：

```
                    ┌──────────────┐
                    │   应用启动    │
                    │ isQuitting=F │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │ 关闭窗口  │  │ 主动退出  │  │ 激活应用  │
       │ Cmd+W    │  │ Cmd+Q    │  │ 点击Dock  │
       └────┬─────┘  └────┬─────┘  └────┬─────┘
            │              │              │
            ▼              ▼              ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │isQuitting│  │isQuitting│  │ 检查窗口  │
       │  = false │  │  = true  │  │  存在？   │
       └────┬─────┘  └────┬─────┘  └────┬─────┘
            │              │              │
            ▼              ▼         ┌────┴────┐
       ┌──────────┐  ┌──────────┐  │         │
       │ 阻止关闭  │  │ 允许关闭  │  ▼         ▼
       │ 隐藏窗口  │  │ 退出应用  │ 无窗口   有窗口
       └──────────┘  └──────────┘  创建    显示
```

#### 2.3.2 完整实现代码

**步骤 1：定义全局状态变量**

```javascript
// 文件: src/main/main.js

/**
 * 应用是否正在退出的标志
 * 用于区分"用户主动退出应用"和"用户关闭窗口"
 * 
 * true: 用户正在主动退出应用（Cmd+Q 或 菜单退出）
 * false: 用户只是关闭窗口或其他操作
 */
let isQuitting = false;
```

**步骤 2：实现窗口 close 事件处理**

```javascript
// 文件: src/main/main.js

mainWindow.on('close', (event) => {
  const isMac = process.platform === 'darwin';

  // ============================================
  // 关键判断：区分退出方式
  // ============================================
  
  // 场景 1：用户主动退出应用（Cmd+Q 或 菜单退出）
  if (isQuitting) {
    // 允许窗口关闭，应用将在 will-quit 事件中完全退出
    mainWindow = null;
    return;
  }

  // 场景 2：用户只是关闭窗口（点击红色按钮或 Cmd+W）
  if (isMac) {
    // ============================================
    // macOS 行为：阻止窗口关闭，改为隐藏
    // ============================================
    
    // 阻止默认的关闭行为
    event.preventDefault();
    
    // 根据窗口状态选择不同的隐藏方式
    if (mainWindow.isFullScreen()) {
      // 全屏模式：先退出全屏，再隐藏
      mainWindow.once('leave-full-screen', () => {
        mainWindow.hide();
      });
      mainWindow.setFullScreen(false);
    } else {
      // 普通模式：直接隐藏
      mainWindow.hide();
      
      // 可选：也可以最小化到 Dock 栏
      // mainWindow.minimize();
    }
    
    console.log('[macOS] 窗口已隐藏，应用仍在运行');
  } else {
    // ============================================
    // Windows/Linux 行为：允许窗口关闭
    // ============================================
    
    // 窗口关闭后，window-all-closed 事件会触发
    // 在那里处理应用退出
    mainWindow = null;
  }
});
```

**步骤 3：实现 window-all-closed 事件处理**

```javascript
// 文件: src/main/main.js

/**
 * 所有窗口都已关闭事件
 * 
 * 平台行为差异：
 * - Windows/Linux: 退出应用
 * - macOS: 保持应用运行，等待 activate 事件
 */
app.on('window-all-closed', () => {
  console.log('[应用] window-all-closed 事件');
  
  const isMac = process.platform === 'darwin';
  
  if (!isMac) {
    // Windows/Linux: 退出应用
    console.log('[应用] Windows/Linux: 退出应用');
    app.quit();
  } else {
    // macOS: 不退出应用，保持运行
    // 用户可以通过以下方式重新打开窗口：
    // 1. 点击 Dock 栏图标（触发 activate 事件）
    // 2. 使用 Cmd+Tab 切换到应用
    // 3. 点击菜单栏的"窗口"菜单
    console.log('[应用] macOS: 保持应用运行，等待 activate 事件');
  }
});
```

**步骤 4：实现 activate 事件处理（macOS 特有）**

```javascript
// 文件: src/main/main.js

/**
 * 应用激活事件（macOS 特有）
 * 
 * 触发时机：
 * 1. 用户点击 Dock 栏图标
 * 2. 用户使用 Cmd+Tab 切换到应用
 * 3. 应用从隐藏状态恢复
 * 
 * 这是 macOS 上让用户恢复窗口的关键事件
 */
app.on('activate', () => {
  console.log('[应用] activate 事件 (macOS特有)');
  
  if (mainWindow === null) {
    // 没有窗口：创建新的主窗口
    console.log('[应用] 创建新窗口');
    createMainWindow();
  } else {
    // 有窗口：显示并聚焦
    console.log('[应用] 显示现有窗口');
    
    if (mainWindow.isMinimized()) {
      // 如果窗口被最小化，先恢复
      mainWindow.restore();
    }
    
    // 显示窗口
    mainWindow.show();
    
    // 聚焦窗口（提到最前面）
    mainWindow.focus();
  }
});
```

**步骤 5：实现 before-quit 事件处理**

```javascript
// 文件: src/main/main.js

/**
 * 应用即将退出事件
 * 
 * 触发时机：
 * 1. 用户点击菜单"退出"
 * 2. 用户按下 Cmd+Q
 * 3. 代码调用 app.quit()
 * 
 * 这是设置 isQuitting 标志的最佳时机
 */
app.on('before-quit', (event) => {
  console.log('[应用] before-quit 事件');
  
  // 设置退出标志
  // 这样窗口的 close 事件就知道这是主动退出
  isQuitting = true;
});
```

**步骤 6：实现应用菜单（确保退出选项正确）**

```javascript
// 文件: src/main/main.js

/**
 * 创建应用菜单
 * 
 * macOS 上应用菜单是系统级的，需要包含"退出"选项
 * 使用 role: 'quit' 可以确保 Cmd+Q 快捷键正确工作
 */
function createApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS 特有：应用菜单
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { label: '关于 ' + app.name, role: 'about' },
        { type: 'separator' },
        { label: '服务', role: 'services' },
        { type: 'separator' },
        { label: '隐藏 ' + app.name, role: 'hide' },
        { label: '隐藏其他应用', role: 'hideOthers' },
        { label: '显示全部', role: 'unhide' },
        { type: 'separator' },
        // 关键：使用 role: 'quit'
        // 这会自动处理 Cmd+Q 快捷键
        // 并正确触发 before-quit 事件
        { label: '退出 ' + app.name, role: 'quit' }
      ]
    }] : []),
    
    // 文件菜单
    {
      label: '文件',
      submenu: [
        { label: '新建笔记', accelerator: 'CmdOrCtrl+N' },
        { type: 'separator' },
        // Windows/Linux 上的退出选项放在文件菜单
        ...(!isMac ? [{
          label: '退出',
          accelerator: 'Ctrl+Q',
          click: () => {
            // 主动设置退出标志
            isQuitting = true;
            app.quit();
          }
        }] : [])
      ]
    },
    
    // ... 其他菜单
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
```

#### 2.3.3 修复后的行为对比

| 操作 | 修复前（问题） | 修复后（正确） |
|------|----------------|----------------|
| 点击窗口关闭按钮 | 可能退出应用 | 只隐藏窗口 |
| Cmd+W | 可能退出应用 | 只隐藏窗口 |
| Cmd+Q | 可能不退出 | 完全退出应用 |
| 菜单"退出" | 可能不退出 | 完全退出应用 |
| Dock 右键"退出" | 可能不退出 | 完全退出应用 |
| 点击 Dock 图标 | 无响应 | 显示/创建窗口 |
| Cmd+Tab 切换 | 可能切换失败 | 正常切换并显示窗口 |

### 2.4 测试验证要点

#### 2.4.1 功能测试清单

- [ ] **关闭窗口测试**：点击关闭按钮，窗口隐藏，应用仍在运行
- [ ] **Dock 图标测试**：关闭窗口后，Dock 图标仍然显示
- [ ] **进程测试**：活动监视器中应用进程仍存在
- [ ] **恢复窗口测试**：点击 Dock 图标，窗口重新显示
- [ ] **Cmd+Tab 测试**：使用 Cmd+Tab 切换，应用出现在列表中
- [ ] **Cmd+Q 测试**：按下 Cmd+Q，应用完全退出
- [ ] **菜单退出测试**：点击菜单"退出"，应用完全退出
- [ ] **Dock 右键退出测试**：右键点击 Dock 图标选择"退出"，应用完全退出

#### 2.4.2 与原生应用行为对比

验证应用行为是否与 macOS 原生应用一致：

| 测试项 | Safari | 我们的应用（修复后） |
|--------|--------|---------------------|
| 关闭窗口 | 隐藏，应用继续运行 | 隐藏，应用继续运行 |
| Cmd+W | 隐藏当前窗口 | 隐藏当前窗口 |
| Cmd+Q | 完全退出 | 完全退出 |
| 点击 Dock 图标 | 显示窗口 | 显示窗口 |
| Cmd+Tab | 可以切换 | 可以切换 |

---

## 3. 问题二：Retina 屏幕截图分辨率问题

### 3.1 问题描述

**现象**：
在 Retina 屏幕（或其他高 DPI 显示器）上使用截图功能时：
- 生成的图片分辨率只有实际屏幕的一半
- 图片显示模糊，文字边缘有锯齿
- 在非 Retina 屏幕上查看时问题更加明显

**具体表现**：
- 13" MacBook Pro (2560x1600 物理分辨率)
- 截图得到的是 1280x800 像素
- 只有实际分辨率的 1/4（面积）

### 3.2 问题根因分析

#### 3.2.1 Retina 屏幕技术原理

**什么是 Retina 屏幕？**

Retina 屏幕是 Apple 推出的高分辨率显示技术，其核心特点是：
- 像素密度足够高，人眼在正常观看距离下无法分辨单个像素
- 通常使用 2:1 的缩放比例（2 个物理像素显示 1 个逻辑像素）

**逻辑坐标 vs 物理坐标**

这是理解问题的关键概念：

```
┌─────────────────────────────────────────┐
│              物理屏幕 (2880 x 1800)      │
│  ┌───────────────────────────────────┐  │
│  │         逻辑区域 (1440 x 900)      │  │
│  │                                   │  │
│  │  每个逻辑点 = 2x2 物理像素         │  │
│  │                                   │  │
│  │  逻辑坐标 (100, 100)              │  │
│  │  = 物理坐标 (200, 200)            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

| 概念 | 说明 | 示例值 |
|------|------|--------|
| 物理像素 | 屏幕上实际的发光点 | 2880 x 1800 |
| 逻辑坐标 | 操作系统使用的抽象坐标 | 1440 x 900 |
| 缩放因子 | 物理像素 / 逻辑坐标 | 2.0 |
| CSS 像素 | 网页使用的像素单位 | 与逻辑坐标一致 |

**为什么要这样设计？**

1. **向后兼容**：旧应用不需要修改就能在高分辨率屏幕上正常显示
2. **可读性**：保持文字和图标的物理大小一致，不会变得太小
3. **清晰度**：使用更多物理像素渲染，显示更加细腻

#### 3.2.2 Electron 中的坐标系统

Electron 继承了 Chromium 的坐标系统：

**screen 模块返回的是逻辑坐标**：

```javascript
const { screen } = require('electron');

// 获取主显示器
const display = screen.getPrimaryDisplay();

console.log(display.bounds);
// 输出（Retina 屏幕）: { x: 0, y: 0, width: 1440, height: 900 }
// 注意：这是逻辑坐标，不是物理像素！

console.log(display.scaleFactor);
// 输出: 2
// 这才是关键！缩放因子告诉我们需要乘以多少
```

**desktopCapturer 的行为**：

```javascript
const { desktopCapturer } = require('electron');

// ❌ 错误：使用逻辑尺寸获取截图
const sources = await desktopCapturer.getSources({
  types: ['screen'],
  thumbnailSize: {
    width: 1440,   // 逻辑宽度
    height: 900     // 逻辑高度
  }
});

// 结果：得到的是 1440x900 的图片
// 但实际屏幕是 2880x1800，所以图片只有一半分辨率！
```

#### 3.2.3 常见错误代码分析

**错误实现 1：直接使用返回的 bounds**

```javascript
// ❌ 错误：没有考虑缩放因子
async function captureScreen() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds;  // 这是逻辑坐标！
  
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height }  // 直接使用逻辑尺寸
  });
  
  // 结果：截图分辨率只有实际的 1/scaleFactor
  return sources[0].thumbnail;
}
```

**错误实现 2：截图后缩放**

```javascript
// ❌ 错误：先获取低分辨率图片再缩放
// 这样无法恢复丢失的细节
async function captureScreen() {
  const display = screen.getPrimaryDisplay();
  const scaleFactor = display.scaleFactor;
  
  // 先获取低分辨率截图
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { 
      width: display.bounds.width,   // 逻辑尺寸
      height: display.bounds.height
    }
  });
  
  // 尝试缩放，但细节已经丢失了！
  const image = sources[0].thumbnail;
  // image.resize({ width: width * scaleFactor, height: height * scaleFactor })
  // ❌ 这样只会让图片变大，不会变清晰！
  
  return image;
}
```

**错误实现 3：忽略多显示器不同缩放**

```javascript
// ❌ 错误：假设所有显示器缩放因子相同
async function captureRegion(x, y, width, height) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const scaleFactor = primaryDisplay.scaleFactor;  // 使用主显示器的缩放
  
  // 但用户可能在第二个显示器上操作，缩放因子可能不同！
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: width * scaleFactor,   // 可能使用了错误的缩放因子
      height: height * scaleFactor
    }
  });
  
  // 结果：在不同缩放的显示器上截图尺寸错误
}
```

#### 3.2.4 问题影响范围

| 场景 | 影响程度 | 说明 |
|------|----------|------|
| 全屏截图 | 高 | 分辨率只有实际的一半 |
| 窗口截图 | 高 | 同样受到缩放因子影响 |
| 区域截图 | 高 | 坐标和尺寸都需要转换 |
| 普通屏幕 (1x) | 无 | 问题不显现 |
| Retina 屏幕 (2x) | 严重 | 分辨率只有 1/4 |
| 超高分屏幕 (3x) | 更严重 | 分辨率只有 1/9 |

### 3.3 修复方案

#### 3.3.1 设计思路

**核心原则**：

1. **获取正确的缩放因子**：从实际显示器获取，不是假设
2. **转换所有坐标**：逻辑坐标 × 缩放因子 = 物理坐标
3. **使用正确尺寸获取截图**：告诉 desktopCapturer 使用物理尺寸
4. **正确处理多显示器**：每个显示器可能有不同的缩放因子

**坐标转换流程**：

```
用户输入/系统返回（逻辑坐标）
         │
         ▼
┌─────────────────────┐
│  1. 获取目标显示器    │
│  2. 获取 scaleFactor │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  坐标转换：          │
│  物理X = 逻辑X × 缩放  │
│  物理Y = 逻辑Y × 缩放  │
│  物理宽 = 逻辑宽 × 缩放 │
│  物理高 = 逻辑高 × 缩放 │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  使用物理尺寸获取截图  │
│  desktopCapturer    │
└─────────────────────┘
         │
         ▼
    高分辨率截图结果
```

#### 3.3.2 完整实现代码

**步骤 1：获取正确的显示器和缩放因子**

```javascript
// 文件: src/main/main.js

/**
 * 获取屏幕截图（修复 Retina 屏幕问题版本）
 */
async function captureScreen(options = {}) {
  const { 
    x = 0, 
    y = 0, 
    width = 0, 
    height = 0,
    captureType = 'screen'
  } = options;

  try {
    // ============================================
    // 关键修复 1：获取正确的显示器信息
    // ============================================
    
    let targetDisplay;
    
    if (captureType === 'region' && (x !== 0 || y !== 0)) {
      // 区域截图：获取鼠标所在位置的显示器
      // 这样可以正确处理多显示器不同缩放的情况
      targetDisplay = screen.getDisplayNearestPoint({ x, y });
    } else {
      // 全屏截图：使用主显示器
      targetDisplay = screen.getPrimaryDisplay();
    }
    
    // ============================================
    // 关键修复 2：获取缩放因子
    // ============================================
    
    // 这是修复 Retina 问题的核心！
    const scaleFactor = targetDisplay.scaleFactor;
    console.log(`[截图] 检测到缩放因子: ${scaleFactor}x`);
    
    // 获取显示器的边界和工作区域
    const displayBounds = targetDisplay.bounds;      // 整个显示器
    const displayWorkArea = targetDisplay.workArea;  // 不包括任务栏/Dock
    
    // ============================================
    // 关键修复 3：计算正确的截图区域
    // ============================================
    
    let captureX, captureY, captureWidth, captureHeight;
    
    if (captureType === 'region' && width > 0 && height > 0) {
      // 区域截图：使用用户提供的逻辑坐标
      captureX = x;
      captureY = y;
      captureWidth = width;
      captureHeight = height;
    } else {
      // 全屏截图：使用工作区域的逻辑坐标
      captureX = displayWorkArea.x;
      captureY = displayWorkArea.y;
      captureWidth = displayWorkArea.width;
      captureHeight = displayWorkArea.height;
    }
    
    console.log(`[截图] 逻辑区域: x=${captureX}, y=${captureY}, w=${captureWidth}, h=${captureHeight}`);
    
    // ============================================
    // 关键修复 4：坐标转换（逻辑 → 物理）
    // ============================================
    
    // 计算相对于显示器左上角的偏移
    // 因为 displayBounds 可能不是从 (0,0) 开始（多显示器时）
    const relativeX = captureX - displayBounds.x;
    const relativeY = captureY - displayBounds.y;
    
    // 转换为物理坐标（乘以缩放因子）
    // 使用 Math.round 确保是整数像素
    const physicalX = Math.round(relativeX * scaleFactor);
    const physicalY = Math.round(relativeY * scaleFactor);
    const physicalWidth = Math.round(captureWidth * scaleFactor);
    const physicalHeight = Math.round(captureHeight * scaleFactor);
    
    console.log(`[截图] 物理区域: x=${physicalX}, y=${physicalY}, w=${physicalWidth}, h=${physicalHeight}`);
    
    // ============================================
    // 关键修复 5：使用物理尺寸获取截图源
    // ============================================
    
    // 重要：thumbnailSize 需要使用物理尺寸
    // 这样 desktopCapturer 才会返回高分辨率的截图
    const sources = await desktopCapturer.getSources({
      types: captureType === 'window' ? ['window'] : ['screen'],
      thumbnailSize: {
        width: Math.round(displayBounds.width * scaleFactor),
        height: Math.round(displayBounds.height * scaleFactor)
      }
    });
    
    if (sources.length === 0) {
      throw new Error('未找到可用的截图源');
    }
    
    // 选择截图源
    let source = sources[0];  // 默认使用第一个
    
    if (captureType === 'window' && mainWindow) {
      // 窗口截图：尝试找到当前应用的窗口
      const windowSource = sources.find(s => 
        s.name === mainWindow.getTitle() || 
        s.id.includes('window')
      );
      if (windowSource) source = windowSource;
    }
    
    console.log(`[截图] 使用源: ${source.name}`);
    
    // ============================================
    // 关键修复 6：裁剪（如果是区域截图）
    // ============================================
    
    let thumbnail = source.thumbnail;
    
    // 如果是区域截图，需要从完整截图中裁剪
    if (captureType === 'region' && (physicalX > 0 || physicalY > 0 || 
        physicalWidth < thumbnail.getWidth() || 
        physicalHeight < thumbnail.getHeight())) {
      
      // 确保裁剪区域在截图范围内
      const cropX = Math.max(0, Math.min(physicalX, thumbnail.getWidth() - 1));
      const cropY = Math.max(0, Math.min(physicalY, thumbnail.getHeight() - 1));
      const cropWidth = Math.min(physicalWidth, thumbnail.getWidth() - cropX);
      const cropHeight = Math.min(physicalHeight, thumbnail.getHeight() - cropY);
      
      console.log(`[截图] 裁剪区域: x=${cropX}, y=${cropY}, w=${cropWidth}, h=${cropHeight}`);
      
      // 使用 nativeImage.crop() 裁剪
      // 注意：crop() 使用的是物理像素坐标
      thumbnail = thumbnail.crop({
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      });
    }
    
    // ============================================
    // 关键修复 7：设置图片元数据
    // ============================================
    
    // 标记为模板图片（可选，根据需求）
    // thumbnail.setTemplateImage(true);
    
    // ============================================
    // 返回结果
    // ============================================
    
    // 转换为 PNG 和 Base64
    const imageBuffer = thumbnail.toPNG();
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log(`[截图] 完成，图片尺寸: ${thumbnail.getWidth()}x${thumbnail.getHeight()}`);
    
    return {
      success: true,
      dataUrl: dataUrl,
      width: thumbnail.getWidth(),           // 物理宽度
      height: thumbnail.getHeight(),         // 物理高度
      scaleFactor: scaleFactor,              // 使用的缩放因子
      logicalWidth: Math.round(thumbnail.getWidth() / scaleFactor),   // 逻辑宽度
      logicalHeight: Math.round(thumbnail.getHeight() / scaleFactor), // 逻辑高度
      buffer: imageBuffer
    };
    
  } catch (error) {
    console.error('[截图] 失败:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}
```

**步骤 2：辅助函数（获取鼠标位置和显示器信息）**

```javascript
// 文件: src/main/main.js

/**
 * 获取当前鼠标位置（包含逻辑坐标和物理坐标）
 * 用于调试和区域截图
 */
function getCursorPosition() {
  // screen.getCursorScreenPoint() 返回的是逻辑坐标
  const point = screen.getCursorScreenPoint();
  
  // 获取鼠标所在的显示器
  const display = screen.getDisplayNearestPoint(point);
  
  return {
    // 逻辑坐标（DPI 无关）
    logicalX: point.x,
    logicalY: point.y,
    
    // 物理坐标（实际像素）
    physicalX: Math.round((point.x - display.bounds.x) * display.scaleFactor),
    physicalY: Math.round((point.y - display.bounds.y) * display.scaleFactor),
    
    // 显示器信息
    displayId: display.id,
    scaleFactor: display.scaleFactor,
    displayBounds: display.bounds
  };
}

/**
 * 获取所有显示器信息
 * 用于调试和多显示器支持
 */
function getAllDisplays() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  
  return displays.map(display => ({
    id: display.id,
    isPrimary: display.id === primaryDisplay.id,
    
    // 逻辑边界
    bounds: display.bounds,
    workArea: display.workArea,
    
    // 物理尺寸（关键：逻辑尺寸 × 缩放因子）
    physicalWidth: Math.round(display.bounds.width * display.scaleFactor),
    physicalHeight: Math.round(display.bounds.height * display.scaleFactor),
    
    // 缩放信息
    scaleFactor: display.scaleFactor,
    rotation: display.rotation,
    touchSupport: display.touchSupport
  }));
}
```

**步骤 3：注册 IPC 处理器供渲染进程调用**

```javascript
// 文件: src/main/main.js

/**
 * 注册所有 IPC 处理器
 */
function registerIPCHandlers() {
  // 全屏截图
  ipcMain.handle('screen-capture:full', async (event) => {
    return await captureScreen({
      captureType: 'screen'
    });
  });
  
  // 区域截图
  ipcMain.handle('screen-capture:region', async (event, x, y, width, height) => {
    return await captureScreen({
      x,
      y,
      width,
      height,
      captureType: 'region'
    });
  });
  
  // 窗口截图
  ipcMain.handle('screen-capture:window', async (event) => {
    return await captureScreen({
      captureType: 'window'
    });
  });
  
  // 获取鼠标位置
  ipcMain.handle('screen-capture:getCursorPosition', (event) => {
    return getCursorPosition();
  });
  
  // 获取所有显示器信息
  ipcMain.handle('screen-capture:getAllDisplays', (event) => {
    return getAllDisplays();
  });
  
  // 获取当前显示器的缩放因子
  ipcMain.handle('screen-capture:getScaleFactor', (event) => {
    const primaryDisplay = screen.getPrimaryDisplay();
    return primaryDisplay.scaleFactor;
  });
  
  // ... 其他 IPC 处理器
}
```

#### 3.3.3 修复前后对比

**数据对比**（以 13" MacBook Pro 为例）：

| 项目 | 修复前 | 修复后 |
|------|--------|--------|
| 逻辑分辨率 | 1440 x 900 | 1440 x 900 |
| 缩放因子 | 未使用 | 2x |
| 截图分辨率 | 1440 x 900 ❌ | 2880 x 1800 ✅ |
| 像素数量 | 1,296,000 | 5,184,000（4 倍） |
| 图片清晰度 | 模糊、有锯齿 | 清晰、锐利 |
| 文件大小 | 较小 | 较大（约 4 倍） |

**视觉对比**：

```
修复前（1440x900 放大到 2880x1800）：
┌─────────────────────────────────┐
│  文字边缘模糊，有锯齿             │
│  图片细节丢失                     │
│  类似低分辨率显示器的显示效果      │
└─────────────────────────────────┘

修复后（原生 2880x1800）：
┌─────────────────────────────────┐
│  文字边缘锐利清晰                 │
│  所有细节完整保留                 │
│  与 Retina 屏幕原生显示效果一致    │
└─────────────────────────────────┘
```

### 3.4 测试验证要点

#### 3.4.1 功能测试清单

**基础测试**：
- [ ] **缩放因子检测**：状态栏显示正确的缩放因子（Retina 应为 2x）
- [ ] **全屏截图分辨率**：截图宽度 = 逻辑宽度 × 缩放因子
- [ ] **截图清晰度**：放大查看，文字边缘无锯齿
- [ ] **窗口截图**：窗口截图同样使用正确的缩放因子

**多显示器测试**：
- [ ] **主显示器截图**：主显示器截图尺寸正确
- [ ] **副显示器截图**：副显示器截图尺寸正确
- [ ] **不同缩放显示器**：一台 1x，一台 2x，各自截图正确

**边缘情况**：
- [ ] **不同缩放值**：1x、1.25x、1.5x、2x、3x 都能正确处理
- [ ] **高分屏**：4K/5K 显示器截图尺寸正确
- [ ] **横屏/竖屏**：旋转显示器后截图尺寸正确

#### 3.4.2 验证方法

**方法 1：查看截图信息面板**

执行截图后，在预览模态框中查看：
- 分辨率：应显示物理像素值
- 缩放因子：应显示正确值（如 2x）
- 逻辑尺寸：分辨率 / 缩放因子

**方法 2：保存图片后查看属性**

1. 将截图保存到文件
2. 在 Finder/文件资源管理器中查看图片属性
3. 验证尺寸是否正确

**方法 3：放大对比**

1. 同时打开修复前和修复后的截图
2. 放大到相同比例（如 200%）
3. 观察文字边缘的清晰度

---

## 4. 代码修改总结

### 4.1 修改文件清单

| 文件路径 | 修改类型 | 主要修改内容 |
|----------|----------|--------------|
| `src/main/main.js` | 新增/修改 | 完整的生命周期管理和截图功能 |
| `src/main/preload.js` | 新增 | 安全的 IPC 桥接 |
| `src/renderer/index.html` | 新增 | 用户界面 |
| `src/renderer/renderer.js` | 新增 | 渲染进程逻辑 |

### 4.2 关键代码位置

#### 4.2.1 macOS 退出问题修复

| 功能 | 文件位置 | 代码行号（参考） |
|------|----------|------------------|
| isQuitting 标志 | `src/main/main.js` | 约 45 行 |
| 窗口 close 事件 | `src/main/main.js` | 约 180-230 行 |
| window-all-closed 事件 | `src/main/main.js` | 约 780-810 行 |
| activate 事件 | `src/main/main.js` | 约 815-850 行 |
| before-quit 事件 | `src/main/main.js` | 约 765-775 行 |
| 应用菜单创建 | `src/main/main.js` | 约 250-350 行 |

#### 4.2.2 Retina 截图问题修复

| 功能 | 文件位置 | 代码行号（参考） |
|------|----------|------------------|
| captureScreen 函数 | `src/main/main.js` | 约 360-550 行 |
| 获取缩放因子 | `src/main/main.js` | 约 400-410 行 |
| 坐标转换 | `src/main/main.js` | 约 440-470 行 |
| 使用物理尺寸获取截图 | `src/main/main.js` | 约 480-500 行 |
| 裁剪处理 | `src/main/main.js` | 约 520-545 行 |
| 辅助函数 | `src/main/main.js` | 约 560-620 行 |
| IPC 注册 | `src/main/main.js` | 约 630-710 行 |

### 4.3 核心代码片段

#### 4.3.1 macOS 退出问题核心代码

```javascript
// 标志位
let isQuitting = false;

// 窗口关闭事件处理
mainWindow.on('close', (event) => {
  if (isQuitting) {
    mainWindow = null;
    return;
  }
  if (process.platform === 'darwin') {
    event.preventDefault();
    mainWindow.hide();
  }
});

// 应用即将退出
app.on('before-quit', () => {
  isQuitting = true;
});

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用激活（macOS 特有）
app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});
```

#### 4.3.2 Retina 截图问题核心代码

```javascript
async function captureScreen(options = {}) {
  const display = screen.getPrimaryDisplay();
  
  // 关键：获取缩放因子
  const scaleFactor = display.scaleFactor;
  
  // 关键：使用物理尺寸
  const physicalWidth = Math.round(display.bounds.width * scaleFactor);
  const physicalHeight = Math.round(display.bounds.height * scaleFactor);
  
  // 关键：告诉 desktopCapturer 使用物理尺寸
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: physicalWidth,
      height: physicalHeight
    }
  });
  
  return sources[0].thumbnail;
}
```

---

## 5. 最佳实践建议

### 5.1 跨平台开发建议

#### 5.1.1 始终考虑平台差异

```javascript
// ✅ 推荐：使用平台判断
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

if (isMac) {
  // macOS 特定逻辑
} else {
  // Windows/Linux 逻辑
}

// ❌ 不推荐：假设所有平台行为一致
app.on('window-all-closed', () => {
  app.quit();  // macOS 上不应该这样！
});
```

#### 5.1.2 使用 Electron 提供的角色（Role）

```javascript
// ✅ 推荐：使用 role，Electron 会处理平台差异
{ label: '退出', role: 'quit' }
{ label: '复制', role: 'copy' }
{ label: '粘贴', role: 'paste' }

// ❌ 不推荐：手动实现所有行为
{ 
  label: '退出',
  click: () => app.quit()  // 可能缺少平台特定处理
}
```

#### 5.1.3 正确使用加速器（Accelerator）

```javascript
// ✅ 推荐：使用 CmdOrCtrl，自动适配平台
accelerator: 'CmdOrCtrl+N'  // macOS: Cmd+N, Windows: Ctrl+N

// ❌ 不推荐：硬编码特定平台
accelerator: 'Cmd+N'    // Windows 上不工作
accelerator: 'Ctrl+N'    // macOS 上不符合习惯
```

### 5.2 高 DPI 开发建议

#### 5.2.1 始终考虑缩放因子

```javascript
// ✅ 推荐：获取并使用缩放因子
const display = screen.getPrimaryDisplay();
const scaleFactor = display.scaleFactor;
const physicalWidth = logicalWidth * scaleFactor;

// ❌ 不推荐：假设缩放因子为 1
const width = display.bounds.width;  // 这是逻辑尺寸！
```

#### 5.2.2 多显示器支持

```javascript
// ✅ 推荐：根据坐标获取正确的显示器
function getDisplayAt(x, y) {
  return screen.getDisplayNearestPoint({ x, y });
}

// ❌ 不推荐：总是使用主显示器
const display = screen.getPrimaryDisplay();  // 可能不是用户操作的显示器
```

#### 5.2.3 测试不同的缩放设置

建议在以下环境测试：
- 100% 缩放（普通屏幕）
- 125% 缩放（部分笔记本）
- 150% 缩放（部分高分屏）
- 200% 缩放（Retina 屏幕）
- 300% 缩放（超高分屏）

### 5.3 测试建议

#### 5.3.1 建立跨平台测试流程

```
开发完成
    │
    ▼
本地测试（开发平台）
    │
    ▼
跨平台测试
├── Windows 10/11
├── macOS 12+
└── Ubuntu 20.04+
    │
    ▼
关键功能验证
├── 窗口生命周期
├── 应用退出行为
├── 截图功能（含高 DPI）
└── 多显示器支持
    │
    ▼
发布
```

#### 5.3.2 自动化测试考虑

虽然完整的 GUI 自动化测试比较复杂，但可以考虑：

1. **单元测试**：测试纯逻辑函数
2. **集成测试**：使用 Spectron 或 Playwright 测试 Electron 应用
3. **手动测试清单**：如本文档提供的测试用例

### 5.4 资源

#### 5.4.1 官方文档

- [Electron 官方文档 - app 模块](https://www.electronjs.org/docs/latest/api/app)
- [Electron 官方文档 - BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)
- [Electron 官方文档 - desktopCapturer](https://www.electronjs.org/docs/latest/api/desktop-capturer)
- [Electron 官方文档 - screen](https://www.electronjs.org/docs/latest/api/screen)
- [Electron 官方文档 - 应用生命周期](https://www.electronjs.org/docs/latest/tutorial/quick-start#application-lifecycle)

#### 5.4.2 设计规范

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Windows App 设计指南](https://learn.microsoft.com/en-us/windows/apps/design/)
- [GNOME 人类界面指南](https://developer.gnome.org/hig/)

---

## 附录

### 附录 A：术语表

| 术语 | 定义 |
|------|------|
| Retina 屏幕 | Apple 的高分辨率显示技术，通常使用 2:1 缩放 |
| 高 DPI | Dots Per Inch，每英寸点数，高 DPI 意味着更清晰的显示 |
| 逻辑坐标 | 操作系统使用的抽象坐标系统，与 DPI 无关 |
| 物理坐标 | 屏幕上实际的像素位置 |
| 缩放因子 | 物理坐标与逻辑坐标的比值（如 2.0 表示 2x 缩放） |
| Dock 栏 | macOS 上的应用程序启动器和切换器 |
| 活动监视器 | macOS 上的任务管理器 |

### 附录 B：快速检查表

#### 发布前检查清单

- [ ] **macOS 退出行为**：关闭窗口不退出应用
- [ ] **macOS 恢复行为**：点击 Dock 图标恢复窗口
- [ ] **macOS 完全退出**：Cmd+Q 和菜单退出正常工作
- [ ] **Windows 退出行为**：关闭窗口后应用退出
- [ ] **Retina 截图**：截图使用物理分辨率
- [ ] **普通屏幕截图**：1x 缩放下截图正常
- [ ] **多显示器**：不同显示器截图正确
- [ ] **快捷键**：所有平台快捷键正确

---

**文档结束**
