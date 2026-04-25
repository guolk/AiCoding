/**
 * 预加载脚本 (Preload Script)
 * 
 * 作用：
 * 1. 在渲染进程（网页）和主进程之间建立安全的通信桥接
 * 2. 暴露有限的 API 给渲染进程，而不是完全的 Node.js 环境
 * 3. 遵循 Electron 的安全最佳实践
 * 
 * 安全背景：
 * - 从 Electron 14 开始，contextIsolation 默认启用
 * - 从 Electron 12 开始，nodeIntegration 默认禁用
 * - 这意味着渲染进程无法直接访问 Node.js API
 * - 必须通过 contextBridge 来暴露有限的功能
 */

const { contextBridge, ipcRenderer } = require('electron');

// ============================================
// 安全 API 暴露
// ============================================

/**
 * 通过 contextBridge 暴露 API 给渲染进程
 * 
 * 注意事项：
 * 1. 只暴露必要的最小功能
 * 2. 不要直接暴露 ipcRenderer.send/on/invoke
 * 3. 使用具体的方法名，避免通用的 send 方法
 * 4. 对参数进行验证（在实际项目中）
 */

contextBridge.exposeInMainWorld('electronAPI', {
  // ============================================
  // 截图相关 API
  // ============================================
  
  /**
   * 全屏截图
   * @returns {Promise<Object>} 截图结果
   */
  captureScreen: () => ipcRenderer.invoke('screen-capture:full'),
  
  /**
   * 区域截图
   * @param {number} x - 区域左上角 X 坐标（逻辑坐标）
   * @param {number} y - 区域左上角 Y 坐标（逻辑坐标）
   * @param {number} width - 区域宽度（逻辑单位）
   * @param {number} height - 区域高度（逻辑单位）
   * @returns {Promise<Object>} 截图结果
   */
  captureRegion: (x, y, width, height) => 
    ipcRenderer.invoke('screen-capture:region', x, y, width, height),
  
  /**
   * 窗口截图
   * @returns {Promise<Object>} 截图结果
   */
  captureWindow: () => ipcRenderer.invoke('screen-capture:window'),
  
  /**
   * 获取鼠标位置
   * @returns {Promise<Object>} 包含逻辑坐标和物理坐标的对象
   */
  getCursorPosition: () => ipcRenderer.invoke('screen-capture:getCursorPosition'),
  
  /**
   * 获取所有显示器信息
   * @returns {Promise<Array>} 显示器信息数组
   */
  getAllDisplays: () => ipcRenderer.invoke('screen-capture:getAllDisplays'),
  
  /**
   * 获取当前显示器的缩放因子
   * @returns {Promise<number>} 缩放因子（1 表示普通屏幕，2 表示 Retina）
   */
  getScaleFactor: () => ipcRenderer.invoke('screen-capture:getScaleFactor'),
  
  // ============================================
  // 窗口控制相关 API
  // ============================================
  
  /**
   * 最小化窗口
   * @returns {Promise<boolean>} 是否成功
   */
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  
  /**
   * 最大化/还原窗口
   * @returns {Promise<boolean>} 当前是否最大化
   */
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  
  /**
   * 关闭窗口
   * 注意：这会遵循平台特定的行为
   * - macOS: 隐藏窗口而非退出应用
   * - Windows: 关闭窗口并退出应用
   * @returns {Promise<boolean>} 是否成功
   */
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // ============================================
  // 应用控制相关 API
  // ============================================
  
  /**
   * 完全退出应用
   * 这会强制退出，忽略平台特定的窗口行为
   * @returns {Promise<boolean>}
   */
  quitApp: () => ipcRenderer.invoke('app:quit'),
  
  /**
   * 获取平台信息
   * @returns {Promise<Object>} 包含 platform, arch, version 等信息
   */
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  
  // ============================================
  // 事件监听相关
  // ============================================
  
  /**
   * 监听来自主进程的消息
   * @param {string} channel - 消息通道
   * @param {Function} callback - 回调函数
   */
  on: (channel, callback) => {
    // 只允许特定的通道，增加安全性
    const allowedChannels = [
      'menu-action',
      'window-state-changed',
      'notification'
    ];
    
    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  
  /**
   * 移除事件监听器
   * @param {string} channel - 消息通道
   * @param {Function} callback - 回调函数
   */
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});

// ============================================
// 类型声明（用于 IDE 提示）
// ============================================

/**
 * @typedef {Object} CaptureResult
 * @property {boolean} success - 是否成功
 * @property {string} [dataUrl] - 图片 Data URL（base64 编码）
 * @property {number} [width] - 图片宽度（物理像素）
 * @property {number} [height] - 图片高度（物理像素）
 * @property {number} [scaleFactor] - 使用的缩放因子
 * @property {number} [logicalWidth] - 逻辑宽度
 * @property {number} [logicalHeight] - 逻辑高度
 * @property {Buffer} [buffer] - 原始图片 Buffer
 * @property {string} [error] - 错误信息（如果失败）
 */

/**
 * @typedef {Object} CursorPosition
 * @property {number} logicalX - 逻辑坐标 X
 * @property {number} logicalY - 逻辑坐标 Y
 * @property {number} physicalX - 物理坐标 X
 * @property {number} physicalY - 物理坐标 Y
 * @property {number} scaleFactor - 缩放因子
 * @property {Object} displayBounds - 显示器边界
 */

/**
 * @typedef {Object} PlatformInfo
 * @property {string} platform - 操作系统平台 (darwin/win32/linux)
 * @property {string} arch - 架构 (x64/arm64/ia32)
 * @property {string} version - Node.js 版本
 * @property {string} electronVersion - Electron 版本
 * @property {string} chromeVersion - Chrome 版本
 * @property {string} nodeVersion - Node.js 版本
 */

console.log('[Preload] 预加载脚本已加载');
console.log('[Preload] 安全 API 已通过 contextBridge 暴露');
