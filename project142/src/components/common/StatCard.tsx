import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  delay?: number;
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-orange-500',
  red: 'from-rose-500 to-red-500',
  purple: 'from-violet-500 to-purple-600'
};

const bgColorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-rose-50 text-rose-600',
  purple: 'bg-violet-50 text-violet-600'
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = 'blue', delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <motion.p 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
            className="text-3xl font-bold text-slate-800 mt-2 tracking-tight"
          >
            {value}
          </motion.p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-400 font-normal">较上月</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg shadow-opacity-20',
          colorMap[color]
        )}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      
      <div className={cn(
        'mt-4 h-1 rounded-full overflow-hidden',
        bgColorMap[color].split(' ')[0]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60%' }}
          transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', colorMap[color])}
        />
      </div>
    </motion.div>
  );
};

export default StatCard;
