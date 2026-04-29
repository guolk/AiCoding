import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from './Modal';
import SudokuGrid from './SudokuGrid';
import { deepCloneGrid } from '../utils/sudoku';

function ReplayPlayer({ isOpen, onClose, initialGrid, steps }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [grid, setGrid] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [animationCells, setAnimationCells] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialGrid) {
      setGrid(deepCloneGrid(initialGrid));
      setCurrentStep(0);
      setIsPlaying(false);
      setAnimationCells({});
    }
  }, [isOpen, initialGrid]);

  const executeStep = useCallback((stepIndex) => {
    if (!steps || stepIndex < 0 || stepIndex >= steps.length) return;
    
    const step = steps[stepIndex];
    const newGrid = deepCloneGrid(grid);
    newGrid[step.row][step.col] = step.value;
    
    setGrid(newGrid);
    setCurrentStep(stepIndex);
    setAnimationCells({
      [`${step.row}-${step.col}`]: step.type === 'fill' ? 'fill' : 'backtrack'
    });
    
    setTimeout(() => {
      setAnimationCells({});
    }, 500);
  }, [grid, steps]);

  const playNext = useCallback(() => {
    if (!steps) return;
    if (currentStep < steps.length - 1) {
      executeStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, steps, executeStep]);

  const playPrevious = useCallback(() => {
    if (!steps || currentStep <= 0) return;
    
    const newGrid = deepCloneGrid(initialGrid);
    
    for (let i = 0; i < currentStep - 1; i++) {
      const step = steps[i];
      newGrid[step.row][step.col] = step.value;
    }
    
    setGrid(newGrid);
    setCurrentStep(currentStep - 1);
  }, [currentStep, steps, initialGrid]);

  const goToStep = useCallback((stepIndex) => {
    if (!steps || stepIndex < 0 || stepIndex > steps.length) return;
    
    const newGrid = deepCloneGrid(initialGrid);
    
    for (let i = 0; i < stepIndex; i++) {
      const step = steps[i];
      newGrid[step.row][step.col] = step.value;
    }
    
    setGrid(newGrid);
    setCurrentStep(stepIndex);
  }, [steps, initialGrid]);

  useEffect(() => {
    if (isPlaying && steps) {
      intervalRef.current = setInterval(() => {
        if (currentStep >= steps.length - 1) {
          setIsPlaying(false);
        } else {
          executeStep(currentStep + 1);
        }
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, currentStep, steps, executeStep]);

  const getSpeedLabel = (ms) => {
    if (ms === 2000) return '慢速';
    if (ms === 1000) return '正常';
    if (ms === 500) return '快速';
    if (ms === 200) return '极快';
    return '正常';
  };

  const fillSteps = steps ? steps.filter(s => s.type === 'fill').length : 0;
  const backtrackSteps = steps ? steps.filter(s => s.type === 'backtrack').length : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="解题过程回放">
      {!initialGrid || !steps || steps.length === 0 ? (
        <div className="empty-state">
          <p>没有可回放的解题过程</p>
          <p>请先生成或导入一个数独谜题，然后点击"显示求解过程"</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {grid && (
              <SudokuGrid
                grid={grid}
                initialGrid={initialGrid}
                animationCells={animationCells}
                highlightSameNumber={false}
              />
            )}
          </div>

          <div className="replay-controls">
            <button
              className="control-btn secondary"
              onClick={() => goToStep(0)}
              disabled={currentStep === 0}
            >
              ⏮
            </button>
            <button
              className="control-btn secondary"
              onClick={playPrevious}
              disabled={currentStep === 0}
            >
              ⏪
            </button>
            <button
              className={`control-btn ${isPlaying ? 'warning' : 'primary'}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸ 暂停' : '▶ 播放'}
            </button>
            <button
              className="control-btn secondary"
              onClick={playNext}
              disabled={currentStep >= steps.length}
            >
              ⏩
            </button>
            <button
              className="control-btn secondary"
              onClick={() => goToStep(steps.length)}
              disabled={currentStep >= steps.length}
            >
              ⏭
            </button>

            <div className="replay-speed">
              <span>速度:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={2000}>慢速</option>
                <option value={1000}>正常</option>
                <option value={500}>快速</option>
                <option value={200}>极快</option>
              </select>
            </div>
          </div>

          <div className="replay-progress">
            <input
              type="range"
              min={0}
              max={steps.length}
              value={currentStep}
              onChange={(e) => goToStep(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div className="replay-stats">
              <span>步骤: {currentStep} / {steps.length}</span>
              <span>填充: {fillSteps} | 回溯: {backtrackSteps}</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                background: 'var(--animation-fill)',
                borderRadius: '4px'
              }}></div>
              <span style={{ fontSize: '0.875rem' }}>填充</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                background: 'var(--animation-backtrack)',
                borderRadius: '4px'
              }}></div>
              <span style={{ fontSize: '0.875rem' }}>回溯</span>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

export default ReplayPlayer;
