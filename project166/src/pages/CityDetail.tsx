import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Wifi,
  Users,
  Plane,
  Sun,
  Clock,
  Shield,
  Utensils,
  Building2,
  Coffee,
  BookOpen,
  MoreHorizontal,
  CalendarPlus,
  Star,
  MapPin,
  Volume2,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useCityStore } from '@/store/cityStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import type { City, Workspace } from '@/types';
import { cn } from '@/lib/utils';

function getWorkspaceIcon(type: Workspace['type']) {
  switch (type) {
    case 'cafe':
      return Coffee;
    case 'coworking':
      return Building2;
    case 'library':
      return BookOpen;
    default:
      return MoreHorizontal;
  }
}

function getWorkspaceTypeName(type: Workspace['type']) {
  switch (type) {
    case 'cafe':
      return '咖啡馆';
    case 'coworking':
      return '共享办公';
    case 'library':
      return '图书馆';
    default:
      return '其他';
  }
}

function getRadarData(city: City) {
  const communityScore = Math.min(10, Math.round(city.coworkingSpaces / 15));
  const foodScore = city.tags.includes('food') ? 9 : city.tags.includes('culture') ? 8 : 7;
  const climateScore =
    city.climate.includes('地中海') || city.climate.includes('亚热带')
      ? 9
      : city.climate.includes('热带')
      ? 8
      : 7;
  const safetyScore = city.tags.includes('safety') ? 10 : 8;
  const costScore = 11 - city.costOfLiving * 2;

  return [
    { subject: '网速评分', value: city.internetScore, fullMark: 10 },
    { subject: '共享办公', value: communityScore, fullMark: 10 },
    { subject: '生活成本', value: costScore, fullMark: 10 },
    { subject: '签证友好', value: city.visaFriendliness, fullMark: 10 },
    { subject: '社群活跃', value: communityScore, fullMark: 10 },
    { subject: '美食丰富', value: foodScore, fullMark: 10 },
    { subject: '气候舒适', value: climateScore, fullMark: 10 },
    { subject: '安全程度', value: safetyScore, fullMark: 10 },
  ];
}

export default function CityDetail() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { cities } = useCityStore();
  const { getWorkspacesByCity } = useWorkspaceStore();

  const city = useMemo(() => cities.find((c) => c.id === cityId), [cities, cityId]);
  const workspaces = useMemo(() => (cityId ? getWorkspacesByCity(cityId) : []), [cityId, getWorkspacesByCity]);
  const radarData = useMemo(() => (city ? getRadarData(city) : []), [city]);

  if (!city) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">未找到该城市</p>
          <button
            onClick={() => navigate('/cities')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            返回城市列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/cities')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-teal-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回城市列表</span>
        </button>

        {/* Hero */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 opacity-60" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl">{city.flag}</span>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{city.name}</h1>
                  <div className="flex items-center gap-1 text-slate-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{city.country}</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed max-w-2xl">{city.description}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-3xl gradient-card flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">{city.overallScore}</span>
              </div>
              <span className="text-sm text-slate-400 mt-2">综合评分</span>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3.5 h-3.5',
                      i <= Math.round(city.overallScore / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Radar Chart + Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Radar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">八维能力雷达图</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickCount={5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}/10`, '得分']}
                  />
                  <Radar
                    name="评分"
                    dataKey="value"
                    stroke="#0f766e"
                    fill="#0f766e"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-slate-400 mb-1">月度生活成本</p>
              <p className="text-2xl font-bold text-slate-900">${city.monthlyCostUsd}</p>
              <p className="text-xs text-slate-400 mt-1">
                成本等级：{['', '极低', '较低', '中等', '较高', '极高'][city.costOfLiving]}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                <Wifi className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-slate-400 mb-1">平均网速</p>
              <p className="text-2xl font-bold text-slate-900">{city.avgInternetMbps}Mbps</p>
              <p className="text-xs text-slate-400 mt-1">网速评分：{city.internetScore}/10</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                <Sun className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-xs text-slate-400 mb-1">气候类型</p>
              <p className="text-lg font-bold text-slate-900">{city.climate}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-slate-400 mb-1">所在时区</p>
              <p className="text-2xl font-bold text-slate-900">{city.timezone}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-xs text-slate-400 mb-1">共享办公空间</p>
              <p className="text-2xl font-bold text-slate-900">{city.coworkingSpaces}个</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                <Plane className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-slate-400 mb-1">签证友好度</p>
              <p className="text-2xl font-bold text-slate-900">{city.visaFriendliness}/10</p>
            </div>
          </div>
        </div>

        {/* Best For + Action */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">适合人群</h3>
              <div className="flex flex-wrap gap-2">
                {city.bestFor.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-sm rounded-full bg-teal-50 text-teal-700 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              <CalendarPlus className="w-5 h-5" />
              添加到旅居计划
            </button>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-6 shadow-sm border border-teal-100 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            推荐理由
          </h3>
          <p className="text-slate-600 leading-relaxed">{city.description}</p>
        </div>

        {/* Workspaces */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            已探索的工作空间
            <span className="text-sm font-normal text-slate-400">({workspaces.length})</span>
          </h3>

          {workspaces.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>该城市还没有探索过的工作空间</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workspaces.map((ws) => {
                const WsIcon = getWorkspaceIcon(ws.type);
                return (
                  <div
                    key={ws.id}
                    className="p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <WsIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{ws.name}</h4>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                            {getWorkspaceTypeName(ws.type)}
                          </span>
                        </div>
                        {ws.address && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{ws.address}</span>
                          </div>
                        )}
                        <p className="text-sm text-slate-500">{ws.notes}</p>
                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-xs">
                            <Wifi className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-slate-500">网速</span>
                            <span className="font-semibold text-slate-700">{ws.internetSpeed}/10</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Volume2 className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-slate-500">安静</span>
                            <span className="font-semibold text-slate-700">{11 - ws.noiseLevel}/10</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-slate-500">价格</span>
                            <span className="font-semibold text-slate-700">{ws.priceLevel}/5</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Shield className="w-3.5 h-3.5 text-teal-500" />
                            <span className="text-slate-500">工作友好</span>
                            <span className="font-semibold text-slate-700">{ws.workFriendly}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
