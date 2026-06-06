import { cn } from '../../lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showLabel?: boolean;
  label?: string;
  subLabel?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#10B981',
  bgColor = '#e2e8f0',
  showLabel = true,
  label,
  subLabel,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const isOverLimit = progress > 100;
  const displayProgress = isOverLimit ? 100 : progress;
  const displayOffset = circumference - (displayProgress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="progress-ring">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOverLimit ? '#ef4444' : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={displayOffset}
          className="transition-all duration-700 ease-out"
          style={{
            strokeDashoffset: displayOffset,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-2xl font-bold text-slate-900">
            {label || `${progress}%`}
          </span>
          {subLabel && (
            <span className="text-xs text-slate-500 mt-0.5">{subLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
