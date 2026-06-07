import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  type TooltipProps,
} from 'recharts';

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartData[];
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showLabel?: boolean;
  tooltip?: React.ReactNode | ((props: TooltipProps<number, string>) => React.ReactNode);
  colors?: string[];
  className?: string;
  onPieClick?: (data: PieChartData, index: number) => void;
}

const DEFAULT_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

export default function PieChart({
  data,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  showLabel = true,
  tooltip,
  colors = DEFAULT_COLORS,
  className,
  onPieClick,
}: PieChartProps) {
  const renderLabel = (entry: PieChartData & { percent: number }) => {
    return `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`;
  };

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            label={showLabel ? renderLabel : undefined}
            onClick={(_, index) => onPieClick?.(data[index], index)}
            style={{ cursor: onPieClick ? 'pointer' : 'default' }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Pie>
          {showLegend && <Legend />}
          {typeof tooltip === 'function' ? (
            <Tooltip content={tooltip as never} />
          ) : tooltip ? (
            <Tooltip content={tooltip as never} />
          ) : (
            <Tooltip />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
