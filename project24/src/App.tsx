import { useState, useCallback, useMemo } from 'react';
import { CodeInput, VirtualDiffView } from './components';
import {
  computeDiff,
  collapseUnchangedRegions,
  expandAllLines,
  DiffLine,
  ViewMode,
  DiffResult
} from './utils/diffEngine';
import { exportToHtml, downloadHtml } from './utils/htmlExport';

const DEFAULT_LEFT_CODE = `function helloWorld() {
  console.log("Hello, World!");
  return 42;
}

function calculate(a, b) {
  return a + b;
}

function main() {
  let x = 10;
  let y = 20;
  console.log("Result:", calculate(x, y));
}`;

const DEFAULT_RIGHT_CODE = `function helloWorld() {
  console.log("Hello, Trae!");
  return 42;
}

function calculate(a, b, c = 0) {
  return a + b + c;
}

function subtract(a, b) {
  return a - b;
}

function main() {
  let x = 10;
  let y = 20;
  console.log("Result:", calculate(x, y));
  console.log("Subtract:", subtract(x, y));
}`;

export default function App() {
  const [leftCode, setLeftCode] = useState<string>(DEFAULT_LEFT_CODE);
  const [rightCode, setRightCode] = useState<string>(DEFAULT_RIGHT_CODE);
  const [leftFileName, setLeftFileName] = useState<string>('');
  const [rightFileName, setRightFileName] = useState<string>('');
  
  const [viewMode, setViewMode] = useState<ViewMode>('unified');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [collapseUnchanged, setCollapseUnchanged] = useState<boolean>(true);
  
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [displayLines, setDisplayLines] = useState<DiffLine[]>([]);
  const [hasCompared, setHasCompared] = useState<boolean>(false);

  const handleLeftFileUpload = useCallback((content: string, filename: string) => {
    setLeftCode(content);
    setLeftFileName(filename);
  }, []);

  const handleRightFileUpload = useCallback((content: string, filename: string) => {
    setRightCode(content);
    setRightFileName(filename);
  }, []);

  const performCompare = useCallback(() => {
    const result = computeDiff(leftCode, rightCode, ignoreWhitespace);
    setDiffResult(result);
    
    let lines = result.lines;
    if (collapseUnchanged) {
      lines = collapseUnchangedRegions(lines, 5);
    }
    setDisplayLines(lines);
    setHasCompared(true);
  }, [leftCode, rightCode, ignoreWhitespace, collapseUnchanged]);

  const handleExpandCollapsed = useCallback((_index: number) => {
    if (!diffResult) return;
    
    const expandedLines = expandAllLines(displayLines, diffResult.lines);
    setDisplayLines(expandedLines);
    setCollapseUnchanged(false);
  }, [diffResult, displayLines]);

  const handleExportHtml = useCallback(() => {
    if (!diffResult) return;
    
    const html = exportToHtml(
      displayLines,
      viewMode,
      diffResult.stats,
      leftFileName || '左侧代码',
      rightFileName || '右侧代码'
    );
    downloadHtml(html, `diff-result-${Date.now()}.html`);
  }, [diffResult, displayLines, viewMode, leftFileName, rightFileName]);

  const stats = useMemo(() => {
    if (!diffResult) return { added: 0, removed: 0, modified: 0 };
    return diffResult.stats;
  }, [diffResult]);

  const canCompare = leftCode.trim().length > 0 || rightCode.trim().length > 0;
  const canExport = hasCompared && diffResult !== null;

  return (
    <div className="container">
      <div className="header">
        <h1>代码差异对比工具</h1>
        <p>支持两段代码对比、文件上传、虚拟滚动、差异高亮和HTML导出</p>
      </div>

      <div className="input-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <CodeInput
          label="原始代码 (左侧)"
          value={leftCode}
          onChange={setLeftCode}
          onFileUpload={handleLeftFileUpload}
          filename={leftFileName}
          placeholder="输入原始代码或上传文件..."
        />
        <CodeInput
          label="修改后代码 (右侧)"
          value={rightCode}
          onChange={setRightCode}
          onFileUpload={handleRightFileUpload}
          filename={rightFileName}
          placeholder="输入修改后代码或上传文件..."
        />
      </div>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="viewMode">对比模式:</label>
          <select
            id="viewMode"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
          >
            <option value="unified">上下对比</option>
            <option value="side-by-side">并排对比</option>
          </select>
        </div>

        <div className="control-group">
          <input
            type="checkbox"
            id="ignoreWhitespace"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
          />
          <label htmlFor="ignoreWhitespace">忽略空白字符</label>
        </div>

        <div className="control-group">
          <input
            type="checkbox"
            id="collapseUnchanged"
            checked={collapseUnchanged}
            onChange={(e) => setCollapseUnchanged(e.target.checked)}
          />
          <label htmlFor="collapseUnchanged">折叠未改变区域 (仅显示差异周围5行)</label>
        </div>

        <div className="control-group" style={{ marginLeft: 'auto' }}>
          <button
            className="button"
            onClick={performCompare}
            disabled={!canCompare}
          >
            开始对比
          </button>
        </div>

        {canExport && (
          <div className="control-group">
            <button
              className="button secondary"
              onClick={handleExportHtml}
            >
              导出HTML
            </button>
          </div>
        )}
      </div>

      {hasCompared && diffResult && (
        <>
          <div className="diff-header">
            <h3>对比结果</h3>
            <div className="diff-stats">
              <span className="added-stats">+ 新增 {stats.added} 行</span>
              <span className="removed-stats">- 删除 {stats.removed} 行</span>
              <span className="modified-stats">~ 修改 {stats.modified} 行</span>
            </div>
          </div>

          <VirtualDiffView
            lines={displayLines}
            viewMode={viewMode}
            onExpandCollapsed={handleExpandCollapsed}
            height={600}
          />
        </>
      )}

      {!hasCompared && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#586069' }}>
          <h3>点击「开始对比」按钮查看差异</h3>
          <p style={{ marginTop: '12px', fontSize: '14px' }}>
            您可以直接输入代码，或者拖拽/上传文件进行对比
          </p>
        </div>
      )}
    </div>
  );
}
