import { useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { mean, max, min, sum, calculateClimateExtremes, getAvailableYears } from '@/utils/statistics';
import { getBeaufortScale, angleToDirection, getDirectionName } from '@/utils/wind';
import { determineSeasonTransitions, getSeasonName, getSeasonColor } from '@/utils/seasons';
import {
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  CloudRain,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  gradient: string;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-blue-500' : 'text-slate-400';

  return (
    <div className={`stat-card ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {typeof value === 'number' ? (isNaN(value) ? '--' : value.toFixed(1)) : value}
            {unit && <span className="text-lg font-normal ml-1 opacity-80">{unit}</span>}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm">较昨日</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}

export default function Dashboard() {
  const observations = useWeatherStore((state) => state.observations);
  const instruments = useWeatherStore((state) => state.instruments);

  const { todayData, recentData } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayObs = observations.filter((o) => o.datetime.startsWith(today));
    const recent = observations.slice(0, 200);
    return { todayData: todayObs, recentData: recent };
  }, [observations]);

  const stats = useMemo(() => {
    const approved = observations.filter((o) => o.reviewStatus === 'approved');
    const pending = observations.filter((o) => o.reviewStatus === 'pending');
    const flagged = observations.filter(
      (o) => o.qualityFlag === 'out_of_range' || o.qualityFlag === 'suspect'
    );
    const extremes = calculateClimateExtremes(observations);
    const years = getAvailableYears(observations);

    let season = null;
    if (years.length > 0) {
      const latestYear = years[years.length - 1];
      const transitions = determineSeasonTransitions(observations, latestYear);
      if (transitions.length > 0) {
        const now = new Date();
        for (let i = transitions.length - 1; i >= 0; i--) {
          if (new Date(transitions[i].date) <= now) {
            season = transitions[i];
            break;
          }
        }
      }
    }

    return {
      total: observations.length,
      approved: approved.length,
      pending: pending.length,
      flagged: flagged.length,
      instruments: instruments.length,
      activeInstruments: instruments.filter((i) => i.isActive).length,
      extremes,
      years,
      season,
    };
  }, [observations, instruments]);

  const quickActions = [
    {
      icon: FileSpreadsheet,
      label: '数据录入',
      description: '手动添加观测记录',
      path: '/data/entry',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Database,
      label: 'CSV导入',
      description: '批量导入历史数据',
      path: '/data/import',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: ShieldCheck,
      label: '质量审核',
      description: '审核标记的可疑数据',
      path: '/data/quality',
      badge: stats.pending > 0 ? stats.pending : null,
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: BarChart3,
      label: '统计分析',
      description: '查看气候统计摘要',
      path: '/statistics/summary',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">数据总览</h1>
        <p className="text-slate-500 mt-1">欢迎使用气象观测站数据分析系统</p>
      </div>

      {stats.season && (
        <div className={`card p-4 border-l-4 ${getSeasonColor(stats.season.season).split(' ')[2]}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${getSeasonColor(stats.season.season).split(' ').slice(0, 2).join(' ')} flex items-center justify-center`}>
              <span className="text-2xl">
                {stats.season.season === 'spring' && '🌸'}
                {stats.season.season === 'summer' && '☀️'}
                {stats.season.season === 'autumn' && '🍂'}
                {stats.season.season === 'winter' && '❄️'}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500">当前季节</p>
              <p className="font-semibold text-slate-800">
                {getSeasonName(stats.season.season)} · 候平均气温 {stats.season.pentadMeanTemp.toFixed(1)}°C
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Thermometer}
          label="气温"
          value={mean(todayData.map((o) => o.temperature))}
          unit="°C"
          gradient="bg-gradient-to-br from-orange-500 to-red-500"
        />
        <StatCard
          icon={Droplets}
          label="湿度"
          value={mean(todayData.map((o) => o.humidity))}
          unit="%"
          gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
        />
        <StatCard
          icon={Gauge}
          label="气压"
          value={mean(todayData.map((o) => o.pressure))}
          unit="hPa"
          gradient="bg-gradient-to-br from-purple-500 to-indigo-500"
        />
        <StatCard
          icon={Wind}
          label="风速"
          value={mean(todayData.map((o) => o.windSpeed))}
          unit="m/s"
          gradient="bg-gradient-to-br from-teal-500 to-emerald-500"
        />
        <StatCard
          icon={CloudRain}
          label="降水量"
          value={sum(todayData.map((o) => o.precipitation))}
          unit="mm"
          gradient="bg-gradient-to-br from-sky-500 to-blue-600"
        />
        <StatCard
          icon={Eye}
          label="能见度"
          value={mean(todayData.map((o) => o.visibility))}
          unit="km"
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
        />
      </div>

      {todayData.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">最新观测</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {todayData.slice(-3).reverse().map((obs, idx) => {
              const beaufort = getBeaufortScale(obs.windSpeed);
              const windDir = obs.windDirection !== null ? getDirectionName(angleToDirection(obs.windDirection)) : '--';
              return (
                <div key={obs.id} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    {new Date(obs.datetime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {obs.temperature !== null ? obs.temperature.toFixed(1) : '--'}°
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p>💧 {obs.humidity !== null ? obs.humidity.toFixed(0) : '--'}%</p>
                    <p>🌬️ {obs.windSpeed !== null ? obs.windSpeed.toFixed(1) : '--'}m/s {windDir}</p>
                    <p className="text-slate-400">{beaufort.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="card p-5 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                    {action.label}
                  </h3>
                  {action.badge && (
                    <span className="badge bg-red-100 text-red-700">{action.badge}条待审</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">数据统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.approved}</p>
                <p className="text-xs text-slate-500">已审核数据</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                <p className="text-xs text-slate-500">待审核数据</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.flagged}</p>
                <p className="text-xs text-slate-500">异常标记</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.total.toLocaleString()}</p>
                <p className="text-xs text-slate-500">总记录数</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">历史极值</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-red-500" />
                <span className="font-medium text-slate-700">历史最高气温</span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">
                  {isNaN(stats.extremes.maxTemperature.value) ? '--' : `${stats.extremes.maxTemperature.value.toFixed(1)}°C`}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.extremes.maxTemperature.datetime ? new Date(stats.extremes.maxTemperature.datetime).toLocaleDateString('zh-CN') : '--'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-slate-700">历史最低气温</span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">
                  {isNaN(stats.extremes.minTemperature.value) ? '--' : `${stats.extremes.minTemperature.value.toFixed(1)}°C`}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.extremes.minTemperature.datetime ? new Date(stats.extremes.minTemperature.datetime).toLocaleDateString('zh-CN') : '--'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
              <div className="flex items-center gap-3">
                <CloudRain className="w-5 h-5 text-sky-500" />
                <span className="font-medium text-slate-700">日最大降水量</span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-sky-600">
                  {isNaN(stats.extremes.maxPrecipitation.value) ? '--' : `${stats.extremes.maxPrecipitation.value.toFixed(1)}mm`}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.extremes.maxPrecipitation.datetime ? new Date(stats.extremes.maxPrecipitation.datetime).toLocaleDateString('zh-CN') : '--'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
              <div className="flex items-center gap-3">
                <Wind className="w-5 h-5 text-teal-500" />
                <span className="font-medium text-slate-700">极大风速</span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-teal-600">
                  {isNaN(stats.extremes.maxWindSpeed.value) ? '--' : `${stats.extremes.maxWindSpeed.value.toFixed(1)}m/s`}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.extremes.maxWindSpeed.datetime ? new Date(stats.extremes.maxWindSpeed.datetime).toLocaleDateString('zh-CN') : '--'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats.years.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">数据时间跨度</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              {stats.years.map((year, idx) => (
                <div
                  key={year}
                  className="h-full bg-gradient-to-r from-primary-400 to-accent-400 inline-block"
                  style={{ width: `${100 / stats.years.length}%` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold">{stats.years[0]}</span>
              <span>—</span>
              <span className="font-semibold">{stats.years[stats.years.length - 1]}</span>
              <span className="text-slate-400">({stats.years.length}年)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
