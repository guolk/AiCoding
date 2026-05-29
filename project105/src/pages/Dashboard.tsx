import { Package, Boxes, FolderKanban, Clock, ArrowRight, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatHours, getRelativeTime, truncateString } from '../utils/helpers';
import ThemePieChart from '../components/analytics/ThemePieChart';
import { STATUS_LABELS } from '../utils/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const { sets, projects, works, recentActivities, getAnalytics, getMissingParts } = useAppStore();
  const analytics = getAnalytics();
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress');
  const missingParts = getMissingParts('1');
  const themeData = Object.entries(analytics.setsByTheme).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(analytics.setsByStatus).map(([key, value]) => ({
    name: STATUS_LABELS[key as keyof typeof STATUS_LABELS] || key,
    value,
  }));
  const quickActions = [
    { label: '添加新套装', icon: Package, path: '/collection', color: 'red' as const },
    { label: '查看缺件清单', icon: AlertTriangle, path: '/inventory', color: 'yellow' as const },
    { label: '创建MOC项目', icon: FolderKanban, path: '/projects', color: 'blue' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="收藏套装" value={analytics.totalSets} icon={Package} trend="+2 本月" trendUp color="red" />
        <StatCard title="零件总数" value={analytics.totalParts.toLocaleString()} icon={Boxes} trend="+1,200 本月" trendUp color="yellow" />
        <StatCard title="进行中项目" value={inProgressProjects.length} icon={FolderKanban} trend="0 已完成" trendUp={false} color="blue" />
        <StatCard title="总搭建时长" value={formatHours(analytics.totalHours)} icon={Clock} trend="+15.5h 本月" trendUp color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="brick-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-lego-dark">快捷操作</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`p-4 rounded-brick border-2 border-dashed transition-all duration-300 hover:shadow-lego-md text-left group ${
                      action.color === 'red'
                        ? 'border-lego-red/30 hover:border-lego-red hover:bg-lego-red/5'
                        : action.color === 'yellow'
                        ? 'border-lego-yellow/30 hover:border-lego-yellow hover:bg-lego-yellow/10'
                        : 'border-lego-blue/30 hover:border-lego-blue hover:bg-lego-blue/5'
                    }`}
                  >
                    <Icon
                      size={24}
                      className={`mb-2 ${
                        action.color === 'red'
                          ? 'text-lego-red'
                          : action.color === 'yellow'
                          ? 'text-amber-500'
                          : 'text-lego-blue'
                      }`}
                    />
                    <div className="flex items-center gap-1 text-sm font-medium text-lego-dark group-hover:gap-2 transition-all">
                      <span>{action.label}</span>
                      <ArrowRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemePieChart data={themeData} title="主题分布" />
            <ThemePieChart data={statusData} title="收藏状态" />
          </div>

          {inProgressProjects.length > 0 && (
            <div className="brick-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-lego-blue" />
                  <h3 className="font-display font-semibold text-lg text-lego-dark">进行中的项目</h3>
                </div>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-sm text-lego-blue hover:underline"
                >
                  查看全部
                </button>
              </div>
              <div className="space-y-3">
                {inProgressProjects.slice(0, 3).map((project) => {
                  const steps = useAppStore.getState().getProjectSteps(project.id);
                  const completedSteps = steps.filter((s) => s.is_completed).length;
                  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
                  return (
                    <div
                      key={project.id}
                      className="p-4 bg-gray-50 rounded-brick hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-lego-dark">{project.name}</h4>
                        <span className="text-sm text-gray-500">
                          {completedSteps}/{steps.length} 步骤
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-lego rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatHours(project.total_hours)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {missingParts.length > 0 && (
            <div className="brick-card p-6 border-lego-yellow/50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-amber-500" />
                <h3 className="font-display font-semibold text-lg text-lego-dark">缺件提醒</h3>
              </div>
              <div className="space-y-2">
                {missingParts.slice(0, 3).map((part, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-brick"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-brick border border-gray-200"
                        style={{ backgroundColor: part.color_rgb }}
                      />
                      <div>
                        <p className="text-sm font-medium text-lego-dark">{part.part_name}</p>
                        <p className="text-xs text-gray-500">{part.color_name}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-lego-red">
                      缺 {part.missing} 个
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/inventory')}
                className="w-full mt-4 py-2 text-sm text-lego-blue hover:bg-lego-blue/5 rounded-brick transition-colors"
              >
                查看完整缺件清单
              </button>
            </div>
          )}

          <div className="brick-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-lego-blue" />
              <h3 className="font-display font-semibold text-lg text-lego-dark">最近活动</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div
                    className={`w-8 h-8 rounded-brick flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'set'
                        ? 'bg-lego-red/10 text-lego-red'
                        : activity.type === 'inventory'
                        ? 'bg-lego-yellow/20 text-amber-700'
                        : activity.type === 'project'
                        ? 'bg-lego-blue/10 text-lego-blue'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {activity.action === 'added' && '+'}
                    {activity.action === 'updated' && '→'}
                    {activity.action === 'completed' && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-lego-dark">
                      {truncateString(activity.title, 40)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {works.length > 0 && (
            <div className="brick-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg text-lego-dark">我的作品</h3>
                <button
                  onClick={() => navigate('/gallery')}
                  className="text-sm text-lego-blue hover:underline"
                >
                  查看全部
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {works.slice(0, 4).map((work) => {
                  const photos = useAppStore.getState().getWorkPhotos(work.id);
                  const coverPhoto = photos.find((p) => p.is_cover) || photos[0];
                  return (
                    <div
                      key={work.id}
                      className="aspect-square rounded-brick overflow-hidden cursor-pointer group relative"
                      onClick={() => navigate(`/gallery/${work.id}`)}
                    >
                      {coverPhoto ? (
                        <img
                          src={coverPhoto.photo_url}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package size={32} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-white text-sm font-medium truncate">
                          {truncateString(work.title, 15)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="brick-card p-6 bg-gradient-to-br from-lego-blue to-blue-900 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-brick flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-display font-semibold">收藏价值统计</h3>
                <p className="text-white/70 text-sm">已记录的购入总价值</p>
              </div>
            </div>
            <p className="text-3xl font-display font-bold mt-3">
              {formatCurrency(analytics.totalValue)}
            </p>
            <p className="text-white/70 text-sm mt-1">
              共 {analytics.totalSets} 个套装，平均 {formatCurrency(analytics.totalValue / analytics.totalSets)} 元/套
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
