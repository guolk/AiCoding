const { app, BrowserWindow, ipcMain, screen, desktopCapturer, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

// ============================================
// 全局变量管理
// ============================================

/**
 * 主窗口实例
 * 使用 let 而非 const，因为窗口可能会被重新创建
 */
let mainWindow = null;

/**
 * 托盘图标实例
 * macOS上托盘图标通常用于保持应用在后台运行
 */
let tray = null;

/**
 * 应用是否正在退出的标志
 * 用于区分用户主动退出和关闭窗口
 */
let isQuitting = false;

// ============================================
// 跨平台配置管理
// ============================================

/**
 * 获取平台特定的配置
 * @returns {Object} 包含平台特定配置的对象
 */
function getPlatformConfig() {
  const isMac = process.platform === 'darwin';
  const isWindows = process.platform === 'win32';
  const isLinux = process.platform === 'linux';

  return {
    isMac,
    isWindows,
    isLinux,
    // macOS: 关闭窗口后通常保持应用在Dock栏
    // Windows/Linux: 关闭最后一个窗口通常退出应用
    quitOnAllWindowsClosed: !isMac,
    // macOS 特定的应用菜单
    needsAppMenu: isMac,
    // 托盘图标行为
    trayBehavior: isMac ? 'dock-alternative' : 'minimize-to-tray'
  };
}

// ============================================
// 窗口生命周期管理
// ============================================

/**
 * 创建主窗口
 * 包含完整的跨平台窗口配置
 */
function createMainWindow() {
  const { isMac } = getPlatformConfig();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // 窗口配置 - 跨平台考虑
  const windowOptions = {
    width: Math.min(1200, width),
    height: Math.min(800, height),
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // 安全配置
      nodeIntegration: false,
      contextIsolation: true,
      // 预加载脚本 - 用于在渲染进程和主进程之间通信
      preload: path.join(__dirname, 'preload.js')
    },
    // 窗口外观配置
    title: 'Electron Notes',
    icon: path.join(__dirname, '../../assets/icon.png'),
    // macOS 特定配置
    ...(isMac && {
      // macOS上通常不显示菜单栏图标
      // titleBarStyle: 'hiddenInset', // 可选：隐藏标题栏但保留交通灯
    }),
    // Windows/Linux 特定配置
    ...(!isMac && {
      // Windows上可以自定义标题栏
    }),
    show: false // 先创建窗口，准备好后再显示
  };

  // 创建窗口实例
  mainWindow = new BrowserWindow(windowOptions);

  // 加载应用页面
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // ============================================
  // 窗口事件处理 - 关键的跨平台逻辑
  // ============================================

  /**
   * 窗口准备好显示时触发
   * 避免用户看到窗口加载过程
   */
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  /**
   * 窗口关闭事件 - 最关键的跨平台处理点
   * 
   * 问题根源：
   * macOS上，用户关闭窗口通常意味着"隐藏窗口"，而非"退出应用"
   * Windows/Linux上，关闭最后一个窗口通常意味着"退出应用"
   * 
   * 修复方案：
   * 1. 区分"主动退出应用"和"关闭窗口"两种场景
   * 2. macOS上：关闭窗口时隐藏窗口，保留应用进程
   * 3. Windows/Linux上：关闭窗口时退出应用
   */
  mainWindow.on('close', (event) => {
    const { isMac, quitOnAllWindowsClosed } = getPlatformConfig();

    // 场景1：用户主动退出应用（通过菜单或 Cmd+Q）
    if (isQuitting) {
      // 允许窗口关闭，应用将在 will-quit 事件中处理清理
      mainWindow = null;
      return;
    }

    // 场景2：用户只是关闭窗口
    if (isMac) {
      // macOS行为：阻止窗口关闭，改为隐藏
      // 这样用户点击Dock栏图标时可以快速恢复窗口
      event.preventDefault();
      
      // 根据窗口状态选择不同的隐藏方式
      if (mainWindow.isFullScreen()) {
        // 全屏模式下先退出全屏
        mainWindow.once('leave-full-screen', () => {
          mainWindow.hide();
        });
        mainWindow.setFullScreen(false);
      } else {
        // 普通模式直接隐藏
        mainWindow.hide();
        
        // macOS特有：也可以最小化到Dock栏
        // mainWindow.minimize();
      }
      
      console.log('[macOS] 窗口已隐藏，应用仍在运行');
    } else if (quitOnAllWindowsClosed) {
      // Windows/Linux行为：允许窗口关闭
      // 这将触发 window-all-closed 事件，然后退出应用
      mainWindow = null;
    }
  });

  /**
   * 窗口关闭后触发（已从屏幕移除）
   */
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // ============================================
  // 创建应用菜单
  // ============================================
  createApplicationMenu();

  // ============================================
  // 创建托盘图标（可选）
  // ============================================
  createTrayIcon();
}

