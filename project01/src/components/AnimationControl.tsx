import { useState, useEffect, useCallback } from 'react';

interface AnimationControlProps {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onProgressChange: (progress: number) => void;
  onSpeedChange: (speed: number) => void;
  duration?: number;
}

function AnimationControl({
  isPlaying,
  isPaused,
  progress,
  speed,
  onPlay,
  onPause,
  onReset,
  onProgressChange,
  onSpeedChange,
  duration = 10
}: AnimationControlProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const currentTime = progress * duration;

  return (
    <div style={styles.container}>
      <div style={styles.progressSection}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(e) => onProgressChange(parseFloat(e.target.value))}
          style={styles.progressSlider}
        />
        <div style={styles.timeDisplay}>
          <span style={styles.timeText}>{formatTime(currentTime)}</span>
          <span style={styles.timeSeparator}>/</span>
          <span style={styles.timeText}>{formatTime(duration)}</span>
        </div>
      </div>

      <div style={styles.controlsSection}>
        <div style={styles.playbackControls}>
          <button
            onClick={onReset}
            style={styles.controlButton}
            title="重置"
          >
            ⏮️
          </button>
          <button
            onClick={isPlaying && !isPaused ? onPause : onPlay}
            style={{ ...styles.controlButton, ...styles.playButton }}
            title={isPlaying && !isPaused ? '暂停' : '播放'}
          >
            {isPlaying && !isPaused ? '⏸️' : '▶️'}
          </button>
        </div>

        <div style={styles.speedControl}>
          <span style={styles.speedLabel}>速度：</span>
          <div style={styles.speedButtons}>
            {[0.25, 0.5, 1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                style={{
                  ...styles.speedButton,
                  ...(speed === s ? styles.speedButtonActive : {})
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {isPlaying && (
        <div style={styles.statusIndicator}>
          <span style={styles.statusDot}></span>
          <span style={styles.statusText}>动画播放中...</span>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
  },
  progressSection: {
    marginBottom: '16px'
  },
  progressSlider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: '#e0e0e0',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    marginBottom: '8px'
  },
  timeDisplay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px'
  },
  timeText: {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#666'
  },
  timeSeparator: {
    color: '#999'
  },
  controlsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  playbackControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  controlButton: {
    width: '48px',
    height: '48px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease'
  },
  playButton: {
    width: '56px',
    height: '56px',
    backgroundColor: '#1890ff',
    fontSize: '24px'
  },
  speedControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  speedLabel: {
    fontSize: '14px',
    color: '#666'
  },
  speedButtons: {
    display: 'flex',
    gap: '4px'
  },
  speedButton: {
    padding: '6px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    backgroundColor: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#666'
  },
  speedButtonActive: {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
    color: 'white'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#52c41a',
    animation: 'pulse 1.5s infinite'
  },
  statusText: {
    fontSize: '12px',
    color: '#52c41a'
  }
};

export default AnimationControl;
