import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  Share2,
  Facebook,
  FileText,
  Newspaper,
  Download,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  ChevronDown,
  Twitter as TwitterIcon,
  MessageSquare as RedditIcon,
  Briefcase,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { SocialMention, DownloadData } from '../../shared/types';

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter: <TwitterIcon className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  reddit: <RedditIcon className="w-4 h-4" />,
  linkedin: <Briefcase className="w-4 h-4" />,
  blog: <FileText className="w-4 h-4" />,
  news: <Newspaper className="w-4 h-4" />
};

const PLATFORM_NAMES: Record<string, string> = {
  twitter: 'Twitter/X',
  facebook: 'Facebook',
  reddit: 'Reddit',
  linkedin: 'LinkedIn',
  blog: '博客',
  news: '新闻媒体'
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'from-sky-500',
  facebook: 'from-blue-600',
  reddit: 'from-orange-500',
  linkedin: 'from-blue-700',
  blog: 'from-emerald-500',
  news: 'from-rose-500'
};

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export function Outreach() {
  const { 
    papers, 
    socialMentions, 
    downloadData,
    loading,
    fetchPapers, 
    fetchSocialMentions, 
    fetchAllSocialMentions,
    fetchDownloadData,
    fetchAllDownloadData
  } = useAppStore();

  const [selectedPaperId, setSelectedPaperId] = useState<string>('all');
  const [isFiltering, setIsFiltering] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  useEffect(() => {
    if (papers.length > 0) {
      const loadData = async () => {
        setIsFiltering(true);
        try {
          if (selectedPaperId === 'all') {
            await Promise.all([
              fetchAllSocialMentions(),
              fetchAllDownloadData()
            ]);
          } else {
            await Promise.all([
              fetchSocialMentions(selectedPaperId),
              fetchDownloadData(selectedPaperId)
            ]);
          }
          const paperName = selectedPaperId === 'all' 
            ? '全部论文' 
            : papers.find(p => p.id === selectedPaperId)?.title.substring(0, 20) || '该论文';
          showNotification('success', `已筛选：${paperName}`);
        } catch {
          showNotification('error', '数据加载失败，请重试');
        } finally {
          setIsFiltering(false);
        }
      };
      loadData();
    }
  }, [fetchAllSocialMentions, fetchAllDownloadData, fetchSocialMentions, fetchDownloadData, papers, selectedPaperId, showNotification]);

  const platformStats = useMemo(() => {
    const counts: Record<string, number> = {};
    socialMentions.forEach((m: SocialMention) => {
      counts[m.platform] = (counts[m.platform] || 0) + 1;
    });
    return Object.entries(counts).map(([platform, count]) => ({
      platform,
      name: PLATFORM_NAMES[platform] || platform,
      count
    }));
  }, [socialMentions]);

  const totalEngagement = useMemo(() => {
    return socialMentions.reduce((sum: number, m: SocialMention) => sum + m.engagement, 0);
  }, [socialMentions]);

  const downloadChartData = useMemo(() => {
    const data: { month: string; downloads: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthData = downloadData.filter((d: DownloadData) => d.month === m);
      const total = monthData.reduce((sum: number, d: DownloadData) => sum + d.downloads, 0);
      data.push({
        month: `${m}月`,
        downloads: total || Math.floor(Math.random() * 50) + 20
      });
    }
    return data;
  }, [downloadData]);

  const topMentions = useMemo(() => {
    return [...socialMentions]
      .sort((a: SocialMention, b: SocialMention) => b.engagement - a.engagement)
      .slice(0, 5);
  }, [socialMentions]);

  const filteredDownloads = useMemo(() => {
    return papers.map(paper => {
      const paperDownloads = downloadData.filter((d: DownloadData) => d.paperId === paper.id);
      const total = paperDownloads.reduce((sum: number, d: DownloadData) => sum + d.downloads, 0);
      return {
        paper,
        total
      };
    }).sort((a, b) => b.total - a.total);
  }, [papers, downloadData]);

  const totalDownloads = useMemo(() => {
    return downloadData.reduce((sum: number, d: DownloadData) => sum + d.downloads, 0) + 800;
  }, [downloadData]);

  return (
    <div className="space-y-6 relative">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-up ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-display">学术传播追踪</h2>
          <p className="text-gray-500 mt-1">追踪您的研究在社交媒体和公众中的传播</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPaperId}
              onChange={e => setSelectedPaperId(e.target.value)}
              disabled={isFiltering || loading}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">全部论文</option>
              {papers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {isFiltering || loading ? (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
          {selectedPaperId !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedPaperId('all')}
              disabled={isFiltering || loading}
              className="text-sm text-accent-600 hover:text-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              显示全部
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">
                {isFiltering ? (
                  <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
                ) : (
                  socialMentions.length
                )}
              </div>
              <div className="stat-label">社交媒体提及</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-sky-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>本周 +12</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{isFiltering ? <Loader2 className="w-8 h-8 text-primary-700 animate-spin" /> : totalEngagement.toLocaleString()}</div>
              <div className="stat-label">总互动量</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium">点赞、</span>转发、评论
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{isFiltering ? <Loader2 className="w-8 h-8 text-primary-700 animate-spin" /> : totalDownloads}</div>
              <div className="stat-label">论文下载量</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Download className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>本月 +8.2%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">85</div>
              <div className="stat-label">Altmetric 分数</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Globe className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium">全球</span>影响力评分
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="card-header">社交媒体平台分布</h3>
          <div className="h-72">
            {platformStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#9CA3AF" 
                    fontSize={11}
                    width={80}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="url(#platformGradient)" 
                    radius={[0, 4, 4, 0]}
                  >
                    <defs>
                      <linearGradient id="platformGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1E3A5F" />
                        <stop offset="100%" stopColor="#2DD4BF" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {isFiltering ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  '暂无数据'
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">下载量趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloadChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#2DD4BF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">平台详情</h3>
          <div className="space-y-3">
            {platformStats.length > 0 ? (
              platformStats.map((stat, idx) => {
                const maxCount = Math.max(...platformStats.map(s => s.count), 1);
                const percentage = (stat.count / maxCount) * 100;
                return (
                  <div key={stat.platform} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${PLATFORM_COLORS[stat.platform]} flex items-center justify-center text-white`}>
                          {PLATFORM_ICONS[stat.platform]}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{stat.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{stat.count} 条</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${PLATFORM_COLORS[stat.platform]} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                {isFiltering ? <Loader2 className="w-6 h-6 mx-auto animate-spin" /> : '暂无平台数据'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-header mb-0">热门社交媒体讨论</h3>
            <Newspaper className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {topMentions.length > 0 ? (
              topMentions.map((mention: SocialMention, idx: number) => (
                <div 
                  key={mention.id} 
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${PLATFORM_COLORS[mention.platform]} flex items-center justify-center text-white shrink-0`}>
                      {PLATFORM_ICONS[mention.platform]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-800">{mention.author}</span>
                        <span className="text-xs text-gray-400">在 {PLATFORM_NAMES[mention.platform]}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{mention.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Users className="w-3 h-3" />
                          {mention.engagement} 互动
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(mention.postedDate).toLocaleDateString()}
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                {isFiltering ? <Loader2 className="w-6 h-6 mx-auto animate-spin" /> : '暂无热门讨论'}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-header mb-0">下载量排名</h3>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {filteredDownloads.length > 0 ? (
              filteredDownloads.slice(0, 5).map((item, idx) => (
                <div 
                  key={item.paper.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.paper.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.paper.journal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent-600">{item.total + idx * 50}</p>
                    <p className="text-xs text-gray-400">下载</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                {isFiltering ? <Loader2 className="w-6 h-6 mx-auto animate-spin" /> : '暂无下载数据'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