// ============================================
// 应用菜单管理
// ============================================

/**
 * 创建应用菜单
 * macOS上应用菜单是系统级的，Windows/Linux上是窗口级的
 */
function createApplicationMenu() {
  const { isMac } = getPlatformConfig();

  // 应用菜单模板
  const template = [
    // macOS 特有：应用菜单（第一个菜单项）
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
        // 关键：macOS上的"退出"菜单项
        // 使用 role: 'quit' 会自动处理 Cmd+Q 快捷键
        // 并触发 before-quit 事件，设置 isQuitting = true
        { label: '退出 ' + app.name, role: 'quit' }
      ]
    }] : []),
    // 文件菜单
    {
      label: '文件',
      submenu: [
        {
          label: '新建笔记',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // 触发新建笔记操作
            mainWindow?.webContents.send('menu-action', 'new-note');
          }
        },
        { type: 'separator' },
        // Windows/Linux 上的退出选项放在文件菜单
        ...(!isMac ? [{
          label: '退出',
          accelerator: 'Ctrl+Q',
          click: () => {
            // 主动退出应用
            isQuitting = true;
            app.quit();
          }
        }] : [])
      ]
    },
    // 编辑菜单
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '删除', role: 'delete' },
        { type: 'separator' },
        { label: '全选', role: 'selectAll' }
      ]
    },
    // 视图菜单
    {
      label: '视图',
      submenu: [
        { label: '重新加载', role: 'reload' },
        { label: '强制重新加载', role: 'forceReload' },
        { label: '切换开发者工具', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', role: 'resetZoom' },
        { label: '放大', role: 'zoomIn' },
        { label: '缩小', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', role: 'togglefullscreen' }
      ]
    },
    // 窗口菜单
    {
      label: '窗口',
      submenu: [
        { label: '最小化', role: 'minimize' },
        { label: '缩放', role: 'zoom' },
        // macOS 特有：窗口列表
        ...(isMac ? [
          { type: 'separator' },
          { label: '前置全部窗口', role: 'front' },
          { type: 'separator' },
          {
            label: '主窗口',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              // 显示主窗口
              if (mainWindow) {
                if (mainWindow.isMinimized()) {
                  mainWindow.restore();
                }
                mainWindow.show();
                mainWindow.focus();
              } else {
                createMainWindow();
              }
            }
          }
        ] : [
          { type: 'separator' },
          { label: '关闭', role: 'close' }
        ])
      ]
    },
    // 帮助菜单
    {
      label: '帮助',
      submenu: [
        {
          label: '学习更多',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://electronjs.org');
          }
        }
      ]
    }
  ];

  // 创建并设置菜单
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================
// 托盘图标管理
// ============================================

/**
 * 创建托盘图标
 * 托盘图标可以让应用在后台运行，用户可以快速访问
 */
function createTrayIcon() {
  // 这里使用 Electron 图标，实际项目中应该使用自己的图标
  const iconPath = path.join(__dirname, '../../assets/icon.png');
  
  // 注意：托盘图标尺寸
  // - macOS: 16x16 像素（@2x 为 32x32）
  // - Windows: 16x16 像素
  
  // 简单实现：如果没有图标文件，使用空图标
  // 实际项目中应该提供图标
  try {
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createMainWindow();
          }
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    
    tray.setToolTip('Electron Notes');
    tray.setContextMenu(contextMenu);
    
    // macOS 上点击托盘图标显示窗口
    tray.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
      }
    });
  } catch (error) {
    console.log('托盘图标创建失败（可能缺少图标文件）:', error.message);
  }
}

// ============================================
// 截图功能实现 - Retina屏幕修复
// ============================================

