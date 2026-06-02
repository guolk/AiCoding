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
  LineChart,
  Line,
} from 'recharts';
import {
  FolderKanban,
  Target,
  Users,
  UserCheck,
  Calendar,
  Database,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useProjectStore } from '../../store/useProjectStore';
import { useResourceStore } from '../../store/useResourceStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useDataRoomStore } from '../../store/useDataRoomStore';
import { calculateMilestoneCompletionRate, getStatusLabel, formatDate } from '../../utils/helpers';
import { STAGE_OPTIONS, MILESTONE_STATUS_OPTIONS } from '../../utils/constants';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const projects = useProjectStore((s) => s.projects);
  const mentors = useResourceStore((s) => s.mentors);
  const investors = useResourceStore((s) => s.investors);
  const activities = useActivityStore((s) => s.activities);
  const dataRoomItems = useDataRoomStore((s) => s.dataRoomItems);

  const stageDistribution = STAGE_OPTIONS.map((stage) => ({
    name: stage.label,
    value: projects.filter((p) => p.stage === stage.value).length,
  }));

  const milestoneData = projects.flatMap((p) =>
    p.milestones.map((m) => ({
      name: p.name.substring(0, 4),
      已完成: m.status === 'completed' ? 1 : 0,
      进行中: m.status === 'in_progress' ? 1 : 0,
      待开始: m.status === 'pending' ? 1 : 0,
      已延期: m.status === 'delayed' ? 1 : 0,
    }))
  );

  const kpiTrendData = projects[0]?.kpiRecords.map((k) => ({
    date: formatDate(k.date),
    用户数: k.userCount,
    收入: k.revenue / 1000,
  })) || [];

  const totalMilestones = projects.reduce((sum, p) => sum + p.milestones.length, 0);
  const completedMilestones = projects.reduce(
    (sum, p) => sum + p.milestones.filter((m) => m.status === 'completed').length,
    0
  );
  const overallCompletionRate =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const statCards = [
    {
      title: '在孵项目',
      value: projects.length,
      icon: FolderKanban,
      color: 'from-blue-500 to-blue-600',
      change: '+2 本月',
    },
    {
      title: '里程碑完成率',
      value: `${overallCompletionRate}%`,
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      change: '↑ 8% 环比',
    },
    {
      title: '导师资源',
      value: mentors.length,
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      change: '活跃 3 位',
    },
    {
      title: '投资机构',
      value: investors.length,
      icon: UserCheck,
      color: 'from-orange-500 to-amber-600',
      change: '高意向 2 家',
    },
    {
      title: '近期活动',
      value: activities.length,
      icon: Calendar,
      color: 'from-cyan-500 to-teal-600',
      change: '本月 3 场',
    },
    {
      title: '尽调材料',
      value: dataRoomItems.length,
      icon: Database,
      color: 'from-pink-500 to-rose-600',
      change: `${Math.round((dataRoomItems.filter(i => i.status === 'completed').length / dataRoomItems.length) * 100)}% 已完成`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">数据概览</h1>
          <p className="text-slate-500 mt-1">孵化器运营数据仪表盘</p>
        </div>
        <div className="text-sm text-slate-500">
          数据更新时间：{new Date().toLocaleString('zh-CN')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} hover className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {card.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">项目阶段分布</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stageDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {stageDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-600">
                    {item.name}: {item.value}个
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">里程碑状态统计</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={milestoneData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="已完成" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="进行中" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="待开始" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="已延期" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              {projects[0]?.name || '项目'} - KPI趋势
            </h3>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpiTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="用户数"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="收入"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">项目概览</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.slice(0, 3).map((project) => {
              const rate = calculateMilestoneCompletionRate(project.milestones);
              const stageLabel = getStatusLabel(project.stage, STAGE_OPTIONS);
              return (
                <div key={project.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{project.name}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {stageLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{project.track}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">里程碑完成</span>
                      <span className="font-medium text-slate-700">{rate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
