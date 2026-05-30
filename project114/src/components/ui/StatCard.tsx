import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color: 'blue' | 'orange' | 'cyan' | 'green';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  orange: 'from-orange-500 to-orange-600',
  cyan: 'from-cyan-500 to-cyan-600',
  green: 'from-primary-500 to-primary-600',
};

export default function StatCard({ title, value, unit, icon: Icon, trend, trendLabel, color }: StatCardProps) {
  return (
    <div className="stat-card relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${colorClasses[color]} opacity-10 -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500`}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
              trend >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-display text-gray-800">{value}</span>
          {unit && <span className="text-sm text-gray-400">{unit}</span>}
        </div>
        {trendLabel && (
          <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}
