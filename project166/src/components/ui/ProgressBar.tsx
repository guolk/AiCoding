import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'nomad' | 'amber' | 'emerald' | 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorStyles = {
  nomad: 'bg-nomad-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'nomad',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min((value / max) * 100, 100));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
          <span>进度</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorStyles[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
