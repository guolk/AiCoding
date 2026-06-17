import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardColor = 'forest' | 'lake' | 'earth' | 'sun';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string | number;
  trendUp?: boolean;
  color?: StatCardColor;
}

const colorMap: Record<StatCardColor, { bg: string; text: string }> = {
  forest: { bg: 'bg-forest-100', text: 'text-forest-600' },
  lake: { bg: 'bg-lake-100', text: 'text-lake-600' },
  earth: { bg: 'bg-earth-100', text: 'text-earth-600' },
  sun: { bg: 'bg-sun-100', text: 'text-sun-600' },
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  color = 'forest',
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-5',
        'shadow-card hover:shadow-card-hover',
        'transition-all duration-300 ease-out',
        'border border-forest-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-forest-600 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-forest-800">{value}</p>

          {trend !== undefined && (
            <div className="mt-3 flex items-center gap-1.5">
              {trendUp !== undefined && (
                trendUp ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trendUp === true
                    ? 'text-green-600'
                    : trendUp === false
                    ? 'text-red-500'
                    : 'text-forest-600'
                )}
              >
                {trend}
              </span>
              <span className="text-xs text-forest-400">较上周</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            colors.bg,
            colors.text
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
