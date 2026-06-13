import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { Chart } from 'react-chartjs-2';
import { chartOptions, chartColors } from '@/utils/chartConfig';
import { getAvailableYears, calculateClimateNormals } from '@/utils/statistics';
import { Thermometer, CloudRain, Calendar } from 'lucide-react';

export default function DualAxis() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [year, setYear] = useState<number>(availableYears[availableYears.length - 1] || new Date().getFullYear());

  const chartData = useMemo(() => {
    const filtered = observations.filter((o) => o.reviewStatus !== 'rejected');
    const yearData = filtered.filter((o) => new Date(o.datetime).getFullYear() === year);

    const monthlyTemp = new Map<number, number[]>();
    const monthlyPrecip = new Map<number, number>();
    for (let m = 1; m <= 12; m++) {
      monthlyTemp.set(m, []);
      monthlyPrecip.set(m, 0);
    }

    for (const obs of yearData) {
      const d = new Date(obs.datetime);
      const m = d.getMonth() + 1;
      const temp = obs.temperature;
      const precip = obs.precipitation;
      if (temp !== null && !isNaN(temp)) {
        monthlyTemp.get(m)!.push(temp);
      }
      if (precip !== null && !isNaN(precip)) {
        monthlyPrecip.set(m, (monthlyPrecip.get(m) || 0) + precip);
      }
    }

    const labels = Array.from(monthlyTemp.keys()).sort();
    const tempValues = labels.map((m) => {
      const temps = monthlyTemp.get(m)!;
      return temps.length > 0 ? temps.reduce((s, v) => s + v, 0) / temps.length : NaN;
    });
    const precipValues = labels.map((m) => monthlyPrecip.get(m) || 0);

    return {
      labels: labels.map((m) => `${m}月`),
      datasets: [
        {
          type: 'bar' as const,
          label: '月降水量(mm)',
          data: precipValues,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: chartColors.precipitation.border,
          borderWidth: 2,
          borderRadius: 6,
          yAxisID: 'y1',
          order: 2,
        },
        {
          type: 'line' as const,
          label: '月平均气温(°C)',
          data: tempValues,
          borderColor: chartColors.temperature.border,
          backgroundColor: chartColors.temperature.background,
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2,
          yAxisID: 'y',
          order: 1,
        },
      ],
    };
  }, [observations, year]);

  const stats = useMemo(() => {
    const filtered = observations.filter((o) => o.reviewStatus !== 'rejected');
    const yearData = filtered.filter((o) => new Date(o.datetime).getFullYear() === year);

    const temps = yearData
      .map((o) => o.temperature)
      .filter((v): v is number => v !== null && !isNaN(v));
    const precips = yearData
      .map((o) => o.precipitation)
      .filter((v): v is number => v !== null && !isNaN(v));

    const avgTemp = temps.length > 0 ? temps.reduce((s, v) => s + v, 0) / temps.length : NaN;
    const totalPrecip = precips.reduce((s, v) => s + v, 0);

    const rainDays = yearData.filter((o) => {
      const v = o.precipitation;
      return v !== null && !isNaN(v) && v >= 0.1;
    }).length;

    let maxTempMonth = 0, maxTemp = -Infinity;
    let minTempMonth = 0, minTemp = Infinity;
    let maxPrecipMonth = 0, maxPrecip = -1;

    for (let m = 1; m <= 12; m++) {
      const monthData = yearData.filter((o) => new Date(o.datetime).getMonth() + 1 === m);
      const mTemps = monthData
        .map((o) => o.temperature)
        .filter((v): v is number => v !== null && !isNaN(v));
      const mPrecips = monthData
        .map((o) => o.precipitation)
        .filter((v): v is number => v !== null && !isNaN(v));

      if (mTemps.length > 0) {
        const avg = mTemps.reduce((s, v) => s + v, 0) / mTemps.length;
        if (avg > maxTemp) { maxTemp = avg; maxTempMonth = m; }
        if (avg < minTemp) { minTemp = avg; minTempMonth = m; }
      }
      const totalP = mPrecips.reduce((s, v) => s + v, 0);
      if (totalP > maxPrecip) { maxPrecip = totalP; maxPrecipMonth = m; }
    }

    return { avgTemp, totalPrecip, rainDays, maxTempMonth, maxTemp, minTempMonth, minTemp, maxPrecipMonth, maxPrecip };
  }, [observations, year]);

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">温降双轴图</h1>
        <p className="text-slate-500 mt-1">气温与降水同期对比可视化分析</p>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              选择年份
            </label>
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
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-orange-500 to-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">年平均气温</p>
              <p className="text-white text-2xl font-bold mt-1">
                {isNaN(stats.avgTemp) ? '-' : stats.avgTemp.toFixed(1)}<span className="text-sm ml-1">°C</span>
              </p>
            </div>
            <Thermometer className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">年降水量</p>
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
              <p className="text-rose-100 text-sm">最热月份</p>
              <p className="text-white text-2xl font-bold mt-1">
                {stats.maxTempMonth > 0 ? monthNames[stats.maxTempMonth - 1] : '-'}
                <span className="text-sm ml-1">({stats.maxTemp > -Infinity ? stats.maxTemp.toFixed(1) : '-'}°C)</span>
              </p>
            </div>
            <Thermometer className="w-8 h-8 text-rose-200" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {year}年 气温-降水同期对比
        </h2>
        <div className="h-[450px]">
          <Chart
            type="bar"
            data={chartData}
            options={{
              ...chartOptions,
              scales: {
                x: chartOptions.scales.x,
                y: {
                  type: 'linear' as const,
                  display: true,
                  position: 'left' as const,
                  title: {
                    display: true,
                    text: '气温 (°C)',
                    font: { family: '"Noto Sans SC", sans-serif', size: 12, weight: 'bold' as const },
                    color: '#f97316',
                  },
                  ticks: {
                    color: '#f97316',
                    font: { family: '"Noto Sans SC", sans-serif', size: 11 },
                  },
                  grid: { color: 'rgba(249, 115, 22, 0.1)' },
                },
                y1: {
                  type: 'linear' as const,
                  display: true,
                  position: 'right' as const,
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: '降水量 (mm)',
                    font: { family: '"Noto Sans SC", sans-serif', size: 12, weight: 'bold' as const },
                    color: '#3b82f6',
                  },
                  ticks: {
                    color: '#3b82f6',
                    font: { family: '"Noto Sans SC", sans-serif', size: 11 },
                  },
                  grid: { drawOnChartArea: false },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-600">最冷月</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {stats.minTempMonth > 0 ? monthNames[stats.minTempMonth - 1] : '-'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            平均气温 {stats.minTemp < Infinity ? stats.minTemp.toFixed(1) : '-'}°C
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-sm text-slate-600">最热月</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {stats.maxTempMonth > 0 ? monthNames[stats.maxTempMonth - 1] : '-'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            平均气温 {stats.maxTemp > -Infinity ? stats.maxTemp.toFixed(1) : '-'}°C
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-600">降水最多月</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {stats.maxPrecipMonth > 0 ? monthNames[stats.maxPrecipMonth - 1] : '-'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            降水量 {stats.maxPrecip >= 0 ? stats.maxPrecip.toFixed(1) : '-'}mm
          </p>
        </div>
      </div>
    </div>
  );
}
