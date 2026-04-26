import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as Diff from 'diff';
import { FixedSizeList as List } from 'react-window';
import { 
  FileText, 
  Upload, 
  SplitSquareVertical, 
  LayoutGrid, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  RefreshCw,
  Trash2,
  Copy
} from 'lucide-react';

// 定义Diff行类型
type DiffLineType = 'added' | 'removed' | 'modified' | 'unchanged' | 'empty' | 'folded';

interface DiffLine {
  type: DiffLineType;
  content: string;
  lineNumber: number;
  oldLineNumber?: number;
  newLineNumber?: number;
  charDiff?: { type: 'added' | 'removed' | 'unchanged'; value: string }[];
  foldedLines?: number;
  startLine?: number;
  endLine?: number;
}

// 格式化文本，处理空行
const normalizeText = (text: string): string => {
  return text.replace(/\r\n/g, '\n');
};

// 处理忽略空白字符的逻辑
const removeWhitespace = (text: string): string => {
  return text.replace(/\s+/g, '');
};

// 生成行内差异
const generateCharDiff = (oldLine: string, newLine: string) => {
  const charDiff = Diff.diffChars(oldLine, newLine);
  return charDiff;
};

// 主组件
const App: React.FC = () => {
  // 状态管理
  const [oldCode, setOldCode] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [showFolded, setShowFolded] = useState<boolean>(true);
  const [oldFileName, setOldFileName] = useState<string>('');
  const [newFileName, setNewFileName] = useState<string>('');
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [foldedRegions, setFoldedRegions] = useState<{ [key: number]: boolean }>({});
  
  const oldFileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);

  // 计算差异
  const computeDiff = useCallback(() => {
    if (!oldCode || !newCode) return;
    
    setIsComputing(true);
    
    setTimeout(() => {
      try {
        const normalizedOld = normalizeText(oldCode);
        const normalizedNew = normalizeText(newCode);
        
        // 行级比较
        const lineDiff = Diff.diffLines(normalizedOld, normalizedNew, {
          ignoreWhitespace: ignoreWhitespace
        });
        
        let oldLineNum = 1;
        let newLineNum = 1;
        const lines: DiffLine[] = [];
        
        // 首先，检查两个文本是否完全相同
        if (normalizedOld === normalizedNew) {
          // 如果完全相同，所有行都标记为unchanged
          const allLines = normalizedOld.split('\n');
          // 处理末尾空行的情况
          if (allLines.length > 0 && allLines[allLines.length - 1] === '') {
            allLines.pop();
          }
          
          allLines.forEach((line) => {
            lines.push({
              type: 'unchanged',
              content: line,
              lineNumber: oldLineNum,
              oldLineNumber: oldLineNum,
              newLineNumber: newLineNum
            });
            oldLineNum++;
            newLineNum++;
          });
          
          setDiffResult(lines);
          setFoldedRegions({});
          setIsComputing(false);
          return;
        }
        
        // 如果不完全相同，则进行详细的diff处理
        for (let i = 0; i < lineDiff.length; i++) {
          const part = lineDiff[i];
          const partLines = part.value.split('\n');
          
          // 移除最后一个空字符串（如果有），但要注意空行的情况
          // 只有当原始文本以换行符结尾时，split才会产生末尾空字符串
          if (partLines.length > 0 && partLines[partLines.length - 1] === '' && part.value.endsWith('\n')) {
            partLines.pop();
          }
          
          // 检查是否是修改的情况（前一个是removed，当前是added）
          const isModified = part.added && i > 0 && lineDiff[i - 1].removed;
          
          if (isModified) {
            // 处理修改的情况
            const removedPart = lineDiff[i - 1];
            const removedLines = removedPart.value.split('\n');
            if (removedLines.length > 0 && removedLines[removedLines.length - 1] === '' && removedPart.value.endsWith('\n')) {
              removedLines.pop();
            }
            
            // 找到前面添加的removed行并替换为modified
            // 计算需要替换的行数
            const minLines = Math.min(removedLines.length, partLines.length);
            const maxLines = Math.max(removedLines.length, partLines.length);
            
            // 移除之前添加的removed行
            const removedCount = removedLines.length;
            lines.splice(lines.length - removedCount, removedCount);
            oldLineNum -= removedCount;
            
            // 处理对应的行
            for (let j = 0; j < maxLines; j++) {
              const oldLine = removedLines[j] || '';
              const newLine = partLines[j] || '';
              
              if (j < minLines) {
                // 两行都存在，标记为modified
                const charDiff = generateCharDiff(oldLine, newLine);
                
                // 添加旧版本的modified行
                lines.push({
                  type: 'modified',
                  content: oldLine,
                  lineNumber: oldLineNum,
                  oldLineNumber: oldLineNum,
                  charDiff: charDiff.filter(c => !c.added)
                });
                
                // 添加新版本的modified行
                lines.push({
                  type: 'modified',
                  content: newLine,
                  lineNumber: newLineNum,
                  newLineNumber: newLineNum,
                  charDiff: charDiff.filter(c => !c.removed)
                });
                
                oldLineNum++;
                newLineNum++;
              } else if (j < removedLines.length) {
                // 只有旧行，标记为removed
                lines.push({
                  type: 'removed',
                  content: oldLine,
                  lineNumber: oldLineNum,
                  oldLineNumber: oldLineNum
                });
                oldLineNum++;
              } else {
                // 只有新行，标记为added
                lines.push({
                  type: 'added',
                  content: newLine,
                  lineNumber: newLineNum,
                  newLineNumber: newLineNum
                });
                newLineNum++;
              }
            }
          } else if (part.removed) {
            // 检查是否下一个是added，如果是则暂时添加为removed，后面会处理
            const nextPart = lineDiff[i + 1];
            const willBeModified = nextPart && nextPart.added;
            
            // 暂时添加为removed，如果是modified会在后面替换
            partLines.forEach((line) => {
              lines.push({
                type: willBeModified ? 'removed' : 'removed',
                content: line,
                lineNumber: oldLineNum,
                oldLineNumber: oldLineNum
              });
              oldLineNum++;
            });
          } else if (part.added) {
            // 检查是否前一个是removed，如果是则已经在上面处理过了
            const prevPart = lineDiff[i - 1];
            const wasModified = prevPart && prevPart.removed;
            
            if (!wasModified) {
              // 只有当前是纯added，不是modified的一部分
              partLines.forEach((line) => {
                lines.push({
                  type: 'added',
                  content: line,
                  lineNumber: newLineNum,
                  newLineNumber: newLineNum
                });
                newLineNum++;
              });
            }
          } else {
            // 未修改的行
            partLines.forEach((line) => {
              lines.push({
                type: 'unchanged',
                content: line,
                lineNumber: oldLineNum,
                oldLineNumber: oldLineNum,
                newLineNumber: newLineNum
              });
              oldLineNum++;
              newLineNum++;
            });
          }
        }
        
        setDiffResult(lines);
        setFoldedRegions({});
      } catch (error) {
        console.error('计算差异时出错:', error);
      } finally {
        setIsComputing(false);
      }
    }, 100);
  }, [oldCode, newCode, ignoreWhitespace]);

  // 处理折叠逻辑
  const processFoldedLines = useCallback((lines: DiffLine[]): DiffLine[] => {
    if (!showFolded) return lines;
    
    const result: DiffLine[] = [];
    let unchangedBlock: DiffLine[] = [];
    let foldedRegionId = 0;
    
    lines.forEach((line, index) => {
      if (line.type === 'unchanged') {
        unchangedBlock.push(line);
      } else {
        // 处理前面的未修改块
        if (unchangedBlock.length > 0) {
          if (unchangedBlock.length <= 10) {
            // 如果未修改的行少于等于10行，直接显示
            result.push(...unchangedBlock);
          } else {
            // 显示前5行
            result.push(...unchangedBlock.slice(0, 5));
            
            // 添加折叠行
            const foldedRegionIdCopy = foldedRegionId;
            result.push({
              type: 'folded',
              content: '',
              lineNumber: -1,
              foldedLines: unchangedBlock.length - 10,
              startLine: unchangedBlock[5].lineNumber,
              endLine: unchangedBlock[unchangedBlock.length - 6].lineNumber
            });
            setFoldedRegions(prev => ({ ...prev, [foldedRegionId]: true }));
            foldedRegionId++;
            
            // 显示后5行
            result.push(...unchangedBlock.slice(unchangedBlock.length - 5));
          }
          unchangedBlock = [];
        }
        
        // 添加当前的修改行
        result.push(line);
      }
    });
    
    // 处理最后可能的未修改块
    if (unchangedBlock.length > 0) {
      if (unchangedBlock.length <= 10) {
        result.push(...unchangedBlock);
      } else {
        result.push(...unchangedBlock.slice(0, 5));
        const foldedRegionIdCopy = foldedRegionId;
        result.push({
          type: 'folded',
          content: '',
          lineNumber: -1,
          foldedLines: unchangedBlock.length - 10,
          startLine: unchangedBlock[5].lineNumber,
          endLine: unchangedBlock[unchangedBlock.length - 6].lineNumber
        });
        setFoldedRegions(prev => ({ ...prev, [foldedRegionId]: true }));
        foldedRegionId++;
        result.push(...unchangedBlock.slice(unchangedBlock.length - 5));
      }
    }
    
    return result;
  }, [showFolded]);

  // 处理文件上传
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setCode: React.Dispatch<React.SetStateAction<string>>,
    setFileName: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  // 导出为HTML
  const exportToHTML = () => {
    const htmlContent = generateHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff-result.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 生成HTML内容
  const generateHTML = () => {
    const lines = processFoldedLines(diffResult);
    
    let linesHTML = '';
    lines.forEach((line, index) => {
      const bgColor = line.type === 'added' ? '#e6fffa' : 
                     line.type === 'removed' ? '#ffeef0' : 
                     line.type === 'modified' ? '#fffbe6' : 
                     line.type === 'folded' ? '#f6f8fa' : '#fff';
      
      const linePrefix = line.type === 'added' ? '+' : 
                        line.type === 'removed' ? '-' : 
                        line.type === 'modified' ? '~' : ' ';
      
      if (line.type === 'folded') {
        linesHTML += `
          <div style="display: flex; background-color: #f6f8fa; padding: 4px 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 12px; line-height: 1.5;">
            <div style="width: 80px; text-align: right; padding-right: 8px; color: #6a737d; background-color: #f6f8fa; user-select: none;"></div>
            <div style="width: 80px; text-align: right; padding-right: 8px; color: #6a737d; background-color: #f6f8fa; user-select: none;"></div>
            <div style="width: 20px; text-align: center; color: #6a737d; background-color: #f6f8fa; user-select: none;">...</div>
            <div style="flex: 1; padding-left: 8px; color: #6a737d;">
              ${line.foldedLines} 行未显示 (从行 ${line.startLine} 到 ${line.endLine})
            </div>
          </div>
        `;
      } else {
        let contentHTML = '';
        if (line.charDiff && line.charDiff.length > 0) {
          line.charDiff.forEach((char) => {
            const bgColor = char.type === 'added' ? '#a6f3c6' : 
                           char.type === 'removed' ? '#fdb8c0' : 'transparent';
            contentHTML += `<span style="background-color: ${bgColor};">${escapeHTML(char.value)}</span>`;
          });
        } else {
          contentHTML = escapeHTML(line.content);
        }
        
        linesHTML += `
          <div style="display: flex; background-color: ${bgColor}; padding: 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 12px; line-height: 1.5;">
            <div style="width: 80px; text-align: right; padding-right: 8px; color: #6a737d; background-color: ${bgColor}; user-select: none;">
              ${line.oldLineNumber || ''}
            </div>
            <div style="width: 80px; text-align: right; padding-right: 8px; color: #6a737d; background-color: ${bgColor}; user-select: none;">
              ${line.newLineNumber || ''}
            </div>
            <div style="width: 20px; text-align: center; color: #6a737d; background-color: ${bgColor}; user-select: none;">
              ${linePrefix}
            </div>
            <div style="flex: 1; padding-left: 8px; white-space: pre-wrap; word-break: break-all;">
              ${contentHTML || '&nbsp;'}
            </div>
          </div>
        `;
      }
    });
    
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>代码差异对比结果</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; margin: 20px; }
          .container { max-width: 1200px; margin: 0 auto; }
          h1 { color: #24292e; border-bottom: 1px solid #e1e4e8; padding-bottom: 10px; }
          .info { margin-bottom: 20px; color: #586069; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>代码差异对比结果</h1>
          <div class="info">
            <p>原文件: ${oldFileName || '未命名'} | 新文件: ${newFileName || '未命名'}</p>
            <p>生成时间: ${new Date().toLocaleString()}</p>
          </div>
          <div class="diff-container">
            ${linesHTML}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // HTML转义函数
  const escapeHTML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // 处理折叠/展开
  const toggleFold = (regionId: number) => {
    setFoldedRegions(prev => ({
      ...prev,
      [regionId]: !prev[regionId]
    }));
  };

  // 清除所有内容
  const clearAll = () => {
    setOldCode('');
    setNewCode('');
    setDiffResult([]);
    setOldFileName('');
    setNewFileName('');
    setFoldedRegions({});
  };

  // 复制结果
  const copyResult = () => {
    const lines = processFoldedLines(diffResult);
    let text = '';
    lines.forEach(line => {
      if (line.type === 'folded') {
        text += `... ${line.foldedLines} 行未显示\n`;
      } else {
        const prefix = line.type === 'added' ? '+' : 
                      line.type === 'removed' ? '-' : 
                      line.type === 'modified' ? '~' : ' ';
        text += `${prefix} ${line.content}\n`;
      }
    });
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  // 计算处理后的行（包含折叠）
  const processedLines = useMemo(() => {
    return processFoldedLines(diffResult);
  }, [diffResult, processFoldedLines]);

  // 渲染单行
  const renderLine = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const line = processedLines[index];
    if (!line) return null;

    // 基础样式
    const baseStyle = {
      display: 'flex',
      fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
      fontSize: '12px',
      lineHeight: '1.5',
      ...style
    };

    // 折叠行
    if (line.type === 'folded') {
      return (
        <div 
          style={{
            ...baseStyle,
            backgroundColor: '#f6f8fa',
            cursor: 'pointer',
            padding: '4px 0'
          }}
          onClick={() => toggleFold(index)}
        >
          <div style={{ width: '50px', textAlign: 'right', paddingRight: '8px', color: '#6a737d', backgroundColor: '#f6f8fa', userSelect: 'none' }}></div>
          <div style={{ width: '50px', textAlign: 'right', paddingRight: '8px', color: '#6a737d', backgroundColor: '#f6f8fa', userSelect: 'none' }}></div>
          <div style={{ width: '20px', textAlign: 'center', color: '#6a737d', backgroundColor: '#f6f8fa', userSelect: 'none' }}>
            <ChevronRight size={12} />
          </div>
          <div style={{ flex: 1, paddingLeft: '8px', color: '#6a737d' }}>
            {line.foldedLines} 行未显示 (从行 {line.startLine} 到 {line.endLine}) - 点击展开
          </div>
        </div>
      );
    }

    // 行背景色
    const bgColor = line.type === 'added' ? '#e6fffa' : 
                   line.type === 'removed' ? '#ffeef0' : 
                   line.type === 'modified' ? '#fffbe6' : '#ffffff';
    
    // 行前缀
    const linePrefix = line.type === 'added' ? '+' : 
                      line.type === 'removed' ? '-' : 
                      line.type === 'modified' ? '~' : ' ';
    
    // 渲染行内差异
    let contentElement: React.ReactNode = line.content || '\u00A0';
    if (line.charDiff && line.charDiff.length > 0) {
      contentElement = (
        <>
          {line.charDiff.map((char, charIndex) => {
            const charBgColor = char.type === 'added' ? '#a6f3c6' : 
                                char.type === 'removed' ? '#fdb8c0' : 'transparent';
            return (
              <span key={charIndex} style={{ backgroundColor: charBgColor }}>
                {char.value}
              </span>
            );
          })}
        </>
      );
    }

    if (viewMode === 'split') {
      // 并排视图
      return (
        <div style={{ ...baseStyle, backgroundColor: bgColor }}>
          {/* 左侧（旧版本） */}
          {line.type !== 'added' && (
            <>
              <div style={{ width: '50px', textAlign: 'right', paddingRight: '8px', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}>
                {line.oldLineNumber || ''}
              </div>
              <div style={{ width: '20px', textAlign: 'center', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}>
                {line.type === 'removed' ? '-' : line.type === 'modified' ? '~' : ' '}
              </div>
              <div style={{ flex: 1, paddingLeft: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderRight: '1px solid #e1e4e8' }}>
                {line.type !== 'added' ? contentElement : ''}
              </div>
            </>
          )}
          {line.type === 'added' && (
            <>
              <div style={{ width: '50px', textAlign: 'right', paddingRight: '8px', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}></div>
              <div style={{ width: '20px', textAlign: 'center', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}></div>
              <div style={{ flex: 1, paddingLeft: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderRight: '1px solid #e1e4e8' }}></div>
            </>
          )}
          
          {/* 右侧（新版本） */}
          {line.type !== 'removed' && (
            <>
              <div style={{ width: '50px', textAlign: 'right', paddingRight: '8px', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}>
                {line.newLineNumber || ''}
              </div>
              <div style={{ width: '20px', textAlign: 'center', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}>
                {line.type === 'added' ? '+' : line.type === 'modified' ? '~' : ' '}
              </div>
              <div style={{ flex: 1, paddingLeft: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {line.type !== 'removed' ? contentElement : ''}
              </div>
            </>
          )}
          {line.type === 'removed' && (
            <>
              <div style={{ width: '50px', textAlign: 'right', paddingRight: '8px', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}></div>
              <div style={{ width: '20px', textAlign: 'center', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}></div>
              <div style={{ flex: 1, paddingLeft: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}></div>
            </>
          )}
        </div>
      );
    } else {
      // 统一视图
      return (
        <div style={{ ...baseStyle, backgroundColor: bgColor }}>
          <div style={{ width: '50px', textAlign: 'right', paddingRight: '8px', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}>
            {line.oldLineNumber || ''}
          </div>
          <div style={{ width: '50px', textAlign: 'right', paddingRight: '8px', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}>
            {line.newLineNumber || ''}
          </div>
          <div style={{ width: '20px', textAlign: 'center', color: '#6a737d', backgroundColor: bgColor, userSelect: 'none' }}>
            {linePrefix}
          </div>
          <div style={{ flex: 1, paddingLeft: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {contentElement}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={28} className="text-blue-600" />
            代码差异对比工具
          </h1>
          <p className="text-gray-600 mt-1">支持行级和字符级差异对比，多种视图模式，大文件虚拟滚动</p>
        </div>
        
        {/* 控制栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 视图模式切换 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">视图模式:</span>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'split' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SplitSquareVertical size={16} />
                并排对比
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'unified' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LayoutGrid size={16} />
                上下对比
              </button>
            </div>
            
            {/* 忽略空白字符 */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">忽略空白字符</span>
              </label>
            </div>
            
            {/* 折叠相同区域 */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFolded}
                  onChange={(e) => setShowFolded(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">折叠未改变区域</span>
              </label>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={computeDiff}
                disabled={!oldCode || !newCode || isComputing}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isComputing ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {isComputing ? '计算中...' : '对比代码'}
              </button>
              
              <button
                onClick={copyResult}
                disabled={diffResult.length === 0}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Copy size={16} />
                复制
              </button>
              
              <button
                onClick={exportToHTML}
                disabled={diffResult.length === 0}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={16} />
                导出HTML
              </button>
              
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
                清除
              </button>
            </div>
          </div>
        </div>
        
        {/* 输入区域 */}
        <div className={`grid gap-6 mb-6 ${viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* 左侧输入框（旧代码） */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {oldFileName || '原代码 (左边)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={oldFileInputRef}
                  onChange={(e) => handleFileUpload(e, setOldCode, setOldFileName)}
                  className="hidden"
                  accept=".txt,.js,.ts,.tsx,.jsx,.json,.css,.html,.md,.py,.java,.cpp,.c,.go,.rs,.rb,.php"
                />
                <button
                  onClick={() => oldFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <Upload size={12} />
                  上传文件
                </button>
              </div>
            </div>
            <textarea
              value={oldCode}
              onChange={(e) => setOldCode(e.target.value)}
              placeholder="在此输入或粘贴原代码..."
              className="w-full h-64 p-4 font-mono text-sm border-none focus:ring-0 resize-none"
            />
          </div>
          
          {/* 右侧输入框（新代码） */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {newFileName || '新代码 (右边)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={newFileInputRef}
                  onChange={(e) => handleFileUpload(e, setNewCode, setNewFileName)}
                  className="hidden"
                  accept=".txt,.js,.ts,.tsx,.jsx,.json,.css,.html,.md,.py,.java,.cpp,.c,.go,.rs,.rb,.php"
                />
                <button
                  onClick={() => newFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <Upload size={12} />
                  上传文件
                </button>
              </div>
            </div>
            <textarea
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="在此输入或粘贴新代码..."
              className="w-full h-64 p-4 font-mono text-sm border-none focus:ring-0 resize-none"
            />
          </div>
        </div>
        
        {/* 结果区域 */}
        {diffResult.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-700">
                差异结果 ({processedLines.length} 行显示)
              </h2>
            </div>
            
            {/* 虚拟滚动列表 */}
            <div style={{ height: '600px', width: '100%' }}>
              <List
                ref={listRef}
                height={600}
                itemCount={processedLines.length}
                itemSize={24}
                width="100%"
              >
                {renderLine}
              </List>
            </div>
          </div>
        )}
        
        {/* 空状态 */}
        {diffResult.length === 0 && !isComputing && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <FileText size={48} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无对比结果</h3>
            <p className="text-gray-600 mb-4">
              请在上方输入框中输入两段代码，或上传两个文件进行对比
            </p>
            <div className="text-sm text-gray-500">
              <p>支持的功能：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>行级别差异高亮（新增行绿色、删除行红色、修改行蓝色）</li>
                <li>字符级别精确差异标注（行内diff）</li>
                <li>并排对比和上下对比两种布局</li>
                <li>忽略空白字符的选项</li>
                <li>大文件虚拟滚动支持（10万行不卡顿）</li>
                <li>折叠未改变的相同区域</li>
                <li>上传文件对比</li>
                <li>导出为HTML格式</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
