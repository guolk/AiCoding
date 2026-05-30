import React from 'react';

interface Props {
  progress: number;
  color?: 'primary' | 'secondary' | 'accent';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  label?: string;
}

const colorClasses = {
  primary: 'bg-gradient-to-r from-primary-400 to-primary-600',
  secondary: 'bg-gradient-to-r from-secondary-400 to-secondary-600',
  accent: 'bg-gradient-to-r from-accent-400 to-accent-600',
};

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-5',
};

export default function ProgressBar({
  progress,
  color = 'primary',
  showLabel = false,
  height = 'md',
  label,
}: Props) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-neutral-600">
            {label || '进度'}
          </span>
          <span className="text-sm font-bold text-neutral-800">
            {clampedProgress.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={`w-full ${heightClasses[height]} bg-neutral-200 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
