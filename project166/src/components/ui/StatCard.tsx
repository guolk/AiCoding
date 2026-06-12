import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type GradientVariant = 'nomad' | 'amber' | 'rose' | 'violet' | 'sky';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: GradientVariant;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

const gradientStyles: Record<GradientVariant, string> = {
  nomad: 'from-nomad-500 to-nomad-700',
  amber: 'from-amber-400 to-amber-600',
  rose: 'from-rose-400 to-rose-600',
  violet: 'from-violet-500 to-violet-700',
  sky: 'from-sky-400 to-sky-600',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  gradient = 'nomad',
  trend,
  trendLabel,
  className,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg',
        `bg-gradient-to-br ${gradientStyles[gradient]}`,
        className
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {trend !== undefined && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                isPositive
                  ? 'bg-emerald-400/30 text-emerald-50'
                  : 'bg-red-400/30 text-red-50'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? '+' : ''}
              {trend}%
            </span>
            {trendLabel && (
              <span className="text-white/70">{trendLabel}</span>
            )}
          </div>
        )}
      </div>

      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/5" />
    </div>
  );
}
