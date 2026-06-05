import { cn } from '../../utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-accent-500 to-accent-600',
  purple: 'from-purple-500 to-purple-600',
};

export default function StatCard({ title, value, change, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="font-display text-3xl font-bold text-slate-800">{value}</p>
          {change !== undefined && (
            <p className={cn(
              'text-sm mt-2 flex items-center gap-1',
              change >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              <span className="text-slate-400 ml-1">vs 上周</span>
            </p>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg',
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
