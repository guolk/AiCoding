import type { CompetitionType, Topic, ErrorReason, NoteType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function CompetitionBadge({ children, className }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary ${className || ''}`}>
      {children}
    </span>
  );
}

export function TopicBadge({ topic }: { topic: Topic }) {
  const labels: Record<Topic, string> = {
    number_theory: '数论',
    combinatorics: '组合',
    algebra: '代数',
    geometry: '几何',
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
      {labels[topic]}
    </span>
  );
}

export function ErrorReasonBadge({ reason }: { reason: ErrorReason }) {
  const labels: Record<ErrorReason, string> = {
    concept: '概念不清',
    calculation: '计算失误',
    approach: '思路跑偏',
    careless: '粗心',
  };

  const colors: Record<ErrorReason, string> = {
    concept: 'bg-purple-500/20 text-purple-400',
    calculation: 'bg-blue-500/20 text-blue-400',
    approach: 'bg-orange-500/20 text-orange-400',
    careless: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[reason]}`}>
      {labels[reason]}
    </span>
  );
}

export function NoteTypeBadge({ type }: { type: NoteType }) {
  const labels: Record<NoteType, string> = {
    knowledge: '知识梳理',
    method: '方法归纳',
    experience: '参赛感悟',
  };

  const colors: Record<NoteType, string> = {
    knowledge: 'bg-primary/20 text-primary',
    method: 'bg-success/20 text-success',
    experience: 'bg-yellow-500/20 text-yellow-500',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[type]}`}>
      {labels[type]}
    </span>
  );
}
