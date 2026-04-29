import React from 'react';
import Modal from './Modal';
import { formatTime } from '../utils/sudoku';

function HistoryModal({ isOpen, onClose, history, onClearHistory }) {
  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      expert: '专家'
    };
    return labels[difficulty] || difficulty;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="游戏历史">
      {history.length === 0 ? (
        <div className="empty-state">
          <p>暂无游戏历史</p>
          <p>开始游戏后，您的记录将显示在这里</p>
        </div>
      ) : (
        <>
          <div className="history-list">
            {history.map((entry, index) => (
              <div key={entry.id || index} className="history-item">
                <div className="history-item-header">
                  <span className={`difficulty ${entry.difficulty}`}>
                    {getDifficultyLabel(entry.difficulty)}
                  </span>
                  <span className="time">{formatTime(entry.time)}</span>
                </div>
                <div className="date">{formatDate(entry.createdAt)}</div>
                {entry.clueCount && (
                  <div style={{ marginTop: '4px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    提示数: {entry.clueCount}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              className="control-btn danger"
              onClick={onClearHistory}
            >
              清空历史记录
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default HistoryModal;
