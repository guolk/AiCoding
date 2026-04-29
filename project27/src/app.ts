import { FlowchartEngine, NodeType, AlignType, DistributeType, Point } from './index.js';

let engine: FlowchartEngine | null = null;

function getCanvas(): HTMLCanvasElement {
  return document.getElementById('flowchart-canvas') as HTMLCanvasElement;
}

function resizeCanvas(): void {
  const canvas = getCanvas();
  const container = canvas.parentElement;
  if (!container) return;

  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

function initEngine(): void {
  const canvas = getCanvas();
  engine = new FlowchartEngine(canvas);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  engine.setViewState(
    { x: centerX - 200, y: centerY - 200 },
    1
  );

  createSampleNodes();
  updateButtons();
  updateStatus();
}

function createSampleNodes(): void {
  if (!engine) return;

  engine.addNode(NodeType.CIRCLE, { x: 100, y: 100 }, '开始', {
    color: '#4CAF50'
  });

  engine.addNode(NodeType.RECTANGLE, { x: 100, y: 250 }, '处理数据', {
    color: '#2196F3'
  });

  engine.addNode(NodeType.DIAMOND, { x: 100, y: 400 }, '条件判断', {
    color: '#FFC107',
    size: { width: 120, height: 80 }
  });

  engine.addNode(NodeType.PARALLELOGRAM, { x: 350, y: 250 }, '输入/输出', {
    color: '#9C27B0'
  });

  engine.addNode(NodeType.CIRCLE, { x: 100, y: 550 }, '结束', {
    color: '#F44336'
  });
}

function updateButtons(): void {
  if (!engine) return;

  const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement | null;
  const redoBtn = document.getElementById('redo-btn') as HTMLButtonElement | null;

  if (undoBtn) undoBtn.disabled = !engine.canUndo();
  if (redoBtn) redoBtn.disabled = !engine.canRedo();
}

function updateStatus(): void {
  if (!engine) return;

  const viewState = engine.getViewState();
  const zoomInfo = document.getElementById('zoom-info');
  const statusInfo = document.getElementById('status-info');

  if (zoomInfo) {
    zoomInfo.textContent = `缩放: ${Math.round(viewState.scale * 100)}%`;
  }

  const selectedNodes = engine.getSelectedNodes();
  const selectedConns = engine.getSelectedConnections();

  if (statusInfo) {
    if (selectedNodes.length > 0 || selectedConns.length > 0) {
      statusInfo.textContent = `已选择 ${selectedNodes.length} 个节点, ${selectedConns.length} 条连接`;
    } else {
      statusInfo.textContent = '准备就绪 - 点击空白处取消选择';
    }
  }

  updateButtons();
}

function getCenterWorldPosition(): Point {
  const canvas = getCanvas();
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const viewState = engine!.getViewState();

  return {
    x: (centerX - viewState.offset.x) / viewState.scale,
    y: (centerY - viewState.offset.y) / viewState.scale
  };
}

function addNodeWithOffset(type: NodeType, title: string, color: string): void {
  if (!engine) return;

  const center = getCenterWorldPosition();
  const offsetX = (Math.random() - 0.5) * 100;
  const offsetY = (Math.random() - 0.5) * 100;

  engine.addNode(type, { x: center.x + offsetX, y: center.y + offsetY }, title, {
    color
  });

  updateStatus();
}

function setupEventListeners(): void {
  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    if (engine) {
      engine.destroy();
      initEngine();
    }
  });

  const container = getCanvas().parentElement;
  if (container) {
    resizeObserver.observe(container);
  }

  document.getElementById('add-rectangle')?.addEventListener('click', () => {
    addNodeWithOffset(NodeType.RECTANGLE, '矩形节点', '#2196F3');
  });

  document.getElementById('add-diamond')?.addEventListener('click', () => {
    addNodeWithOffset(NodeType.DIAMOND, '菱形节点', '#FFC107');
  });

  document.getElementById('add-circle')?.addEventListener('click', () => {
    addNodeWithOffset(NodeType.CIRCLE, '圆形节点', '#9C27B0');
  });

  document.getElementById('add-parallelogram')?.addEventListener('click', () => {
    addNodeWithOffset(NodeType.PARALLELOGRAM, '平行四边形', '#4CAF50');
  });

  document.getElementById('add-swimlane')?.addEventListener('click', () => {
    addNodeWithOffset(NodeType.SWIMLANE, '泳道', '#607D8B');
  });

  document.getElementById('undo-btn')?.addEventListener('click', () => {
    if (engine && engine.canUndo()) {
      (engine as any).undo();
      updateStatus();
    }
  });

  document.getElementById('redo-btn')?.addEventListener('click', () => {
    if (engine && engine.canRedo()) {
      (engine as any).redo();
      updateStatus();
    }
  });

  document.getElementById('align-left')?.addEventListener('click', () => {
    engine?.alignSelected(AlignType.LEFT);
    updateStatus();
  });

  document.getElementById('align-center-h')?.addEventListener('click', () => {
    engine?.alignSelected(AlignType.CENTER_HORIZONTAL);
    updateStatus();
  });

  document.getElementById('align-right')?.addEventListener('click', () => {
    engine?.alignSelected(AlignType.RIGHT);
    updateStatus();
  });

  document.getElementById('align-top')?.addEventListener('click', () => {
    engine?.alignSelected(AlignType.TOP);
    updateStatus();
  });

  document.getElementById('align-center-v')?.addEventListener('click', () => {
    engine?.alignSelected(AlignType.CENTER_VERTICAL);
    updateStatus();
  });

  document.getElementById('align-bottom')?.addEventListener('click', () => {
    engine?.alignSelected(AlignType.BOTTOM);
    updateStatus();
  });

  document.getElementById('distribute-h')?.addEventListener('click', () => {
    engine?.distributeSelected(DistributeType.HORIZONTAL);
    updateStatus();
  });

  document.getElementById('distribute-v')?.addEventListener('click', () => {
    engine?.distributeSelected(DistributeType.VERTICAL);
    updateStatus();
  });

  document.getElementById('export-json')?.addEventListener('click', () => {
    if (!engine) return;
    const json = engine.exportToJSON();
    const contentEl = document.getElementById('json-export-content') as HTMLTextAreaElement | null;
    if (contentEl) contentEl.value = json;
    document.getElementById('json-export-modal')?.classList.add('active');
  });

  document.getElementById('export-svg')?.addEventListener('click', () => {
    if (!engine) return;
    const svg = engine.exportToSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowchart-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-json')?.addEventListener('click', () => {
    const contentEl = document.getElementById('json-import-content') as HTMLTextAreaElement | null;
    if (contentEl) contentEl.value = '';
    document.getElementById('json-import-modal')?.classList.add('active');
  });

  document.getElementById('do-import')?.addEventListener('click', () => {
    if (!engine) return;
    const contentEl = document.getElementById('json-import-content') as HTMLTextAreaElement | null;
    const content = contentEl?.value || '';
    try {
      const result = engine.importFromJSON(content);
      if (result.success || result.nodes.length > 0) {
        document.getElementById('json-import-modal')?.classList.remove('active');
        updateStatus();
        if (result.errors.length > 0) {
          alert(`导入完成，但有 ${result.errors.length} 个警告:\n${result.errors.slice(0, 5).join('\n')}`);
        }
      } else {
        alert(`导入失败:\n${result.errors.join('\n')}`);
      }
    } catch (e) {
      alert(`导入出错: ${(e as Error).message}`);
    }
  });

  document.getElementById('copy-json')?.addEventListener('click', () => {
    const contentEl = document.getElementById('json-export-content') as HTMLTextAreaElement | null;
    const content = contentEl?.value || '';
    navigator.clipboard.writeText(content).then(() => {
      alert('已复制到剪贴板!');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  });

  document.getElementById('close-export-modal')?.addEventListener('click', () => {
    document.getElementById('json-export-modal')?.classList.remove('active');
  });

  document.getElementById('close-import-modal')?.addEventListener('click', () => {
    document.getElementById('json-import-modal')?.classList.remove('active');
  });

  document.getElementById('delete-selected')?.addEventListener('click', () => {
    if (engine) {
      (engine as any).deleteSelected();
      updateStatus();
    }
  });

  document.getElementById('select-all')?.addEventListener('click', () => {
    if (engine) {
      (engine as any).selectAll();
      updateStatus();
    }
  });

  document.getElementById('clear-selection')?.addEventListener('click', () => {
    if (engine) {
      (engine as any).clearSelection();
      updateStatus();
    }
  });

  document.getElementById('help-btn')?.addEventListener('click', () => {
    document.getElementById('help-modal')?.classList.add('active');
  });

  document.getElementById('close-help-modal')?.addEventListener('click', () => {
    document.getElementById('help-modal')?.classList.remove('active');
  });

  const modals = ['json-export-modal', 'json-import-modal', 'help-modal'];
  modals.forEach((modalId) => {
    document.getElementById(modalId)?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        (e.currentTarget as HTMLElement).classList.remove('active');
      }
    });
  });

  setInterval(() => {
    updateStatus();
  }, 100);
}

resizeCanvas();
setupEventListeners();
initEngine();
