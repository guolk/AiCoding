import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { calculateAllYearlyStats, calculateMonthlyStats, getAvailableYears } from '@/utils/statistics';
import { Line, Bar } from 'react-chartjs-2';
import { chartOptions, chartColors } from '@/utils/chartConfig';
import { Calendar, Thermometer, Droplets, Gauge, Wind, CloudRain, Eye } from 'lucide-react';

export default function Summary() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[availableYears.length - 1] || new Date().getFullYear());
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');

  const { monthlyStats, yearlyStats } = useMemo(() => {
    const approved = observations.filter((o) => o.reviewStatus !== 'rejected');
    const allYearly = calculateAllYearlyStats(approved);
    const selectedMonthly = [];
    for (let m = 1; m <= 12; m++) {
      selectedMonthly.push(calculateMonthlyStats(approved, selectedYear, m));
    }
    return { monthlyStats: selectedMonthly, yearlyStats: allYearly };
  }, [observations, selectedYear]);

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const tempChartData = {
    labels: monthNames,
    datasets: [
      {
        label: '平均气温(°C)',
        data: monthlyStats.map((m) => (isNaN(m.avgTemperature) ? null : m.avgTemperature.toFixed(1))),
        borderColor: chartColors.avgTemp.border,
        backgroundColor: chartColors.avgTemp.background,
        fill: true,
        tension: 0.3,
      },
      {
        label: '最高气温(°C)',
        data: monthlyStats.map((m) => (isNaN(m.maxTemperature) ? null : m.maxTemperature.toFixed(1))),
        borderColor: chartColors.maxTemp.border,
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: '最低气温(°C)',
        data: monthlyStats.map((m) => (isNaN(m.minTemperature) ? null : m.minTemperature.toFixed(1))),
        borderColor: chartColors.minTemp.border,
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const precipChartData = {
    labels: monthNames,
    datasets: [
      {
        label: '降水量(mm)',
        data: monthlyStats.map((m) => (isNaN(m.totalPrecipitation) ? 0 : m.totalPrecipitation.toFixed(1))),
        backgroundColor: chartColors.precipitation.background,
        borderColor: chartColors.precipitation.border,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const yearlyTempData = {
    labels: yearlyStats.map((y) => `${y.year}年`),
    datasets: [
      {
        label: '年平均气温(°C)',
        data: yearlyStats.map((y) => (isNaN(y.avgTemperature) ? null : y.avgTemperature.toFixed(2))),
        borderColor: chartColors.avgTemp.border,
        backgroundColor: chartColors.avgTemp.background,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const statIcons = [Thermometer, Droplets, Gauge, Wind, CloudRain, Eye];
  const statKeys = ['avgTemperature', 'avgHumidity', 'avgPressure', 'avgWindSpeed', 'totalPrecipitation', 'avgVisibility'] as const;
  const statLabels = ['平均气温', '平均湿度', '平均气压', '平均风速', '总降水量', '平均能见度'];
  const statUnits = ['°C', '%', 'hPa', 'm/s', 'mm', 'km'];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">统计摘要</h1>
          <p className="text-slate-500 mt-1">月均值和年均值自动计算</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewType === 'monthly' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-600'
              }`}
            >
              月度统计
            </button>
            <button
              onClick={() => setViewType('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewType === 'yearly' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-600'
              }`}
            >
              年度统计
            </button>
          </div>
          {viewType === 'monthly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input w-auto"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {viewType === 'monthly' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statKeys.map((key, idx) => {
              const Icon = statIcons[idx];
              const yearStats = yearlyStats.find((y) => y.year === selectedYear);
              const value = yearStats ? yearStats[key] : NaN;
              return (
                <div key={key} className="card p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <Icon className="w-4 h-4" />
                    <span>{statLabels[idx]}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {isNaN(value as number) ? '--' : (value as number).toFixed(1)}
                    <span className="text-sm font-normal text-slate-400 ml-1">{statUnits[idx]}</span>
                  </p>
                </div>
              );
            })}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">月份</th>
                    <th className="table-header">平均气温(°C)</th>
                    <th className="table-header">最高气温(°C)</th>
                    <th className="table-header">最低气温(°C)</th>
                    <th className="table-header">平均湿度(%)</th>
                    <th className="table-header">平均气压(hPa)</th>
                    <th className="table-header">平均风速(m/s)</th>
                    <th className="table-header">降水量(mm)</th>
                    <th className="table-header">能见度(km)</th>
                    <th className="table-header">观测次数</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.map((ms, idx) => (
                    <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="table-cell font-semibold text-primary-700">{monthNames[idx]}</td>
                      <td className="table-cell">{isNaN(ms.avgTemperature) ? '--' : ms.avgTemperature.toFixed(1)}</td>
                      <td className="table-cell text-danger-600">{isNaN(ms.maxTemperature) ? '--' : ms.maxTemperature.toFixed(1)}</td>
                      <td className="table-cell text-blue-600">{isNaN(ms.minTemperature) ? '--' : ms.minTemperature.toFixed(1)}</td>
                      <td className="table-cell">{isNaN(ms.avgHumidity) ? '--' : ms.avgHumidity.toFixed(0)}</td>
                      <td className="table-cell">{isNaN(ms.avgPressure) ? '--' : ms.avgPressure.toFixed(1)}</td>
                      <td className="table-cell">{isNaN(ms.avgWindSpeed) ? '--' : ms.avgWindSpeed.toFixed(1)}</td>
                      <td className="table-cell text-sky-600">{isNaN(ms.totalPrecipitation) ? '--' : ms.totalPrecipitation.toFixed(1)}</td>
                      <td className="table-cell">{isNaN(ms.avgVisibility) ? '--' : ms.avgVisibility.toFixed(1)}</td>
                      <td className="table-cell">{ms.observationCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">{selectedYear}年气温变化</h2>
              <div className="h-[320px]">
                <Line data={tempChartData} options={chartOptions} />
              </div>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">{selectedYear}年月降水量</h2>
              <div className="h-[320px]">
                <Bar data={precipChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </>
      )}

      {viewType === 'yearly' && (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">年份</th>
                    <th className="table-header">平均气温(°C)</th>
                    <th className="table-header">最高气温(°C)</th>
                    <th className="table-header">最低气温(°C)</th>
                    <th className="table-header">平均湿度(%)</th>
                    <th className="table-header">平均气压(hPa)</th>
                    <th className="table-header">平均风速(m/s)</th>
                    <th className="table-header">年降水量(mm)</th>
                    <th className="table-header">能见度(km)</th>
                    <th className="table-header">观测次数</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyStats.slice().reverse().map((ys) => (
                    <tr key={ys.year} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="table-cell font-semibold text-primary-700">{ys.year}年</td>
                      <td className="table-cell">{isNaN(ys.avgTemperature) ? '--' : ys.avgTemperature.toFixed(2)}</td>
                      <td className="table-cell text-danger-600">{isNaN(ys.maxTemperature) ? '--' : ys.maxTemperature.toFixed(1)}</td>
                      <td className="table-cell text-blue-600">{isNaN(ys.minTemperature) ? '--' : ys.minTemperature.toFixed(1)}</td>
                      <td className="table-cell">{isNaN(ys.avgHumidity) ? '--' : ys.avgHumidity.toFixed(1)}</td>
                      <td className="table-cell">{isNaN(ys.avgPressure) ? '--' : ys.avgPressure.toFixed(1)}</td>
                      <td className="table-cell">{isNaN(ys.avgWindSpeed) ? '--' : ys.avgWindSpeed.toFixed(2)}</td>
                      <td className="table-cell text-sky-600">{isNaN(ys.totalPrecipitation) ? '--' : ys.totalPrecipitation.toFixed(1)}</td>
                      <td className="table-cell">{isNaN(ys.avgVisibility) ? '--' : ys.avgVisibility.toFixed(1)}</td>
                      <td className="table-cell">{ys.observationCount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">年平均气温变化趋势</h2>
            <div className="h-[350px]">
              <Line
                data={yearlyTempData}
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
        </>
      )}
    </div>
  );
}
