import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  trend?: string;
}

const colorStyles = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-green-600',
  orange: 'from-orange-500 to-amber-600',
  purple: 'from-violet-500 to-purple-600',
  red: 'from-red-500 to-rose-600',
};

const bgStyles = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-violet-50 text-violet-600',
  red: 'bg-red-50 text-red-600',
};

export function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {trend && (
            <p className={cn("text-sm mt-2 font-medium", trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-500')}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", bgStyles[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className={cn("h-1 rounded-full mt-4 bg-gradient-to-r", colorStyles[color])} />
    </div>
  );
}
