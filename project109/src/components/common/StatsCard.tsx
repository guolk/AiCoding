import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { ReactNode } from 'react';

type VariantType = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: VariantType;
  description?: string;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<VariantType, { bg: string; iconBg: string; iconColor: string }> = {
  default: {
    bg: 'bg-white',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  primary: {
    bg: 'bg-primary-600',
    iconBg: 'bg-primary-500',
    iconColor: 'text-white',
  },
  accent: {
    bg: 'bg-accent-500',
    iconBg: 'bg-accent-400',
    iconColor: 'text-white',
  },
  success: {
    bg: 'bg-white',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-white',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  danger: {
    bg: 'bg-white',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  description,
  className,
  onClick,
}: StatsCardProps) {
  const styles = variantStyles[variant];
  const isDarkVariant = variant === 'primary' || variant === 'accent';

  const renderTrend = () => {
    if (!trend) return null;

    const isPositive = trend.value > 0;
    const isNeutral = trend.value === 0;

    return (
      <div className='flex items-center gap-1 mt-2'>
        {isPositive ? (
          <TrendingUp className='w-4 h-4 text-green-500' />
        ) : isNeutral ? (
          <Minus className='w-4 h-4 text-gray-500' />
        ) : (
          <TrendingDown className='w-4 h-4 text-red-500' />
        )}
        <span
          className={cn(
            'text-xs font-medium',
            isPositive && 'text-green-500',
            isNeutral && 'text-gray-500',
            !isPositive && !isNeutral && 'text-red-500'
          )}
        >
          {isPositive ? '+' : ''}{trend.value}%
        </span>
        {trend.label && (
          <span
            className={cn(
              'text-xs',
              isDarkVariant ? 'text-white/70' : 'text-gray-500'
            )}
          >
            {trend.label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl p-5 border transition-all duration-200',
        styles.bg,
        isDarkVariant
          ? 'border-transparent'
          : 'border-gray-200 hover:border-primary-200 hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className='flex items-start justify-between'>
        <div>
          <p
            className={cn(
              'text-sm font-medium mb-1',
              isDarkVariant ? 'text-white/80' : 'text-gray-500'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'text-3xl font-bold',
              isDarkVariant ? 'text-white' : 'text-gray-900'
            )}
          >
            {value}
          </p>
          {renderTrend()}
        </div>

        {icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              styles.iconBg
            )}
          >
            <div className={styles.iconColor}>{icon}</div>
          </div>
        )}
      </div>

      {description && (
        <p
          className={cn(
            'text-xs mt-3 pt-3 border-t',
            isDarkVariant
              ? 'text-white/60 border-white/10'
              : 'text-gray-500 border-gray-100'
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
