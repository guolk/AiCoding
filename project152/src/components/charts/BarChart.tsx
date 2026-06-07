import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from 'recharts';

export interface BarChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface BarChartProps {
  data: BarChartData[];
  direction?: 'horizontal' | 'vertical';
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  barColor?: string;
  tooltip?: React.ReactNode | ((props: TooltipProps<number, string>) => React.ReactNode);
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  onBarClick?: (data: BarChartData, index: number) => void;
}

const DEFAULT_COLOR = '#6366f1';

export default function BarChart({
  data,
  direction = 'vertical',
  stacked = false,
  showGrid = true,
  showLegend = false,
  barColor = DEFAULT_COLOR,
  tooltip,
  xAxisLabel,
  yAxisLabel,
  className,
  onBarClick,
}: BarChartProps) {
  const isHorizontal = direction === 'horizontal';

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          {isHorizontal ? (
            <>
              <XAxis type="number" label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
              />
              <YAxis
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
            </>
          )}
          {typeof tooltip === 'function' ? (
            <Tooltip content={tooltip as never} />
          ) : tooltip ? (
            <Tooltip content={tooltip as never} />
          ) : (
            <Tooltip />
          )}
          {showLegend && <Legend />}
          <Bar
            dataKey="value"
            stackId={stacked ? 'stack' : undefined}
            onClick={(_, index) => onBarClick?.(data[index], index)}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill || barColor}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
