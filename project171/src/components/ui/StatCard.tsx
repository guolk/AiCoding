import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatColor = 'terracotta' | 'forest' | 'ocean' | 'amber' | 'purple';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: StatColor;
  trend?: {
    value: number;
    isUp: boolean;
    label?: string;
  };
  className?: string;
}

const colorGradients: Record<StatColor, string> = {
  terracotta: 'bg-gradient-to-br from-terracotta-400 to-terracotta-600',
  forest: 'bg-gradient-to-br from-forest-400 to-forest-600',
  ocean: 'bg-gradient-to-br from-blue-400 to-blue-600',
  amber: 'bg-gradient-to-br from-amber-400 to-amber-600',
  purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'terracotta',
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'stat-card',
        colorGradients[color],
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2 font-display">
              {value}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="text-white" size={24} />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
            {trend.isUp ? (
              <TrendingUp className="text-green-200" size={16} />
            ) : (
              <TrendingDown className="text-red-200" size={16} />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                trend.isUp ? 'text-green-200' : 'text-red-200'
              )}
            >
              {trend.isUp ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-sm text-white/60">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
