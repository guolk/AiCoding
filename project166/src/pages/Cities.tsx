import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  DollarSign,
  Wifi,
  Users,
  Star,
  MapPin,
  Clock,
  Plane,
  Sun,
  Globe,
} from 'lucide-react';
import { useCityStore } from '@/store/cityStore';
import { cn } from '@/lib/utils';

const TAG_OPTIONS = [
  { key: 'budget', label: '预算型', icon: DollarSign },
  { key: 'internet', label: '网络型', icon: Wifi },
  { key: 'community', label: '社群型', icon: Users },
  { key: 'europe', label: '欧洲', icon: Globe },
  { key: 'beach', label: '海滩', icon: Sun },
  { key: 'dvisa', label: '签证友好', icon: Plane },
];

const SORT_OPTIONS = [
  { key: 'score', label: '综合评分' },
  { key: 'cost', label: '生活成本' },
  { key: 'internet', label: '网速' },
  { key: 'name', label: '城市名' },
];

function CityCard({ city }: { city: import('@/types').City }) {
  const navigate = useNavigate();

  const metrics = [
    { icon: Wifi, label: '网速', value: `${city.avgInternetMbps}Mbps`, score: city.internetScore },
    { icon: Users, label: '共享空间', value: `${city.coworkingSpaces}个`, score: Math.min(10, Math.round(city.coworkingSpaces / 15)) },
    { icon: DollarSign, label: '成本', value: `$${city.monthlyCostUsd}`, score: 6 - city.costOfLiving },
    { icon: Plane, label: '签证', value: '', score: city.visaFriendliness },
    { icon: Sun, label: '气候', value: city.climate.slice(0, 4), score: 7 },
    { icon: Clock, label: '时区', value: city.timezone, score: 6 },
  ];

  return (
    <div
      onClick={() => navigate(`/cities/${city.id}`)}
      className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:border-teal-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{city.flag}</span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
              {city.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{city.country}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl gradient-card flex items-center justify-center shadow-md">
            <span className="text-xl font-bold text-white">{city.overallScore}</span>
          </div>
          <span className="text-xs text-slate-400 mt-1">综合评分</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <m.icon className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">{m.label}</span>
            </div>
            <div className="flex items-center gap-1">
              {m.value && <span className="text-xs font-medium text-slate-700">{m.value}</span>}
              <div className="flex gap-0.5 ml-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1 h-1 rounded-full',
                      i <= Math.round(m.score / 2) ? 'bg-teal-500' : 'bg-slate-200'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-slate-800">${city.monthlyCostUsd}</span>
          <span className="text-xs text-slate-400">/月</span>
        </div>
        <div className="flex gap-1">
          {city.tags.slice(0, 2).map((tag) => {
            const opt = TAG_OPTIONS.find((t) => t.key === tag);
            return (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-teal-50 text-teal-700"
              >
                {opt?.label || tag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RankingCard({
  city,
  rank,
  type,
}: {
  city: import('@/types').City;
  rank: number;
  type: 'budget' | 'internet' | 'community';
}) {
  const navigate = useNavigate();
  const rankColors = ['bg-amber-400', 'bg-slate-400', 'bg-orange-400', 'bg-slate-300', 'bg-slate-300'];

  let valueText = '';
  let valueIcon = null;
  if (type === 'budget') {
    valueText = `$${city.monthlyCostUsd}/月`;
    valueIcon = <DollarSign className="w-3.5 h-3.5" />;
  } else if (type === 'internet') {
    valueText = `${city.avgInternetMbps}Mbps`;
    valueIcon = <Wifi className="w-3.5 h-3.5" />;
  } else {
    valueText = `${city.coworkingSpaces}个`;
    valueIcon = <Users className="w-3.5 h-3.5" />;
  }

  return (
    <div
      onClick={() => navigate(`/cities/${city.id}`)}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <div
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
          rankColors[rank - 1]
        )}
      >
        {rank}
      </div>
      <span className="text-2xl flex-shrink-0">{city.flag}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 group-hover:text-teal-700 truncate">
          {city.name}
        </p>
        <p className="text-xs text-slate-400 truncate">{city.country}</p>
      </div>
      <div className="flex items-center gap-1 text-teal-600 flex-shrink-0">
        {valueIcon}
        <span className="text-sm font-semibold">{valueText}</span>
      </div>
    </div>
  );
}

export default function Cities() {
  const {
    cities,
    selectedTag,
    searchQuery,
    sortBy,
    setSelectedTag,
    setSearchQuery,
    setSortBy,
    getFilteredCities,
  } = useCityStore();

  const filteredCities = useMemo(() => getFilteredCities(), [cities, selectedTag, searchQuery, sortBy, getFilteredCities]);

  const budgetTop5 = useMemo(
    () => [...cities].sort((a, b) => a.monthlyCostUsd - b.monthlyCostUsd).slice(0, 5),
    [cities]
  );

  const internetTop5 = useMemo(
    () => [...cities].sort((a, b) => b.avgInternetMbps - a.avgInternetMbps).slice(0, 5),
    [cities]
  );

  const communityTop5 = useMemo(
    () => [...cities].sort((a, b) => b.coworkingSpaces - a.coworkingSpaces).slice(0, 5),
    [cities]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">城市数据库</h1>
          <p className="text-slate-500">探索全球数字游民最爱的旅居城市</p>
        </div>

        {/* Search + Sort + Tags */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索城市或国家..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'cost' | 'internet' | 'name')}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    排序：{opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                selectedTag === null
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Star className="w-4 h-4" />
              全部
            </button>
            {TAG_OPTIONS.map((tag) => {
              const Icon = tag.icon;
              const active = selectedTag === tag.key;
              return (
                <button
                  key={tag.key}
                  onClick={() => setSelectedTag(active ? null : tag.key)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                    active ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Rankings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">预算友好城市</h3>
                <p className="text-xs text-slate-400">按月度生活成本升序</p>
              </div>
            </div>
            <div className="space-y-1">
              {budgetTop5.map((city, i) => (
                <RankingCard key={city.id} city={city} rank={i + 1} type="budget" />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">网络高速城市</h3>
                <p className="text-xs text-slate-400">按平均网速降序</p>
              </div>
            </div>
            <div className="space-y-1">
              {internetTop5.map((city, i) => (
                <RankingCard key={city.id} city={city} rank={i + 1} type="internet" />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">社群活跃城市</h3>
                <p className="text-xs text-slate-400">按共享空间数量降序</p>
              </div>
            </div>
            <div className="space-y-1">
              {communityTop5.map((city, i) => (
                <RankingCard key={city.id} city={city} rank={i + 1} type="community" />
              ))}
            </div>
          </div>
        </div>

        {/* City Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">全部城市</h2>
          <span className="text-sm text-slate-400">共 {filteredCities.length} 个城市</span>
        </div>

        {filteredCities.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <p className="text-slate-500">没有找到匹配的城市</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
