
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card card-hover border border-gold-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ink-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-ink-600 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trendUp ? 'text-emerald-500' : 'text-ruby-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
