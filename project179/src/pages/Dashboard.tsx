import { useMemo } from 'react';
import {
  MapPin,
  Leaf,
  Thermometer,
  AlertTriangle,
  Plus,
  BarChart3,
  Calendar,
  Clock,
  Droplets,
  Bird,
  Bug,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/store';
import { StatCard } from '@/components/ui/StatCard';
import { Header } from '@/components/Layout/Header';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  time: string;
  icon: keyof typeof iconMap;
  title: string;
  description: string;
  siteName: string;
  type: 'species' | 'env' | 'event';
}

const iconMap = {
  Leaf,
  Bird,
  Bug,
  Thermometer,
  Droplets,
  Activity,
};

const speciesTrendData = [
  { month: '1月', 物种数: 8 },
  { month: '2月', 物种数: 9 },
  { month: '3月', 物种数: 10 },
  { month: '4月', 物种数: 11 },
  { month: '5月', 物种数: 12 },
  { month: '6月', 物种数: 12 },
];

export default function Dashboard() {
  const { sites, species, envParams } = useAppStore();

  const invasiveCount = useMemo(
    () => species.filter((s) => s.isInvasive).length,
    [species]
  );

  const speciesBySiteId = useMemo(() => {
    const map: Record<string, number> = {};
    species.forEach((s) => {
      map[s.siteId] = (map[s.siteId] || 0) + 1;
    });
    return map;
  }, [species]);

  const envParamsBySiteId = useMemo(() => {
    const map: Record<string, string> = {};
    const sortedEnv = [...envParams].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    sortedEnv.forEach((e) => {
      if (!map[e.siteId]) {
        map[e.siteId] = e.date;
      }
    });
    return map;
  }, [envParams]);

  const timelineData = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    species.slice().reverse().forEach((s) => {
      items.push({
        id: `sp-${s.id}`,
        time: s.date,
        icon: s.isInvasive ? 'Bug' : 'Bird',
        title: `${s.isInvasive ? '发现入侵物种' : '记录物种'}：${s.name}`,
        description: `数量 ${s.count}，${s.behavior.slice(0, 30)}...`,
        siteName: sites.find((site) => site.id === s.siteId)?.name || '未知',
        type: 'species',
      });
    });

    envParams.slice().reverse().forEach((e) => {
      items.push({
        id: `env-${e.id}`,
        time: e.date,
        icon: e.isAbnormal ? 'Activity' : 'Thermometer',
        title: e.isAbnormal ? '环境参数异常' : '环境测量完成',
        description: `水温${e.waterTemperature}°C，pH${e.waterPH}，透明度${e.waterTransparency}%`,
        siteName: sites.find((site) => site.id === e.siteId)?.name || '未知',
        type: 'env',
      });
    });

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);
  }, [species, envParams, sites]);

  const quickActions = [
    {
      icon: Plus,
      title: '新增监测点',
      description: '创建新的生态监测站点',
      color: 'forest',
    },
    {
      icon: Leaf,
      title: '记录物种',
      description: '添加物种观测记录',
      color: 'lake',
    },
    {
      icon: Thermometer,
      title: '环境测量',
      description: '录入环境参数数据',
      color: 'sun',
    },
    {
      icon: BarChart3,
      title: '数据分析',
      description: '查看生态多样性分析',
      color: 'danger',
    },
  ];

  const quickActionColors = {
    forest: 'from-forest-50 to-forest-100 hover:from-forest-100 hover:to-forest-200 text-forest-700 border-forest-200',
    lake: 'from-lake-50 to-lake-100 hover:from-lake-100 hover:to-lake-200 text-lake-700 border-lake-200',
    sun: 'from-sun-50 to-sun-100 hover:from-sun-100 hover:to-sun-200 text-sun-700 border-sun-200',
    danger: 'from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 border-red-200',
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="仪表板" subtitle="实时监控生态环境数据" />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* 欢迎横幅 */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-forest-500 to-lake-500 p-8 shadow-xl animate-fade-in">
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                欢迎回来，张研究员
              </h1>
              <p className="mt-3 text-lg text-white/90">
                今日是野外调查的好日子，已记录
                <span className="mx-1 font-semibold text-yellow-200">3</span>
                条新数据
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">2024年野外调查季</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">系统运行正常</span>
                </div>
              </div>
            </div>
            <div className="hidden items-end md:flex">
              <div className="relative">
                <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -right-2 top-0 h-24 w-24 rounded-full bg-lake-300/20 blur-xl" />
                <div className="flex gap-1">
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-3 rounded-full bg-forest-700/40" />
                    <div className="-mt-2 flex gap-0.5">
                      <div className="h-12 w-10 origin-bottom rounded-t-full bg-green-400/60 rotate-[-20deg] animate-[sway_3s_ease-in-out_infinite]" />
                      <div className="h-16 w-12 origin-bottom rounded-t-full bg-green-500/60 animate-[sway_2.5s_ease-in-out_infinite_0.2s]" />
                      <div className="h-10 w-8 origin-bottom rounded-t-full bg-green-400/60 rotate-[20deg] animate-[sway_3.5s_ease-in-out_infinite_0.4s]" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center -ml-2">
                    <div className="h-32 w-4 rounded-full bg-forest-800/40" />
                    <div className="-mt-2 flex gap-0.5">
                      <div className="h-16 w-14 origin-bottom rounded-t-full bg-emerald-500/60 rotate-[-15deg] animate-[sway_4s_ease-in-out_infinite_0.1s]" />
                      <div className="h-20 w-16 origin-bottom rounded-t-full bg-emerald-400/60 animate-[sway_3s_ease-in-out_infinite_0.3s]" />
                      <div className="h-14 w-12 origin-bottom rounded-t-full bg-emerald-500/60 rotate-[15deg] animate-[sway_3.5s_ease-in-out_infinite_0.5s]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-forest-300/20 blur-3xl" />
            <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-lake-300/20 blur-3xl" />
          </div>
        </div>

        {/* 统计卡片网格 */}
        <div className="mb-8 grid grid-cols-1 gap-6 animate-slide-up sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="监测点总数"
            value={sites.length}
            icon={<MapPin className="h-6 w-6" strokeWidth={2} />}
            color="forest"
          />
          <StatCard
            title="物种记录数"
            value={`${species.length}种`}
            icon={<Leaf className="h-6 w-6" strokeWidth={2} />}
            color="lake"
          />
          <StatCard
            title="环境测量数"
            value={`${envParams.length}条`}
            icon={<Thermometer className="h-6 w-6" strokeWidth={2} />}
            color="sun"
          />
          <StatCard
            title="入侵物种"
            value={`${invasiveCount}种`}
            icon={<AlertTriangle className="h-6 w-6" strokeWidth={2} />}
            color="earth"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 左侧：最近动态 + 快捷操作 */}
          <div className="space-y-6 lg:col-span-2">
            {/* 最近动态时间线 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">最近动态</h2>
                  <p className="mt-1 text-sm text-gray-500">最新的监测记录和事件</p>
                </div>
                <button className="flex items-center gap-1 text-sm font-medium text-forest-600 transition-colors hover:text-forest-700">
                  查看全部
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="relative space-y-1">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-forest-200 via-lake-200 to-sun-200" />
                {timelineData.map((item, index) => {
                  const IconComp = iconMap[item.icon];
                  return (
                    <div
                      key={item.id}
                      className="group relative flex gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-gray-50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className={cn(
                          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-white shadow-md',
                          item.type === 'species'
                            ? item.icon === 'Bug'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-lake-100 text-lake-600'
                            : item.type === 'env'
                            ? item.icon === 'Activity'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-sun-100 text-sun-700'
                            : 'bg-forest-100 text-forest-600'
                        )}
                      >
                        <IconComp className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-900 transition-colors group-hover:text-forest-700">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {item.time}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                          {item.description}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700">
                          <MapPin className="h-3 w-3" />
                          {item.siteName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 快捷操作区 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card animate-fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">快捷操作</h2>
                <p className="mt-1 text-sm text-gray-500">快速开始日常监测工作</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={action.title}
                      className={cn(
                        'group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover bg-gradient-to-br',
                        quickActionColors[action.color as keyof typeof quickActionColors]
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="relative z-10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <ActionIcon className="h-6 w-6" strokeWidth={2} />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">
                          {action.title}
                        </h3>
                        <p className="mt-1 text-sm opacity-80">
                          {action.description}
                        </p>
                      </div>
                      <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 物种数量趋势图 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">物种数量趋势</h2>
                  <p className="mt-1 text-sm text-gray-500">近半年累计物种记录变化</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-lake-50 px-3 py-1.5">
                  <BarChart3 className="h-4 w-4 text-lake-600" />
                  <span className="text-sm font-medium text-lake-700">+50%</span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={speciesTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSpecies" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#40916C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#40916C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      labelStyle={{ fontWeight: 600, color: '#1F2937' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="物种数"
                      stroke="#40916C"
                      strokeWidth={3}
                      dot={{
                        fill: '#fff',
                        stroke: '#40916C',
                        strokeWidth: 2,
                        r: 5,
                      }}
                      activeDot={{
                        r: 7,
                        fill: '#40916C',
                        stroke: '#fff',
                        strokeWidth: 3,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 右侧：监测点分布 */}
          <div className="animate-slide-up">
            <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">监测点分布</h2>
                  <p className="mt-1 text-sm text-gray-500">共 {sites.length} 个监测站点</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-600">
                  <MapPin className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-4">
                {sites.map((site, index) => {
                  const firstPhoto = site.photos[0]?.url;
                  const speciesCount = speciesBySiteId[site.id] || 0;
                  const lastMeasure = envParamsBySiteId[site.id];
                  return (
                    <div
                      key={site.id}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:border-forest-300 hover:shadow-card-hover"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-forest-100 to-lake-100">
                        {firstPhoto ? (
                          <img
                            src={firstPhoto}
                            alt={site.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Leaf className="h-16 w-16 text-forest-300 opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-semibold text-white drop-shadow-sm">
                            {site.name}
                          </h3>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-forest-700 shadow-sm">
                            {site.ecosystemType.slice(0, 4)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                          {site.ecosystemType}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Leaf className="h-4 w-4 text-lake-500" />
                            <span className="font-medium">{speciesCount}</span>
                            <span className="text-gray-400">种</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="h-4 w-4 text-sun-500" />
                            <span className="text-gray-500">{lastMeasure || '暂无'}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                          <span className="text-xs text-gray-400">查看详情</span>
                          <ChevronRight className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-forest-600" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(var(--tw-rotate, 0deg)) translateY(0); }
          50% { transform: rotate(calc(var(--tw-rotate, 0deg) + 5deg)) translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
