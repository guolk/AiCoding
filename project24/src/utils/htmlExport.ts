import { DiffLine, CharDiff, ViewMode } from './diffEngine';

function renderCharDiff(chars: CharDiff[]): string {
  return chars.map(char => {
    if (char.added) {
      return `<span class="char-added">${escapeHtml(char.value)}</span>`;
    } else if (char.removed) {
      return `<span class="char-removed">${escapeHtml(char.value)}</span>`;
    }
    return escapeHtml(char.value);
  }).join('');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getLineClass(type: string): string {
  switch (type) {
    case 'added': return 'line-added';
    case 'removed': return 'line-removed';
    case 'modified': return 'line-modified';
    default: return 'line-unchanged';
  }
}

function getLineSymbol(type: string): string {
  switch (type) {
    case 'added': return '+';
    case 'removed': return '-';
    case 'modified': return '~';
    default: return ' ';
  }
}

function renderUnifiedLine(line: DiffLine): string {
  if (line.isCollapsed) {
    return `
      <tr class="collapsed-section">
        <td colspan="4">
          ... 已折叠 ${line.collapsedLines} 行未改变的代码 ...
        </td>
      </tr>
    `;
  }

  const lineClass = getLineClass(line.type);
  const symbol = getLineSymbol(line.type);

  if (line.type === 'added') {
    return `
      <tr class="${lineClass}">
        <td class="line-number"></td>
        <td class="line-number">${line.rightLineNumber}</td>
        <td class="line-type">${symbol}</td>
        <td class="line-content">
          ${line.charDiffsRight ? renderCharDiff(line.charDiffsRight) : escapeHtml(line.rightContent || '')}
        </td>
      </tr>
    `;
  }

  if (line.type === 'removed') {
    return `
      <tr class="${lineClass}">
        <td class="line-number">${line.leftLineNumber}</td>
        <td class="line-number"></td>
        <td class="line-type">${symbol}</td>
        <td class="line-content">
          ${line.charDiffsLeft ? renderCharDiff(line.charDiffsLeft) : escapeHtml(line.leftContent || '')}
        </td>
      </tr>
    `;
  }

  if (line.type === 'modified') {
    return `
      <tr class="line-removed">
        <td class="line-number">${line.leftLineNumber}</td>
        <td class="line-number"></td>
        <td class="line-type">-</td>
        <td class="line-content">
          ${line.charDiffsLeft ? renderCharDiff(line.charDiffsLeft) : escapeHtml(line.leftContent || '')}
        </td>
      </tr>
      <tr class="line-added">
        <td class="line-number"></td>
        <td class="line-number">${line.rightLineNumber}</td>
        <td class="line-type">+</td>
        <td class="line-content">
          ${line.charDiffsRight ? renderCharDiff(line.charDiffsRight) : escapeHtml(line.rightContent || '')}
        </td>
      </tr>
    `;
  }

  return `
    <tr class="${lineClass}">
      <td class="line-number">${line.leftLineNumber}</td>
      <td class="line-number">${line.rightLineNumber}</td>
      <td class="line-type">${symbol}</td>
      <td class="line-content">
        ${escapeHtml(line.leftContent || '')}
      </td>
    </tr>
  `;
}

function renderSideBySideLine(line: DiffLine): string {
  if (line.isCollapsed) {
    return `
      <tr class="collapsed-section">
        <td colspan="6">
          ... 已折叠 ${line.collapsedLines} 行未改变的代码 ...
        </td>
      </tr>
    `;
  }

  const lineClass = getLineClass(line.type);

  if (line.type === 'added') {
    return `
      <tr class="${lineClass}">
        <td class="line-number"></td>
        <td class="line-type"></td>
        <td class="line-content empty-line"></td>
        <td class="line-number">${line.rightLineNumber}</td>
        <td class="line-type">+</td>
        <td class="line-content">
          ${line.charDiffsRight ? renderCharDiff(line.charDiffsRight) : escapeHtml(line.rightContent || '')}
        </td>
      </tr>
    `;
  }

  if (line.type === 'removed') {
    return `
      <tr class="${lineClass}">
        <td class="line-number">${line.leftLineNumber}</td>
        <td class="line-type">-</td>
        <td class="line-content">
          ${line.charDiffsLeft ? renderCharDiff(line.charDiffsLeft) : escapeHtml(line.leftContent || '')}
        </td>
        <td class="line-number"></td>
        <td class="line-type"></td>
        <td class="line-content empty-line"></td>
      </tr>
    `;
  }

  if (line.type === 'modified') {
    return `
      <tr class="line-modified">
        <td class="line-number">${line.leftLineNumber}</td>
        <td class="line-type">~</td>
        <td class="line-content">
          ${line.charDiffsLeft ? renderCharDiff(line.charDiffsLeft) : escapeHtml(line.leftContent || '')}
        </td>
        <td class="line-number">${line.rightLineNumber}</td>
        <td class="line-type">~</td>
        <td class="line-content">
          ${line.charDiffsRight ? renderCharDiff(line.charDiffsRight) : escapeHtml(line.rightContent || '')}
        </td>
      </tr>
    `;
  }

  return `
    <tr class="${lineClass}">
      <td class="line-number">${line.leftLineNumber}</td>
      <td class="line-type"> </td>
      <td class="line-content">
        ${escapeHtml(line.leftContent || '')}
      </td>
      <td class="line-number">${line.rightLineNumber}</td>
      <td class="line-type"> </td>
      <td class="line-content">
        ${escapeHtml(line.rightContent || '')}
      </td>
    </tr>
  `;
}

export function exportToHtml(
  lines: DiffLine[],
  viewMode: ViewMode,
  stats: { added: number; removed: number; modified: number },
  leftFileName: string = '左侧代码',
  rightFileName: string = '右侧代码'
): string {
  const isSideBySide = viewMode === 'side-by-side';
  
  const tableHeader = isSideBySide
    ? `
      <thead>
        <tr>
          <th colspan="3">${escapeHtml(leftFileName)}</th>
          <th colspan="3">${escapeHtml(rightFileName)}</th>
        </tr>
      </thead>
    `
    : `
      <thead>
        <tr>
          <th>旧行</th>
          <th>新行</th>
          <th></th>
          <th>代码</th>
        </tr>
      </thead>
    `;

  const tableBody = lines.map(line => 
    isSideBySide ? renderSideBySideLine(line) : renderUnifiedLine(line)
  ).join('');

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>代码差异对比结果</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f6f8fa;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background-color: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
      padding: 20px;
    }
    .header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e1e4e8;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #24292e;
    }
    .diff-stats {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      font-size: 14px;
    }
    .diff-stats span {
      padding: 4px 12px;
      border-radius: 3px;
      font-weight: 500;
    }
    .added-stats {
      background-color: #e6fffa;
      color: #22863a;
    }
    .removed-stats {
      background-color: #ffeef0;
      color: #b31d28;
    }
    .modified-stats {
      background-color: #dbedff;
      color: #0366d6;
    }
    .diff-container {
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      overflow: auto;
    }
    .diff-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      line-height: 1.5;
    }
    .diff-table th {
      background-color: #f6f8fa;
      padding: 8px 12px;
      text-align: left;
      font-weight: 500;
      color: #586069;
      border-bottom: 1px solid #e1e4e8;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .line-number {
      width: 50px;
      padding: 4px 8px;
      text-align: right;
      color: #6a737d;
      background-color: #fafbfc;
      border-right: 1px solid #e1e4e8;
      user-select: none;
      white-space: nowrap;
    }
    .line-type {
      width: 20px;
      padding: 4px 2px;
      text-align: center;
      color: #6a737d;
      font-weight: bold;
      background-color: #fafbfc;
      border-right: 1px solid #e1e4e8;
      user-select: none;
    }
    .line-content {
      padding: 4px 8px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .line-added { background-color: #e6fffa; }
    .line-added .line-number,
    .line-added .line-type { background-color: #cdffd8; }
    
    .line-removed { background-color: #ffeef0; }
    .line-removed .line-number,
    .line-removed .line-type { background-color: #ffdce0; }
    
    .line-modified { background-color: #dbedff; }
    .line-modified .line-number,
    .line-modified .line-type { background-color: #c8e1ff; }
    
    .line-unchanged { background-color: #fff; }
    
    .char-added {
      background-color: #acf2bd;
      padding: 1px 0;
    }
    .char-removed {
      background-color: #fdb8c0;
      padding: 1px 0;
      text-decoration: line-through;
    }
    
    .collapsed-section {
      background-color: #f6f8fa;
      text-align: center;
      padding: 8px;
      color: #586069;
      border-bottom: 1px solid #e1e4e8;
      font-size: 12px;
    }
    
    .empty-line {
      background-color: #fafbfc;
      color: #6a737d;
      font-style: italic;
    }
    
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e1e4e8;
      text-align: center;
      color: #586069;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>代码差异对比结果</h1>
      <div class="diff-stats">
        <span class="added-stats">新增: ${stats.added} 行</span>
        <span class="removed-stats">删除: ${stats.removed} 行</span>
        <span class="modified-stats">修改: ${stats.modified} 行</span>
      </div>
    </div>
    <div class="diff-container">
      <table class="diff-table">
        ${tableHeader}
        <tbody>
          ${tableBody}
        </tbody>
      </table>
    </div>
    <div class="footer">
      生成时间: ${new Date().toLocaleString('zh-CN')} | 对比模式: ${isSideBySide ? '并排对比' : '上下对比'}
    </div>
  </div>
</body>
</html>
  `.trim();

  return html;
}

export function downloadHtml(html: string, filename: string = 'diff-result.html'): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
