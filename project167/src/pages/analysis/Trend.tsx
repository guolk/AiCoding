import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { Line } from 'react-chartjs-2';
import { chartOptions, chartColors } from '@/utils/chartConfig';
import { getAvailableYears, linearRegression, mean, sum } from '@/utils/statistics';
import { generateTrendDescription } from '@/utils/report';
import type { ElementKey } from '@/types';
import { ELEMENT_LABELS, ELEMENT_UNITS } from '@/types';
import { Thermometer, Droplets, Gauge, Wind, CloudRain, Eye, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

const elementIcons: Record<ElementKey, React.ElementType> = {
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Gauge,
  windSpeed: Wind,
  precipitation: CloudRain,
  visibility: Eye,
};

export default function Trend() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [selectedElement, setSelectedElement] = useState<ElementKey>('temperature');

  const { trendData, trend, description } = useMemo(() => {
    const approved = observations.filter((o) => o.reviewStatus !== 'rejected');

    const yearlyMap = new Map<number, number[]>();
    for (const obs of approved) {
      const year = new Date(obs.datetime).getFullYear();
      const val = obs[selectedElement];
      if (val !== null && !isNaN(val)) {
        if (!yearlyMap.has(year)) yearlyMap.set(year, []);
        yearlyMap.get(year)!.push(val);
      }
    }

    const years = Array.from(yearlyMap.keys()).sort();
    const values = years.map((y) => {
      const vals = yearlyMap.get(y)!;
      if (selectedElement === 'precipitation') {
        return sum(vals);
      }
      return mean(vals);
    });

    const x = years.map((y, i) => i);
    const trend = linearRegression(x, values);

    const trendLine = x.map((xi) => trend.slope * xi + trend.intercept);

    const data = {
      labels: years.map(String),
      datasets: [
        {
          type: 'line' as const,
          label: `${ELEMENT_LABELS[selectedElement]}年值`,
          data: values,
          borderColor: chartColors[selectedElement].border,
          backgroundColor: chartColors[selectedElement].background,
          fill: false,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: chartColors[selectedElement].border,
        },
        {
          type: 'line' as const,
          label: '线性趋势',
          data: trendLine,
          borderColor: '#dc2626',
          borderDash: [8, 4],
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
      ],
    };

    const description = generateTrendDescription(trend, selectedElement, years);

    return { trendData: data, trend, description };
  }, [observations, selectedElement]);

  const elements: ElementKey[] = ['temperature', 'humidity', 'pressure', 'windSpeed', 'precipitation', 'visibility'];

  const getTrendDirection = () => {
    if (trend.slope > 0.01) return { icon: TrendingUp, color: 'text-danger-600', label: '上升趋势' };
    if (trend.slope < -0.01) return { icon: TrendingDown, color: 'text-blue-600', label: '下降趋势' };
    return { icon: Minus, color: 'text-slate-500', label: '基本平稳' };
  };

  const TrendIcon = getTrendDirection().icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">气候倾向率分析</h1>
        <p className="text-slate-500 mt-1">各气象要素长期变化趋势与线性拟合</p>
      </div>

      <div className="card p-4">
        <label className="input-label">选择气象要素</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {elements.map((el) => {
            const Icon = elementIcons[el];
            return (
              <button
                key={el}
                onClick={() => setSelectedElement(el)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedElement === el
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{ELEMENT_LABELS[el]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">气候倾向率</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {trend.trendPerDecade.toFixed(3)}
            <span className="text-sm font-normal text-slate-500 ml-1">
              {ELEMENT_UNITS[selectedElement]}/10年
            </span>
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">趋势方向</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendIcon className={`w-6 h-6 ${getTrendDirection().color}`} />
            <span className={`text-xl font-bold ${getTrendDirection().color}`}>
              {getTrendDirection().label}
            </span>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">拟合优度 R²</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{trend.rSquared.toFixed(3)}</p>
          <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-accent-500 rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, trend.rSquared * 100))}%` }}
            />
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">回归斜率</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {trend.slope.toFixed(4)}
            <span className="text-sm font-normal text-slate-500 ml-1">
              {ELEMENT_UNITS[selectedElement]}/年
            </span>
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {ELEMENT_LABELS[selectedElement]} 年际变化趋势图
        </h2>
        <div className="h-[400px]">
          <Line
            data={trendData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  title: {
                    display: true,
                    text: ELEMENT_UNITS[selectedElement],
                    font: { family: '"Noto Sans SC", sans-serif' },
                  },
                },
                x: {
                  ...chartOptions.scales.x,
                  title: {
                    display: true,
                    text: '年份',
                    font: { family: '"Noto Sans SC", sans-serif' },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="card p-6 border-l-4 border-primary-500">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">趋势分析</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-2">线性回归方程</p>
              <p className="font-mono text-slate-700">
                y = {trend.slope.toFixed(4)}x + {trend.intercept.toFixed(4)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                其中 x 为年份序号（{availableYears[0]}年=0, {availableYears[availableYears.length - 1]}年={availableYears.length - 1}），y 为 {ELEMENT_LABELS[selectedElement]} 预测值
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
