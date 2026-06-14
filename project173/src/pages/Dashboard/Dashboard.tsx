import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  FolderKanban,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Plus,
  FileBarChart,
  CalendarDays,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useProjectStore } from '@/store/projectStore';
import { StatCard, ProgressBar, StatusBadge, Timeline } from '@/components/UI';
import type { TimelineItem } from '@/components/UI';
import type { Project, Issue, Risk } from '@/types';
import {
  ProjectTypeMap,
  ProjectStatusMap,
  IssueTypeMap,
  RiskTypeMap,
} from '@/types';

interface TrendData {
  month: string;
  count: number;
}

interface TypeDistribution {
  name: string;
  value: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    projects,
    issues,
    risks,
    milestones,
    initializeData,
    getProjectMilestones,
  } = useProjectStore();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    initializeData();
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [initializeData]);

  const currentDate = dayjs().format('YYYY年MM月DD日');
  const greeting = useMemo(() => {
    const hour = dayjs().hour();
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }, []);

  const stats = useMemo(() => {
    const total = projects.length;
    const ongoing = projects.filter((p) => p.status === 'ongoing').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const highRiskIssues = issues.filter((i) => i.level === 'high' && i.status !== 'resolved' && i.status !== 'closed').length;
    const highRiskRisks = risks.filter((r) => r.level === 'high' && r.status !== 'mitigated').length;
    const highRisk = highRiskIssues + highRiskRisks;

    return {
      total,
      ongoing,
      completed,
      highRisk,
      ongoingPercent: total > 0 ? Math.round((ongoing / total) * 100) : 0,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [projects, issues, risks]);

  const trendData = useMemo((): TrendData[] => {
    const data: TrendData[] = [];
    for (let i = 11; i >= 0; i--) {
      const month = dayjs().subtract(i, 'month');
      const monthStr = month.format('YYYY-MM');
      const count = projects.filter((p) => {
        const createMonth = dayjs(p.createTime).format('YYYY-MM');
        return createMonth === monthStr;
      }).length;
      data.push({
        month: month.format('M月'),
        count,
      });
    }
    return data;
  }, [projects]);

  const typeDistribution = useMemo((): TypeDistribution[] => {
    const types: Record<string, number> = {
      infrastructure: 0,
      industry: 0,
      training: 0,
      environment: 0,
      other: 0,
    };
    projects.forEach((p) => {
      types[p.type] = (types[p.type] || 0) + 1;
    });
    return Object.entries(types).map(([key, value]) => ({
      name: ProjectTypeMap[key] || key,
      value,
    }));
  }, [projects]);

  const recentProjects = useMemo((): Project[] => {
    return [...projects]
      .sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf())
      .slice(0, 5);
  }, [projects]);

  const getProjectProgress = (project: Project): number => {
    const projectMilestones = getProjectMilestones(project.id);
    if (projectMilestones.length === 0) return 0;
    const completed = projectMilestones.filter((m) => m.status === 'completed').length;
    return Math.round((completed / projectMilestones.length) * 100);
  };

  const riskItems = useMemo(() => {
    const highIssues = issues
      .filter((i) => i.level === 'high' && i.status !== 'resolved' && i.status !== 'closed')
      .map((i) => ({ ...i, itemType: 'issue' as const }));
    const highRisks = risks
      .filter((r) => r.level === 'high' && r.status !== 'mitigated')
      .map((r) => ({ ...r, itemType: 'risk' as const }));

    return [...highIssues, ...highRisks]
      .sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf())
      .slice(0, 5);
  }, [issues, risks]);

  const timelineItems = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = [];

    projects.slice(0, 3).forEach((p) => {
      items.push({
        date: dayjs(p.createTime).format('YYYY-MM-DD'),
        title: `项目创建：${p.name}`,
        description: `${p.village} - ${ProjectTypeMap[p.type]}`,
        status: p.status,
        type: 'project',
      });
    });

    milestones
      .filter((m) => m.status === 'completed')
      .slice(0, 3)
      .forEach((m) => {
        const project = projects.find((p) => p.id === m.projectId);
        items.push({
          date: m.actualDate || m.plannedDate,
          title: `里程碑完成：${m.name}`,
          description: project ? `所属项目：${project.name}` : '',
          status: 'completed',
          type: 'milestone',
        });
      });

    issues
      .filter((i) => i.status === 'resolved')
      .slice(0, 2)
      .forEach((i) => {
        items.push({
          date: i.resolveTime || i.createTime,
          title: `问题解决：${i.title}`,
          description: IssueTypeMap[i.type],
          status: 'resolved',
          type: 'issue',
        });
      });

    risks
      .filter((r) => r.status === 'mitigated')
      .slice(0, 2)
      .forEach((r) => {
        items.push({
          date: r.createTime,
          title: `风险缓解：${r.title}`,
          description: RiskTypeMap[r.type],
          status: 'mitigated',
          type: 'risk',
        });
      });

    return items
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 10);
  }, [projects, milestones, issues, risks]);

  const lineChartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: trendData.map((d) => d.month),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#6b7280' },
    },
    series: [
      {
        data: trendData.map((d) => d.count),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#10b981', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ],
          },
        },
        itemStyle: { color: '#10b981' },
        symbol: 'circle',
        symbolSize: 8,
      },
    ],
  };

  const pieChartOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#6b7280' },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: { show: false },
        data: typeDistribution,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    ],
  };

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                乡村振兴项目管理平台
              </h1>
              <p className="text-emerald-100 text-sm md:text-base">
                数据驱动决策，助力乡村振兴
              </p>
              <div className="flex items-center gap-2 mt-3 text-emerald-100">
                <CalendarDays size={16} />
                <span className="text-sm">{currentDate}</span>
                <span className="text-emerald-200">|</span>
                <span className="text-sm">{greeting}，欢迎回来！</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/projects/new')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <Plus size={18} />
                <span>新建项目</span>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <FileBarChart size={18} />
                <span>查看报告</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard
          title="项目总数"
          value={stats.total}
          icon={FolderKanban}
          trend={12.5}
          trendUp={true}
          color="green"
        />
        <StatCard
          title="在建项目"
          value={stats.ongoing}
          icon={PlayCircle}
          trend={stats.ongoingPercent}
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="已完成项目"
          value={stats.completed}
          icon={CheckCircle}
          trend={stats.completionRate}
          trendUp={true}
          color="orange"
        />
        <StatCard
          title="高风险预警"
          value={stats.highRisk}
          icon={AlertTriangle}
          trend={2}
          trendUp={false}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            项目数量趋势
          </h3>
          <p className="text-sm text-gray-500 mb-4">近12个月新增项目数</p>
          <ReactECharts
            option={lineChartOption}
            style={{ height: '300px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            项目类型分布
          </h3>
          <p className="text-sm text-gray-500 mb-4">按项目类型分类统计</p>
          <ReactECharts
            option={pieChartOption}
            style={{ height: '300px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">最新项目</h3>
              <p className="text-sm text-gray-500">最近创建的5个项目</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              查看全部
            </button>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-500">{project.village}</p>
                  </div>
                  <StatusBadge status={project.status} type="project" />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">项目进度</span>
                    <span className="text-xs font-medium text-gray-700">
                      {getProjectProgress(project)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={getProjectProgress(project)}
                    color={project.status === 'completed' ? 'green' : 'primary'}
                    height={6}
                  />
                </div>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无项目数据
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">风险预警</h3>
              <p className="text-sm text-gray-500">高风险问题和风险</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {riskItems.map((item) => (
              <div
                key={`${item.itemType}-${item.id}`}
                onClick={() => {
                  if (item.itemType === 'issue') {
                    navigate(`/projects/${(item as Issue).projectId}/risks/issues`);
                  } else {
                    navigate(`/projects/${(item as Risk).projectId}/risks/warnings`);
                  }
                }}
                className="p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.itemType === 'issue'
                        ? IssueTypeMap[(item as Issue).type]
                        : RiskTypeMap[(item as Risk).type]}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.level === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {item.level === 'high' ? '高风险' : '中风险'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {dayjs(item.createTime).format('MM-DD')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {riskItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无高风险预警
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">最新动态</h3>
            <p className="text-sm text-gray-500">项目进展和更新记录</p>
          </div>
        </div>
        <Timeline items={timelineItems} />
      </div>
    </div>
  );
}
