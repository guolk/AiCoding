import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}

export default function Rating({
  value,
  max = 5,
  size = 16,
  className,
  showValue = false,
}: RatingProps) {
  const clampedValue = Math.max(0, Math.min(value, max));

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const fill = clampedValue - index;
          let fillPercentage = 0;

          if (fill >= 1) {
            fillPercentage = 100;
          } else if (fill > 0) {
            fillPercentage = fill * 100;
          }

          return (
            <div key={index} className="relative">
              <Star
                size={size}
                className="text-gray-300 dark:text-gray-600"
                strokeWidth={2}
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  size={size}
                  className="text-amber-400 fill-amber-400"
                  strokeWidth={2}
                />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-400">
          {clampedValue.toFixed(1)}
        </span>
      )}
    </div>
  );
}
