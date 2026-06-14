import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  change: number;
  label: string;
  gradient: string;
  className?: string;
}

export default function StatCard({
  icon: Icon,
  value,
  change,
  label,
  gradient,
  className,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow',
        className,
      )}
    >
      {/* 顶部：图标 + 环比 */}
      <div className="flex items-start justify-between">
        {/* 渐变背景图标 */}
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
            gradient,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* 环比百分比 */}
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium',
            isPositive
              ? 'bg-green-50 text-[#00B42A]'
              : 'bg-red-50 text-[#F53F3F]',
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      {/* 底部：数值 + 标签 */}
      <div className="flex flex-col gap-1">
        <p className="text-[28px] font-bold text-gray-900 leading-tight">
          {value}
        </p>
        <p className="text-[13px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}
