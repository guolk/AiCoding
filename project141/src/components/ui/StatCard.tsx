import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { getColorClass } from '../../utils/calculations';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  gradient: string;
  format?: 'currency' | 'percent' | 'number';
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel = '较昨日',
  icon: Icon,
  gradient,
}: StatCardProps) {
  return (
    <div className={`bg-surface rounded-xl p-6 border border-border card-hover relative overflow-hidden group animate-slide-up`}>
      <div className={`absolute inset-0 opacity-10 ${gradient} group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-text-muted text-sm font-medium">{title}</p>
          </div>
          <div className={`p-3 rounded-lg bg-surface-hover ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl font-bold font-mono text-text-primary">
            {typeof value === 'number' ? value.toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) : value}
          </p>
          
          {change !== undefined && (
            <div className="flex items-center gap-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-up" />
              ) : (
                <TrendingDown className="w-4 h-4 text-down" />
              )}
              <span className={`text-sm font-medium ${getColorClass(change)}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
              <span className="text-text-muted text-xs">{changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
