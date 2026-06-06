import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'primary' | 'accent' | 'social' | 'entertainment' | 'work' | 'study' | 'communication';
  className?: string;
}

const colorClasses: Record<string, string> = {
  primary: 'from-emerald-50 to-teal-50 border-emerald-100',
  accent: 'from-orange-50 to-amber-50 border-orange-100',
  social: 'from-pink-50 to-rose-50 border-pink-100',
  entertainment: 'from-amber-50 to-yellow-50 border-amber-100',
  work: 'from-blue-50 to-sky-50 border-blue-100',
  study: 'from-purple-50 to-violet-50 border-purple-100',
  communication: 'from-cyan-50 to-sky-50 border-cyan-100',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'primary',
  className,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-rose-500' : trend === 'down' ? 'text-emerald-500' : 'text-slate-400';

  return (
    <div
      className={cn(
        'bg-gradient-to-br rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="font-serif text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-3">
          <TrendIcon className={cn('w-4 h-4', trendColor)} />
          <span className={cn('text-xs font-medium', trendColor)}>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
