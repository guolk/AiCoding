import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils';

type Trend = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: Trend;
  trendValue?: string;
  icon?: LucideIcon;
  iconGradient?: string;
  gradient?: string;
  className?: string;
}

const defaultGradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-500',
  'from-violet-500 to-purple-600',
];

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  iconGradient,
  gradient,
  className,
}: StatCardProps) {
  const fallbackGradient = gradient || defaultGradients[0];
  const fallbackIconGradient = iconGradient || fallbackGradient;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 lg:p-6 backdrop-blur-xl',
        'bg-white/60 border border-white/50 shadow-lg shadow-slate-200/50',
        'hover:shadow-xl hover:shadow-slate-300/40 transition-all duration-300',
        className
      )}
    >
      <div
        className={cn(
          'absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-10 bg-gradient-to-br',
          fallbackGradient
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <p className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            {value}
          </p>

          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-3">
              {trend && TrendIcon && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-sm font-semibold',
                    trend === 'up' && 'text-emerald-600',
                    trend === 'down' && 'text-rose-600',
                    trend === 'neutral' && 'text-slate-500'
                  )}
                >
                  <TrendIcon size={16} />
                  {trendValue}
                </span>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 truncate">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center',
              'bg-gradient-to-br shadow-lg shadow-blue-500/25',
              fallbackIconGradient
            )}
          >
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
