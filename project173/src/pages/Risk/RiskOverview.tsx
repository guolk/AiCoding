import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import dayjs from 'dayjs';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  AlertOctagon,
  Activity,
} from 'lucide-react';
import { useProjectStore, useProjectById, useProjectIssues, useProjectRisks } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { Timeline, StatusBadge, EmptyState, StatCard } from '@/components/UI';
import type { TimelineItem } from '@/components/UI/Timeline';
import type { StatusValue } from '@/components/UI/StatusBadge';
import {
  IssueTypeMap,
  RiskTypeMap,
} from '@/types';
import type { Issue, Risk } from '@/types';

export default function RiskOverview() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const {
    setCurrentProjectId,
    initializeData,
  } = useProjectStore();

  const project = useProjectById(projectId);
  const issues = useProjectIssues(projectId);
  const risks = useProjectRisks(projectId);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
    return () => {
      setCurrentProjectId(null);
    };
  }, [projectId, setCurrentProjectId]);

  const pendingHighIssues = useMemo(() => {
    return issues
      .filter((i) => i.level === 'high' && (i.status === 'open' || i.status === 'processing'))
      .sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf())
      .slice(0, 3);
  }, [issues]);

  const highRisks = useMemo(() => risks.filter((r) => r.level === 'high'), [risks]);
  const mediumRisks = useMemo(() => risks.filter((r) => r.level === 'medium'), [risks]);
  const lowRisks = useMemo(() => risks.filter((r) => r.level === 'low'), [risks]);

  const recentActivities: TimelineItem[] = useMemo(() => {
    const activities: Array<{
      time: string;
      type: 'issue' | 'risk';
      data: Issue | Risk;
      title: string;
      description: string;
      status: StatusValue;
    }> = [];

    issues.forEach((issue) => {
      activities.push({
        time: issue.createTime,
        type: 'issue',
        data: issue,
        title: `问题：${issue.title}`,
        description: IssueTypeMap[issue.type],
        status: issue.status as StatusValue,
      });
      issue.history.forEach((h) => {
        activities.push({
          time: h.time,
          type: 'issue',
          data: issue,
          title: `${h.action}：${issue.title}`,
          description: h.remarks || `${h.operator} 操作`,
          status: issue.status as StatusValue,
        });
      });
    });

    risks.forEach((risk) => {
      activities.push({
        time: risk.createTime,
        type: 'risk',
        data: risk,
        title: `风险：${risk.title}`,
        description: RiskTypeMap[risk.type],
        status: risk.status as StatusValue,
      });
    });

    return activities
      .sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
      .slice(0, 8)
      .map((a) => ({
        date: dayjs(a.time).format('YYYY-MM-DD HH:mm'),
        title: a.title,
        description: a.description,
        status: a.status,
        type: a.type,
        icon: a.type === 'issue' ? AlertCircle : AlertTriangle,
      }));
  }, [issues, risks]);

  const issueStats = useMemo(() => ({
    total: issues.length,
    pending: issues.filter((i) => i.status === 'open').length,
    processing: issues.filter((i) => i.status === 'processing').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
  }), [issues]);

  const riskStats = useMemo(() => ({
    total: risks.length,
    high: risks.filter((r) => r.level === 'high').length,
    medium: risks.filter((r) => r.level === 'medium').length,
    low: risks.filter((r) => r.level === 'low').length,
  }), [risks]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="项目不存在"
          description="该项目可能已被删除或不存在"
          action={
            <button onClick={() => navigate('/projects')} className="btn-primary">
              返回项目列表
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <StatusBadge status={project.status} type="project" />
              </div>
              <p className="mt-1 text-sm text-gray-500">{project.village} · 问题与风险</p>
            </div>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="问题总数"
            value={issueStats.total}
            icon={AlertCircle}
            color="blue"
          />
          <StatCard
            title="待处理问题"
            value={issueStats.pending}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="风险总数"
            value={riskStats.total}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="高风险"
            value={riskStats.high}
            icon={AlertOctagon}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">高优先级待处理问题</h3>
              </div>
              <button
                onClick={() => navigate(`/projects/${projectId}/issues/list`)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            {pendingHighIssues.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="暂无高优先级问题"
                description="继续保持，及时处理问题"
              />
            ) : (
              <div className="space-y-3">
                {pendingHighIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 bg-gray-50 rounded-lg border-l-4 ${getLevelColor(issue.level)} hover:bg-gray-100 transition-colors cursor-pointer`}
                    onClick={() => navigate(`/projects/${projectId}/issues/list`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{issue.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{IssueTypeMap[issue.type]}</span>
                          <StatusBadge status={issue.level} type="level" />
                          <StatusBadge status={issue.status} type="issue" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {dayjs(issue.createTime).format('MM-DD')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Activity size={20} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">风险预警看板</h3>
              </div>
              <button
                onClick={() => navigate(`/projects/${projectId}/issues/risks`)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-red-700">高风险</span>
                  <span className="text-xs text-red-500 ml-auto">{highRisks.length}</span>
                </div>
                {highRisks.slice(0, 2).map((risk) => (
                  <div
                    key={risk.id}
                    className="bg-white rounded p-2 mb-2 text-xs hover:bg-gray-50 transition-colors cursor-pointer animate-pulse-soft"
                    onClick={() => navigate(`/projects/${projectId}/issues/risks`)}
                  >
                    <p className="font-medium text-gray-800 truncate">{risk.title}</p>
                    <p className="text-gray-500 mt-1">{RiskTypeMap[risk.type]}</p>
                  </div>
                ))}
                {highRisks.length === 0 && (
                  <p className="text-xs text-red-400 text-center py-2">暂无高风险</p>
                )}
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-orange-700">中风险</span>
                  <span className="text-xs text-orange-500 ml-auto">{mediumRisks.length}</span>
                </div>
                {mediumRisks.slice(0, 2).map((risk) => (
                  <div
                    key={risk.id}
                    className="bg-white rounded p-2 mb-2 text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${projectId}/issues/risks`)}
                  >
                    <p className="font-medium text-gray-800 truncate">{risk.title}</p>
                    <p className="text-gray-500 mt-1">{RiskTypeMap[risk.type]}</p>
                  </div>
                ))}
                {mediumRisks.length === 0 && (
                  <p className="text-xs text-orange-400 text-center py-2">暂无中风险</p>
                )}
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-yellow-700">低风险</span>
                  <span className="text-xs text-yellow-600 ml-auto">{lowRisks.length}</span>
                </div>
                {lowRisks.slice(0, 2).map((risk) => (
                  <div
                    key={risk.id}
                    className="bg-white rounded p-2 mb-2 text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${projectId}/issues/risks`)}
                  >
                    <p className="font-medium text-gray-800 truncate">{risk.title}</p>
                    <p className="text-gray-500 mt-1">{RiskTypeMap[risk.type]}</p>
                  </div>
                ))}
                {lowRisks.length === 0 && (
                  <p className="text-xs text-yellow-500 text-center py-2">暂无低风险</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">最近动态</h3>
            </div>
            <button
              onClick={() => navigate(`/projects/${projectId}/issues/list`)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          {recentActivities.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="暂无动态"
              description="处理问题或风险后将在此处显示"
            />
          ) : (
            <Timeline items={recentActivities} />
          )}
        </div>
      </div>
    </div>
  );
}
