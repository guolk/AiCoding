import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, CheckCircle, Clock, AlertCircle, ChevronRight, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useDataRoomStore } from '../../store/useDataRoomStore';
import { useProjectStore } from '../../store/useProjectStore';
import { DATAROOM_CATEGORY_OPTIONS } from '../../utils/constants';
import { getStatusLabel, getStatusColor, cn } from '../../utils/helpers';
import type { DataRoomStatus } from '../../types';

export default function DataRoomList() {
  const navigate = useNavigate();
  const dataRoomItems = useDataRoomStore((s) => s.dataRoomItems);
  const updateItemStatus = useDataRoomStore((s) => s.updateItemStatus);
  const projects = useProjectStore((s) => s.projects);

  const projectStats = useMemo(() => {
    return projects.map((project) => {
      const items = dataRoomItems.filter((item) => item.projectId === project.id);
      const total = items.length;
      const completed = items.filter((item) => item.status === 'completed').length;
      const inProgress = items.filter((item) => item.status === 'in_progress').length;
      const pending = items.filter((item) => item.status === 'pending').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        project,
        total,
        completed,
        inProgress,
        pending,
        percentage,
        items,
      };
    });
  }, [projects, dataRoomItems]);

  const getCategoryLabel = (value: string) => {
    return DATAROOM_CATEGORY_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const groupedByCategory = (items: typeof dataRoomItems) => {
    const groups: Record<string, typeof dataRoomItems> = {};
    DATAROOM_CATEGORY_OPTIONS.forEach((cat) => {
      groups[cat.value] = items.filter((item) => item.category === cat.value);
    });
    return groups;
  };

  const StatusIcon = ({ status }: { status: DataRoomStatus }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">数据室管理</h1>
          <p className="text-slate-500 mt-1">管理项目尽调材料的收集和审核</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">项目总数</p>
                <p className="text-3xl font-bold text-slate-900">{projects.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">材料总数</p>
                <p className="text-3xl font-bold text-slate-900">{dataRoomItems.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">已完成</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {dataRoomItems.filter((i) => i.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">待收集</p>
                <p className="text-3xl font-bold text-amber-600">
                  {dataRoomItems.filter((i) => i.status !== 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {projectStats.map(({ project, total, completed, inProgress, pending, percentage, items }) => (
          <Card key={project.id} hover onClick={() => navigate(`/dataroom/${project.id}`)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                    {project.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>
                    <p className="text-sm text-slate-500">{project.track} · {project.founders}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{percentage}%</p>
                    <p className="text-xs text-slate-500">完成率</p>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 group">
                    查看详情
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">整体进度</span>
                  <span className="text-sm font-medium text-slate-700">{completed}/{total}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600">已完成 {completed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-600">进行中 {inProgress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="text-sm text-slate-600">待收集 {pending}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(groupedByCategory(items)).map(([category, categoryItems]) => {
                  if (categoryItems.length === 0) return null;
                  const catCompleted = categoryItems.filter(
                    (item) => item.status === 'completed'
                  ).length;
                  const catPercentage =
                    categoryItems.length > 0
                      ? Math.round((catCompleted / categoryItems.length) * 100)
                      : 0;

                  return (
                    <div
                      key={category}
                      className="p-4 bg-slate-50 rounded-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-slate-900 text-sm">
                          {getCategoryLabel(category)}
                        </p>
                        <span className="text-xs text-slate-500">
                          {catCompleted}/{categoryItems.length}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            catPercentage === 100
                              ? 'bg-emerald-500'
                              : catPercentage > 0
                                ? 'bg-amber-500'
                                : 'bg-slate-300'
                          )}
                          style={{ width: `${catPercentage}%` }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        {categoryItems.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.status === 'pending') {
                                updateItemStatus(item.id, 'in_progress');
                              } else if (item.status === 'in_progress') {
                                updateItemStatus(item.id, 'completed');
                              }
                            }}
                          >
                            <StatusIcon status={item.status} />
                            <span
                              className={cn(
                                'text-sm flex-1 line-clamp-1 group-hover:text-blue-600 transition-colors',
                                item.status === 'completed'
                                  ? 'text-slate-500 line-through'
                                  : 'text-slate-700'
                              )}
                            >
                              {item.name}
                            </span>
                          </div>
                        ))}
                        {categoryItems.length > 3 && (
                          <p className="text-xs text-slate-400 pl-7">
                            +{categoryItems.length - 3} 项更多
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-slate-400 mb-2">
              <FolderOpen className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-slate-500">暂无项目数据</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
