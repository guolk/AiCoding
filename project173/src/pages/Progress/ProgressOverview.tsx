import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import {
  Target,
  Users,
  Image,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { Timeline, StatusBadge, EmptyState } from '@/components/UI';
import type { TimelineItem } from '@/components/UI/Timeline';
import {
  ProjectStatusMap,
} from '@/types';

export default function ProgressOverview() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const {
    getProjectById,
    getProjectMilestones,
    getProjectVisits,
    getProjectPhotoGroups,
    setCurrentProjectId,
    loading,
    initializeData,
  } = useProjectStore();

  const project = projectId ? getProjectById(projectId) : undefined;
  const milestones = projectId ? getProjectMilestones(projectId).slice(0, 3) : [];
  const visits = projectId ? getProjectVisits(projectId).slice(0, 2) : [];
  const photoGroups = projectId ? getProjectPhotoGroups(projectId).slice(0, 1) : [];

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

  const overallProgress = useMemo(() => {
    if (!projectId) return 0;
    const allMilestones = useProjectStore.getState().getProjectMilestones(projectId);
    if (allMilestones.length === 0) return 0;
    const totalProgress = allMilestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / allMilestones.length);
  }, [projectId]);

  const chartOption = useMemo(() => ({
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            color: overallProgress >= 80 ? '#22c55e' : overallProgress >= 50 ? '#3b82f6' : '#f59e0b',
          },
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#e5e7eb']],
          },
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        data: [{ value: overallProgress }],
        detail: {
          fontSize: 32,
          fontWeight: 'bold',
          offsetCenter: [0, 0],
          formatter: `${overallProgress}%`,
          color: '#111827',
        },
      },
    ],
  }), [overallProgress]);

  const timelineItems: TimelineItem[] = useMemo(() => {
    return milestones.map((m) => ({
      date: dayjs(m.plannedDate).format('YYYY-MM-DD'),
      title: m.name,
      description: m.description,
      status: m.status,
      type: 'milestone',
    }));
  }, [milestones]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="mt-1 text-sm text-gray-500">{project.village} · 实施进度</p>
            </div>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48">
              <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <StatusBadge status={project.status} type="project" />
                <span className="text-sm text-gray-500">
                  {ProjectStatusMap[project.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">开始日期</div>
                  <div className="text-base font-medium text-gray-900">
                    {dayjs(project.startDate).format('YYYY-MM-DD')}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">结束日期</div>
                  <div className="text-base font-medium text-gray-900">
                    {dayjs(project.endDate).format('YYYY-MM-DD')}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">整体进度</div>
                  <div className="text-base font-medium text-primary-600">
                    {overallProgress}%
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">里程碑数</div>
                  <div className="text-base font-medium text-gray-900">
                    {useProjectStore.getState().getProjectMilestones(projectId!).length} 个
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Target size={20} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">里程碑概览</h3>
              </div>
              <button
                onClick={() => navigate(`/projects/${projectId}/progress/milestones`)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            {milestones.length === 0 ? (
              <EmptyState
                icon={Target}
                title="暂无里程碑"
                description="点击右上角查看全部添加里程碑"
              />
            ) : (
              <Timeline items={timelineItems} />
            )}
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">最近走访</h3>
              </div>
              <button
                onClick={() => navigate(`/projects/${projectId}/progress/visits`)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            {visits.length === 0 ? (
              <EmptyState
                icon={Users}
                title="暂无走访记录"
                description="点击右上角查看全部添加走访记录"
              />
            ) : (
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {dayjs(visit.visitDate).format('YYYY-MM-DD')}
                      </span>
                      <span className="text-xs text-gray-500">{visit.visitor}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      <span className="font-medium text-gray-700">问题：</span>
                      {visit.problemsFound}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      <span className="font-medium text-gray-700">措施：</span>
                      {visit.measuresTaken}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow duration-300 xl:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Image size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">最新照片</h3>
              </div>
              <button
                onClick={() => navigate(`/projects/${projectId}/progress/photos`)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            {photoGroups.length === 0 ? (
              <EmptyState
                icon={Image}
                title="暂无照片"
                description="点击右上角查看全部上传照片"
              />
            ) : (
              <div>
                {photoGroups.map((group) => (
                  <div key={group.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {group.stage}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {dayjs(group.date).format('YYYY-MM-DD')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {group.photos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {photo.type === 'before' ? '施工前' : photo.type === 'during' ? '施工中' : '施工后'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
