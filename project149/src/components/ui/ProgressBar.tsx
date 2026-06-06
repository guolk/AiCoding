import { clsx } from 'clsx';

type ProgressBarVariant = 'primary' | 'secondary' | 'gold' | 'success' | 'danger';
type ProgressBarSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const variantStyles: Record<ProgressBarVariant, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-gray-500',
  gold: 'bg-gold-500',
  success: 'bg-green-500',
  danger: 'bg-coral-500',
};

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-medium text-primary-600">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={clsx(
          'w-full overflow-hidden rounded-full bg-gray-100',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantStyles[variant],
            striped &&
              'bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]',
            animated && 'animate-[progress-stripes_1s_linear_infinite]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!showLabel && (
        <div className="mt-1 text-right">
          <span className="text-xs text-gray-500">{displayLabel}</span>
        </div>
      )}
    </div>
  );
}
