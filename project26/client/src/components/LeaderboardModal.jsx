import React, { useState } from 'react';
import Modal from './Modal';
import { formatTime } from '../utils/sudoku';

function LeaderboardModal({ isOpen, onClose, leaderboard }) {
  const [activeDifficulty, setActiveDifficulty] = useState('easy');

  const difficulties = [
    { key: 'easy', label: '简单' },
    { key: 'medium', label: '中等' },
    { key: 'hard', label: '困难' },
    { key: 'expert', label: '专家' }
  ];

  const entries = leaderboard[activeDifficulty] || [];

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  };

  const getRankSymbol = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="排行榜">
      <div className="difficulty-selector" style={{ marginBottom: '16px' }}>
        {difficulties.map(diff => (
          <button
            key={diff.key}
            className={`difficulty-btn ${activeDifficulty === diff.key ? 'active' : ''}`}
            onClick={() => setActiveDifficulty(diff.key)}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <p>暂无排行榜数据</p>
          <p>完成游戏后，您的成绩将显示在这里</p>
        </div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>用时</th>
              <th>日期</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id || index}>
                <td className={`rank ${getRankClass(index + 1)}`}>
                  {getRankSymbol(index + 1)}
                </td>
                <td style={{ fontWeight: 'bold' }}>
                  {formatTime(entry.time)}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

export default LeaderboardModal;
