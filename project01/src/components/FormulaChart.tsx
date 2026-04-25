import { useRef, useEffect, useCallback } from 'react';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

interface FormulaChartProps {
  data: { x: number; y: number }[];
  animationData?: { x: number; y: number }[];
  chartType: 'line' | 'scatter' | 'bar' | 'area';
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showAnimation?: boolean;
  animationProgress?: number;
  height?: string | number;
}

function FormulaChart({
  data,
  animationData,
  chartType,
  title,
  xAxisLabel = 'x',
  yAxisLabel = 'y',
  showAnimation = false,
  animationProgress = 0,
  height = 400
}: FormulaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const prevProgressRef = useRef(0);
  const prevDataRef = useRef<{ x: number; y: number }[]>([]);

  const getOption = useCallback((): EChartsOption => {
    const series: EChartsOption['series'] = [];

    const mainSeries: EChartsOption['series'] = {
      name: '函数曲线',
      type: chartType === 'area' ? 'line' : chartType,
      data: data.map(d => [d.x, d.y]),
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 3,
        color: '#1890ff'
      },
      areaStyle: chartType === 'area' ? {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ]
        }
      } : undefined
    };

    series.push(mainSeries);

    if (showAnimation && animationData && animationData.length > 0) {
      const visibleCount = Math.max(1, Math.floor(animationData.length * animationProgress));
      const visibleData = animationData.slice(0, visibleCount);

      if (visibleData.length > 0) {
        series.push({
          name: '动画轨迹',
          type: 'line',
          data: visibleData.map(d => [d.x, d.y]),
          smooth: false,
          symbol: 'none',
          lineStyle: {
            width: 3,
            color: '#52c41a',
            opacity: 0.9
          },
          animation: false,
          progressive: false
        });

        const lastPoint = visibleData[visibleData.length - 1];
        series.push({
          name: '当前点',
          type: 'scatter',
          data: [[lastPoint.x, lastPoint.y]],
          symbol: 'circle',
          symbolSize: 14,
          itemStyle: {
            color: '#ff4d4f',
            borderColor: '#fff',
            borderWidth: 3
          },
          zlevel: 100,
          animation: false
        });
      }
    }

    return {
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 16,
          fontWeight: 600
        }
      } : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number[] }[];
          if (p && p.length > 0) {
            const x = p[0].value[0];
            const y = p[0].value[1];
            return `${xAxisLabel}: ${x.toFixed(2)}<br/>${yAxisLabel}: ${y.toFixed(4)}`;
          }
          return '';
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: xAxisLabel,
        nameLocation: 'end',
        nameGap: 10,
        nameTextStyle: {
          color: '#666',
          fontSize: 14
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel,
        nameLocation: 'end',
        nameGap: 10,
        nameTextStyle: {
          color: '#666',
          fontSize: 14
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: series,
      animation: false,
      animationDuration: 0,
      animationEasing: 'linear'
    };
  }, [data, animationData, chartType, title, xAxisLabel, yAxisLabel, showAnimation, animationProgress]);

  useEffect(() => {
    if (!chartRef.current) return;

    const initChart = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }
      chartInstanceRef.current = echarts.init(chartRef.current!);
    };

    initChart();

    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const option = getOption();
    const dataChanged = JSON.stringify(prevDataRef.current) !== JSON.stringify(data);
    const progressChanged = prevProgressRef.current !== animationProgress;

    if (dataChanged || progressChanged) {
      chartInstanceRef.current.setOption(option, {
        notMerge: false,
        lazyUpdate: false,
        replaceMerge: 'series'
      });
      prevDataRef.current = data;
      prevProgressRef.current = animationProgress;
    }
  }, [getOption, data, animationProgress]);

  return (
    <div
      ref={chartRef}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%'
      }}
    />
  );
}

export default FormulaChart;
