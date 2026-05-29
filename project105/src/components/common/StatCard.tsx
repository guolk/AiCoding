import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'red' | 'yellow' | 'blue' | 'green';
}

const colorClasses: Record<string, string> = {
  red: 'bg-lego-red/10 text-lego-red',
  yellow: 'bg-lego-yellow/20 text-amber-700',
  blue: 'bg-lego-blue/10 text-lego-blue',
  green: 'bg-emerald-100 text-emerald-700',
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'blue' }: StatCardProps) {
  return (
    <div className="brick-card p-5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-display font-bold text-lego-dark">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-brick ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
