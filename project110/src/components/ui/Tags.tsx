import React from 'react';
import { cn } from '@/lib/utils';
import { DifficultyLevel, MasteryLevel } from '@/types';
import { getDifficultyLabel, getMasteryLabel } from '@/utils';

interface TagProps {
  children: React.ReactNode;
  className?: string;
  color?: 'olive' | 'sage' | 'terracotta' | 'cream' | 'default';
}

export const Tag: React.FC<TagProps> = ({
  children,
  className,
  color = 'default',
}) => {
  const colorClasses = {
    olive: 'bg-olive-100 text-olive-700',
    sage: 'bg-sage-100 text-sage-700',
    terracotta: 'bg-terracotta-100 text-terracotta-700',
    cream: 'bg-cream-200 text-olive-800',
    default: 'bg-sage-100 text-sage-700',
  };

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', colorClasses[color], className)}>
      {children}
    </span>
  );
};

interface DifficultyTagProps {
  difficulty: DifficultyLevel;
}

export const DifficultyTag: React.FC<DifficultyTagProps> = ({ difficulty }) => {
  const colorMap: Record<DifficultyLevel, TagProps['color']> = {
    beginner: 'olive',
    intermediate: 'sage',
    advanced: 'terracotta',
  };

  return (
    <Tag color={colorMap[difficulty]}>
      {getDifficultyLabel(difficulty)}
    </Tag>
  );
};

interface MasteryTagProps {
  level: MasteryLevel;
}

export const MasteryTag: React.FC<MasteryTagProps> = ({ level }) => {
  const colorMap: Record<MasteryLevel, TagProps['color']> = {
    'first-contact': 'cream',
    'learning': 'olive',
    'practicing': 'sage',
    'improving': 'sage',
    'stable': 'terracotta',
  };

  return (
    <Tag color={colorMap[level]}>
      {getMasteryLabel(level)}
    </Tag>
  );
};

export default Tag;
