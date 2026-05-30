import React from 'react';
import type { TaskDifficulty } from '../types';
import { DIFFICULTY_LABELS } from '../types';

interface Props {
  difficulty: TaskDifficulty;
  size?: 'sm' | 'md';
}

export default function DifficultyBadge({ difficulty, size = 'md' }: Props) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';
  
  const difficultyStyles: Record<TaskDifficulty, string> = {
    easy: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    medium: 'bg-primary-100 text-primary-700 border-primary-200',
    hard: 'bg-accent-100 text-accent-700 border-accent-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${sizeClasses} ${difficultyStyles[difficulty]}`}
    >
      {difficulty === 'easy' && <span>🌱</span>}
      {difficulty === 'medium' && <span>⚡</span>}
      {difficulty === 'hard' && <span>🔥</span>}
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}
