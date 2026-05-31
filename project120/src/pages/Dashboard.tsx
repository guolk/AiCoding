import { useNavigate } from 'react-router-dom';
import {
  Mountain,
  Footprints,
  Waves,
  Activity,
  TrendingUp,
  Shield,
  Users,
  Target,
  Calendar,
  ChevronRight,
  TrendingUp as TrendingUpIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useSafetyStore } from '@/stores/useSafetyStore';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { formatDateShort, formatDuration, daysBetween } from '@/utils/dateUtils';
import { SportType } from '@/types';

interface ModuleCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  gradient: string;
  stats?: { value: string; label: string };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { records, getActiveInjuries } = useTrainingStore();
  const { getRecentMilestones, getAnalytics } = useProgressStore();
  const { getOverdueEquipment, getPrimaryContact } = useSafetyStore();
  const { getActiveGoals, getUpcomingTrips } = useCommunityStore();

  const analytics = getAnalytics();
  const recentMilestones = getRecentMilestones(4);
  const activeInjuries = getActiveInjuries();
  const overdueEquipment = getOverdueEquipment();
  const activeGoals = getActiveGoals();
  const upcomingTrips = getUpcomingTrips();
  const primaryContact = getPrimaryContact();

  const recentRecords = records.slice(0, 4);

  const moduleCards: ModuleCard[] = [
    {
      title: '训练记录',
      description: '记录每次训练的细节',
      path: '/training/climbing',
      icon: <Activity size={24} />,
      gradient: 'from-primary-500 to-primary-700',
      stats: { value: `${records.length}`, label: '条记录' },
    },
    {
      title: '进阶追踪',
      description: '追踪技能成长历程',
      path: '/progress/skills',
      icon: <TrendingUp size={24} />,
      gradient: 'from-secondary-500 to-secondary-700',
      stats: { value: `${analytics.progressTrend === 'improving' ? '+' : ''}${Math.round(analytics.averageSessionsPerWeek)}`, label: '周均训练' },
    },
    {
      title: '风险管理',
      description: '确保训练安全',
      path: '/safety/equipment',
      icon: <Shield size={24} />,
      gradient: overdueEquipment.length > 0
        ? 'from-danger-500 to-danger-700'
        : 'from-success-500 to-success-700',
      stats: { value: overdueEquipment.length > 0 ? `${overdueEquipment.length}` : '正常', label: overdueEquipment.length > 0 ? '待检查' : '装备状态' },
    },
    {
      title: '社群挑战',
      description: '设定目标，与伙伴比拼',
      path: '/community/goals',
      icon: <Users size={24} />,
      gradient: 'from-skate-500 to-skate-700',
      stats: { value: `${activeGoals.length}`, label: '进行中目标' },
    },
  ];

  const sportIcons: Record<SportType, React.ReactNode> = {
    climbing: <Mountain size={18} />,
    skateboarding: <Footprints size={18} />,
    surfing: <Waves size={18} />,
  };

  const sportColors: Record<SportType, string> = {
    climbing: 'bg-primary-500/20 text-primary-400',
    skateboarding: 'bg-skate-500/20 text-skate-400',
    surfing: 'bg-surfing-500/20 text-surfing-400',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">欢迎回来！</h1>
          <p className="text-dark-400">今天是训练的好日子，准备好突破了吗？</p>
        </div>
        <button
          onClick={() => navigate('/training/climbing')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Zap size={18} />
          记录训练
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleCards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="card p-0 overflow-hidden text-left group hover:-translate-y-1 transition-transform duration-300"
          >
            <div className={`bg-gradient-to-r ${card.gradient} p-4`}>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  {card.icon}
                </div>
                {card.stats && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{card.stats.value}</p>
                    <p className="text-white/70 text-sm">{card.stats.label}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-dark-400">{card.description}</p>
                </div>
                <ChevronRight
                  className="text-dark-500 group-hover:text-primary-400 transition-colors"
                  size={20}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">最近训练</h2>
            <button
              onClick={() => navigate('/training/climbing')}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>

          {recentRecords.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto text-dark-600 mb-4" size={48} />
              <p className="text-dark-400">还没有训练记录</p>
              <button
                onClick={() => navigate('/training/climbing')}
                className="btn-primary mt-4"
              >
                开始记录
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${sportColors[record.sportType]}`}
                  >
                    {sportIcons[record.sportType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-primary capitalize">
                        {record.sportType === 'climbing'
                          ? '攀岩'
                          : record.sportType === 'skateboarding'
                          ? '滑板'
                          : '冲浪'}
                      </span>
                      <span className="text-xs text-dark-400">
                        {formatDateShort(record.date)}
                      </span>
                    </div>
                    <p className="text-white font-medium truncate">
                      {record.location}
                    </p>
                    <p className="text-sm text-dark-400">
                      {formatDuration(record.duration)}
                    </p>
                  </div>
                  <ChevronRight className="text-dark-500" size={20} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">快速概览</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Target className="text-primary-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-dark-400">进行中目标</p>
                  <p className="text-white font-semibold">{activeGoals.length} 个</p>
                </div>
              </div>
            </div>

            {activeInjuries.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-danger-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="text-danger-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">恢复中伤病</p>
                    <p className="text-danger-400 font-semibold">
                      {activeInjuries.length} 处
                    </p>
                  </div>
                </div>
              </div>
            )}

            {overdueEquipment.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-danger-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="text-danger-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">装备待检查</p>
                    <p className="text-danger-400 font-semibold">
                      {overdueEquipment.length} 件
                    </p>
                  </div>
                </div>
              </div>
            )}

            {upcomingTrips.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-secondary-500/10 border border-secondary-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="text-secondary-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">即将出发</p>
                    <p className="text-secondary-400 font-semibold">
                      {upcomingTrips[0].name}
                    </p>
                    <p className="text-xs text-dark-500">
                      {daysBetween(new Date().toISOString(), upcomingTrips[0].startDate)} 天后
                    </p>
                  </div>
                </div>
              </div>
            )}

            {primaryContact && (
              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
                    <Users className="text-success-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">紧急联系人</p>
                    <p className="text-white font-semibold">{primaryContact.name}</p>
                    <p className="text-xs text-dark-500">{primaryContact.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">里程碑</h2>
            <button
              onClick={() => navigate('/progress/milestones')}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>

          {recentMilestones.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUpIcon className="mx-auto text-dark-600 mb-4" size={40} />
              <p className="text-dark-400">还没有里程碑</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-dark-700"></div>
              <div className="space-y-6">
                {recentMilestones.map((milestone) => (
                  <div key={milestone.id} className="relative">
                    <div
                      className={`absolute -left-[26px] w-4 h-4 rounded-full border-2 ${
                        milestone.category === 'skill'
                          ? 'bg-primary-500 border-primary-500'
                          : milestone.category === 'goal'
                          ? 'bg-secondary-500 border-secondary-500'
                          : 'bg-success-500 border-success-500'
                      }`}
                    ></div>
                    <div className="bg-dark-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`badge ${
                            milestone.category === 'skill'
                              ? 'badge-primary'
                              : milestone.category === 'goal'
                              ? 'badge-secondary'
                              : 'badge-success'
                          }`}
                        >
                          {milestone.category === 'skill'
                            ? '技能突破'
                            : milestone.category === 'goal'
                            ? '目标达成'
                            : '成就解锁'}
                        </span>
                        <span className="text-xs text-dark-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDateShort(milestone.achievedDate)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-dark-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">当前目标</h2>
            <button
              onClick={() => navigate('/community/goals')}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              管理目标 <ChevronRight size={16} />
            </button>
          </div>

          {activeGoals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="mx-auto text-dark-600 mb-4" size={40} />
              <p className="text-dark-400 mb-4">还没有设定目标</p>
              <button
                onClick={() => navigate('/community/goals')}
                className="btn-primary"
              >
                设定目标
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="bg-dark-700/50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{goal.title}</h3>
                    <span className="text-xs text-dark-400">
                      {daysBetween(new Date().toISOString(), goal.targetDate)} 天
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-dark-400 mb-1">
                      <span>进度</span>
                      <span>{goal.progressPercent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${goal.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-dark-500" />
                    <span className="text-xs text-dark-400">
                      {goal.milestones.filter((m) => m.completed).length} /{' '}
                      {goal.milestones.length} 里程碑
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
