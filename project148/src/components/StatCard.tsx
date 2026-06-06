import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  } | string;
  status?: 'normal' | 'warning' | 'danger';
  description?: string;
}

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  status = 'normal',
  description,
}: StatCardProps) {
  const statusColors = {
    normal: 'from-reef-500 to-reef-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
  };

  const valueColors = {
    normal: 'text-gray-900',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={`text-2xl font-bold font-mono ${valueColors[status]}`}
            >
              {value}
            </span>
            {unit && <span className="text-sm text-gray-400">{unit}</span>}
          </div>
          {trend && typeof trend === 'string' ? (
            <p className="mt-1 text-xs text-gray-500">{trend}</p>
          ) : trend && typeof trend === 'object' ? (
            <div
              className={`mt-1 flex items-center text-xs ${
                trend.isUp ? 'text-reef-600' : 'text-coral-600'
              }`}
            >
              <span>{trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-gray-400 ml-1">较上周</span>
            </div>
          ) : null}
          {description && (
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${statusColors[status]}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
