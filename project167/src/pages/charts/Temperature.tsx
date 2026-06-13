import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { Line } from 'react-chartjs-2';
import { chartOptions, chartColors } from '@/utils/chartConfig';
import { getAvailableYears } from '@/utils/statistics';
import { Thermometer, TrendingUp, Calendar } from 'lucide-react';

export default function Temperature() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [year, setYear] = useState<number | 'all'>(availableYears[availableYears.length - 1] || new Date().getFullYear());

  const chartData = useMemo(() => {
    const filtered = observations.filter((o) => o.reviewStatus !== 'rejected');

    if (year === 'all') {
      const yearlyMap = new Map<number, { temps: number[]; maxes: number[]; mins: number[] }>();
      for (const obs of filtered) {
        const y = new Date(obs.datetime).getFullYear();
        const val = obs.temperature;
        if (val !== null && !isNaN(val)) {
          if (!yearlyMap.has(y)) yearlyMap.set(y, { temps: [], maxes: [], mins: [] });
          yearlyMap.get(y)!.temps.push(val);
        }
      }

      const dailyMaxMin = new Map<string, { max: number; min: number }>();
      for (const obs of filtered) {
        const date = obs.datetime.split('T')[0];
        const val = obs.temperature;
        if (val !== null && !isNaN(val)) {
          if (!dailyMaxMin.has(date)) dailyMaxMin.set(date, { max: -Infinity, min: Infinity });
          const d = dailyMaxMin.get(date)!;
          if (val > d.max) d.max = val;
          if (val < d.min) d.min = val;
        }
      }

      for (const [date, { max, min }] of dailyMaxMin) {
        const y = parseInt(date.substring(0, 4));
        if (yearlyMap.has(y)) {
          yearlyMap.get(y)!.maxes.push(max);
          yearlyMap.get(y)!.mins.push(min);
        }
      }

      const labels = Array.from(yearlyMap.keys()).sort();
      const avgValues = labels.map((y) => {
        const data = yearlyMap.get(y)!;
        return data.temps.length > 0 ? data.temps.reduce((s, v) => s + v, 0) / data.temps.length : NaN;
      });
      const maxValues = labels.map((y) => {
        const data = yearlyMap.get(y)!;
        return data.maxes.length > 0 ? Math.max(...data.maxes) : NaN;
      });
      const minValues = labels.map((y) => {
        const data = yearlyMap.get(y)!;
        return data.mins.length > 0 ? Math.min(...data.mins) : NaN;
      });

      return {
        labels: labels.map((y) => `${y}年`),
        datasets: [
          {
            label: '平均气温(°C)',
            data: avgValues,
            borderColor: chartColors.avgTemp.border,
            backgroundColor: chartColors.avgTemp.background,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: '最高气温(°C)',
            data: maxValues,
            borderColor: chartColors.maxTemp.border,
            backgroundColor: chartColors.maxTemp.background,
            fill: false,
            tension: 0.3,
            borderDash: [5, 5],
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: '最低气温(°C)',
            data: minValues,
            borderColor: chartColors.minTemp.border,
            backgroundColor: chartColors.minTemp.background,
            fill: false,
            tension: 0.3,
            borderDash: [5, 5],
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      };
    } else {
      const dailyMap = new Map<string, { temps: number[]; max: number; min: number }>();
      const yearData = filtered.filter((o) => new Date(o.datetime).getFullYear() === year);

      for (const obs of yearData) {
        const date = obs.datetime.split('T')[0];
        const val = obs.temperature;
        if (val !== null && !isNaN(val)) {
          if (!dailyMap.has(date)) dailyMap.set(date, { temps: [], max: -Infinity, min: Infinity });
          const d = dailyMap.get(date)!;
          d.temps.push(val);
          if (val > d.max) d.max = val;
          if (val < d.min) d.min = val;
        }
      }

      const labels = Array.from(dailyMap.keys()).sort();
      const avgValues = labels.map((date) => {
        const d = dailyMap.get(date)!;
        return d.temps.length > 0 ? d.temps.reduce((s, v) => s + v, 0) / d.temps.length : NaN;
      });
      const maxValues = labels.map((date) => dailyMap.get(date)!.max);
      const minValues = labels.map((date) => dailyMap.get(date)!.min);

      return {
        labels: labels.map((l) => l.substring(5)),
        datasets: [
          {
            label: '日平均气温(°C)',
            data: avgValues,
            borderColor: chartColors.avgTemp.border,
            backgroundColor: chartColors.avgTemp.background,
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
          },
          {
            label: '日最高气温(°C)',
            data: maxValues,
            borderColor: chartColors.maxTemp.border,
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.3,
            pointRadius: 1.5,
            pointHoverRadius: 4,
          },
          {
            label: '日最低气温(°C)',
            data: minValues,
            borderColor: chartColors.minTemp.border,
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.3,
            pointRadius: 1.5,
            pointHoverRadius: 4,
          },
        ],
      };
    }
  }, [observations, year]);

  const stats = useMemo(() => {
    const filtered = observations.filter((o) => o.reviewStatus !== 'rejected');
    const targetData = year === 'all'
      ? filtered
      : filtered.filter((o) => new Date(o.datetime).getFullYear() === year);

    const temps = targetData
      .map((o) => o.temperature)
      .filter((v): v is number => v !== null && !isNaN(v));

    if (temps.length === 0) {
      return { avg: NaN, max: NaN, min: NaN, range: NaN };
    }

    const avg = temps.reduce((s, v) => s + v, 0) / temps.length;
    const max = Math.max(...temps);
    const min = Math.min(...temps);

    return { avg, max, min, range: max - min };
  }, [observations, year]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">气温折线图</h1>
        <p className="text-slate-500 mt-1">气温变化趋势多尺度可视化</p>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              时间范围
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="input"
            >
              <option value="all">全部年份（年度统计）</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}年（日变化）</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-orange-500 to-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">平均气温</p>
              <p className="text-white text-2xl font-bold mt-1">
                {isNaN(stats.avg) ? '-' : stats.avg.toFixed(1)}<span className="text-sm ml-1">°C</span>
              </p>
            </div>
            <Thermometer className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-rose-500 to-rose-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm">最高气温</p>
              <p className="text-white text-2xl font-bold mt-1">
                {isNaN(stats.max) ? '-' : stats.max.toFixed(1)}<span className="text-sm ml-1">°C</span>
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-rose-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">最低气温</p>
              <p className="text-white text-2xl font-bold mt-1">
                {isNaN(stats.min) ? '-' : stats.min.toFixed(1)}<span className="text-sm ml-1">°C</span>
              </p>
            </div>
            <Thermometer className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">气温年较差</p>
              <p className="text-white text-2xl font-bold mt-1">
                {isNaN(stats.range) ? '-' : stats.range.toFixed(1)}<span className="text-sm ml-1">°C</span>
              </p>
            </div>
            <Thermometer className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {year === 'all' ? '历年气温变化趋势' : `${year}年气温日变化曲线`}
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
                    text: '气温 (°C)',
                    font: { family: '"Noto Sans SC", sans-serif' },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">图例说明</h2>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-orange-500" />
            <span className="text-sm text-slate-600">平均气温 - 实线填充区域</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-rose-500" />
            <span className="text-sm text-slate-600">最高气温 - 虚线</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-blue-500" />
            <span className="text-sm text-slate-600">最低气温 - 虚线</span>
          </div>
        </div>
      </div>
    </div>
  );
}
