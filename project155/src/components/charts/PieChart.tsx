import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

// 预算饼图数据项接口
interface PieChartDataItem {
  // 分类名称
  name: string;
  // 数值
  value: number;
  // 颜色（可选）
  color?: string;
}

// 饼图组件属性接口
interface PieChartProps {
  // 图表数据
  data: PieChartDataItem[];
  // 图表尺寸
  width?: number;
  height?: number;
  // 内半径
  innerRadius?: number;
  // 外半径
  outerRadius?: number;
  // 自定义类名
  className?: string;
  // 是否显示图例
  showLegend?: boolean;
  // 是否显示提示框
  showTooltip?: boolean;
  // 标题
  title?: string;
}

// 预算分类颜色映射
const BUDGET_CATEGORY_COLORS: Record<string, string> = {
  '硬装': '#3B82F6',
  '软装': '#10B981',
  '家具': '#F59E0B',
  '家电': '#8B5CF6',
  '装饰': '#EC4899',
};

// 默认颜色调色板
const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
  '#EF4444',
];

// 自定义提示框组件
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-800">{item.name}</p>
        <p className="text-sm text-gray-600">
          金额: <span className="font-semibold">¥{item.value.toLocaleString()}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          占比: {item.percent ? `${(item.percent * 100).toFixed(1)}%` : 'N/A'}
        </p>
      </div>
    );
  }
  return null;
};

// 自定义图例组件
const CustomLegend: React.FC<any> = ({ payload }) => {
  if (!payload || payload.length === 0) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const PieChart: React.FC<PieChartProps> = ({
  data,
  width = 400,
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  className,
  showLegend = true,
  showTooltip = true,
  title,
}) => {
  // 获取数据项颜色
  const getColor = (item: PieChartDataItem, index: number): string => {
    if (item.color) return item.color;
    return BUDGET_CATEGORY_COLORS[item.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  // 计算总值
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {title && (
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>
      )}
      <div className="relative" style={{ width, height: height - (showLegend ? 40 : 0) }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
        {/* 中心文本 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm text-gray-500">总预算</span>
          <span className="text-xl font-bold text-gray-800">
            ¥{totalValue.toLocaleString()}
          </span>
        </div>
      </div>
      {showLegend && <Legend content={<CustomLegend />} />}
    </div>
  );
};

export { PieChart, BUDGET_CATEGORY_COLORS, DEFAULT_COLORS };
export type { PieChartDataItem, PieChartProps };
