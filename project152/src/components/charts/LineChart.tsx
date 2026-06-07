import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Brush,
  type TooltipProps,
} from 'recharts';

export interface LineChartData {
  name: string;
  [key: string]: number | string;
}

export interface LineConfig {
  dataKey: string;
  color?: string;
  name?: string;
}

export interface LineChartProps {
  data: LineChartData[];
  lines: LineConfig[];
  showGrid?: boolean;
  showLegend?: boolean;
  showPoints?: boolean;
  areaMode?: boolean;
  zoomable?: boolean;
  tooltip?: React.ReactNode | ((props: TooltipProps<number, string>) => React.ReactNode);
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
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

export default function LineChart({
  data,
  lines,
  showGrid = true,
  showLegend = true,
  showPoints = true,
  areaMode = false,
  zoomable = false,
  tooltip,
  xAxisLabel,
  yAxisLabel,
  className,
}: LineChartProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="name"
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
          />
          <YAxis
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          {typeof tooltip === 'function' ? (
            <Tooltip content={tooltip as never} />
          ) : tooltip ? (
            <Tooltip content={tooltip as never} />
          ) : (
            <Tooltip />
          )}
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            areaMode ? (
              <Area
                key={`area-${line.dataKey}`}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                fill={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                fillOpacity={0.3}
                name={line.name || line.dataKey}
                dot={showPoints}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Line
                key={`line-${line.dataKey}`}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                strokeWidth={2}
                name={line.name || line.dataKey}
                dot={showPoints}
                activeDot={{ r: 6 }}
              />
            )
          ))}
          {zoomable && <Brush dataKey="name" height={30} stroke="#6366f1" />}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
