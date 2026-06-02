import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function Progress({ value, max = 100, className, barClassName }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div
      className={cn('w-full h-2 bg-slate-100 rounded-full overflow-hidden', className)}
    >
      <div
        className={cn(
          'h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out',
          barClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
