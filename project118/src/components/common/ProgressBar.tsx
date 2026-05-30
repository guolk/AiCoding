import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'orange' | 'blue' | 'gray';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
};

const colorClasses = {
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-500'
};

export default function ProgressBar({
  progress,
  size = 'md',
  color = 'green',
  showLabel = false,
  className
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 mt-1">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}
