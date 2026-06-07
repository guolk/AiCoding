import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  emoji: string;
  gradient: 'warm' | 'cool' | 'pink' | 'green' | 'purple';
  subtitle?: string;
  trend?: { value: string; isPositive: boolean };
}

const gradientClasses = {
  warm: 'bg-gradient-warm',
  cool: 'bg-gradient-cool',
  pink: 'bg-gradient-pink',
  green: 'bg-gradient-green',
  purple: 'bg-gradient-purple',
};

export default function StatCard({ title, value, icon, emoji, gradient, subtitle, trend }: StatCardProps) {
  return (
    <div className={`card-gradient ${gradientClasses[gradient]} text-white animate-slide-up`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
      <p className="text-white/80 text-sm mb-1">{title}</p>
      <p className="text-3xl font-display font-bold mb-2">{value}</p>
      {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
      {trend && (
        <div className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
          trend.isPositive ? 'bg-white/20' : 'bg-red-400/30'
        }`}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
