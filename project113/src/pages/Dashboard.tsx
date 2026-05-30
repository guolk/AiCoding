import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Plane,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { ProgressBar } from '../components/Common/ProgressBar';
import { useStore } from '../store/useStore';
import {
  formatDate,
  getDaysUntil,
  getStatusText,
  getSubmissionStatusLabel,
  getSubmissionStatusColor,
} from '../utils/dateUtils';
import {
  mockConferences,
  mockSubmissions,
  mockPapers,
  mockPublications,
  mockScholars,
  mockAttendancePlans,
} from '../utils/mockData';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

export function Dashboard() {
  const navigate = useNavigate();
  const {
    conferences = [],
    submissions = [],
    papers = [],
    publications = [],
    scholars = [],
    attendancePlans = [],
  } = useStore();

  const actualConferences = conferences.length > 0 ? conferences : mockConferences;
  const actualSubmissions = submissions.length > 0 ? submissions : mockSubmissions;
  const actualPapers = papers.length > 0 ? papers : mockPapers;
  const actualPublications = publications.length > 0 ? publications : mockPublications;
  const actualScholars = scholars.length > 0 ? scholars : mockScholars;
  const actualAttendancePlans = attendancePlans.length > 0 ? attendancePlans : mockAttendancePlans;

  const upcomingDeadlines = useMemo(() => {
    return actualConferences
      .filter((c) => getDaysUntil(c.deadline) >= -7 && getDaysUntil(c.deadline) <= 90)
      .sort((a, b) => getDaysUntil(a.deadline) - getDaysUntil(b.deadline))
      .slice(0, 5);
  }, [actualConferences]);

  const submissionStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    actualSubmissions.forEach((s) => {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: getSubmissionStatusLabel(name),
      value,
    }));
  }, [actualSubmissions]);

  const yearlyPublications = useMemo(() => {
    const yearCounts: Record<number, number> = {};
    actualPublications.forEach((p) => {
      yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
    });
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [actualPublications]);

  const totalCitations = actualPublications.reduce((sum, p) => sum + p.citations, 0);

  const stats = [
    {
      label: '目标会议',
      value: actualConferences.length,
      icon: Calendar,
      color: 'bg-sky-50 text-sky-600',
      change: '+2 本月',
    },
    {
      label: '在投论文',
      value: actualSubmissions.filter((s) => ['preparing', 'submitted', 'under_review'].includes(s.status)).length,
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600',
      change: `${actualSubmissions.filter((s) => s.status === 'accepted').length} 已接受`,
    },
    {
      label: '已发表',
      value: actualPublications.length,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      change: `${totalCitations} 引用`,
    },
    {
      label: '学术人脉',
      value: actualScholars.length,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      change: `${actualAttendancePlans.length} 待参会`,
    },
  ];

  return (
    <Layout title="仪表盘">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <Card.Body>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">近期截止日期</h3>
                <button
                  onClick={() => navigate('/submissions')}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  查看全部
                </button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {upcomingDeadlines.map((conference) => {
                  const daysUntil = getDaysUntil(conference.deadline);
                  const isUrgent = daysUntil <= 7 && daysUntil >= 0;
                  return (
                    <div
                      key={conference.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/submissions')}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${
                            isUrgent
                              ? daysUntil <= 2
                                ? 'bg-red-100 text-red-600'
                                : 'bg-amber-100 text-amber-600'
                              : 'bg-sky-100 text-sky-600'
                          }`}
                        >
                          {isUrgent ? (
                            daysUntil <= 2 ? (
                              <AlertCircle className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )
                          ) : (
                            <Calendar className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{conference.name}</p>
                          <p className="text-sm text-gray-500">{conference.organizer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            daysUntil < 0
                              ? 'text-gray-400'
                              : daysUntil <= 7
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {getStatusText(daysUntil)}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(conference.deadline)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">投稿状态分布</h3>
            </Card.Header>
            <Card.Body>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={submissionStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {submissionStatusData.map((_, index) => (
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
              <div className="mt-4 space-y-2">
                {submissionStatusData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">发表统计</h3>
            </Card.Header>
            <Card.Body>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyPublications}>
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">快速操作</h3>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/submissions')}
                  className="flex flex-col items-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors group"
                >
                  <div className="p-3 bg-sky-100 rounded-xl mb-3 group-hover:bg-sky-200 transition-colors">
                    <Plus className="w-6 h-6 text-sky-600" />
                  </div>
                  <p className="font-medium text-gray-900">添加会议</p>
                  <p className="text-xs text-gray-500 mt-1">新的投稿目标</p>
                </button>

                <button
                  onClick={() => navigate('/papers')}
                  className="flex flex-col items-center p-6 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
                >
                  <div className="p-3 bg-emerald-100 rounded-xl mb-3 group-hover:bg-emerald-200 transition-colors">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-medium text-gray-900">新建论文</p>
                  <p className="text-xs text-gray-500 mt-1">开始新的写作</p>
                </button>

                <button
                  onClick={() => navigate('/attendance')}
                  className="flex flex-col items-center p-6 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
                >
                  <div className="p-3 bg-amber-100 rounded-xl mb-3 group-hover:bg-amber-200 transition-colors">
                    <Plane className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="font-medium text-gray-900">参会计划</p>
                  <p className="text-xs text-gray-500 mt-1">行程与费用</p>
                </button>

                <button
                  onClick={() => navigate('/network')}
                  className="flex flex-col items-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                >
                  <div className="p-3 bg-purple-100 rounded-xl mb-3 group-hover:bg-purple-200 transition-colors">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="font-medium text-gray-900">学术网络</p>
                  <p className="text-xs text-gray-500 mt-1">人脉与合作</p>
                </button>
              </div>
            </Card.Body>
          </Card>
        </div>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">投稿追踪</h3>
          </Card.Header>
          <Card.Body>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-4 font-medium">会议</th>
                    <th className="pb-4 font-medium">论文</th>
                    <th className="pb-4 font-medium">状态</th>
                    <th className="pb-4 font-medium">截止日期</th>
                    <th className="pb-4 font-medium">进度</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {actualSubmissions.slice(0, 4).map((submission) => {
                    const conference = actualConferences.find(
                      (c) => c.id === submission.conferenceId
                    );
                    const paper = actualPapers.find((p) => p.id === submission.paperId);
                    const progress =
                      submission.status === 'accepted'
                        ? 100
                        : submission.status === 'under_review'
                        ? 60
                        : submission.status === 'submitted'
                        ? 40
                        : submission.status === 'rejected'
                        ? 0
                        : 20;

                    return (
                      <tr
                        key={submission.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate('/submissions')}
                      >
                        <td className="py-4">
                          <p className="font-medium text-gray-900">
                            {conference?.name || '未知会议'}
                          </p>
                          <p className="text-sm text-gray-500">{conference?.organizer}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-gray-900">{paper?.title || '未知论文'}</p>
                        </td>
                        <td className="py-4">
                          <Badge className={getSubmissionStatusColor(submission.status)}>
                            {getSubmissionStatusLabel(submission.status)}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <p className="text-gray-900">
                            {conference ? formatDate(conference.deadline) : '-'}
                          </p>
                        </td>
                        <td className="py-4 w-48">
                          <ProgressBar progress={progress} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
}
