import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
  type TooltipProps,
} from 'recharts';

export interface RadarChartData {
  subject: string;
  [key: string]: number | string;
}

export interface RadarSeriesConfig {
  dataKey: string;
  color?: string;
  name?: string;
}

export interface RadarChartProps {
  data: RadarChartData[];
  series: RadarSeriesConfig[];
  showLegend?: boolean;
  showGrid?: boolean;
  gridType?: 'polygon' | 'circle';
  tooltip?: React.ReactNode | ((props: TooltipProps<number, string>) => React.ReactNode);
  className?: string;
  fillOpacity?: number;
  strokeWidth?: number;
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

export default function RadarChart({
  data,
  series,
  showLegend = true,
  showGrid = true,
  gridType = 'polygon',
  tooltip,
  className,
  fillOpacity = 0.3,
  strokeWidth = 2,
}: RadarChartProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          {showGrid && <PolarGrid gridType={gridType} />}
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
          {series.map((serie, index) => (
            <Radar
              key={`radar-${serie.dataKey}`}
              name={serie.name || serie.dataKey}
              dataKey={serie.dataKey}
              stroke={serie.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              fill={serie.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              fillOpacity={fillOpacity}
              strokeWidth={strokeWidth}
            />
          ))}
          {typeof tooltip === 'function' ? (
            <Tooltip content={tooltip as never} />
          ) : tooltip ? (
            <Tooltip content={tooltip as never} />
          ) : (
            <Tooltip />
          )}
          {showLegend && <Legend />}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
