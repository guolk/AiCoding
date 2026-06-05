import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TrendingUp, Users, MessageSquare, Clock, BarChart3, Eye, Calendar, ChevronDown } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';

export default function DataAnalytics() {
  const { analytics, episodes, platforms } = useAppStore();
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(episodes.find(e => e.status === 'published')?.id || '');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const selectedEpisode = episodes.find(e => e.id === selectedEpisodeId);

  const platformColors: Record<string, string> = {
    'p1': '#ff6b35',
    'p2': '#6366f1',
    'p3': '#1db954',
    'p4': '#f59e0b',
    'p5': '#ef4444',
  };

  const getPlatformColor = (platformId: string) => platformColors[platformId] || '#64748b';

  const dailyData = analytics
    .filter(a => a.episodeId === selectedEpisodeId)
    .reduce((acc, data) => {
      const date = format(new Date(data.date), 'MM-dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          plays: 0,
          newSubscribers: 0,
          comments: 0,
        };
      }
      acc[date].plays += data.plays;
      acc[date].newSubscribers += data.newSubscribers;
      acc[date].comments += data.comments;
      return acc;
    }, {} as Record<string, { date: string; plays: number; newSubscribers: number; comments: number }>);

  const chartData = Object.values(dailyData).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime());

  const platformData = platforms.filter(p => p.enabled).map(platform => {
    const platformAnalytics = analytics.filter(
      a => a.episodeId === selectedEpisodeId && a.platformId === platform.id
    );
    const totalPlays = platformAnalytics.reduce((sum, a) => sum + a.plays, 0);
    const totalSubs = platformAnalytics.reduce((sum, a) => sum + a.newSubscribers, 0);
    const avgListenTime = platformAnalytics.length > 0
      ? Math.round(platformAnalytics.reduce((sum, a) => sum + a.averageListenTime, 0) / platformAnalytics.length)
      : 0;

    return {
      name: platform.name,
      plays: totalPlays,
      subscribers: totalSubs,
      avgListenTime: avgListenTime / 60,
    };
  });

  const totalPlays = chartData.reduce((sum, d) => sum + d.plays, 0);

  const totalSubs = chartData.reduce((sum, d) => sum + d.newSubscribers, 0);

  const totalComments = chartData.reduce((sum, d) => sum + d.comments, 0);

  const avgListenTimeAll = analytics.filter(a => a.episodeId === selectedEpisodeId);

  const overallAvgListen = avgListenTimeAll.length > 0
    ? Math.round(avgListenTimeAll.reduce((sum, a) => sum + a.averageListenTime, 0) / avgListenTimeAll.length / 60)
    : 0;

  const pieData = platformData.map(p => ({
    name: p.name,
    value: p.plays,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-600">选择节目:</label>
          <div className="relative">
            <select
              value={selectedEpisodeId}
              onChange={(e) => setSelectedEpisodeId(e.target.value)}
              className="px-4 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none bg-white min-w-[280px">
              {episodes.filter(e => e.status === 'published').map(ep => (
                <option key={ep.id} value={ep.id}>{ep.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                timeRange === range
                  ? 'bg-accent-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-accent-500 hover:text-accent-500'
              )}
            >
              {range === '7d' ? '7天' : range === '30d' ? '30天' : '90天'}
            </button>
          ))}
        </div>
      </div>

      {selectedEpisode && (
        <div className="bg-gradient-to-r from-primary-950 to-primary-800 rounded-2xl p-6 text-white">
          <h2 className="font-display text-2xl font-bold mb-1">{selectedEpisode.title}</h2>
          <p className="text-slate-300 text-sm">发布于 {selectedEpisode.publishDate ? format(new Date(selectedEpisode.publishDate), 'yyyy年MM月dd日') : '未知日期'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{totalPlays.toLocaleString()}</p>
              <p className="text-sm text-slate-500">总播放量</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
            <TrendingUp size={14} />
            <span>+12.5%</span>
            <span className="text-slate-400 ml-1">vs 上周</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">+{totalSubs}</p>
              <p className="text-sm text-slate-500">新增订阅</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
            <TrendingUp size={14} />
            <span>+8.3%</span>
            <span className="text-slate-400 ml-1">vs 上周</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{totalComments}</p>
              <p className="text-sm text-slate-500">评论互动</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm text-red-500">
            <TrendingUp size={14} />
            <span>-2.1%</span>
            <span className="text-slate-400 ml-1">vs 上周</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{overallAvgListen.toFixed(1)}</p>
              <p className="text-sm text-slate-500">平均收听(分钟)</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
            <TrendingUp size={14} />
            <span>+5.7%</span>
            <span className="text-slate-400 ml-1">vs 上期</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="text-accent-500" size={20} />
            播放量趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2942',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="plays"
                  stroke="#ff6b35"
                  strokeWidth={3}
                  fill="url(#colorPlays)"
                  name="播放量"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="text-primary-500" size={20} />
            平台分布
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getPlatformColor(platforms[index]?.id || '')}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2942',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {platformData.map(platform => (
              <div key={platform.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getPlatformColor(platforms.find(p => p.name === platform.name)?.id || '') }}
                />
                <span className="text-slate-600">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="text-primary-500" size={20} />
          平台数据对比
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2942',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="plays" name="播放量" fill="#ff6b35" radius={[4, 4, 0, 0]} />
              <Bar dataKey="subscribers" name="新增订阅" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">各平台详细数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">平台</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">播放量</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">新增订阅</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">评论数</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">平均收听时长</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {platformData.map(platform => (
                <tr key={platform.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPlatformColor(platforms.find(p => p.name === platform.name)?.id || '') }}
                      />
                      <span className="font-medium text-slate-800">{platform.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-800">
                    {platform.plays.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-800">
                    +{platform.subscribers}
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-800">
                    {platformData.reduce((sum, p) => {
                      const a = analytics.filter(
                        x => x.episodeId === selectedEpisodeId && x.platformId === platforms.find(p => p.name === platform.name)?.id
                      );
                      return sum + a.reduce((s, x) => s + x.comments, 0);
                    }, 0)}
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-800">
                    {platform.avgListenTime.toFixed(1)} 分钟
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
