/**
 * 渲染进程脚本 (Renderer Process)
 * 
 * 职责：
 * 1. 处理用户界面交互
 * 2. 通过 IPC 与主进程通信
 * 3. 管理笔记数据和状态
 * 4. 处理截图功能的前端逻辑
 * 
 * 注意：
 * - 此脚本运行在浏览器环境中
 * - 通过 contextBridge 暴露的 API 与主进程通信
 * - 无法直接访问 Node.js API（除了通过暴露的 API）
 */

// ============================================
// 全局状态管理
// ============================================

/**
 * 应用状态对象
 */
const AppState = {
  // 当前选中的笔记
  currentNoteId: null,
  
  // 笔记列表
  notes: [],
  
  // 平台信息
  platform: null,
  scaleFactor: 1,
  
  // 截图相关
  lastScreenshot: null,
  
  // 自动保存定时器
  autoSaveTimer: null
};

// ============================================
// DOM 元素引用
// ============================================

const DOM = {
  // 笔记相关
  notesList: document.getElementById('notesList'),
  noteTitle: document.getElementById('noteTitle'),
  noteContent: document.getElementById('noteContent'),
  newNoteBtn: document.getElementById('newNoteBtn'),
  searchInput: document.getElementById('searchInput'),
  emptyState: document.getElementById('emptyState'),
  
  // 工具栏
  btnSave: document.getElementById('btnSave'),
  btnMinimize: document.getElementById('btnMinimize'),
  btnMaximize: document.getElementById('btnMaximize'),
  btnClose: document.getElementById('btnClose'),
  btnQuit: document.getElementById('btnQuit'),
  
  // 截图相关
  btnCaptureScreen: document.getElementById('btnCaptureScreen'),
  btnCaptureWindow: document.getElementById('btnCaptureWindow'),
  
  // 模态框
  screenshotModal: document.getElementById('screenshotModal'),
  screenshotImage: document.getElementById('screenshotImage'),
  modalTitle: document.getElementById('modalTitle'),
  modalClose: document.getElementById('modalClose'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCopyToClipboard: document.getElementById('btnCopyToClipboard'),
  btnInsertToNote: document.getElementById('btnInsertToNote'),
  
  // 截图信息
  infoResolution: document.getElementById('infoResolution'),
  infoScaleFactor: document.getElementById('infoScaleFactor'),
  infoLogicalSize: document.getElementById('infoLogicalSize'),
  
  // 状态栏
  platformInfo: document.getElementById('platformInfo'),
  scaleFactorInfo: document.getElementById('scaleFactorInfo'),
  cursorInfo: document.getElementById('cursorInfo'),
  saveStatus: document.getElementById('saveStatus'),
  saveIndicator: document.getElementById('saveIndicator')
};

// ============================================
// 工具函数
// ============================================

/**
 * 生成唯一 ID
 * @returns {string} 唯一标识符
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化时间戳
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化的时间字符串
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // 今天
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }
  
  // 本周内
  if (diff < 604800000) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  }
  
  // 更早
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

/**
 * 显示保存状态
 * @param {string} status - 状态文本
 * @param {boolean} saving - 是否正在保存
 */
function showSaveStatus(status, saving = false) {
  DOM.saveStatus.textContent = status;
  if (saving) {
    DOM.saveIndicator.classList.add('saving');
  } else {
    DOM.saveIndicator.classList.remove('saving');
  }
}

/**
 * 更新状态栏信息
 */
async function updateStatusBar() {
  try {
    // 获取平台信息
    const platformInfo = await window.electronAPI.getPlatform();
    AppState.platform = platformInfo.platform;
    AppState.scaleFactor = await window.electronAPI.getScaleFactor();
    
    // 更新显示
    const platformNames = {
      darwin: 'macOS',
      win32: 'Windows',
      linux: 'Linux'
    };
    DOM.platformInfo.textContent = `平台: ${platformNames[platformInfo.platform] || platformInfo.platform}`;
    DOM.scaleFactorInfo.textContent = `缩放: ${AppState.scaleFactor}x`;
    
    // 添加平台类名用于 CSS 样式
    document.body.classList.add(`platform-${platformInfo.platform}`);
    
    console.log(`[Status] 平台: ${platformInfo.platform}, 缩放: ${AppState.scaleFactor}x`);
  } catch (error) {
    console.error('[Status] 获取平台信息失败:', error);
    DOM.platformInfo.textContent = '平台: 未知';
    DOM.scaleFactorInfo.textContent = '缩放: 1x';
  }
}

/**
 * 持续更新鼠标位置（用于调试）
 */
async function updateCursorPosition() {
  try {
    const pos = await window.electronAPI.getCursorPosition();
    DOM.cursorInfo.textContent = `鼠标: (${pos.logicalX}, ${pos.logicalY}) / 物理: (${pos.physicalX}, ${pos.physicalY})`;
  } catch (error) {
    // 静默失败，可能是在非 Electron 环境中
  }
}

// ============================================
// 笔记管理
// ============================================

/**
 * 初始化笔记数据
 */
function initializeNotes() {
  // 从 localStorage 加载笔记
  const savedNotes = localStorage.getItem('electron-notes');
  if (savedNotes) {
    try {
      AppState.notes = JSON.parse(savedNotes);
    } catch (error) {
      console.error('[Notes] 解析笔记数据失败:', error);
      AppState.notes = [];
    }
  }
  
  // 如果没有笔记，创建示例笔记
  if (AppState.notes.length === 0) {
    AppState.notes = [
      {
        id: generateId(),
        title: '欢迎使用 Electron Notes',
        content: '这是一个跨平台的笔记应用，支持 Windows、macOS 和 Linux。\n\n主要功能：\n- 笔记的创建、编辑和删除\n- 全屏和窗口截图\n- Retina 屏幕高分辨率支持\n- 自动保存\n- 平台特定的窗口行为',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 3600000
      },
      {
        id: generateId(),
        title: '截图功能使用说明',
        content: '截图功能支持：\n\n1. 全屏截图：截取整个屏幕\n2. 窗口截图：截取当前应用窗口\n\n【重要】Retina 屏幕优化：\n- 自动检测屏幕缩放因子\n- 截图时使用物理像素尺寸\n- 保证图片清晰度\n\n缩放因子说明：\n- 普通屏幕: 1x\n- Retina 屏幕: 2x 或更高\n\n你可以在右下角状态栏看到当前的缩放因子。',
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 7200000
      }
    ];
    saveNotesToStorage();
  }
  
  renderNotesList();
}

/**
 * 保存笔记到 localStorage
 */
function saveNotesToStorage() {
  localStorage.setItem('electron-notes', JSON.stringify(AppState.notes));
}

/**
 * 渲染笔记列表
 * @param {Array} filteredNotes - 过滤后的笔记列表（可选）
 */
function renderNotesList(filteredNotes = null) {
  const notes = filteredNotes || AppState.notes;
  
  if (notes.length === 0) {
    DOM.notesList.innerHTML = `
      <div class="empty-state" style="height: auto; padding: 40px 20px;">
        <div class="empty-state-icon" style="font-size: 32px;">📭</div>
        <p style="font-size: 12px; color: var(--text-muted);">暂无笔记</p>
      </div>
    `;
    return;
  }
  
  // 按更新时间排序（最新的在前）
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  
  DOM.notesList.innerHTML = sortedNotes.map(note => `
    <div class="note-item ${note.id === AppState.currentNoteId ? 'active' : ''}" 
         data-id="${note.id}">
      <div class="note-title">${escapeHtml(note.title) || '无标题'}</div>
      <div class="note-preview">${escapeHtml(getPreviewText(note.content))}</div>
      <div class="note-meta">
        <span>${formatTime(note.updatedAt)}</span>
      </div>
    </div>
  `).join('');
  
  // 添加点击事件
  DOM.notesList.querySelectorAll('.note-item').forEach(item => {
    item.addEventListener('click', () => {
      const noteId = item.dataset.id;
      selectNote(noteId);
    });
  });
}

/**
 * 转义 HTML 特殊字符
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 获取预览文本（前50个字符）
 * @param {string} content - 笔记内容
 * @returns {string} 预览文本
 */
function getPreviewText(content) {
  if (!content) return '';
  const firstLine = content.split('\n')[0];
  return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
}

/**
 * 选择笔记
 * @param {string} noteId - 笔记 ID
 */
function selectNote(noteId) {
  const note = AppState.notes.find(n => n.id === noteId);
  if (!note) return;
  
  AppState.currentNoteId = noteId;
  
  // 更新列表高亮
  renderNotesList();
  
  // 显示编辑器
  DOM.emptyState.classList.add('hidden');
  DOM.noteContent.classList.remove('hidden');
  
  // 填充内容
  DOM.noteTitle.value = note.title;
  DOM.noteContent.value = note.content;
  
  console.log(`[Notes] 选中笔记: ${noteId}`);
}

/**
 * 创建新笔记
 */
function createNewNote() {
  const newNote = {
    id: generateId(),
    title: '',
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  AppState.notes.unshift(newNote);
  saveNotesToStorage();
  
  // 选中新笔记
  selectNote(newNote.id);
  
  // 聚焦到标题输入框
  DOM.noteTitle.focus();
  
  console.log('[Notes] 创建新笔记:', newNote.id);
}

/**
 * 保存当前笔记
 */
function saveCurrentNote() {
  if (!AppState.currentNoteId) return;
  
  const note = AppState.notes.find(n => n.id === AppState.currentNoteId);
  if (!note) return;
  
  note.title = DOM.noteTitle.value.trim();
  note.content = DOM.noteContent.value;
  note.updatedAt = Date.now();
  
  saveNotesToStorage();
  renderNotesList();
  
  showSaveStatus('已保存', false);
  console.log('[Notes] 保存笔记:', AppState.currentNoteId);
}

/**
 * 触发自动保存
 */
function triggerAutoSave() {
  showSaveStatus('保存中...', true);
  
  // 清除之前的定时器
  if (AppState.autoSaveTimer) {
    clearTimeout(AppState.autoSaveTimer);
  }
  
  // 1秒后保存
  AppState.autoSaveTimer = setTimeout(() => {
    saveCurrentNote();
  }, 1000);
}

/**
 * 搜索笔记
 * @param {string} query - 搜索关键词
 */
function searchNotes(query) {
  if (!query.trim()) {
    renderNotesList();
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  const filtered = AppState.notes.filter(note => 
    note.title.toLowerCase().includes(lowerQuery) ||
    note.content.toLowerCase().includes(lowerQuery)
  );
  
  renderNotesList(filtered);
}

// ============================================
// 截图功能
// ============================================

/**
 * 执行全屏截图
 */
async function captureScreen() {
  try {
    console.log('[Screenshot] 开始全屏截图...');
    showSaveStatus('截图中...', true);
    
    // 隐藏窗口（可选，根据需求）
    // await window.electronAPI.minimizeWindow();
    // await new Promise(resolve => setTimeout(resolve, 300));
    
    // 调用主进程截图 API
    const result = await window.electronAPI.captureScreen();
    
    // 恢复窗口
    // await new Promise(resolve => setTimeout(resolve, 100));
    // 窗口会自动处理
    
    showSaveStatus('已保存', false);
    
    if (result.success) {
      console.log('[Screenshot] 截图成功:', result.width, 'x', result.height);
      AppState.lastScreenshot = result;
      showScreenshotModal('全屏截图', result);
    } else {
      console.error('[Screenshot] 截图失败:', result.error);
      alert(`截图失败: ${result.error}`);
    }
  } catch (error) {
    console.error('[Screenshot] 截图异常:', error);
    showSaveStatus('截图失败', false);
    alert(`截图异常: ${error.message}`);
  }
}

/**
 * 执行窗口截图
 */
async function captureWindow() {
  try {
    console.log('[Screenshot] 开始窗口截图...');
    showSaveStatus('截图中...', true);
    
    const result = await window.electronAPI.captureWindow();
    
    showSaveStatus('已保存', false);
    
    if (result.success) {
      console.log('[Screenshot] 窗口截图成功:', result.width, 'x', result.height);
      AppState.lastScreenshot = result;
      showScreenshotModal('窗口截图', result);
    } else {
      console.error('[Screenshot] 窗口截图失败:', result.error);
      alert(`截图失败: ${result.error}`);
    }
  } catch (error) {
    console.error('[Screenshot] 窗口截图异常:', error);
    showSaveStatus('截图失败', false);
    alert(`截图异常: ${error.message}`);
  }
}

/**
 * 显示截图预览模态框
 * @param {string} title - 标题
 * @param {Object} result - 截图结果
 */
function showScreenshotModal(title, result) {
  DOM.modalTitle.textContent = title;
  DOM.screenshotImage.src = result.dataUrl;
  
  // 更新截图信息
  DOM.infoResolution.textContent = `${result.width} × ${result.height} px`;
  DOM.infoScaleFactor.textContent = `${result.scaleFactor}x`;
  DOM.infoLogicalSize.textContent = `${result.logicalWidth} × ${result.logicalHeight}`;
  
  // 显示模态框
  DOM.screenshotModal.classList.add('visible');
}

/**
 * 隐藏截图模态框
 */
function hideScreenshotModal() {
  DOM.screenshotModal.classList.remove('visible');
}

/**
 * 复制截图到剪贴板
 */
async function copyScreenshotToClipboard() {
  if (!AppState.lastScreenshot) return;
  
  try {
    // 创建图片元素
    const img = new Image();
    img.onload = async () => {
      try {
        // 创建 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // 转换为 Blob
        canvas.toBlob(async (blob) => {
          try {
            // 写入剪贴板
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            alert('已复制到剪贴板！');
          } catch (error) {
            console.error('[Clipboard] 复制失败:', error);
            alert('复制到剪贴板失败: ' + error.message);
          }
        }, 'image/png');
      } catch (error) {
        console.error('[Clipboard] Canvas 处理失败:', error);
      }
    };
    img.src = AppState.lastScreenshot.dataUrl;
  } catch (error) {
    console.error('[Clipboard] 复制异常:', error);
    alert('复制失败: ' + error.message);
  }
}

/**
 * 插入截图到笔记
 */
function insertScreenshotToNote() {
  if (!AppState.lastScreenshot) return;
  
  // 如果没有选中笔记，创建一个新的
  if (!AppState.currentNoteId) {
    createNewNote();
  }
  
  // 插入图片 Markdown 格式
  const markdown = `\n![截图](${AppState.lastScreenshot.dataUrl})\n`;
  
  // 插入到当前光标位置或末尾
  const textarea = DOM.noteContent;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  
  textarea.value = before + markdown + after;
  
  // 移动光标到插入位置之后
  const newPosition = start + markdown.length;
  textarea.setSelectionRange(newPosition, newPosition);
  textarea.focus();
  
  // 触发自动保存
  triggerAutoSave();
  
  // 关闭模态框
  hideScreenshotModal();
  
  console.log('[Screenshot] 已插入到笔记');
}

// ============================================
// 窗口控制
// ============================================

/**
 * 最小化窗口
 */
async function minimizeWindow() {
  try {
    await window.electronAPI.minimizeWindow();
    console.log('[Window] 最小化窗口');
  } catch (error) {
    console.error('[Window] 最小化失败:', error);
  }
}

/**
 * 最大化/还原窗口
 */
async function toggleMaximize() {
  try {
    const isMaximized = await window.electronAPI.maximizeWindow();
    console.log('[Window]', isMaximized ? '最大化' : '还原', '窗口');
  } catch (error) {
    console.error('[Window] 最大化/还原失败:', error);
  }
}

/**
 * 关闭窗口
 * 注意：这会遵循平台特定的行为
 * - macOS: 隐藏窗口而非退出应用
 * - Windows: 关闭窗口并退出应用
 */
async function closeWindow() {
  try {
    console.log('[Window] 关闭窗口（遵循平台行为）');
    await window.electronAPI.closeWindow();
  } catch (error) {
    console.error('[Window] 关闭失败:', error);
  }
}

/**
 * 完全退出应用
 * 这会强制退出，忽略平台特定的窗口行为
 */
async function quitApp() {
  try {
    // 先保存当前笔记
    if (AppState.currentNoteId) {
      saveCurrentNote();
    }
    
    console.log('[App] 完全退出应用');
    await window.electronAPI.quitApp();
  } catch (error) {
    console.error('[App] 退出失败:', error);
  }
}

// ============================================
// 事件监听
// ============================================

/**
 * 初始化事件监听
 */
function initializeEventListeners() {
  // ============================================
  // 笔记相关事件
  // ============================================
  
  // 新建笔记按钮
  DOM.newNoteBtn.addEventListener('click', createNewNote);
  
  // 搜索框
  DOM.searchInput.addEventListener('input', (e) => {
    searchNotes(e.target.value);
  });
  
  // 标题输入
  DOM.noteTitle.addEventListener('input', triggerAutoSave);
  
  // 内容输入
  DOM.noteContent.addEventListener('input', triggerAutoSave);
  
  // 保存按钮
  DOM.btnSave.addEventListener('click', saveCurrentNote);
  
  // ============================================
  // 窗口控制事件
  // ============================================
  
  DOM.btnMinimize.addEventListener('click', minimizeWindow);
  DOM.btnMaximize.addEventListener('click', toggleMaximize);
  DOM.btnClose.addEventListener('click', closeWindow);
  DOM.btnQuit.addEventListener('click', quitApp);
  
  // ============================================
  // 截图相关事件
  // ============================================
  
  DOM.btnCaptureScreen.addEventListener('click', captureScreen);
  DOM.btnCaptureWindow.addEventListener('click', captureWindow);
  
  // ============================================
  // 模态框事件
  // ============================================
  
  DOM.modalClose.addEventListener('click', hideScreenshotModal);
  DOM.btnCloseModal.addEventListener('click', hideScreenshotModal);
  
  // 点击遮罩层关闭
  DOM.screenshotModal.addEventListener('click', (e) => {
    if (e.target === DOM.screenshotModal) {
      hideScreenshotModal();
    }
  });
  
  // ESC 键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.screenshotModal.classList.contains('visible')) {
      hideScreenshotModal();
    }
  });
  
  // 复制到剪贴板
  DOM.btnCopyToClipboard.addEventListener('click', copyScreenshotToClipboard);
  
  // 插入到笔记
  DOM.btnInsertToNote.addEventListener('click', insertScreenshotToNote);
  
  // ============================================
  // 快捷键支持
  // ============================================
  
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: 新建笔记
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      createNewNote();
    }
    
    // Ctrl/Cmd + S: 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentNote();
    }
    
    // Ctrl/Cmd + W: 关闭窗口
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
      e.preventDefault();
      closeWindow();
    }
    
    // Ctrl/Cmd + Q: 退出应用
    if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
      e.preventDefault();
      quitApp();
    }
  });
  
  // ============================================
  // 周期性更新
  // ============================================
  
  // 每秒更新一次鼠标位置
  setInterval(updateCursorPosition, 1000);
  
  console.log('[Events] 事件监听已初始化');
}

// ============================================
// 应用初始化
// ============================================

/**
 * 应用入口
 */
async function initializeApp() {
  console.log('============================================');
  console.log('  Electron Notes - 渲染进程初始化');
  console.log('============================================');
  
  // 1. 初始化事件监听
  initializeEventListeners();
  
  // 2. 更新状态栏信息
  await updateStatusBar();
  
  // 3. 初始化笔记数据
  initializeNotes();
  
  // 4. 默认选中第一个笔记
  if (AppState.notes.length > 0) {
    selectNote(AppState.notes[0].id);
  }
  
  console.log('[App] 初始化完成');
  console.log('[App] 当前平台:', AppState.platform);
  console.log('[App] 缩放因子:', AppState.scaleFactor, 'x');
  console.log('[App] 笔记数量:', AppState.notes.length);
}

// 页面加载完成后启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