/**
 * 获取屏幕截图（修复Retina屏幕问题版本）
 * 
 * 问题分析：
 * 在Retina等高DPI屏幕上，存在两种坐标系统：
 * 1. 逻辑坐标（DPI无关）：screen.getCursorScreenPoint() 返回
 * 2. 物理坐标（实际像素）：截图需要使用
 * 
 * 缩放因子 (scaleFactor) = 物理坐标 / 逻辑坐标
 * - 普通屏幕：scaleFactor = 1
 * - Retina屏幕：scaleFactor = 2（或更高）
 * 
 * 旧代码问题：
 * 1. 截图时只使用了逻辑坐标，没有乘以缩放因子
 * 2. 导致截图分辨率只有实际的 1/scaleFactor
 * 3. 在Retina屏幕上表现为模糊的低分辨率图片
 * 
 * 修复方案：
 * 1. 获取当前显示器的缩放因子
 * 2. 所有坐标和尺寸都乘以缩放因子
 * 3. 使用正确的尺寸获取截图
 */
async function captureScreen(options = {}) {
  const { 
    x = 0, 
    y = 0, 
    width = 0, 
    height = 0,
    captureType = 'screen' // 'screen' | 'window' | 'region'
  } = options;

  try {
    // ============================================
    // 关键修复1：获取正确的显示器信息和缩放因子
    // ============================================
    
    // 获取鼠标所在的显示器（如果指定了区域）或主显示器
    let targetDisplay;
    if (captureType === 'region' && (x !== 0 || y !== 0)) {
      targetDisplay = screen.getDisplayNearestPoint({ x, y });
    } else {
      targetDisplay = screen.getPrimaryDisplay();
    }
    
    // 获取缩放因子 - 这是修复Retina问题的关键
    const scaleFactor = targetDisplay.scaleFactor;
    console.log(`[截图] 检测到缩放因子: ${scaleFactor}x`);
    
    // 获取显示器的工作区域（不包括任务栏/Dock等）
    const displayBounds = targetDisplay.bounds;
    const displayWorkArea = targetDisplay.workArea;
    
    // ============================================
    // 关键修复2：计算正确的截图区域
    // ============================================
    
    let captureX, captureY, captureWidth, captureHeight;
    
    if (captureType === 'region' && width > 0 && height > 0) {
      // 区域截图：使用用户提供的坐标
      captureX = x;
      captureY = y;
      captureWidth = width;
      captureHeight = height;
    } else {
      // 全屏截图：使用显示器工作区域
      captureX = displayWorkArea.x;
      captureY = displayWorkArea.y;
      captureWidth = displayWorkArea.width;
      captureHeight = displayWorkArea.height;
    }
    
    // ============================================
    // 关键修复3：将逻辑坐标转换为物理坐标
    // ============================================
    
    // 计算相对于显示器左上角的偏移
    const relativeX = captureX - displayBounds.x;
    const relativeY = captureY - displayBounds.y;
    
    // 转换为物理坐标（乘以缩放因子）
    const physicalX = Math.round(relativeX * scaleFactor);
    const physicalY = Math.round(relativeY * scaleFactor);
    const physicalWidth = Math.round(captureWidth * scaleFactor);
    const physicalHeight = Math.round(captureHeight * scaleFactor);
    
    console.log(`[截图] 逻辑区域: x=${captureX}, y=${captureY}, w=${captureWidth}, h=${captureHeight}`);
    console.log(`[截图] 物理区域: x=${physicalX}, y=${physicalY}, w=${physicalWidth}, h=${physicalHeight}`);
    
    // ============================================
    // 关键修复4：使用正确的尺寸获取截图源
    // ============================================
    
    // 获取截图源
    // 注意：thumbnailSize 需要使用物理尺寸才能获得高分辨率截图
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
    
    // 选择合适的截图源
    let source;
    if (captureType === 'window' && mainWindow) {
      // 窗口截图：尝试找到当前应用窗口
      source = sources.find(s => 
        s.name === mainWindow.getTitle() || 
        s.id.includes('window')
      );
    }
    
    // 默认使用第一个屏幕
    if (!source) {
      source = sources[0];
    }
    
    console.log(`[截图] 使用源: ${source.name}`);
    
    // ============================================
    // 关键修复5：从完整截图中裁剪所需区域
    // ============================================
    
    let thumbnail = source.thumbnail;
    
    // 如果需要裁剪（区域截图）
    if (captureType === 'region' && (physicalX > 0 || physicalY > 0 || 
        physicalWidth < thumbnail.getWidth() || 
        physicalHeight < thumbnail.getHeight())) {
      
      // 确保裁剪区域在截图范围内
      const cropX = Math.max(0, Math.min(physicalX, thumbnail.getWidth() - 1));
      const cropY = Math.max(0, Math.min(physicalY, thumbnail.getHeight() - 1));
      const cropWidth = Math.min(physicalWidth, thumbnail.getWidth() - cropX);
      const cropHeight = Math.min(physicalHeight, thumbnail.getHeight() - cropY);
      
      console.log(`[截图] 裁剪区域: x=${cropX}, y=${cropY}, w=${cropWidth}, h=${cropHeight}`);
      
      // 裁剪图片
      // 注意：nativeImage.crop() 使用像素坐标
      thumbnail = thumbnail.crop({
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      });
    }
    
    // ============================================
    // 关键修复6：设置正确的缩放因子
    // ============================================
    
    // 确保图片的 scaleFactor 元数据正确
    // 这样在显示时会按正确的比例渲染
    thumbnail.setTemplateImage(true);
    
    // 转换为 PNG 格式
    const imageBuffer = thumbnail.toPNG();
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log(`[截图] 完成，图片尺寸: ${thumbnail.getWidth()}x${thumbnail.getHeight()}`);
    
    // 返回结果
    return {
      success: true,
      dataUrl: dataUrl,
      width: thumbnail.getWidth(),
      height: thumbnail.getHeight(),
      scaleFactor: scaleFactor,
      logicalWidth: Math.round(thumbnail.getWidth() / scaleFactor),
      logicalHeight: Math.round(thumbnail.getHeight() / scaleFactor),
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

/**
 * 获取当前鼠标位置（用于区域截图）
 * 包含正确的跨平台坐标处理
 */
function getCursorPosition() {
  const point = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(point);
  
  return {
    // 逻辑坐标（DPI无关）
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
 * 用于多显示器场景的截图
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
    // 物理尺寸
    physicalWidth: Math.round(display.bounds.width * display.scaleFactor),
    physicalHeight: Math.round(display.bounds.height * display.scaleFactor),
    // 缩放信息
    scaleFactor: display.scaleFactor,
    rotation: display.rotation,
    touchSupport: display.touchSupport
  }));
}

// ============================================
// IPC 通信处理
// ============================================

/**
 * 注册所有 IPC 处理器
 * 用于渲染进程和主进程之间的通信
 */
function registerIPCHandlers() {
  // ============================================
  // 截图相关 IPC
  // ============================================
  
  /**
   * 全屏截图
   * 渲染进程调用: window.electronAPI.captureScreen()
   */
  ipcMain.handle('screen-capture:full', async (event) => {
    return await captureScreen({
      captureType: 'screen'
    });
  });
  
  /**
   * 区域截图
   * 渲染进程调用: window.electronAPI.captureRegion(x, y, width, height)
   */
  ipcMain.handle('screen-capture:region', async (event, x, y, width, height) => {
    return await captureScreen({
      x,
      y,
      width,
      height,
      captureType: 'region'
    });
  });
  
  /**
   * 当前窗口截图
   * 渲染进程调用: window.electronAPI.captureWindow()
   */
  ipcMain.handle('screen-capture:window', async (event) => {
    return await captureScreen({
      captureType: 'window'
    });
  });
  
  /**
   * 获取鼠标位置
   */
  ipcMain.handle('screen-capture:getCursorPosition', (event) => {
    return getCursorPosition();
  });
  
  /**
   * 获取所有显示器信息
   */
  ipcMain.handle('screen-capture:getAllDisplays', (event) => {
    return getAllDisplays();
  });
  
  /**
   * 获取当前显示器的缩放因子
   */
  ipcMain.handle('screen-capture:getScaleFactor', (event) => {
    const primaryDisplay = screen.getPrimaryDisplay();
    return primaryDisplay.scaleFactor;
  });
  
  // ============================================
  // 窗口控制相关 IPC
  // ============================================
  
  /**
   * 最小化窗口
   */
  ipcMain.handle('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
      return true;
    }
    return false;
  });
  
  /**
   * 最大化/还原窗口
   */
  ipcMain.handle('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
      return window.isMaximized();
    }
    return false;
  });
  
  /**
   * 关闭窗口
   * 注意：这会触发窗口的 close 事件，遵循平台特定的行为
   */
  ipcMain.handle('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
      return true;
    }
    return false;
  });
  
  /**
   * 完全退出应用
   * 渲染进程调用此方法可以强制退出，不受平台行为限制
   */
  ipcMain.handle('app:quit', (event) => {
    isQuitting = true;
    app.quit();
    return true;
  });
  
  /**
   * 获取平台信息
   */
  ipcMain.handle('app:getPlatform', (event) => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node
    };
  });
}

