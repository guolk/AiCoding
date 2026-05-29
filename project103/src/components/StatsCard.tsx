import React from 'react';
import { Clock, Target, Trophy, TrendingUp, BookOpen } from 'lucide-react';

interface StatsCardProps {
  type: 'time' | 'accuracy' | 'completed' | 'streak';
  value: number | string;
  label: string;
  subtitle?: string;
  progress?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  type,
  value,
  label,
  subtitle,
  progress = 100,
}) => {
  const configs = {
    time: {
      icon: <Clock className="w-6 h-6" />,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    accuracy: {
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    completed: {
      icon: <Trophy className="w-6 h-6" />,
      gradient: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
    },
    streak: {
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
  };

  const config = configs[type];

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} text-white flex items-center justify-center shadow-md`}>
          {config.icon}
        </div>
      </div>
      
      <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

interface ChartItem {
  name: string;
  value: number;
}

interface ProgressChartProps {
  title: string;
  data: ChartItem[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ title, data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <BookOpen className="w-5 h-5 text-gray-400" />
      </div>
      <div className="relative h-40">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gray-100 rounded-t-lg flex-1 relative overflow-hidden"
                style={{ minHeight: '4px' }}
              >
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-[#1E3A5F] to-[#2d4f7a] rounded-t-lg transition-all duration-500"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
