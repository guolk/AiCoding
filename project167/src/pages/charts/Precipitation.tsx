import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { Bar } from 'react-chartjs-2';
import { chartOptions, chartColors } from '@/utils/chartConfig';
import { getAvailableYears } from '@/utils/statistics';
import { CloudRain, TrendingUp, Calendar } from 'lucide-react';

export default function Precipitation() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [year, setYear] = useState<number | 'all'>(availableYears[availableYears.length - 1] || new Date().getFullYear());

  const chartData = useMemo(() => {
    const filtered = observations.filter((o) => o.reviewStatus !== 'rejected');

    if (year === 'all') {
      const yearlyMap = new Map<number, number>();
      for (const obs of filtered) {
        const y = new Date(obs.datetime).getFullYear();
        const val = obs.precipitation;
        if (val !== null && !isNaN(val)) {
          yearlyMap.set(y, (yearlyMap.get(y) || 0) + val);
        }
      }
      const labels = Array.from(yearlyMap.keys()).sort();
      const values = labels.map((y) => yearlyMap.get(y) || 0);

      return {
        labels: labels.map((y) => `${y}年`),
        datasets: [{
          label: '年降水量(mm)',
          data: values,
          backgroundColor: chartColors.precipitation.background,
          borderColor: chartColors.precipitation.border,
          borderWidth: 2,
          borderRadius: 6,
        }],
      };
    } else {
      const monthlyMap = new Map<number, number>();
      for (let m = 1; m <= 12; m++) monthlyMap.set(m, 0);

      for (const obs of filtered) {
        const d = new Date(obs.datetime);
        if (d.getFullYear() !== year) continue;
        const m = d.getMonth() + 1;
        const val = obs.precipitation;
        if (val !== null && !isNaN(val)) {
          monthlyMap.set(m, (monthlyMap.get(m) || 0) + val);
        }
      }

      const labels = Array.from(monthlyMap.keys()).sort();
      const values = labels.map((m) => monthlyMap.get(m) || 0);

      return {
        labels: labels.map((m) => `${m}月`),
        datasets: [{
          label: '月降水量(mm)',
          data: values,
          backgroundColor: values.map((v) =>
            v > 200 ? 'rgba(239, 68, 68, 0.6)' :
            v > 100 ? 'rgba(59, 130, 246, 0.6)' :
            v > 50 ? 'rgba(6, 182, 212, 0.6)' :
            'rgba(148, 163, 184, 0.4)'
          ),
          borderColor: values.map((v) =>
            v > 200 ? '#ef4444' :
            v > 100 ? '#3b82f6' :
            v > 50 ? '#06b6d4' :
            '#94a3b8'
          ),
          borderWidth: 2,
          borderRadius: 6,
        }],
      };
    }
  }, [observations, year]);

  const stats = useMemo(() => {
    const filtered = observations.filter((o) => o.reviewStatus !== 'rejected');
    const targetData = year === 'all'
      ? filtered
      : filtered.filter((o) => new Date(o.datetime).getFullYear() === year);

    const totalPrecip = targetData.reduce((sum, o) => {
      const v = o.precipitation;
      return sum + (v !== null && !isNaN(v) ? v : 0);
    }, 0);

    const rainDays = targetData.filter((o) => {
      const v = o.precipitation;
      return v !== null && !isNaN(v) && v >= 0.1;
    }).length;

    const heavyRainDays = targetData.filter((o) => {
      const v = o.precipitation;
      return v !== null && !isNaN(v) && v >= 50;
    }).length;

    const dailyMap = new Map<string, number>();
    for (const obs of targetData) {
      const date = obs.datetime.split('T')[0];
      const v = obs.precipitation;
      if (v !== null && !isNaN(v)) {
        dailyMap.set(date, (dailyMap.get(date) || 0) + v);
      }
    }
    const dailyTotals = Array.from(dailyMap.values());
    const maxDaily = dailyTotals.length > 0 ? Math.max(...dailyTotals) : 0;

    return { totalPrecip, rainDays, heavyRainDays, maxDaily };
  }, [observations, year]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">降水量柱状图</h1>
        <p className="text-slate-500 mt-1">降水量时空分布可视化分析</p>
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
                <option key={y} value={y}>{y}年（月度统计）</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">总降水量</p>
              <p className="text-white text-2xl font-bold mt-1">
                {stats.totalPrecip.toFixed(1)}<span className="text-sm ml-1">mm</span>
              </p>
            </div>
            <CloudRain className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-cyan-500 to-cyan-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">降雨日数</p>
              <p className="text-white text-2xl font-bold mt-1">
                {stats.rainDays}<span className="text-sm ml-1">天</span>
              </p>
            </div>
            <CloudRain className="w-8 h-8 text-cyan-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-rose-500 to-rose-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm">暴雨日数</p>
              <p className="text-white text-2xl font-bold mt-1">
                {stats.heavyRainDays}<span className="text-sm ml-1">天</span>
              </p>
            </div>
            <CloudRain className="w-8 h-8 text-rose-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-amber-500 to-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">最大日降水量</p>
              <p className="text-white text-2xl font-bold mt-1">
                {stats.maxDaily.toFixed(1)}<span className="text-sm ml-1">mm</span>
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-200" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {year === 'all' ? '历年降水量统计' : `${year}年月度降水量分布`}
        </h2>
        <div className="h-[400px]">
          <Bar
            data={chartData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: '降水量 (mm)',
                    font: { family: '"Noto Sans SC", sans-serif' },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">降水等级说明</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-full h-2 rounded-full bg-slate-400 mb-2" />
            <p className="font-medium text-slate-700">小雨或无雨</p>
            <p className="text-sm text-slate-500">{`< 50mm/月`}</p>
          </div>
          <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200">
            <div className="w-full h-2 rounded-full bg-cyan-500 mb-2" />
            <p className="font-medium text-slate-700">中等降水</p>
            <p className="text-sm text-slate-500">50-100mm/月</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="w-full h-2 rounded-full bg-blue-500 mb-2" />
            <p className="font-medium text-slate-700">降水充沛</p>
            <p className="text-sm text-slate-500">100-200mm/月</p>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <div className="w-full h-2 rounded-full bg-rose-500 mb-2" />
            <p className="font-medium text-slate-700">强降水</p>
            <p className="text-sm text-slate-500">{`> 200mm/月`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