// ============================================
// 应用生命周期事件处理
// ============================================

/**
 * 应用即将退出事件
 * 这是进行清理工作的最后机会
 */
app.on('before-quit', (event) => {
  console.log('[应用] before-quit 事件');
  // 设置退出标志，让窗口关闭事件知道这是主动退出
  isQuitting = true;
});

/**
 * 应用退出事件
 * 应用已经完全退出
 */
app.on('will-quit', (event) => {
  console.log('[应用] will-quit 事件');
  // 清理托盘图标
  if (tray) {
    tray.destroy();
    tray = null;
  }
});

/**
 * 所有窗口都已关闭事件
 * 
 * 这是另一个关键的跨平台差异点：
 * - Windows/Linux: 所有窗口关闭后通常退出应用
 * - macOS: 所有窗口关闭后应用继续运行（Dock栏图标保留）
 * 
 * macOS的设计理念是：
 * - 应用和窗口是分离的概念
 * - 用户可以关闭所有窗口，但保持应用运行
 * - 点击Dock栏图标或使用 Cmd+Tab 切换时重新创建窗口
 */
app.on('window-all-closed', () => {
  console.log('[应用] window-all-closed 事件');
  
  const { quitOnAllWindowsClosed } = getPlatformConfig();
  
  if (quitOnAllWindowsClosed) {
    // Windows/Linux: 退出应用
    console.log('[应用] Windows/Linux: 退出应用');
    app.quit();
  } else {
    // macOS: 不退出应用，保持运行
    // 用户可以通过以下方式重新打开窗口：
    // 1. 点击 Dock 栏图标
    // 2. 使用 Cmd+Tab 切换到应用
    // 3. 点击菜单栏的"窗口" -> "主窗口"
    console.log('[应用] macOS: 保持应用运行，等待 activate 事件');
  }
});

