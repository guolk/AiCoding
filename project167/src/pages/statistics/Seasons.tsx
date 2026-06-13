import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { determineSeasonTransitions, getSeasonName, getSeasonColor } from '@/utils/seasons';
import { getAvailableYears } from '@/utils/statistics';
import { CalendarDays, Sun, CloudSun, Cloud, Snowflake, Flower2, Leaf, Info, ArrowRight } from 'lucide-react';

const seasonIcons: Record<string, React.ElementType> = {
  spring: Flower2,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
};

const seasonColors: Record<string, string> = {
  spring: 'from-green-400 to-emerald-500',
  summer: 'from-orange-400 to-red-500',
  autumn: 'from-amber-400 to-orange-500',
  winter: 'from-sky-400 to-blue-500',
};

export default function Seasons() {
  const observations = useWeatherStore((state) => state.observations);
  const availableYears = getAvailableYears(observations);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[availableYears.length - 1] || new Date().getFullYear());

  const { selectedYearTransitions, allYearTransitions } = useMemo(() => {
    const approved = observations.filter((o) => o.reviewStatus !== 'rejected');
    const selected = determineSeasonTransitions(approved, selectedYear);

    const all = availableYears
      .map((year) => ({
        year,
        transitions: determineSeasonTransitions(approved, year),
      }))
      .filter((t) => t.transitions.length > 0);

    return { selectedYearTransitions: selected, allYearTransitions: all };
  }, [observations, selectedYear, availableYears]);

  const seasonOrder = ['spring', 'summer', 'autumn', 'winter'] as const;
  const seasonMonthDays = [
    { start: 80, end: 171 },
    { start: 172, end: 263 },
    { start: 264, end: 354 },
    { start: 355, end: 445 },
  ];

  const getDayOfYear = (dateStr: string) => {
    const d = new Date(dateStr);
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">季节划分</h1>
          <p className="text-slate-500 mt-1">基于候温法的气候学季节判定</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="input w-auto"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
      </div>

      <div className="card p-6 border-l-4 border-primary-500 bg-primary-50/30">
        <div className="flex items-start gap-4">
          <Info className="w-5 h-5 text-primary-600 mt-0.5" />
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-800 mb-1">候温法季节判定标准</p>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <li>• 春季：候平均气温稳定≥10°C</li>
              <li>• 夏季：候平均气温稳定≥22°C</li>
              <li>• 秋季：候平均气温稳定＜22°C</li>
              <li>• 冬季：候平均气温稳定＜10°C</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">候为连续5天，需连续4候满足温度条件方可判定</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">{selectedYear}年季节时间轴</h2>
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-2 bg-slate-100 rounded-full -translate-y-1/2" />
          <div className="relative flex justify-between px-4">
            {seasonOrder.map((season, idx) => {
              const transition = selectedYearTransitions.find((t) => t.season === season);
              const Icon = seasonIcons[season];
              const day = transition ? getDayOfYear(transition.date) : seasonMonthDays[idx].start;
              const leftPos = Math.min(95, Math.max(0, (day / 365) * 100));

              return (
                <div
                  key={season}
                  className="relative"
                  style={{ position: 'absolute', left: `${leftPos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${seasonColors[season]} flex flex-col items-center justify-center text-white shadow-lg ${transition ? '' : 'opacity-40 grayscale'}`}>
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium mt-0.5">{getSeasonName(season)}</span>
                  </div>
                  {transition && (
                    <div className="mt-3 text-center">
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(transition.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-500">候温 {transition.pentadMeanTemp.toFixed(1)}°C</p>
                    </div>
                  )}
                  {!transition && (
                    <p className="mt-3 text-xs text-slate-400 text-center">数据不足</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-32 flex justify-between text-xs text-slate-400">
          <span>1月1日</span>
          <span>4月1日</span>
          <span>7月1日</span>
          <span>10月1日</span>
          <span>12月31日</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {seasonOrder.map((season) => {
          const transition = selectedYearTransitions.find((t) => t.season === season);
          const Icon = seasonIcons[season];
          return (
            <div key={season} className={`card p-6 bg-gradient-to-br ${seasonColors[season]} text-white relative overflow-hidden`}>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8" />
                  <span className="text-sm text-white/80">{getSeasonName(season)}</span>
                </div>
                {transition ? (
                  <>
                    <p className="text-2xl font-bold">
                      {new Date(transition.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-white/80 mt-1">入{getSeasonName(season).charAt(0)}</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-sm">候平均气温</p>
                      <p className="text-xl font-semibold">{transition.pentadMeanTemp.toFixed(1)}°C</p>
                    </div>
                  </>
                ) : (
                  <div className="text-white/80">
                    <p>数据不足以判定</p>
                    <p className="text-sm mt-2">可能需要更多连续观测记录</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">历年季节入季日期对比</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">年份</th>
                <th className="table-header text-green-700">入春</th>
                <th className="table-header text-orange-700">入夏</th>
                <th className="table-header text-amber-700">入秋</th>
                <th className="table-header text-blue-700">入冬</th>
              </tr>
            </thead>
            <tbody>
              {allYearTransitions.slice().reverse().map(({ year, transitions }) => (
                <tr key={year} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="table-cell font-semibold text-primary-700">{year}年</td>
                  {seasonOrder.map((season) => {
                    const t = transitions.find((tr) => tr.season === season);
                    const color = getSeasonColor(season).split(' ')[0];
                    return (
                      <td key={season} className="table-cell">
                        {t ? (
                          <span className={`badge ${color}`}>
                            {new Date(t.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                            <ArrowRight className="w-3 h-3 inline mx-1" />
                            {t.pentadMeanTemp.toFixed(1)}°C
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {seasonOrder.map((season) => {
          const Icon = seasonIcons[season];
          const seasonData = allYearTransitions
            .map(({ year, transitions }) => {
              const t = transitions.find((tr) => tr.season === season);
              if (!t) return null;
              const d = new Date(t.date);
              const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
              return { year, dayOfYear, date: t.date, temp: t.pentadMeanTemp };
            })
            .filter(Boolean) as Array<{ year: number; dayOfYear: number; date: string; temp: number }>;

          if (seasonData.length < 2) return null;

          const avgDay = Math.round(seasonData.reduce((s, d) => s + d.dayOfYear, 0) / seasonData.length);
          const avgDate = new Date(2000, 0, avgDay);
          const avgTemp = seasonData.reduce((s, d) => s + d.temp, 0) / seasonData.length;

          return (
            <div key={season} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${seasonColors[season]} flex items-center justify-center text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{getSeasonName(season)}平均入季</h3>
                  <p className="text-sm text-slate-500">{seasonData.length}年统计</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">平均日期</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {avgDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">平均候温</p>
                  <p className="text-lg font-semibold text-slate-800">{avgTemp.toFixed(1)}°C</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
