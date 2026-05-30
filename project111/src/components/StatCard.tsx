import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'accent';
  trend?: number;
}

const colorClasses = {
  primary: 'from-primary-50 to-primary-100 text-primary-600',
  secondary: 'from-secondary-50 to-secondary-100 text-secondary-600',
  accent: 'from-accent-50 to-accent-100 text-accent-600',
};

const iconBgClasses = {
  primary: 'bg-primary-100 text-primary-600',
  secondary: 'bg-secondary-100 text-secondary-600',
  accent: 'bg-accent-100 text-accent-600',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
}: Props) {
  return (
    <div className={`card bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-800">{value}</p>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p
              className={`text-sm font-semibold mt-2 ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% 较上周
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${iconBgClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