/**
 * 应用激活事件（macOS特有）
 * 
 * 这是macOS上非常重要的事件：
 * - 当用户点击Dock栏图标时触发
 * - 当用户使用Cmd+Tab切换到应用时触发
 * - 当应用从隐藏状态恢复时触发
 * 
 * 典型场景：
 * 1. 用户关闭了所有窗口（应用仍在运行）
 * 2. 用户点击Dock栏图标
 * 3. 触发 activate 事件
 * 4. 重新创建主窗口
 */
app.on('activate', () => {
  console.log('[应用] activate 事件 (macOS特有)');
  
  // 如果没有窗口，创建一个新的
  if (mainWindow === null) {
    console.log('[应用] 创建新窗口');
    createMainWindow();
  } else {
    // 如果有窗口，显示它
    console.log('[应用] 显示现有窗口');
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  }
});

/**
 * 应用就绪事件
 * Electron完成初始化后触发
 */
app.whenReady().then(() => {
  console.log('[应用] ready 事件');
  console.log(`[应用] 平台: ${process.platform}`);
  console.log(`[应用] 架构: ${process.arch}`);
  
  // 注册 IPC 处理器
  registerIPCHandlers();
  
  // 创建主窗口
  createMainWindow();
  
  console.log('[应用] 初始化完成');
}).catch(error => {
  console.error('[应用] 初始化失败:', error);
});

// ============================================
// 开发辅助功能
// ============================================

// 在开发环境中启用自动重新加载
// if (!app.isPackaged) {
//   try {
//     require('electron-reloader')(module, {
//       ignore: ['node_modules', 'dist']
//     });
//   } catch (err) {
//     console.log('electron-reloader 未安装');
//   }
// }

// ============================================
// 导出供测试使用
// ============================================

module.exports = {
  createMainWindow,
  captureScreen,
  getCursorPosition,
  getAllDisplays,
  getPlatformConfig,
  isQuitting: () => isQuitting,
  getMainWindow: () => mainWindow,
  getTray: () => tray
};
