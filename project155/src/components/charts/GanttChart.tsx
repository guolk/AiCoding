import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import { ConstructionTaskType } from '@/types';

// 甘特图任务数据项接口
interface GanttChartDataItem {
  // 任务ID
  id: string;
  // 任务名称
  name: string;
  // 任务类型
  type: ConstructionTaskType;
  // 计划开始日期 (YYYY-MM-DD)
  plannedStartDate: string;
  // 计划结束日期 (YYYY-MM-DD)
  plannedEndDate: string;
  // 实际开始日期 (YYYY-MM-DD，可选)
  actualStartDate?: string;
  // 实际结束日期 (YYYY-MM-DD，可选)
  actualEndDate?: string;
  // 进度百分比 (0-100)
  progress: number;
}

// 甘特图组件属性接口
interface GanttChartProps {
  // 任务数据
  data: GanttChartDataItem[];
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
  // 是否显示今日参考线
  showTodayLine?: boolean;
  // 标题
  title?: string;
}

// 任务类型颜色映射
const TASK_TYPE_COLORS: Record<ConstructionTaskType, string> = {
  'waterproof': '#3B82F6',
  'electrical': '#10B981',
  'tiling': '#F59E0B',
  'carpentry': '#8B5CF6',
  'painting': '#EC4899',
  'soft-decoration': '#06B6D4',
};

// 任务类型中文名称映射
const TASK_TYPE_NAMES: Record<ConstructionTaskType, string> = {
  'waterproof': '防水工程',
  'electrical': '电气工程',
  'tiling': '贴砖工程',
  'carpentry': '木工工程',
  'painting': '油漆工程',
  'soft-decoration': '软装工程',
};

// 计算两个日期之间的天数差
const getDaysDiff = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// 格式化日期显示
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 自定义提示框组件
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const taskType = TASK_TYPE_NAMES[data.type] || data.type;
    
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200 min-w-[240px]">
        <p className="text-sm font-semibold text-gray-800 mb-2">{data.name}</p>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: TASK_TYPE_COLORS[data.type] || '#6B7280' }}
          />
          <span className="text-xs text-gray-500">{taskType}</span>
        </div>
        <div className="space-y-1 mt-2">
          <p className="text-xs text-gray-600">
            <span className="font-medium">计划时间:</span> {formatDate(data.plannedStartDate)} - {formatDate(data.plannedEndDate)}
          </p>
          {data.actualStartDate && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">实际时间:</span> {formatDate(data.actualStartDate)}
              {data.actualEndDate ? ` - ${formatDate(data.actualEndDate)}` : ' (进行中)'}
            </p>
          )}
          <p className="text-xs text-gray-600">
            <span className="font-medium">完成进度:</span> {data.progress}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// 自定义图例组件
const CustomLegend: React.FC<any> = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-2 rounded-sm bg-gray-300 opacity-50" />
        <span className="text-sm text-gray-600">计划时间</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: '#3B82F6' }} />
        <span className="text-sm text-gray-600">实际时间</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full border-2 border-dashed border-red-400" />
        <span className="text-sm text-gray-600">今日</span>
      </div>
    </div>
  );
};

