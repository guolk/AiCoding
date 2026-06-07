import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red';
  delay?: number;
}

const colorClasses = {
  blue: 'before:bg-primary-500 text-primary-400',
  green: 'before:bg-success-500 text-success-500',
  yellow: 'before:bg-warning-500 text-warning-500',
  red: 'before:bg-danger-500 text-danger-500',
};

export function StatCard({
  title,
  value,
  change,
  changeLabel = '较上期',
  icon: Icon,
  color,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn('stat-card', colorClasses[color])}
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        animation: `fadeInUp 0.6s ease-out ${delay}ms forwards`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold font-mono text-white animate-count-up">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp size={14} className="text-success-500" />
              ) : (
                <TrendingDown size={14} className="text-danger-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  change >= 0 ? 'text-success-500' : 'text-danger-500'
                )}
              >
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
              <span className="text-xs text-gray-500">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-dark-700/50">
          <Icon size={24} className={colorClasses[color].split(' ')[1]} />
        </div>
      </div>
    </div>
  );
}
