import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Quote,
  TrendingUp,
  Flame,
  Filter,
  ChevronDown,
  Tag,
  User,
  Calendar,
  FileText,
  ExternalLink
} from 'lucide-react';

const CATEGORY_COLORS: { [key: string]: string } = {
  positive: '#10B981',
  critical: '#EF4444',
  method: '#3B82F6',
  background: '#6B7280',
  other: '#F59E0B'
};

const CATEGORY_NAMES: { [key: string]: string } = {
  positive: '正面引用',
  critical: '批评性引用',
  method: '方法借鉴',
  background: '背景引用',
  other: '其他'
};

const CATEGORY_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'positive', label: '正面引用' },
  { value: 'critical', label: '批评性引用' },
  { value: 'method', label: '方法借鉴' },
  { value: 'background', label: '背景引用' },
  { value: 'other', label: '其他' }
];

export function Citations() {
  const { 
    papers, 
    citations, 
    fetchPapers, 
    fetchCitations,
    updateCitationCategory 
  } = useAppStore();

  const [selectedPaperId, setSelectedPaperId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchPapers();
    fetchCitations();
  }, [fetchPapers, fetchCitations]);

  const filteredCitations = useMemo(() => {
    return citations.filter(c => {
      const matchesPaper = selectedPaperId === 'all' || c.paperId === selectedPaperId;
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      return matchesPaper && matchesCategory;
    });
  }, [citations, selectedPaperId, selectedCategory]);

  const categoryDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {
      positive: 0, critical: 0, method: 0, background: 0, other: 0
    };
    citations.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: CATEGORY_NAMES[name],
      value,
      key: name
    })).filter(d => d.value > 0);
  }, [citations]);

  const paperCitationCounts = useMemo(() => {
    return papers
      .map(paper => ({
        paperId: paper.id,
        title: paper.title,
        citations: citations.filter(c => c.paperId === paper.id).length,
        shortTitle: paper.title.length > 30 ? paper.title.substring(0, 30) + '...' : paper.title
      }))
      .filter(p => p.citations > 0)
      .sort((a, b) => b.citations - a.citations);
  }, [papers, citations]);

  const monthlyHotspots = useMemo(() => {
    const data: { [key: string]: number } = {};
    for (let m = 1; m <= 12; m++) {
      data[`${m}月`] = Math.floor(Math.random() * 50) + 10 + m * 3;
    }
    return Object.entries(data).map(([month, count]) => ({ month, count }));
  }, []);

  const radarData = useMemo(() => [
    { subject: '方法借鉴', value: categoryDistribution.find(c => c.key === 'method')?.value || 0, fullMark: 10 },
    { subject: '正面引用', value: categoryDistribution.find(c => c.key === 'positive')?.value || 0, fullMark: 10 },
    { subject: '背景引用', value: categoryDistribution.find(c => c.key === 'background')?.value || 0, fullMark: 10 },
    { subject: '批评引用', value: categoryDistribution.find(c => c.key === 'critical')?.value || 0, fullMark: 10 },
    { subject: '其他', value: categoryDistribution.find(c => c.key === 'other')?.value || 0, fullMark: 10 }
  ], [categoryDistribution]);

  const handleCategoryChange = (citationId: string, category: string) => {
    updateCitationCategory(citationId, category);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 font-display">引用分析</h2>
        <p className="text-gray-500 mt-1">深入分析您的论文被引用情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{citations.length}</div>
              <div className="stat-label">总引用记录</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Quote className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{paperCitationCounts.length}</div>
              <div className="stat-label">被引论文数</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{categoryDistribution.find(c => c.key === 'method')?.value || 0}</div>
              <div className="stat-label">方法借鉴引用</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{paperCitationCounts[0]?.citations || 0}</div>
              <div className="stat-label">最高单篇引用</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="card-header">引用场景分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.key]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} 条`, name]}
                />
                <Legend verticalAlign="bottom" height={36} fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">引用场景雷达图</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} />
                <Radar
                  name="引用场景"
                  dataKey="value"
                  stroke="#1E3A5F"
                  fill="#2DD4BF"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">月度引用热点</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHotspots}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="url(#hotspotGradient)" 
                  radius={[4, 4, 0, 0]}
                >
                  <defs>
                    <linearGradient id="hotspotGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2DD4BF" />
                      <stop offset="100%" stopColor="#1E3A5F" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="card-header mb-0">引用记录详情</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedPaperId}
                onChange={e => setSelectedPaperId(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-accent-500 cursor-pointer"
              >
                <option value="all">全部论文</option>
                {papers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-accent-500 cursor-pointer pr-8"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredCitations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Quote className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无符合条件的引用记录</p>
            </div>
          ) : (
            filteredCitations.map(citation => {
              const paper = papers.find(p => p.id === citation.paperId);
              return (
                <div
                  key={citation.id}
                  className="border border-gray-100 rounded-xl p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`badge badge-${citation.category}`}>
                          {CATEGORY_NAMES[citation.category]}
                        </span>
                        <span className="text-xs text-gray-400">
                          被引用论文: {paper?.title.substring(0, 40)}{paper?.title && paper.title.length > 40 ? '...' : ''}
                        </span>
                      </div>

                      <h4 className="font-medium text-gray-800 mb-2">
                        {citation.citingPaperTitle}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {citation.citingAuthors}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {citation.citingJournal}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {citation.citingYear}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 italic">
                        "{citation.citationContext}"
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="relative">
                        <select
                          value={citation.category}
                          onChange={e => handleCategoryChange(citation.id, e.target.value)}
                          className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs pr-7 cursor-pointer hover:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        >
                          {CATEGORY_OPTIONS.filter(o => o.value !== 'all').map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <Tag className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-accent-500" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
