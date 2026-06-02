import { cn } from '../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
  height?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  value,
  max = 100,
  color = '#2C5F2D',
  showLabel = false,
  label,
  className,
  height = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-gray-700">{label || `${value}/${max}`}</span>
          <span className="font-medium text-gray-600">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-100',
          heightClasses[height]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            heightClasses[height]
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
