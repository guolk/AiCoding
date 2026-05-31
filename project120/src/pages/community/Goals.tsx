import { useState } from 'react';
import {
  Target,
  Plus,
  ChevronRight,
  Mountain,
  Footprints,
  Waves,
  Trophy,
  Clock,
  CheckCircle,
  Circle,
  X,
  Edit2,
  Trash2,
  Calendar,
  Activity,
  Flame,
  Plane,
} from 'lucide-react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Goal, SportType } from '@/types';
import { formatDateShort, daysBetween } from '@/utils/dateUtils';
import { useForm } from 'react-hook-form';
import { generateId } from '@/utils/storage';

interface GoalFormData {
  title: string;
  description: string;
  sportType: string;
  category: string;
  targetDate: string;
  milestoneTitles: string;
}

export default function GoalsPage() {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    getActiveGoals,
    getCompletedGoals,
    toggleGoalMilestone,
  } = useCommunityStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();

  const filteredGoals =
    filter === 'all'
      ? goals
      : filter === 'active'
      ? activeGoals
      : completedGoals;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GoalFormData>({
    defaultValues: {
      title: '',
      description: '',
      sportType: 'climbing',
      category: 'skill',
      targetDate: new Date(new Date().getFullYear(), 11, 31)
        .toISOString()
        .split('T')[0],
      milestoneTitles: '',
    },
  });

  const openEditForm = (goal: Goal) => {
    setEditingId(goal.id);
    setValue('title', goal.title);
    setValue('description', goal.description);
    setValue('sportType', goal.sportType);
    setValue('category', goal.category);
    setValue('targetDate', goal.targetDate.split('T')[0]);
    setValue(
      'milestoneTitles',
      goal.milestones.map((m) => m.title).join('\n')
    );
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    reset({
      title: '',
      description: '',
      sportType: 'climbing',
      category: 'skill',
      targetDate: new Date(new Date().getFullYear(), 11, 31)
        .toISOString()
        .split('T')[0],
      milestoneTitles: '',
    });
    setShowForm(true);
  };

  const onSubmit = (data: GoalFormData) => {
    const milestones = data.milestoneTitles
      .split('\n')
      .filter((line) => line.trim())
      .map((title) => ({
        id: generateId(),
        title: title.trim(),
        targetDate: new Date().toISOString(),
        completed: false,
      }));

    const goalData = {
      title: data.title,
      description: data.description,
      sportType: data.sportType as SportType,
      category: data.category as Goal['category'],
      targetDate: new Date(data.targetDate).toISOString(),
      progressPercent: 0,
      status: 'active' as Goal['status'],
      milestones,
    };

    if (editingId) {
      updateGoal(editingId, goalData);
    } else {
      addGoal(goalData);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此目标吗？')) {
      deleteGoal(id);
    }
  };

  const handleToggleMilestone = (goalId: string, milestoneId: string, completed: boolean) => {
    toggleGoalMilestone(goalId, milestoneId, completed);
    if (selectedGoal) {
      const updatedGoal = goals.find((g) => g.id === goalId);
      if (updatedGoal) {
        setSelectedGoal(updatedGoal);
      }
    }
  };

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

  const categoryLabels: Record<string, string> = {
    skill: '技能目标',
    fitness: '体能目标',
    competition: '比赛目标',
    travel: '旅行目标',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    skill: <Trophy size={16} />,
    fitness: <Activity size={16} />,
    competition: <Flame size={16} />,
    travel: <Plane size={16} />,
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const daysLeft = daysBetween(new Date().toISOString(), goal.targetDate);
    const isOverdue = daysLeft < 0 && goal.status === 'active';

    return (
      <div
        className={`bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors cursor-pointer ${
          goal.status === 'completed' ? 'border border-success-500/30' : ''
        } ${isOverdue ? 'border border-danger-500/30' : ''}`}
        onClick={() => setSelectedGoal(goal)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sportColors[goal.sportType]}`}>
              {sportIcons[goal.sportType]}
            </div>
            <div>
              <h3 className="font-semibold text-white">{goal.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge px-2 py-0.5 text-xs bg-dark-600 text-dark-300 flex items-center gap-1`}>
                  {categoryIcons[goal.category]}
                  {categoryLabels[goal.category]}
                </span>
                {goal.status === 'completed' && (
                  <span className="badge badge-success flex items-center gap-1">
                    <CheckCircle size={12} />
                    已完成
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditForm(goal);
              }}
              className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <Edit2 size={14} className="text-dark-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(goal.id);
              }}
              className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <Trash2 size={14} className="text-danger-400" />
            </button>
          </div>
        </div>

        <p className="text-sm text-dark-400 mb-4 line-clamp-2">{goal.description}</p>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-dark-400">进度</span>
            <span className="text-white font-medium">{goal.progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                goal.progressPercent === 100
                  ? 'bg-gradient-to-r from-success-600 to-success-400'
                  : ''
              }`}
              style={{ width: `${goal.progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-dark-400">
            <CheckCircle size={14} />
            <span>
              {goal.milestones.filter((m) => m.completed).length} /{' '}
              {goal.milestones.length} 里程碑
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} className={isOverdue ? 'text-danger-400' : 'text-dark-400'} />
            <span className={isOverdue ? 'text-danger-400' : 'text-dark-400'}>
              {goal.status === 'completed'
                ? `已完成 (${formatDateShort(goal.targetDate)})`
                : isOverdue
                ? `已逾期 ${Math.abs(daysLeft)} 天`
                : `${daysLeft} 天后`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-skate-400">社群挑战</span>
            <ChevronRight size={14} />
            <span className="text-white">个人目标</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="text-skate-500" size={28} />
            个人挑战目标
          </h1>
          <p className="text-dark-400 mt-1">设定目标，追踪进度，实现突破</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          设定目标
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { type: 'all' as const, label: '全部', icon: <Target size={16} /> },
          { type: 'active' as const, label: '进行中', icon: <Clock size={16} /> },
          { type: 'completed' as const, label: '已完成', icon: <CheckCircle size={16} /> },
        ].map((tab) => (
          <button
            key={tab.type}
            onClick={() => setFilter(tab.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              filter === tab.type
                ? 'bg-skate-500/20 text-skate-400 border border-skate-500/30'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className="text-xs">
              ({tab.type === 'all'
                ? goals.length
                : tab.type === 'active'
                ? activeGoals.length
                : completedGoals.length})
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Target className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{goals.length}</p>
          <p className="text-sm text-dark-400">总目标数</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{activeGoals.length}</p>
          <p className="text-sm text-dark-400">进行中</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{completedGoals.length}</p>
          <p className="text-sm text-dark-400">已完成</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="text-secondary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {goals.length > 0
              ? Math.round(
                  (completedGoals.length / goals.length) * 100
                )
              : 0}
            %
          </p>
          <p className="text-sm text-dark-400">完成率</p>
        </div>
      </div>

      {activeGoals.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="text-primary-400" size={20} />
            进行中目标
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="text-success-400" size={20} />
            已完成目标
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="card text-center py-12">
          <Target className="mx-auto text-dark-600 mb-4" size={48} />
          <p className="text-dark-400 mb-2">还没有设定目标</p>
          <p className="text-dark-500 text-sm mb-4">
            设定一个挑战目标，让训练更有动力！
          </p>
          <button onClick={openAddForm} className="btn-primary">
            设定第一个目标
          </button>
        </div>
      )}

      {selectedGoal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGoal(null)}
        >
          <div
            className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{selectedGoal.title}</h2>
              <button
                onClick={() => setSelectedGoal(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`badge ${sportColors[selectedGoal.sportType]}`}>
                  {selectedGoal.sportType === 'climbing'
                    ? '攀岩'
                    : selectedGoal.sportType === 'skateboarding'
                    ? '滑板'
                    : '冲浪'}
                </span>
                <span className="badge bg-dark-600 text-dark-300 flex items-center gap-1">
                  {categoryIcons[selectedGoal.category]}
                  {categoryLabels[selectedGoal.category]}
                </span>
                {selectedGoal.status === 'completed' && (
                  <span className="badge badge-success">已完成</span>
                )}
              </div>

              <p className="text-dark-300">{selectedGoal.description}</p>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-dark-400">完成进度</span>
                  <span className="text-white font-medium">
                    {selectedGoal.progressPercent}%
                  </span>
                </div>
                <div className="progress-bar h-3">
                  <div
                    className={`progress-fill ${
                      selectedGoal.progressPercent === 100
                        ? 'bg-gradient-to-r from-success-600 to-success-400'
                        : ''
                    }`}
                    style={{ width: `${selectedGoal.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">目标日期</p>
                  <p className="text-white font-medium">
                    {formatDateShort(selectedGoal.targetDate)}
                  </p>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">创建日期</p>
                  <p className="text-white font-medium">
                    {formatDateShort(selectedGoal.createdAt)}
                  </p>
                </div>
              </div>

              {selectedGoal.milestones.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-3">里程碑</p>
                  <div className="space-y-2">
                    {selectedGoal.milestones.map((milestone, idx) => (
                      <div
                        key={milestone.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          milestone.completed
                            ? 'bg-success-500/10'
                            : 'bg-dark-700/30 hover:bg-dark-700/50'
                        }`}
                        onClick={() =>
                          handleToggleMilestone(
                            selectedGoal.id,
                            milestone.id,
                            !milestone.completed
                          )
                        }
                      >
                        {milestone.completed ? (
                          <CheckCircle size={18} className="text-success-400" />
                        ) : (
                          <Circle
                            size={18}
                            className="text-dark-500 hover:text-primary-400"
                          />
                        )}
                        <div className="flex-1">
                          <span
                            className={`text-sm ${
                              milestone.completed
                                ? 'text-dark-400 line-through'
                                : 'text-white'
                            }`}
                          >
                            {milestone.title}
                          </span>
                          {milestone.completedDate && (
                            <p className="text-xs text-dark-500">
                              完成于 {formatDateShort(milestone.completedDate)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-dark-500">
                          {idx + 1}/{selectedGoal.milestones.length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingId ? '编辑目标' : '设定目标'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">目标标题</label>
                <input
                  {...register('title', { required: '请输入目标标题' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：完成5.12c路线"
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
                  placeholder="描述这个目标的具体内容..."
                />
                {errors.description && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">运动类型</label>
                  <select {...register('sportType')} className="input-field">
                    <option value="climbing">攀岩</option>
                    <option value="skateboarding">滑板</option>
                    <option value="surfing">冲浪</option>
                  </select>
                </div>
                <div>
                  <label className="label">目标类型</label>
                  <select {...register('category')} className="input-field">
                    <option value="skill">技能目标</option>
                    <option value="fitness">体能目标</option>
                    <option value="competition">比赛目标</option>
                    <option value="travel">旅行目标</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">目标完成日期</label>
                <input
                  {...register('targetDate', { required: '请选择日期' })}
                  type="date"
                  className="input-field"
                />
                {errors.targetDate && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.targetDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">里程碑 (每行一个)</label>
                <textarea
                  {...register('milestoneTitles')}
                  className="input-field h-24 resize-none"
                  placeholder="巩固基础\n突破难点\n达成目标"
                />
                <p className="text-xs text-dark-500 mt-1">
                  每个里程碑占一行，目标进度将根据已完成的里程碑自动计算
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? '保存修改' : '设定目标'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
