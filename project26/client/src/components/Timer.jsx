import React from 'react';
import { formatTime } from '../utils/sudoku';

function Timer({ time, isRunning, isCompleted, showControls, onStart, onPause, onReset }) {
  const timerClasses = [
    'timer',
    isRunning ? 'running' : '',
    isCompleted ? 'completed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="timer-component">
      <div className={timerClasses}>
        {formatTime(time)}
      </div>
      {showControls && (
        <div className="timer-controls" style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {!isRunning ? (
            <button className="control-btn primary" onClick={onStart}>
              开始
            </button>
          ) : (
            <button className="control-btn warning" onClick={onPause}>
              暂停
            </button>
          )}
          <button className="control-btn secondary" onClick={onReset}>
            重置
          </button>
        </div>
      )}
    </div>
  );
}

export default React.memo(Timer);
