import { useState } from 'react';
import {
  Flame,
  Plus,
  ChevronRight,
  Mountain,
  Footprints,
  Waves,
  Clock,
  Star,
  X,
  Trophy,
  Zap,
  Target,
} from 'lucide-react';
import { useProgressStore } from '@/stores/useProgressStore';
import { Milestone, SportType } from '@/types';
import { formatDateShort } from '@/utils/dateUtils';
import { useForm } from 'react-hook-form';

interface MilestoneFormData {
  title: string;
  description: string;
  category: string;
  sportType: string;
  achievedDate: string;
  isPublic: boolean;
}

export default function MilestonesPage() {
  const { milestones, addMilestone } = useProgressStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | SportType>('all');

  const filteredMilestones = filter === 'all'
    ? milestones
    : milestones.filter((m) => m.sportType === filter);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: 'achievement',
      sportType: 'climbing',
      achievedDate: new Date().toISOString().split('T')[0],
      isPublic: true,
    },
  });

  const onSubmit = (data: MilestoneFormData) => {
    addMilestone({
      title: data.title,
      description: data.description,
      category: data.category as Milestone['category'],
      sportType: data.sportType as SportType,
      achievedDate: new Date(data.achievedDate).toISOString(),
      achievementDetails: {},
      isPublic: data.isPublic,
      icon: 'Trophy',
    });

    setShowForm(false);
    reset();
  };

  const sportTabs: { type: 'all' | SportType; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: '全部', icon: <Trophy size={18} /> },
    { type: 'climbing', label: '攀岩', icon: <Mountain size={18} /> },
    { type: 'skateboarding', label: '滑板', icon: <Footprints size={18} /> },
    { type: 'surfing', label: '冲浪', icon: <Waves size={18} /> },
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    skill: <Zap size={16} />,
    goal: <Target size={16} />,
    achievement: <Trophy size={16} />,
  };

  const categoryLabels: Record<string, string> = {
    skill: '技能突破',
    goal: '目标达成',
    achievement: '成就解锁',
  };

  const categoryColors: Record<string, string> = {
    skill: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    goal: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
    achievement: 'bg-success-500/20 text-success-400 border-success-500/30',
  };

  const sportColors: Record<SportType, string> = {
    climbing: 'bg-primary-500',
    skateboarding: 'bg-skate-500',
    surfing: 'bg-surfing-500',
  };

  const skillCount = milestones.filter((m) => m.category === 'skill').length;
  const goalCount = milestones.filter((m) => m.category === 'goal').length;
  const achievementCount = milestones.filter((m) => m.category === 'achievement').length;

  const sortedMilestones = [...filteredMilestones].sort(
    (a, b) => new Date(b.achievedDate).getTime() - new Date(a.achievedDate).getTime()
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-secondary-400">进阶追踪</span>
            <ChevronRight size={14} />
            <span className="text-white">里程碑</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="text-secondary-500" size={28} />
            里程碑记录
          </h1>
          <p className="text-dark-400 mt-1">记录每一个重要的突破时刻</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          记录里程碑
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sportTabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setFilter(tab.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              filter === tab.type
                ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <Flame className="text-secondary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{milestones.length}</p>
          <p className="text-sm text-dark-400">总里程碑</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Zap className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{skillCount}</p>
          <p className="text-sm text-dark-400">技能突破</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{achievementCount}</p>
          <p className="text-sm text-dark-400">成就解锁</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Target className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{goalCount}</p>
          <p className="text-sm text-dark-400">目标达成</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">时间线</h2>

        {sortedMilestones.length === 0 ? (
          <div className="text-center py-12">
            <Flame className="mx-auto text-dark-600 mb-4" size={48} />
            <p className="text-dark-400 mb-4">还没有里程碑记录</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              记录第一个里程碑
            </button>
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-dark-700"></div>
            <div className="space-y-6">
              {sortedMilestones.map((milestone) => (
                <div key={milestone.id} className="relative">
                  <div
                    className={`absolute -left-[26px] w-4 h-4 rounded-full border-2 ${
                      sportColors[milestone.sportType]
                    }`}
                  ></div>
                  <div className="bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            categoryColors[milestone.category]
                          }`}
                        >
                          {categoryIcons[milestone.category]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{milestone.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`badge px-2 py-0.5 text-xs ${
                                categoryColors[milestone.category]
                              }`}
                            >
                              {categoryLabels[milestone.category]}
                            </span>
                            <span className="text-xs text-dark-500">
                              {milestone.sportType === 'climbing'
                                ? '攀岩'
                                : milestone.sportType === 'skateboarding'
                                ? '滑板'
                                : '冲浪'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-dark-400">
                          <Clock size={12} />
                          {formatDateShort(milestone.achievedDate)}
                        </div>
                        {milestone.isPublic && (
                          <span className="text-xs text-success-400">公开</span>
                        )}
                      </div>
                    </div>
                    <p className="text-dark-300">{milestone.description}</p>

                    {milestone.achievementDetails &&
                      Object.keys(milestone.achievementDetails).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-dark-700">
                          <p className="text-xs text-dark-500 mb-2">详情:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(milestone.achievementDetails).map(([key, value]) => (
                              <span
                                key={key}
                                className="px-3 py-1 bg-dark-600 rounded-lg text-sm text-dark-200"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">记录里程碑</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">标题</label>
                <input
                  {...register('title', { required: '请输入标题' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：首次完成5.12a路线"
                />
                {errors.title && (
                  <p className="text-danger-400 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="label">描述</label>
                <textarea
                  {...register('description', { required: '请输入描述' })}
                  className="input-field h-20 resize-none"
                  placeholder="描述这个里程碑的意义..."
                />
                {errors.description && (
                  <p className="text-danger-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">分类</label>
                  <select {...register('category')} className="input-field">
                    <option value="skill">技能突破</option>
                    <option value="goal">目标达成</option>
                    <option value="achievement">成就解锁</option>
                  </select>
                </div>
                <div>
                  <label className="label">运动类型</label>
                  <select {...register('sportType')} className="input-field">
                    <option value="climbing">攀岩</option>
                    <option value="skateboarding">滑板</option>
                    <option value="surfing">冲浪</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">达成日期</label>
                <input
                  {...register('achievedDate', { required: '请选择日期' })}
                  type="date"
                  className="input-field"
                />
                {errors.achievedDate && (
                  <p className="text-danger-400 text-sm mt-1">{errors.achievedDate.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...register('isPublic')}
                  type="checkbox"
                  id="isPublic"
                  className="w-4 h-4 rounded bg-dark-700 border-dark-600"
                />
                <label htmlFor="isPublic" className="text-dark-300 text-sm">
                  公开此里程碑
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  保存里程碑
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
