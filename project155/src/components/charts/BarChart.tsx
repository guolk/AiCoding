import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

// 支出偏差柱状图数据项接口
interface BarChartDataItem {
  // 分类名称
  name: string;
  // 预算金额
  budget: number;
  // 实际支出金额
  actual: number;
  // 颜色（可选）
  color?: string;
}

// 柱状图组件属性接口
interface BarChartProps {
  // 图表数据
  data: BarChartDataItem[];
  // 图表宽度
  width?: number;
  // 图表高度
  height?: number;
  // 自定义类名
  className?: string;
  // 是否显示图例
  showLegend?: boolean;
  // 是否显示提示框
  showTooltip?: boolean;
  // 是否显示网格
  showGrid?: boolean;
  // 标题
  title?: string;
  // X轴标签
  xAxisLabel?: string;
  // Y轴标签
  yAxisLabel?: string;
}

// 预算颜色
const BUDGET_COLOR = '#93C5FD';
// 实际支出颜色
const ACTUAL_COLOR = '#3B82F6';
// 偏差参考线颜色
const REFERENCE_LINE_COLOR = '#EF4444';

// 自定义提示框组件
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const budget = payload.find((p: any) => p.dataKey === 'budget')?.value || 0;
    const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
    const variance = actual - budget;
    const variancePercent = budget > 0 ? ((variance / budget) * 100).toFixed(1) : '0';
    
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-300"></span>
          预算: <span className="font-medium">¥{budget.toLocaleString()}</span>
        </p>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          实际: <span className="font-medium">¥{actual.toLocaleString()}</span>
        </p>
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className={`text-sm font-medium ${variance > 0 ? 'text-red-500' : variance < 0 ? 'text-green-500' : 'text-gray-500'}`}>
            偏差: {variance > 0 ? '+' : ''}¥{variance.toLocaleString()} ({variance > 0 ? '+' : ''}{variancePercent}%)
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// 自定义图例组件
const CustomLegend: React.FC<any> = ({ payload }) => {
  if (!payload || payload.length === 0) return null;
  
  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 600,
  height = 400,
  className,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  title,
  xAxisLabel,
  yAxisLabel,
}) => {
  // 格式化Y轴刻度为货币格式
  const formatYAxis = (value: number): string => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万`;
    }
    return value.toLocaleString();
  };

  // 计算是否超支（用于条形颜色）
  const getBarColor = (entry: BarChartDataItem, type: 'budget' | 'actual'): string => {
    if (type === 'budget') return BUDGET_COLOR;
    return entry.actual > entry.budget ? '#EF4444' : ACTUAL_COLOR;
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {title && (
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>
      )}
      <div style={{ width, height: height - (showLegend ? 40 : 0) }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            )}
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
              label={
                xAxisLabel
                  ? { value: xAxisLabel, position: 'bottom', offset: 0, style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 } }
                  : undefined
              }
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
              label={
                yAxisLabel
                  ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 } }
                  : undefined
              }
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />}
            {showLegend && <Legend content={<CustomLegend />} />}
            {/* 预算条形 */}
            <Bar
              dataKey="budget"
              name="预算"
              fill={BUDGET_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={30}
            >
              {data.map((entry, index) => (
                <Cell key={`budget-${index}`} fill={getBarColor(entry, 'budget')} />
              ))}
            </Bar>
            {/* 实际支出条形 */}
            <Bar
              dataKey="actual"
              name="实际支出"
              fill={ACTUAL_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={30}
            >
              {data.map((entry, index) => (
                <Cell key={`actual-${index}`} fill={getBarColor(entry, 'actual')} />
              ))}
            </Bar>
            {/* 预算参考线 */}
            <ReferenceLine
              y={0}
              stroke={REFERENCE_LINE_COLOR}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export { BarChart };
export type { BarChartDataItem, BarChartProps };
