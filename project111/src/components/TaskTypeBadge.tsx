import React from 'react';
import type { TaskType } from '../types';
import { TASK_TYPE_LABELS } from '../types';

interface Props {
  type: TaskType;
}

export default function TaskTypeBadge({ type }: Props) {
  const typeStyles: Record<TaskType, string> = {
    daily: 'bg-blue-100 text-blue-700',
    weekly: 'bg-purple-100 text-purple-700',
    monthly: 'bg-pink-100 text-pink-700',
    timed: 'bg-red-100 text-red-700',
  };

  const icons: Record<TaskType, string> = {
    daily: '📅',
    weekly: '📆',
    monthly: '🗓️',
    timed: '⏰',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyles[type]}`}
    >
      <span>{icons[type]}</span>
      {TASK_TYPE_LABELS[type]}
    </span>
  );
}
