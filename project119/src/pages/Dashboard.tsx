import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  FileText, 
  Quote, 
  Award,
  ArrowUpRight,
  Clock,
  ExternalLink
} from 'lucide-react';

const CATEGORY_COLORS = {
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

export function Dashboard() {
  const { 
    papers, 
    citations, 
    impactMetrics, 
    fetchPapers, 
    fetchCitations, 
    fetchImpactMetrics 
  } = useAppStore();

  useEffect(() => {
    fetchPapers();
    fetchCitations();
    fetchImpactMetrics();
  }, [fetchPapers, fetchCitations, fetchImpactMetrics]);

  const totalCitations = useMemo(() => {
    return papers.reduce((sum, p) => sum + p.currentCitations, 0);
  }, [papers]);

  const citationTrendData = useMemo(() => {
    const data: { month: string; citations: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      data.push({
        month: `${m}月`,
        citations: Math.floor(Math.random() * 200) + 50 + m * 10
      });
    }
    return data;
  }, []);

  const citationDistribution = useMemo(() => {
    const categoryCount: { [key: string]: number } = {
      positive: 0, critical: 0, method: 0, background: 0, other: 0
    };
    citations.forEach(c => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });
    return Object.entries(categoryCount).map(([name, value]) => ({
      name: CATEGORY_NAMES[name],
      value
    }));
  }, [citations]);

  const topPapers = useMemo(() => {
    return [...papers]
      .sort((a, b) => b.currentCitations - a.currentCitations)
      .slice(0, 5);
  }, [papers]);

  const recentCitations = useMemo(() => {
    return [...citations]
      .sort((a, b) => new Date(b.citedDate).getTime() - new Date(a.citedDate).getTime())
      .slice(0, 4);
  }, [citations]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{impactMetrics?.hIndex || 0}</div>
              <div className="stat-label">H指数</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-green-600">
            <ArrowUpRight className="w-4 h-4" />
            <span>较上月 +2</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{totalCitations.toLocaleString()}</div>
              <div className="stat-label">总引用次数</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Quote className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-green-600">
            <ArrowUpRight className="w-4 h-4" />
            <span>本月 +12.5%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{papers.length}</div>
              <div className="stat-label">论文总数</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>2020-2024</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{impactMetrics?.percentileRanking || 0}%</div>
              <div className="stat-label">领域百分位</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-green-600">
            <ArrowUpRight className="w-4 h-4" />
            <span>前 {100 - (impactMetrics?.percentileRanking || 0)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="card-header mb-0">引用增长趋势</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-500">
              <option>近12个月</option>
              <option>近24个月</option>
              <option>全部</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={citationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="citations"
                  stroke="#1E3A5F"
                  strokeWidth={3}
                  dot={{ fill: '#1E3A5F', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#2DD4BF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">引用场景分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={citationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {citationDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={Object.values(CATEGORY_COLORS)[index]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  fontSize={11}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="card-header">高被引论文</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPapers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="title" 
                  stroke="#9CA3AF" 
                  fontSize={10}
                  width={150}
                  tickFormatter={(value) => 
                    value.length > 25 ? value.substring(0, 25) + '...' : value
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} 次引用`, '被引次数']}
                  labelFormatter={(label) => label}
                />
                <Bar 
                  dataKey="currentCitations" 
                  fill="url(#barGradient)" 
                  radius={[0, 4, 4, 0]}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1E3A5F" />
                      <stop offset="100%" stopColor="#2DD4BF" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">最近引用</h3>
          <div className="space-y-4">
            {recentCitations.map((citation, idx) => (
              <div 
                key={citation.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <span className={`badge badge-${citation.category} mt-0.5 shrink-0`}>
                  {CATEGORY_NAMES[citation.category]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {citation.citingPaperTitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {citation.citingAuthors} · {citation.citingJournal}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {citation.citationContext}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
