import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  Award,
  Users,
  BarChart3,
  Zap,
  ArrowUpRight,
  Percent,
  FileText,
  Target
} from 'lucide-react';

export function Impact() {
  const { 
    papers, 
    impactMetrics, 
    comparisonData, 
    fetchPapers, 
    fetchImpactMetrics, 
    fetchComparisonData 
  } = useAppStore();

  useEffect(() => {
    fetchPapers();
    fetchImpactMetrics();
    fetchComparisonData();
  }, [fetchPapers, fetchImpactMetrics, fetchComparisonData]);

  const citationDistribution = useMemo(() => {
    return [...papers]
      .sort((a, b) => b.currentCitations - a.currentCitations)
      .map(p => ({
        name: p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title,
        fullTitle: p.title,
        citations: p.currentCitations,
        field: p.field
      }));
  }, [papers]);

  const yearlyTrend = useMemo(() => {
    const data: { year: number; citations: number; papers: number }[] = [];
    for (let y = 2020; y <= 2024; y++) {
      data.push({
        year: y,
        citations: Math.floor(Math.random() * 400) + 100 + (y - 2020) * 150,
        papers: y === 2020 ? 1 : y === 2021 ? 2 : y === 2022 ? 3 : y === 2023 ? 4 : 5
      });
    }
    return data;
  }, []);

  const radarComparisonData = useMemo(() => {
    if (!comparisonData) return [];
    return [
      { subject: '您的H指数', value: comparisonData.userHIndex, fullMark: 20 },
      { subject: '领域中位数', value: comparisonData.fieldMedian, fullMark: 20 },
      { subject: '75分位', value: comparisonData.field75Percentile, fullMark: 20 },
      { subject: '90分位', value: comparisonData.field90Percentile, fullMark: 20 }
    ];
  }, [comparisonData]);

  const percentileProgress = useMemo(() => {
    return comparisonData?.userPercentile || 0;
  }, [comparisonData]);

  const progressColor = percentileProgress >= 75 
    ? 'from-emerald-500 to-teal-500' 
    : percentileProgress >= 50 
      ? 'from-blue-500 to-cyan-500' 
      : 'from-amber-500 to-orange-500';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 font-display">学术影响力指标</h2>
        <p className="text-gray-500 mt-1">全面评估您的学术影响力</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value text-4xl">{impactMetrics?.hIndex || 0}</div>
                <div className="stat-label">H指数</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Award className="w-7 h-7 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 text-sm text-amber-600 font-medium flex items-center gap-1">
              <Target className="w-4 h-4" />
              卓越的学术产出
            </div>
          </div>
        </div>

        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value text-4xl">{(impactMetrics?.totalCitations || 0).toLocaleString()}</div>
                <div className="stat-label">总引用次数</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              较上年 +23.5%
            </div>
          </div>
        </div>

        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value text-4xl">{impactMetrics?.averageCitationsPerPaper || 0}</div>
                <div className="stat-label">篇均引用</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 text-sm text-emerald-600 font-medium flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {papers.length} 篇论文
            </div>
          </div>
        </div>

        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-bl-full opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-value text-4xl">{percentileProgress}%</div>
                <div className="stat-label">领域百分位</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Percent className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 text-sm text-purple-600 font-medium flex items-center gap-1">
              <Users className="w-4 h-4" />
              超越 {100 - percentileProgress}% 学者
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="card-header">历年引用趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyTrend}>
                <defs>
                  <linearGradient id="colorCitations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="citations"
                  stroke="#1E3A5F"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCitations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">与同领域学者对比</h3>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${percentileProgress * 2.51} 251`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1E3A5F" />
                    <stop offset="100%" stopColor="#2DD4BF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-primary-900 font-display">{percentileProgress}%</span>
                <span className="text-xs text-gray-500">超越比例</span>
              </div>
            </div>

            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">您的位置</span>
                <span className="font-semibold text-primary-900">前 {100 - percentileProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${progressColor} h-2 rounded-full transition-all duration-1000`}
                  style={{ width: `${percentileProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>底部</span>
                <span>中位数</span>
                <span>顶尖</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="card-header">各论文引用量分布</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={citationDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF" 
                  fontSize={10}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} 次引用`, '被引次数']}
                />
                <Bar 
                  dataKey="citations" 
                  fill="url(#barGradient2)" 
                  radius={[4, 4, 0, 0]}
                >
                  <defs>
                    <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2DD4BF" />
                      <stop offset="100%" stopColor="#1E3A5F" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">H指数对比雷达图</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarComparisonData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar
                  name="指标值"
                  dataKey="value"
                  stroke="#1E3A5F"
                  fill="#2DD4BF"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {impactMetrics?.mostCitedPaper && (
        <div className="card bg-gradient-to-r from-primary-900 to-accent-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl font-semibold mb-1">最高被引论文</h3>
              <p className="text-white/80 truncate">
                {impactMetrics.mostCitedPaper.title}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                <span>{impactMetrics.mostCitedPaper.journal}</span>
                <span>•</span>
                <span>{impactMetrics.mostCitedPaper.authors}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-4xl font-bold font-display">
                {impactMetrics.mostCitedPaper.currentCitations.toLocaleString()}
              </div>
              <div className="text-white/70 text-sm">被引次数</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
