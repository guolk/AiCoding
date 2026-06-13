import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { calculateClimateNormals, getAvailableYears } from '@/utils/statistics';
import { Bar, Line } from 'react-chartjs-2';
import { chartOptions, chartColors } from '@/utils/chartConfig';
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

export default function Anomaly() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [selectedElement, setSelectedElement] = useState<ElementKey>('temperature');
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[availableYears.length - 1] || new Date().getFullYear());

  const { normals, anomalies, chartData } = useMemo(() => {
    const approved = observations.filter((o) => o.reviewStatus !== 'rejected');

    const baselineEnd = availableYears[Math.floor(availableYears.length / 2)] || selectedYear - 5;
    const baselineStart = baselineEnd - 10;
    const normals = calculateClimateNormals(approved, Math.max(availableYears[0], baselineStart), baselineEnd);

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    const anomalies = normals.map((normal, idx) => {
      const month = idx + 1;
      const monthData = approved.filter((o) => {
        const d = new Date(o.datetime);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === month;
      });

      if (monthData.length === 0) return null;

      const values = monthData.map((o) => o[selectedElement]).filter((v): v is number => v !== null && !isNaN(v));
      if (values.length === 0) return null;

      let currentValue: number;
      let baselineValue: number;

      if (selectedElement === 'precipitation') {
        currentValue = values.reduce((s, v) => s + v, 0);
        baselineValue = normal.totalPrecipitation;
      } else if (selectedElement === 'temperature') {
        currentValue = values.reduce((s, v) => s + v, 0) / values.length;
        baselineValue = normal.avgTemperature;
      } else if (selectedElement === 'humidity') {
        currentValue = values.reduce((s, v) => s + v, 0) / values.length;
        baselineValue = normal.avgHumidity;
      } else if (selectedElement === 'pressure') {
        currentValue = values.reduce((s, v) => s + v, 0) / values.length;
        baselineValue = normal.avgPressure;
      } else if (selectedElement === 'visibility') {
        currentValue = values.reduce((s, v) => s + v, 0) / values.length;
        baselineValue = normal.avgVisibility;
      } else {
        currentValue = values.reduce((s, v) => s + v, 0) / values.length;
        baselineValue = normal.avgTemperature;
      }

      if (isNaN(currentValue) || isNaN(baselineValue)) return null;

      const anomaly = currentValue - baselineValue;
      const anomalyPercent = baselineValue === 0 ? 0 : (anomaly / baselineValue) * 100;

      return {
        month,
        monthName: monthNames[idx],
        value: currentValue,
        baseline: baselineValue,
        anomaly,
        anomalyPercent,
      };
    }).filter(Boolean) as Array<{
      month: number;
      monthName: string;
      value: number;
      baseline: number;
      anomaly: number;
      anomalyPercent: number;
    }>;

    const chartData = {
      labels: anomalies.map((a) => a.monthName),
      datasets: [
        {
          label: '距平值',
          data: anomalies.map((a) => a.anomaly.toFixed(2)),
          backgroundColor: anomalies.map((a) =>
            a.anomaly >= 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'
          ),
          borderColor: anomalies.map((a) =>
            a.anomaly >= 0 ? '#ef4444' : '#3b82f6'
          ),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const lineData = {
      labels: anomalies.map((a) => a.monthName),
      datasets: [
        {
          label: `${selectedYear}年值`,
          data: anomalies.map((a) => a.value.toFixed(2)),
          borderColor: chartColors[selectedElement].border,
          backgroundColor: chartColors[selectedElement].background,
          fill: false,
          tension: 0.3,
        },
        {
          label: '多年平均',
          data: anomalies.map((a) => a.baseline.toFixed(2)),
          borderColor: '#64748b',
          borderDash: [6, 4],
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    };

    return { normals, anomalies, chartData: { bar: chartData, line: lineData } };
  }, [observations, selectedYear, selectedElement, availableYears]);

  const elements: ElementKey[] = ['temperature', 'humidity', 'pressure', 'windSpeed', 'precipitation', 'visibility'];

  const yearAnomaly = useMemo(() => {
    const valid = anomalies.filter((a) => !isNaN(a.anomaly));
    if (valid.length === 0) return 0;
    return valid.reduce((s, a) => s + a.anomaly, 0) / valid.length;
  }, [anomalies]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">气候距平分析</h1>
        <p className="text-slate-500 mt-1">当月值与历年同期对比，判断偏高或偏低</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <label className="input-label">气象要素</label>
          <div className="grid grid-cols-3 gap-2">
            {elements.slice(0, 6).map((el) => {
              const Icon = elementIcons[el];
              return (
                <button
                  key={el}
                  onClick={() => setSelectedElement(el)}
                  className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedElement === el
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{ELEMENT_LABELS[el]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-4">
          <label className="input-label">分析年份</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-2">
            基准期：{availableYears[0]}-{availableYears[Math.floor(availableYears.length / 2)]}年
          </p>
        </div>

        <div className={`card p-5 ${
          yearAnomaly > 0.5 ? 'border-danger-300' : yearAnomaly < -0.5 ? 'border-blue-300' : 'border-slate-200'
        }`}>
          <p className="text-sm text-slate-500 mb-1">年平均距平</p>
          <div className="flex items-center gap-2">
            {yearAnomaly > 0.5 ? (
              <TrendingUp className="w-8 h-8 text-danger-500" />
            ) : yearAnomaly < -0.5 ? (
              <TrendingDown className="w-8 h-8 text-blue-500" />
            ) : (
              <Minus className="w-8 h-8 text-slate-400" />
            )}
            <p className={`text-3xl font-bold ${
              yearAnomaly > 0.5 ? 'text-danger-600' : yearAnomaly < -0.5 ? 'text-blue-600' : 'text-slate-700'
            }`}>
              {yearAnomaly > 0 ? '+' : ''}{yearAnomaly.toFixed(2)}
              <span className="text-base font-normal ml-1">{ELEMENT_UNITS[selectedElement]}</span>
            </p>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {yearAnomaly > 1 ? '显著偏高' : yearAnomaly > 0.5 ? '偏高' : yearAnomaly < -1 ? '显著偏低' : yearAnomaly < -0.5 ? '偏低' : '接近常年'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {selectedYear}年{ELEMENT_LABELS[selectedElement]}月距平
          </h2>
          <div className="h-[320px]">
            <Bar
              data={chartData.bar}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    title: {
                      display: true,
                      text: `距平 (${ELEMENT_UNITS[selectedElement]})`,
                      font: { family: '"Noto Sans SC", sans-serif' },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-danger-500" />
              <span className="text-slate-600">正距平（偏高）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-600">负距平（偏低）</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {selectedYear}年值与多年平均对比
          </h2>
          <div className="h-[320px]">
            <Line data={chartData.line} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">月份</th>
                <th className="table-header">{selectedYear}年值({ELEMENT_UNITS[selectedElement]})</th>
                <th className="table-header">多年平均({ELEMENT_UNITS[selectedElement]})</th>
                <th className="table-header">距平({ELEMENT_UNITS[selectedElement]})</th>
                <th className="table-header">距平百分率</th>
                <th className="table-header">评价</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) => {
                const absAnomaly = Math.abs(a.anomalyPercent);
                let level = '正常';
                let levelClass = 'text-emerald-600 bg-emerald-50';
                if (absAnomaly >= 50) {
                  level = a.anomaly > 0 ? '异常偏高' : '异常偏低';
                  levelClass = 'text-danger-600 bg-danger-50';
                } else if (absAnomaly >= 30) {
                  level = a.anomaly > 0 ? '显著偏高' : '显著偏低';
                  levelClass = 'text-danger-600 bg-danger-50';
                } else if (absAnomaly >= 15) {
                  level = a.anomaly > 0 ? '偏高' : '偏低';
                  levelClass = 'text-amber-600 bg-amber-50';
                }

                return (
                  <tr key={a.month} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="table-cell font-semibold">{a.monthName}</td>
                    <td className="table-cell">{a.value.toFixed(2)}</td>
                    <td className="table-cell text-slate-500">{a.baseline.toFixed(2)}</td>
                    <td className={`table-cell font-medium ${a.anomaly >= 0 ? 'text-danger-600' : 'text-blue-600'}`}>
                      {a.anomaly >= 0 ? '+' : ''}{a.anomaly.toFixed(2)}
                    </td>
                    <td className={`table-cell ${a.anomalyPercent >= 0 ? 'text-danger-600' : 'text-blue-600'}`}>
                      {a.anomalyPercent >= 0 ? '+' : ''}{a.anomalyPercent.toFixed(1)}%
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${levelClass}`}>{level}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6 border-l-4 border-amber-500 bg-amber-50/30">
        <div className="flex items-start gap-4">
          <Info className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-800 mb-1">距平评价标准</p>
            <ul className="space-y-1">
              <li>• 距平百分率 ≥50%：异常偏高/偏低</li>
              <li>• 距平百分率 30%~50%：显著偏高/偏低</li>
              <li>• 距平百分率 15%~30%：偏高/偏低</li>
              <li>• 距平百分率 ＜15%：接近常年</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
