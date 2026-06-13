import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import WindRoseChart from '@/components/WindRoseChart';
import { calculateWindRose, getDominantDirection, getAverageWindSpeed, getBeaufortScale } from '@/utils/wind';
import { getAvailableYears } from '@/utils/statistics';
import { Compass, Wind, Calendar } from 'lucide-react';

export default function WindRose() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [year, setYear] = useState<number | 'all'>(availableYears[availableYears.length - 1] || new Date().getFullYear());
  const [month, setMonth] = useState<number | 'all'>('all');

  const filteredObservations = useMemo(() => {
    return observations.filter((o) => {
      if (o.reviewStatus === 'rejected') return false;
      const d = new Date(o.datetime);
      if (year !== 'all' && d.getFullYear() !== year) return false;
      if (month !== 'all' && d.getMonth() + 1 !== month) return false;
      return true;
    });
  }, [observations, year, month]);

  const windRose = useMemo(() => calculateWindRose(filteredObservations), [filteredObservations]);

  const avgWindSpeed = useMemo(() => getAverageWindSpeed(filteredObservations), [filteredObservations]);
  const beaufort = useMemo(() => getBeaufortScale(avgWindSpeed), [avgWindSpeed]);
  const dominantDir = useMemo(() => getDominantDirection(windRose), [windRose]);

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">风向玫瑰图</h1>
        <p className="text-slate-500 mt-1">专业风向频率分布可视化分析</p>
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
              onChange={(e) => setYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="input"
            >
              <option value="all">全部年份</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              选择月份
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="input"
            >
              <option value="all">全部月份</option>
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">主导风向</p>
              <p className="text-white text-3xl font-bold mt-1">{dominantDir}</p>
            </div>
            <Compass className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-emerald-500 to-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">平均风速</p>
              <p className="text-white text-3xl font-bold mt-1">
                {isNaN(avgWindSpeed) ? '-' : avgWindSpeed.toFixed(1)}
                <span className="text-lg ml-1">m/s</span>
              </p>
            </div>
            <Wind className="w-10 h-10 text-emerald-200" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-amber-500 to-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">蒲福风级</p>
              <p className="text-white text-3xl font-bold mt-1">
                {beaufort.force}级
                <span className="text-sm ml-2 font-normal">{beaufort.name}</span>
              </p>
            </div>
            <Wind className="w-10 h-10 text-amber-200" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {year === 'all' ? '全部年份' : `${year}年`}
          {month === 'all' ? '' : ` ${monthNames[month - 1]}`}
          {' '}风向频率分布
        </h2>
        <WindRoseChart data={windRose} height={450} />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">各方位风向频率详情</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>方位</th>
                <th>频率(%)</th>
                <th>0-2 m/s</th>
                <th>2-5 m/s</th>
                <th>5-10 m/s</th>
                <th>10-20 m/s</th>
                <th>{'>'}20 m/s</th>
              </tr>
            </thead>
            <tbody>
              {windRose.directions.map((dir) => (
                <tr key={dir.direction}>
                  <td className="font-medium">{dir.direction}</td>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <span
                          className="bg-primary-500 h-full rounded-full block"
                          style={{ width: `${Math.min(dir.frequency * 5, 100)}%` }}
                        />
                      </span>
                      {dir.frequency.toFixed(1)}%
                    </span>
                  </td>
                  {dir.speedRanges.map((range, idx) => (
                    <td key={idx} className="text-slate-600">
                      {range.frequency.toFixed(1)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
