import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

// 环形进度图组件属性接口
interface RingChartProps {
  // 百分比值 (0-100)
  percentage: number;
  // 图表尺寸
  size?: number;
  // 进度条颜色
  color?: string;
  // 背景轨道颜色
  trackColor?: string;
  // 进度条宽度
  strokeWidth?: number;
  // 自定义类名
  className?: string;
  // 是否显示中心文本
  showLabel?: boolean;
  // 中心自定义文本
  label?: string;
}

// 任务类型颜色映射
const TASK_TYPE_COLORS: Record<string, string> = {
  'waterproof': '#3B82F6',
  'electrical': '#10B981',
  'tiling': '#F59E0B',
  'carpentry': '#8B5CF6',
  'painting': '#EC4899',
  'soft-decoration': '#06B6D4',
};

// 默认颜色
const DEFAULT_COLOR = '#3B82F6';
const DEFAULT_TRACK_COLOR = '#E5E7EB';

const RingChart: React.FC<RingChartProps> = ({
  percentage,
  size = 200,
  color,
  trackColor = DEFAULT_TRACK_COLOR,
  strokeWidth = 12,
  className,
  showLabel = true,
  label,
}) => {
  // 确保百分比在有效范围内
  const validPercentage = Math.max(0, Math.min(100, percentage));
  
  // 图表数据
  const data = [
    { name: 'progress', value: validPercentage },
    { name: 'remaining', value: 100 - validPercentage },
  ];

  // 确定进度颜色
  const progressColor = color || DEFAULT_COLOR;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          {/* 背景轨道 */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={trackColor} />
            <Cell fill="transparent" />
          </Pie>
          {/* 进度环 */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={progressColor} />
            <Cell fill="transparent" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* 中心文本 */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">
            {label || `${Math.round(validPercentage)}%`}
          </span>
          {!label && (
            <span className="text-sm text-gray-500 mt-1">完成进度</span>
          )}
        </div>
      )}
    </div>
  );
};

export { RingChart, TASK_TYPE_COLORS };
