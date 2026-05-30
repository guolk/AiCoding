import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive as ArchiveIcon,
  Plus,
  Search,
  FileText,
  BookOpen,
  ExternalLink,
  Link2,
  TrendingUp,
  Award,
  BarChart3,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { useStore } from '../store/useStore';
import { mockPublications } from '../utils/mockData';

const COLORS = ['#0ea5e9', '#10b981'];

export function Archive() {
  const navigate = useNavigate();

  const { publications = [] } = useStore();
  const actualPublications = publications.length > 0 ? publications : mockPublications;

  const stats = useMemo(() => {
    const totalCitations = actualPublications.reduce((sum, p) => sum + p.citations, 0);
    const conferenceCount = actualPublications.filter((p) => p.venueType === 'conference').length;
    const journalCount = actualPublications.filter((p) => p.venueType === 'journal').length;
    const avgCitations = actualPublications.length > 0 ? (totalCitations / actualPublications.length).toFixed(1) : '0';

    return {
      total: actualPublications.length,
      totalCitations,
      avgCitations,
      conferenceCount,
      journalCount,
    };
  }, [actualPublications]);

  const venueTypeData = useMemo(() => {
    return [
      { name: '会议论文', value: stats.conferenceCount },
      { name: '期刊论文', value: stats.journalCount },
    ];
  }, [stats]);

  const yearlyData = useMemo(() => {
    const yearMap: Record<number, { year: number; count: number; citations: number }> = {};
    actualPublications.forEach((p) => {
      if (!yearMap[p.year]) {
        yearMap[p.year] = { year: p.year, count: 0, citations: 0 };
      }
      yearMap[p.year].count++;
      yearMap[p.year].citations += p.citations;
    });
    return Object.values(yearMap).sort((a, b) => a.year - b.year);
  }, [actualPublications]);

  const sortedPublications = useMemo(() => {
    return [...actualPublications].sort(
      (a, b) => b.year - a.year || b.citations - a.citations
    );
  }, [actualPublications]);

  return (
    <Layout title="学术档案">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <Card.Body>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">总发表</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">总引用</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCitations}</p>
                </div>
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">平均引用</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgCitations}</p>
                </div>
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">会议/期刊</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.conferenceCount}/{stats.journalCount}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <ArchiveIcon className="w-5 h-5" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">发表类型分布</h3>
            </Card.Header>
            <Card.Body>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={venueTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {venueTypeData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                  <span className="text-sm text-gray-600">会议论文</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                  <span className="text-sm text-gray-600">期刊论文</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="lg:col-span-2">
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">年度发表统计</h3>
            </Card.Header>
            <Card.Body>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="发表数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </div>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">发表论文列表</h3>
              <button
                onClick={() => alert('添加论文功能')}
                className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加论文
              </button>
            </div>
          </Card.Header>
          <Card.Body>
            {sortedPublications.length === 0 ? (
              <div className="text-center py-12">
                <ArchiveIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无已发表论文</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPublications.map((pub) => (
                  <div
                    key={pub.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              pub.venueType === 'conference'
                                ? 'bg-sky-100 text-sky-600'
                                : 'bg-emerald-100 text-emerald-600'
                            }`}
                          >
                            {pub.venueType === 'conference' ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <BookOpen className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{pub.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {pub.venue} · {pub.year}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 ml-11">
                          <Badge
                            className={
                              pub.venueType === 'conference'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }
                          >
                            {pub.venueType === 'conference' ? '会议论文' : '期刊论文'}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {pub.citations} 引用
                          </span>
                          {pub.doi && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <Link2 className="w-4 h-4 mr-1" />
                              DOI: {pub.doi}
                            </span>
                          )}
                        </div>
                      </div>

                      {pub.link && (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sky-600 hover:text-sky-700 text-sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          查看
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
}
