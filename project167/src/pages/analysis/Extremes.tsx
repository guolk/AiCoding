import { useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { calculateClimateExtremes, calculateMonthlyStats, getAvailableYears } from '@/utils/statistics';
import { Thermometer, CloudRain, Wind, Eye, TrendingUp, Calendar, Flame, Snowflake, Droplets, CloudLightning } from 'lucide-react';

export default function Extremes() {
  const observations = useWeatherStore((state) => state.observations);
  const approved = useMemo(() => observations.filter((o) => o.reviewStatus !== 'rejected'), [observations]);
  const availableYears = getAvailableYears(approved);
  const extremes = calculateClimateExtremes(approved);

  const yearlyExtremes = useMemo(() => {
    return availableYears.map((year) => {
      const yearObs = approved.filter((o) => new Date(o.datetime).getFullYear() === year);
      const yearStats = yearObs.reduce(
        (acc, o) => {
          if (o.temperature !== null) {
            acc.maxTemp = Math.max(acc.maxTemp, o.temperature);
            acc.minTemp = Math.min(acc.minTemp, o.temperature);
          }
          if (o.precipitation !== null) {
            acc.totalPrecip += o.precipitation;
            acc.maxDailyPrecip = Math.max(acc.maxDailyPrecip, o.precipitation);
          }
          if (o.windSpeed !== null) {
            acc.maxWind = Math.max(acc.maxWind, o.windSpeed);
          }
          if (o.visibility !== null) {
            acc.minVisibility = Math.min(acc.minVisibility, o.visibility);
          }
          return acc;
        },
        { maxTemp: -Infinity, minTemp: Infinity, totalPrecip: 0, maxDailyPrecip: 0, maxWind: -Infinity, minVisibility: Infinity }
      );

      const rainyDays = yearObs.filter((o) => o.precipitation !== null && o.precipitation > 0.1).length;
      const highTempDays = yearObs.filter((o) => o.temperature !== null && o.temperature >= 35).length;
      const lowTempDays = yearObs.filter((o) => o.temperature !== null && o.temperature <= 0).length;

      return {
        year,
        ...yearStats,
        rainyDays,
        highTempDays,
        lowTempDays,
      };
    });
  }, [approved, availableYears]);

  const statCards = [
    {
      icon: Flame,
      label: '历史最高气温',
      value: extremes.maxTemperature.value,
      unit: '°C',
      date: extremes.maxTemperature.datetime,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Snowflake,
      label: '历史最低气温',
      value: extremes.minTemperature.value,
      unit: '°C',
      date: extremes.minTemperature.datetime,
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      icon: CloudRain,
      label: '日最大降水量',
      value: extremes.maxPrecipitation.value,
      unit: 'mm',
      date: extremes.maxPrecipitation.datetime,
      gradient: 'from-sky-500 to-blue-600',
    },
    {
      icon: Wind,
      label: '极大风速',
      value: extremes.maxWindSpeed.value,
      unit: 'm/s',
      date: extremes.maxWindSpeed.datetime,
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      icon: Eye,
      label: '最低能见度',
      value: extremes.minVisibility.value,
      unit: 'km',
      date: extremes.minVisibility.datetime,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">极端天气识别</h1>
        <p className="text-slate-500 mt-1">历史最高温、最低温、最大降水等极端事件统计</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`stat-card bg-gradient-to-br ${card.gradient}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {isNaN(card.value) ? '--' : card.value.toFixed(1)}
                    <span className="text-lg font-normal ml-1 opacity-80">{card.unit}</span>
                  </p>
                  {card.date && (
                    <p className="text-xs text-white/70 mt-2">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(card.date).toLocaleDateString('zh-CN')}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">逐年极端天气统计</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">年份</th>
                <th className="table-header">最高气温(°C)</th>
                <th className="table-header">最低气温(°C)</th>
                <th className="table-header">年降水量(mm)</th>
                <th className="table-header">日最大降水(mm)</th>
                <th className="table-header">极大风速(m/s)</th>
                <th className="table-header">最低能见度(km)</th>
                <th className="table-header">高温日数(≥35°C)</th>
                <th className="table-header">低温日数(≤0°C)</th>
                <th className="table-header">降水日数</th>
              </tr>
            </thead>
            <tbody>
              {yearlyExtremes.reverse().map((ye) => (
                <tr key={ye.year} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="table-cell font-semibold text-primary-700">{ye.year}年</td>
                  <td className="table-cell text-danger-600 font-medium">
                    {isFinite(ye.maxTemp) ? ye.maxTemp.toFixed(1) : '--'}
                  </td>
                  <td className="table-cell text-blue-600 font-medium">
                    {isFinite(ye.minTemp) ? ye.minTemp.toFixed(1) : '--'}
                  </td>
                  <td className="table-cell">
                    {ye.totalPrecip > 0 ? ye.totalPrecip.toFixed(1) : '--'}
                  </td>
                  <td className="table-cell text-sky-600 font-medium">
                    {ye.maxDailyPrecip > 0 ? ye.maxDailyPrecip.toFixed(1) : '--'}
                  </td>
                  <td className="table-cell">
                    {isFinite(ye.maxWind) ? ye.maxWind.toFixed(1) : '--'}
                  </td>
                  <td className="table-cell">
                    {isFinite(ye.minVisibility) ? ye.minVisibility.toFixed(1) : '--'}
                  </td>
                  <td className="table-cell">
                    {ye.highTempDays > 0 ? (
                      <span className="badge bg-danger-100 text-danger-700">
                        <Thermometer className="w-3 h-3 inline mr-1" />
                        {ye.highTempDays}天
                      </span>
                    ) : '0天'}
                  </td>
                  <td className="table-cell">
                    {ye.lowTempDays > 0 ? (
                      <span className="badge bg-blue-100 text-blue-700">
                        <Snowflake className="w-3 h-3 inline mr-1" />
                        {ye.lowTempDays}天
                      </span>
                    ) : '0天'}
                  </td>
                  <td className="table-cell">
                    {ye.rainyDays > 0 ? (
                      <span className="badge bg-sky-100 text-sky-700">
                        <Droplets className="w-3 h-3 inline mr-1" />
                        {ye.rainyDays}天
                      </span>
                    ) : '0天'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-danger-600" />
            </div>
            <h3 className="font-semibold text-slate-800">高温预警</h3>
          </div>
          <p className="text-sm text-slate-600">
            当日最高气温 ≥35°C 为高温日。持续性高温可能引发中暑、电力过载等问题，需做好防暑降温和能源调度。
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">累计高温日</span>
              <span className="text-2xl font-bold text-danger-600">
                {yearlyExtremes.reduce((s, y) => s + y.highTempDays, 0)}天
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <CloudLightning className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="font-semibold text-slate-800">强降水预警</h3>
          </div>
          <p className="text-sm text-slate-600">
            日降水量 ≥50mm 为暴雨。强降水可能引发城市内涝、山洪、地质灾害等，需关注防汛工作。
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">累计降水日</span>
              <span className="text-2xl font-bold text-sky-600">
                {yearlyExtremes.reduce((s, y) => s + y.rainyDays, 0)}天
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800">寒潮预警</h3>
          </div>
          <p className="text-sm text-slate-600">
            日最低气温 ≤0°C 为低温日。低温冻害可能影响农业生产、交通出行和市政设施运行。
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">累计低温日</span>
              <span className="text-2xl font-bold text-blue-600">
                {yearlyExtremes.reduce((s, y) => s + y.lowTempDays, 0)}天
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
