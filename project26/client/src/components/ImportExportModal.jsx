import React, { useState } from 'react';
import Modal from './Modal';
import { gridToString, stringToGrid } from '../utils/sudoku';

function ImportExportModal({ 
  isOpen, 
  onClose, 
  currentPuzzle, 
  currentSolution,
  onImport 
}) {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [activeTab, setActiveTab] = useState('import');

  const puzzleString = currentPuzzle ? gridToString(currentPuzzle) : '';
  const solutionString = currentSolution ? gridToString(currentSolution) : '';

  const handleImport = () => {
    setImportError('');
    
    const trimmed = importText.trim();
    if (trimmed.length !== 81) {
      setImportError('数独格式错误：必须是81个字符，使用数字1-9和.表示空格');
      return;
    }
    
    if (!/^[1-9.]{81}$/.test(trimmed)) {
      setImportError('数独格式错误：只能包含数字1-9和.');
      return;
    }
    
    const grid = stringToGrid(trimmed);
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const val = grid[i][j];
        if (val === 0) continue;
        
        grid[i][j] = 0;
        for (let k = 0; k < 9; k++) {
          if (grid[i][k] === val || grid[k][j] === val) {
            setImportError('无效的数独：存在重复数字');
            grid[i][j] = val;
            return;
          }
        }
        
        const startRow = Math.floor(i / 3) * 3;
        const startCol = Math.floor(j / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
          for (let c = startCol; c < startCol + 3; c++) {
            if (grid[r][c] === val) {
              setImportError('无效的数独：存在重复数字');
              grid[i][j] = val;
              return;
            }
          }
        }
        
        grid[i][j] = val;
      }
    }
    
    onImport(trimmed);
    onClose();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="导入/导出">
      <div className="import-export-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`control-btn ${activeTab === 'import' ? 'primary' : 'secondary'}`}
          onClick={() => setActiveTab('import')}
          style={{ flex: 1 }}
        >
          导入
        </button>
        <button
          className={`control-btn ${activeTab === 'export' ? 'primary' : 'secondary'}`}
          onClick={() => setActiveTab('export')}
          style={{ flex: 1 }}
        >
          导出
        </button>
      </div>

      {activeTab === 'import' && (
        <div className="import-section">
          <p style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            输入81个字符的数独字符串，使用数字1-9表示已知数字，使用.表示空格。
            <br />
            例如：53..7....6..195....98....6.8...6...34..8.3..17...2.6....28....419..5....8..79
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="在此粘贴数独字符串..."
            rows={4}
          />
          {importError && (
            <div className="message error">{importError}</div>
          )}
          <button
            className="control-btn primary"
            onClick={handleImport}
            style={{ width: '100%' }}
          >
            导入数独
          </button>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="export-section">
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '8px' }}>当前谜题</h4>
            <div className="export-display">{puzzleString || '无当前谜题'}</div>
            {puzzleString && (
              <button
                className="control-btn secondary"
                onClick={() => copyToClipboard(puzzleString)}
                style={{ marginTop: '8px' }}
              >
                复制谜题
              </button>
            )}
          </div>
          
          {solutionString && (
            <div>
              <h4 style={{ marginBottom: '8px' }}>答案</h4>
              <div className="export-display">{solutionString}</div>
              <button
                className="control-btn secondary"
                onClick={() => copyToClipboard(solutionString)}
                style={{ marginTop: '8px' }}
              >
                复制答案
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default ImportExportModal;
