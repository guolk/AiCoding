import React, { useState, useEffect, useCallback } from 'react';
import SudokuGrid from './components/SudokuGrid';
import NumberPad from './components/NumberPad';
import Timer from './components/Timer';
import ImportExportModal from './components/ImportExportModal';
import HistoryModal from './components/HistoryModal';
import LeaderboardModal from './components/LeaderboardModal';
import ReplayPlayer from './components/ReplayPlayer';
import { useTimer } from './hooks/useTimer';
import { 
  deepCloneGrid, 
  deepCloneNotes, 
  createEmptyGrid, 
  createEmptyNotes,
  stringToGrid,
  gridToString,
  findErrors,
  validatePartial,
  getNextEditableCell
} from './utils/sudoku';
import { 
  getHistory, 
  addHistoryEntry, 
  clearHistory,
  getLeaderboard,
  addLeaderboardEntry,
  getSettings,
  updateSettings
} from './utils/storage';

const API_BASE = '/api/sudoku';

function App() {
  const [difficulty, setDifficulty] = useState('medium');
  const [grid, setGrid] = useState(null);
  const [initialGrid, setInitialGrid] = useState(null);
  const [solution, setSolution] = useState(null);
  const [notes, setNotes] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  
  const [showImportExport, setShowImportExport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [replaySteps, setReplaySteps] = useState(null);
  const [replayInitialGrid, setReplayInitialGrid] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState({});

  const {
    time,
    formattedTime,
    isRunning: timerRunning,
    isPaused,
    start: startTimer,
    pause: pauseTimer,
    stop: stopTimer,
    reset: resetTimer
  } = useTimer(0, false);

  useEffect(() => {
    const settings = getSettings();
    setDifficulty(settings.difficulty);
    
    setHistory(getHistory());
    setLeaderboard(getLeaderboard());
  }, []);

  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const generatePuzzle = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    setErrors([]);
    setIsComplete(false);
    
    try {
      const response = await fetch(`${API_BASE}/generate?difficulty=${difficulty}`);
      const data = await response.json();
      
      if (data.success) {
        const newGrid = data.data.puzzle;
        setGrid(deepCloneGrid(newGrid));
        setInitialGrid(deepCloneGrid(newGrid));
        setSolution(data.data.solution);
        setNotes(createEmptyNotes());
        setSelectedCell(null);
        resetTimer(0);
        startTimer();
        
        showMessage(`已生成${getDifficultyLabel(difficulty)}难度数独，提示数: ${data.data.clueCount}`, 'success');
        
        updateSettings({ difficulty });
      } else {
        showMessage(data.error || '生成谜题失败', 'error');
      }
    } catch (error) {
      console.error('Generate puzzle error:', error);
      showMessage('网络错误，请稍后重试', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [difficulty, resetTimer, startTimer, showMessage]);

  const handleCellClick = useCallback((row, col) => {
    if (!grid) return;
    
    if (initialGrid && initialGrid[row][col] !== 0) {
      setSelectedCell({ row, col });
      return;
    }
    
    setSelectedCell({ row, col });
  }, [grid, initialGrid]);

  const handleNumberClick = useCallback((num) => {
    if (!selectedCell || !grid) return;
    
    const { row, col } = selectedCell;
    
    if (initialGrid && initialGrid[row][col] !== 0) {
      return;
    }
    
    if (isNoteMode) {
      const newNotes = deepCloneNotes(notes);
      if (newNotes[row][col].has(num)) {
        newNotes[row][col].delete(num);
      } else {
        newNotes[row][col].add(num);
      }
      setNotes(newNotes);
    } else {
      const newGrid = deepCloneGrid(grid);
      newGrid[row][col] = num;
      setGrid(newGrid);
      
      const newNotes = deepCloneNotes(notes);
      newNotes[row][col].clear();
      setNotes(newNotes);
      
      const validation = validatePartial(newGrid);
      if (!validation.valid) {
        setErrors(findErrors(newGrid));
      } else {
        setErrors([]);
      }
      
      const nextCell = getNextEditableCell(newGrid, initialGrid, row, col);
      if (nextCell) {
        setSelectedCell(nextCell);
      }
      
      const hasEmpty = newGrid.flat().some(n => n === 0);
      if (!hasEmpty) {
        checkSolution(newGrid);
      }
    }
  }, [selectedCell, grid, initialGrid, isNoteMode, notes]);

  const handleDelete = useCallback(() => {
    if (!selectedCell || !grid) return;
    
    const { row, col } = selectedCell;
    
    if (initialGrid && initialGrid[row][col] !== 0) {
      return;
    }
    
    if (isNoteMode) {
      const newNotes = deepCloneNotes(notes);
      newNotes[row][col].clear();
      setNotes(newNotes);
    } else {
      const newGrid = deepCloneGrid(grid);
      newGrid[row][col] = 0;
      setGrid(newGrid);
      setErrors(findErrors(newGrid));
    }
  }, [selectedCell, grid, initialGrid, isNoteMode, notes]);

  const checkSolution = async (currentGrid) => {
    try {
      const response = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid: currentGrid })
      });
      const data = await response.json();
      
      if (data.success && data.data.isValid) {
        setIsComplete(true);
        stopTimer();
        
        const historyEntry = addHistoryEntry({
          difficulty,
          time,
          clueCount: initialGrid ? initialGrid.flat().filter(n => n !== 0).length : 0,
          puzzleString: initialGrid ? gridToString(initialGrid) : '',
          solutionString: solution ? gridToString(solution) : ''
        });
        
        if (historyEntry) {
          setHistory(getHistory());
        }
        
        const leaderboardResult = addLeaderboardEntry(difficulty, {
          time,
          clueCount: initialGrid ? initialGrid.flat().filter(n => n !== 0).length : 0
        });
        
        if (leaderboardResult) {
          setLeaderboard(getLeaderboard());
          showMessage(
            `恭喜完成！用时: ${formattedTime}。排行榜排名: 第${leaderboardResult.rank}名`, 
            'success'
          );
        } else {
          showMessage(`恭喜完成！用时: ${formattedTime}`, 'success');
        }
      } else {
        showMessage('答案不正确，请继续检查', 'error');
      }
    } catch (error) {
      console.error('Validate error:', error);
      showMessage('验证失败', 'error');
    }
  };

  const getHint = async () => {
    if (!grid || !solution) return;
    
    try {
      const response = await fetch(`${API_BASE}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          puzzle: grid,
          solution: solution
        })
      });
      const data = await response.json();
      
      if (data.success && data.data.hint) {
        const { row, col, value, reason } = data.data.hint;
        
        showMessage(`提示: 在 (${row + 1}, ${col + 1}) 填入 ${value}。原因: ${reason}`, 'info');
        
        setSelectedCell({ row, col });
      } else {
        showMessage('没有可用的提示', 'info');
      }
    } catch (error) {
      console.error('Hint error:', error);
      showMessage('获取提示失败', 'error');
    }
  };

  const solveFull = async () => {
    if (!grid) return;
    
    try {
      const response = await fetch(`${API_BASE}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzle: grid })
      });
      const data = await response.json();
      
      if (data.success) {
        setGrid(data.data.solution);
        setIsComplete(true);
        stopTimer();
        showMessage('数独已求解完成', 'success');
        
        if (data.data.steps && data.data.steps.length > 0) {
          setReplaySteps(data.data.steps);
          setReplayInitialGrid(deepCloneGrid(grid));
        }
      } else {
        showMessage(data.error || '求解失败', 'error');
      }
    } catch (error) {
      console.error('Solve error:', error);
      showMessage('求解失败', 'error');
    }
  };

  const showSolveSteps = async () => {
    if (!grid) return;
    
    try {
      const response = await fetch(`${API_BASE}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzle: grid })
      });
      const data = await response.json();
      
      if (data.success && data.data.steps && data.data.steps.length > 0) {
        setReplaySteps(data.data.steps);
        setReplayInitialGrid(deepCloneGrid(grid));
        setShowReplay(true);
      } else {
        showMessage('没有可用的解题步骤', 'info');
      }
    } catch (error) {
      console.error('Solve steps error:', error);
      showMessage('获取解题步骤失败', 'error');
    }
  };

  const handleImport = async (puzzleString) => {
    try {
      const response = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzleString })
      });
      const data = await response.json();
      
      if (data.success) {
        const newGrid = data.data.puzzle;
        setGrid(deepCloneGrid(newGrid));
        setInitialGrid(deepCloneGrid(newGrid));
        setSolution(data.data.solution);
        setNotes(createEmptyNotes());
        setSelectedCell(null);
        setErrors([]);
        setIsComplete(false);
        resetTimer(0);
        startTimer();
        
        showMessage(`数独导入成功，提示数: ${data.data.clueCount}`, 'success');
      } else {
        showMessage(data.error || '导入失败', 'error');
      }
    } catch (error) {
      console.error('Import error:', error);
      showMessage('导入失败', 'error');
    }
  };

  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
      setHistory([]);
      showMessage('历史记录已清空', 'info');
    }
  };

  const getDifficultyLabel = (diff) => {
    const labels = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      expert: '专家'
    };
    return labels[diff] || diff;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key >= '1' && e.key <= '9') {
        handleNumberClick(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNoteMode(!isNoteMode);
      } else if (selectedCell) {
        const { row, col } = selectedCell;
        let newRow = row;
        let newCol = col;
        
        if (e.key === 'ArrowUp' && row > 0) newRow--;
        else if (e.key === 'ArrowDown' && row < 8) newRow++;
        else if (e.key === 'ArrowLeft' && col > 0) newCol--;
        else if (e.key === 'ArrowRight' && col < 8) newCol++;
        
        if (newRow !== row || newCol !== col) {
          setSelectedCell({ row: newRow, col: newCol });
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberClick, handleDelete, isNoteMode, selectedCell]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎯 数独游戏</h1>
        <p>挑战你的逻辑思维能力</p>
      </header>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="main-content">
        <div className="game-section">
          <div className="difficulty-selector" style={{ marginBottom: '16px', justifyContent: 'center' }}>
            {['easy', 'medium', 'hard', 'expert'].map(diff => (
              <button
                key={diff}
                className={`difficulty-btn ${difficulty === diff ? 'active' : ''}`}
                onClick={() => setDifficulty(diff)}
              >
                {getDifficultyLabel(diff)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : grid ? (
            <SudokuGrid
              grid={grid}
              initialGrid={initialGrid}
              notes={notes}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
              errors={errors}
            />
          ) : (
            <div style={{ 
              width: '450px', 
              height: '450px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'var(--card-background)',
              borderRadius: '8px',
              border: '2px dashed var(--border-color)'
            }}>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                点击"新游戏"开始<br />
                或"导入"数独谜题
              </p>
            </div>
          )}

          {grid && (
            <>
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${!isNoteMode ? 'active' : ''}`}
                  onClick={() => setIsNoteMode(false)}
                >
                  输入模式
                </button>
                <button
                  className={`mode-btn ${isNoteMode ? 'active' : ''}`}
                  onClick={() => setIsNoteMode(true)}
                >
                  笔记模式
                </button>
              </div>

              <NumberPad
                onNumberClick={handleNumberClick}
                onDelete={handleDelete}
                isNoteMode={isNoteMode}
                disabled={!selectedCell || isComplete}
              />
            </>
          )}

          <div className="controls" style={{ marginTop: '16px' }}>
            <button
              className="control-btn primary"
              onClick={generatePuzzle}
              disabled={isLoading}
            >
              🎲 新游戏
            </button>
            <button
              className="control-btn warning"
              onClick={getHint}
              disabled={!grid || isComplete}
            >
              💡 提示
            </button>
            <button
              className="control-btn success"
              onClick={solveFull}
              disabled={!grid || isComplete}
            >
              ✅ 求解
            </button>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>⏱ 用时</h3>
            <Timer
              time={time}
              isRunning={timerRunning && !isPaused}
              isCompleted={isComplete}
            />
            {grid && !isComplete && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {timerRunning && !isPaused ? (
                  <button className="control-btn warning" onClick={pauseTimer} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                    暂停
                  </button>
                ) : (
                  <button className="control-btn primary" onClick={startTimer} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                    继续
                  </button>
                )}
              </div>
            )}
          </div>

          {grid && (
            <div className="info-card">
              <h3>📊 游戏信息</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>难度: </span>
                  <span style={{ fontWeight: 'bold' }}>{getDifficultyLabel(difficulty)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>提示数: </span>
                  <span style={{ fontWeight: 'bold' }}>
                    {initialGrid ? initialGrid.flat().filter(n => n !== 0).length : 0}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>剩余空格: </span>
                  <span style={{ fontWeight: 'bold' }}>
                    {grid ? grid.flat().filter(n => n === 0).length : 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="info-card">
            <h3>📋 功能</h3>
            <div className="controls" style={{ flexWrap: 'wrap' }}>
              <button
                className="control-btn secondary"
                onClick={() => setShowImportExport(true)}
              >
                📥 导入/导出
              </button>
              <button
                className="control-btn secondary"
                onClick={showSolveSteps}
                disabled={!grid}
              >
                ▶ 回放求解
              </button>
              <button
                className="control-btn secondary"
                onClick={() => setShowHistory(true)}
              >
                📜 历史记录
              </button>
              <button
                className="control-btn secondary"
                onClick={() => setShowLeaderboard(true)}
              >
                🏆 排行榜
              </button>
            </div>
          </div>

          <div className="info-card">
            <h3>⌨ 快捷键</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <div><kbd style={{ background: 'var(--background-color)', padding: '2px 6px', borderRadius: '4px' }}>1-9</kbd> 输入数字</div>
              <div><kbd style={{ background: 'var(--background-color)', padding: '2px 6px', borderRadius: '4px' }}>Backspace</kbd> 删除</div>
              <div><kbd style={{ background: 'var(--background-color)', padding: '2px 6px', borderRadius: '4px' }}>N</kbd> 切换笔记模式</div>
              <div><kbd style={{ background: 'var(--background-color)', padding: '2px 6px', borderRadius: '4px' }}>↑↓←→</kbd> 移动选中</div>
            </div>
          </div>
        </div>
      </div>

      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        currentPuzzle={initialGrid}
        currentSolution={solution}
        onImport={handleImport}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        leaderboard={leaderboard}
      />

      <ReplayPlayer
        isOpen={showReplay}
        onClose={() => setShowReplay(false)}
        initialGrid={replayInitialGrid}
        steps={replaySteps}
      />
    </div>
  );
}

export default App;
