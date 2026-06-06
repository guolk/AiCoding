import { ReactNode, ElementType } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface Trend {
  value: number;
  label?: string;
  isPositive?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  trend?: Trend;
  variant?: StatVariant;
  className?: string;
  suffix?: string;
  prefix?: string;
}

const variantStyles: Record<StatVariant, { bg: string; icon: string; text: string }> = {
  default: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-900 dark:text-white',
  },
  primary: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  danger: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-600 dark:text-red-400',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  suffix,
  prefix,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            {prefix && (
              <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                {prefix}
              </span>
            )}
            <h3
              className={cn(
                'text-2xl font-bold',
                variant === 'default' ? 'text-gray-900 dark:text-white' : styles.text
              )}
            >
              {value}
            </h3>
            {suffix && (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {suffix}
              </span>
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            styles.bg
          )}
        >
          <Icon className={cn('w-6 h-6', styles.icon)} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
