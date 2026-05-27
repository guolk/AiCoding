import { clsx } from 'clsx';
import type { Difficulty } from '../../types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const difficultyConfig: Record<Difficulty, { label: string; color: string }> = {
  1: { label: '入门', color: 'bg-success/20 text-success' },
  2: { label: '简单', color: 'bg-success/40 text-success' },
  3: { label: '中等', color: 'bg-yellow-500/20 text-yellow-500' },
  4: { label: '困难', color: 'bg-danger/20 text-danger' },
  5: { label: '竞赛级', color: 'bg-danger/40 text-danger' },
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
