import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'animate-spin rounded-full border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400',
          sizeStyles[size],
          className
        )}
        role="status"
        aria-label={label || '加载中'}
      />
      {label && (
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
