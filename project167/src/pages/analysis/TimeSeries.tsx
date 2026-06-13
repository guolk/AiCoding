import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { Line } from 'react-chartjs-2';
import { chartOptions, chartColors } from '@/utils/chartConfig';
import { getAvailableYears } from '@/utils/statistics';
import type { ElementKey } from '@/types';
import { ELEMENT_LABELS, ELEMENT_UNITS } from '@/types';
import { Thermometer, Droplets, Gauge, Wind, CloudRain, Eye } from 'lucide-react';

type ScaleType = 'daily' | 'monthly' | 'yearly';

const elementIcons: Record<ElementKey, React.ElementType> = {
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Gauge,
  windSpeed: Wind,
  precipitation: CloudRain,
  visibility: Eye,
};

export default function TimeSeries() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [selectedElement, setSelectedElement] = useState<ElementKey>('temperature');
  const [scale, setScale] = useState<ScaleType>('monthly');
  const [year, setYear] = useState<number>(availableYears[availableYears.length - 1] || new Date().getFullYear());

  const chartData = useMemo(() => {
    const filtered = observations.filter((o) => o.reviewStatus !== 'rejected');

    if (scale === 'daily') {
      const dailyMap = new Map<string, number[]>();
      const yearData = filtered.filter((o) => new Date(o.datetime).getFullYear() === year);

      for (const obs of yearData) {
        const date = obs.datetime.split('T')[0];
        const val = obs[selectedElement];
        if (val !== null && !isNaN(val)) {
          if (!dailyMap.has(date)) dailyMap.set(date, []);
          dailyMap.get(date)!.push(val);
        }
      }

      const labels = Array.from(dailyMap.keys()).sort();
      const values = labels.map((date) => {
        const vals = dailyMap.get(date)!;
        if (selectedElement === 'precipitation') {
          return vals.reduce((s, v) => s + v, 0);
        }
        return vals.reduce((s, v) => s + v, 0) / vals.length;
      });

      return {
        labels,
        datasets: [{
          label: `${ELEMENT_LABELS[selectedElement]}(${ELEMENT_UNITS[selectedElement]})`,
          data: values,
          borderColor: chartColors[selectedElement].border,
          backgroundColor: chartColors[selectedElement].background,
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
        }],
      };
    } else if (scale === 'monthly') {
      const monthlyMap = new Map<string, number[]>();
      const yearData = filtered.filter((o) => new Date(o.datetime).getFullYear() === year);

      for (const obs of yearData) {
        const d = new Date(obs.datetime);
        const key = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const val = obs[selectedElement];
        if (val !== null && !isNaN(val)) {
          if (!monthlyMap.has(key)) monthlyMap.set(key, []);
          monthlyMap.get(key)!.push(val);
        }
      }

      const labels = Array.from(monthlyMap.keys()).sort();
      const values = labels.map((key) => {
        const vals = monthlyMap.get(key)!;
        if (selectedElement === 'precipitation') {
          return vals.reduce((s, v) => s + v, 0);
        }
        return vals.reduce((s, v) => s + v, 0) / vals.length;
      });

      return {
        labels: labels.map((l) => l.substring(5) + '月'),
        datasets: [{
          label: `${ELEMENT_LABELS[selectedElement]}(${ELEMENT_UNITS[selectedElement]})`,
          data: values,
          borderColor: chartColors[selectedElement].border,
          backgroundColor: chartColors[selectedElement].background,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      };
    } else {
      const yearlyMap = new Map<number, number[]>();

      for (const obs of filtered) {
        const y = new Date(obs.datetime).getFullYear();
        const val = obs[selectedElement];
        if (val !== null && !isNaN(val)) {
          if (!yearlyMap.has(y)) yearlyMap.set(y, []);
          yearlyMap.get(y)!.push(val);
        }
      }

      const labels = Array.from(yearlyMap.keys()).sort();
      const values = labels.map((y) => {
        const vals = yearlyMap.get(y)!;
        if (selectedElement === 'precipitation') {
          return vals.reduce((s, v) => s + v, 0);
        }
        return vals.reduce((s, v) => s + v, 0) / vals.length;
      });

      return {
        labels: labels.map(String),
        datasets: [{
          label: `${ELEMENT_LABELS[selectedElement]}(${ELEMENT_UNITS[selectedElement]})`,
          data: values,
          borderColor: chartColors[selectedElement].border,
          backgroundColor: chartColors[selectedElement].background,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      };
    }
  }, [observations, selectedElement, scale, year]);

  const elements: ElementKey[] = ['temperature', 'humidity', 'pressure', 'windSpeed', 'precipitation', 'visibility'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">时间序列分析</h1>
        <p className="text-slate-500 mt-1">多尺度气象要素时间变化可视化</p>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="input-label">气象要素</label>
            <div className="grid grid-cols-3 gap-2">
              {elements.map((el) => {
                const Icon = elementIcons[el];
                return (
                  <button
                    key={el}
                    onClick={() => setSelectedElement(el)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      selectedElement === el
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{ELEMENT_LABELS[el]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="input-label">时间尺度</label>
            <div className="flex gap-2">
              {[
                { key: 'daily', label: '日变化' },
                { key: 'monthly', label: '月变化' },
                { key: 'yearly', label: '年变化' },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScale(s.key as ScaleType)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    scale === s.key
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {scale !== 'yearly' && (
            <div>
              <label className="input-label">选择年份</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="input"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {scale === 'daily' && `${year}年 ${ELEMENT_LABELS[selectedElement]} 日变化`}
          {scale === 'monthly' && `${year}年 ${ELEMENT_LABELS[selectedElement]} 月变化`}
          {scale === 'yearly' && `${ELEMENT_LABELS[selectedElement]} 年际变化`}
        </h2>
        <div className="h-[400px]">
          <Line
            data={chartData}
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
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