const GanttChart: React.FC<GanttChartProps> = ({
  data,
  width = 800,
  height = 500,
  className,
  showLegend = true,
  showTooltip = true,
  showTodayLine = true,
  title,
}) => {
  // 处理图表数据，转换为Recharts格式
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // 找出所有日期中的最小和最大日期
    const allDates = data.flatMap(task => [
      task.plannedStartDate,
      task.plannedEndDate,
      task.actualStartDate,
      task.actualEndDate,
    ]).filter(Boolean) as string[];
    
    const minDate = allDates.reduce((min, date) => 
      new Date(date) < new Date(min) ? date : min, allDates[0]);
    const maxDate = allDates.reduce((max, date) => 
      new Date(date) > new Date(max) ? date : max, allDates[0]);
    
    // 扩展日期范围，留出边距
    const startDate = new Date(minDate);
    startDate.setDate(startDate.getDate() - 2);
    const endDate = new Date(maxDate);
    endDate.setDate(endDate.getDate() + 2);
    
    const totalDays = getDaysDiff(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);

    // 为每个任务计算甘特图条的位置和长度
    return data.map(task => {
      const plannedStart = getDaysDiff(startDate.toISOString().split('T')[0], task.plannedStartDate);
      const plannedDuration = getDaysDiff(task.plannedStartDate, task.plannedEndDate) + 1;
      
      let actualStart = 0;
      let actualDuration = 0;
      
      if (task.actualStartDate) {
        actualStart = getDaysDiff(startDate.toISOString().split('T')[0], task.actualStartDate);
        const end = task.actualEndDate || new Date().toISOString().split('T')[0];
        actualDuration = getDaysDiff(task.actualStartDate, end) + 1;
      }

      return {
        ...task,
        plannedStart,
        plannedDuration,
        actualStart,
        actualDuration,
        empty: plannedStart,
        actualEmpty: actualStart,
      };
    });
  }, [data]);

  // 计算X轴刻度
  const xAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const allDates = data.flatMap(task => [
      task.plannedStartDate,
      task.plannedEndDate,
      task.actualStartDate,
      task.actualEndDate,
    ]).filter(Boolean) as string[];
    
    const minDate = allDates.reduce((min, date) => 
      new Date(date) < new Date(min) ? date : min, allDates[0]);
    const startDate = new Date(minDate);
    startDate.setDate(startDate.getDate() - 2);
    const maxDate = allDates.reduce((max, date) => 
      new Date(date) > new Date(max) ? date : max, allDates[0]);
    const endDate = new Date(maxDate);
    endDate.setDate(endDate.getDate() + 2);
    
    const ticks: { value: number; label: string }[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayNum = getDaysDiff(startDate.toISOString().split('T')[0], currentDate.toISOString().split('T')[0]);
      // 每隔5天显示一个刻度
      if (dayNum % 5 === 0) {
        ticks.push({
          value: dayNum,
          label: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return ticks;
  }, [chartData, data]);

  // 计算今日位置
  const todayPosition = useMemo(() => {
    if (!showTodayLine || chartData.length === 0) return null;
    
    const allDates = data.flatMap(task => [
      task.plannedStartDate,
      task.plannedEndDate,
    ]);
    const minDate = allDates.reduce((min, date) => 
      new Date(date) < new Date(min) ? date : min, allDates[0]);
    const startDate = new Date(minDate);
    startDate.setDate(startDate.getDate() - 2);
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return getDaysDiff(startDate.toISOString().split('T')[0], todayStr);
  }, [showTodayLine, chartData, data]);

  // 获取任务颜色
  const getTaskColor = (type: ConstructionTaskType): string => {
    return TASK_TYPE_COLORS[type] || '#6B7280';
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {title && (
        <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h4>
      )}
      
      {/* 任务类型图例 */}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {Object.entries(TASK_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-600">{TASK_TYPE_NAMES[type as ConstructionTaskType]}</span>
          </div>
        ))}
      </div>

      <div style={{ width, height: height - (showLegend ? 80 : 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={true} />
            
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              tick={{ fontSize: 12, fill: '#374151' }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={false}
            />
            
            <XAxis
              type="number"
              domain={[0, 'auto']}
              ticks={xAxisTicks.map(t => t.value)}
              tickFormatter={(value) => {
                const tick = xAxisTicks.find(t => t.value === value);
                return tick ? tick.label : '';
              }}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />

            {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />}
            
            {showLegend && <Legend content={<CustomLegend />} />}

            {/* 今日参考线 */}
            {todayPosition !== null && (
              <ReferenceLine
                x={todayPosition}
                stroke="#EF4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: '今日',
                  position: 'top',
                  fill: '#EF4444',
                  fontSize: 11,
                }}
              />
            )}

            {/* 计划时间段（灰色背景） */}
            <Bar
              dataKey="empty"
              stackId="a"
              fill="transparent"
              barSize={20}
            />
            <Bar
              dataKey="plannedDuration"
              stackId="a"
              name="计划时间"
              fill="#D1D5DB"
              opacity={0.4}
              radius={[0, 2, 2, 0]}
              barSize={20}
            />

            {/* 实际时间段 */}
            <Bar
              dataKey="actualEmpty"
              stackId="b"
              fill="transparent"
              barSize={14}
            />
            <Bar
              dataKey="actualDuration"
              stackId="b"
              name="实际时间"
              radius={[0, 2, 2, 0]}
              barSize={14}
            >
              {chartData.map((entry, index) => (
                <Cell key={`actual-${index}`} fill={getTaskColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export { GanttChart, TASK_TYPE_COLORS, TASK_TYPE_NAMES };
export type { GanttChartDataItem, GanttChartProps };
