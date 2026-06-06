import { useState, useMemo } from 'react';
import { Plus, Trash2, Clock, Moon, Zap, Target, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { ProgressRing } from '../components/ui/ProgressRing';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, GoalType, GoalFrequency, AppCategory, Goal } from '../types';
import { formatDuration, getToday } from '../utils/date';
import { calculateGoalProgress } from '../utils/statistics';

export default function GoalSetting() {
  const { goals, screenFreeLogs, appUsage, addGoal, updateGoal, deleteGoal, addScreenFreeLog, updateScreenFreeLog } = useAppStore();
  const today = useMemo(() => getToday(), []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalType, setGoalType] = useState<GoalType>('dailyLimit');
  const [newGoal, setNewGoal] = useState({
    name: '',
    type: 'dailyLimit' as GoalType,
    category: 'social' as AppCategory | 'all',
    targetValue: 60,
    timeRange: '',
    frequency: 'daily' as GoalFrequency,
    startDate: getToday(),
    endDate: '',
    active: true,
  });

  const dailyLimitGoals = goals.filter((g) => g.type === 'dailyLimit' && g.active);
  const screenFreeGoals = goals.filter((g) => g.type === 'screenFreeTime' && g.active);
  const detoxChallenges = goals.filter((g) => g.type === 'detoxChallenge' && g.active);

  const todayScreenFree = screenFreeLogs.find((l) => l.date === getToday());

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setNewGoal({
        name: goal.name || '',
        type: goal.type,
        category: goal.category,
        targetValue: goal.targetValue,
        timeRange: goal.timeRange || '',
        frequency: goal.frequency,
        startDate: goal.startDate,
        endDate: goal.endDate || '',
        active: goal.active,
      });
      setGoalType(goal.type);
    } else {
      setEditingGoal(null);
      setNewGoal({
        name: '',
        type: 'dailyLimit',
        category: 'social',
        targetValue: 60,
        timeRange: '',
        frequency: 'daily',
        startDate: getToday(),
        endDate: '',
        active: true,
      });
      setGoalType('dailyLimit');
    }
    setShowAddModal(true);
  };

  const handleSaveGoal = () => {
    if (!newGoal.name.trim()) return;
    
    if (editingGoal) {
      updateGoal(editingGoal.id, newGoal);
    } else {
      addGoal(newGoal);
    }
    
    setShowAddModal(false);
    setEditingGoal(null);
  };

  const handleToggleScreenFree = () => {
    const screenFreeGoal = screenFreeGoals[0];
    if (!screenFreeGoal) return;

    if (todayScreenFree) {
      updateScreenFreeLog(todayScreenFree.id, { completed: !todayScreenFree.completed });
    } else {
      addScreenFreeLog({
        date: getToday(),
        timeRange: screenFreeGoal.timeRange || '20:00-21:00',
        completed: true,
      });
    }
  };

  const goalTypeLabels: Record<GoalType, { label: string; icon: any; color: string }> = {
    dailyLimit: { label: '时长上限', icon: Clock, color: 'text-blue-500' },
    screenFreeTime: { label: '无屏幕时段', icon: Moon, color: 'text-purple-500' },
    detoxChallenge: { label: '排毒挑战', icon: Zap, color: 'text-amber-500' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">目标设定</h1>
          <p className="text-slate-500 mt-1">设定健康的手机使用目标，培养良好习惯</p>
        </div>
        <button type="button" onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建目标
        </button>
      </div>

      {screenFreeGoals.length > 0 && (
        <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Moon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">{screenFreeGoals[0].name}</h2>
                <p className="text-slate-600 mt-1">
                  每天 {screenFreeGoals[0].timeRange} · {formatDuration(screenFreeGoals[0].targetValue)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  远离屏幕，享受真实的生活时光
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <ProgressRing
                progress={todayScreenFree?.completed ? 100 : 0}
                size={100}
                strokeWidth={10}
                color="#8b5cf6"
                label={todayScreenFree?.completed ? '已完成' : '未开始'}
                subLabel="今日"
              />
              <button
                type="button"
                onClick={handleToggleScreenFree}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  todayScreenFree?.completed
                    ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {todayScreenFree?.completed ? (
                  <><XCircle className="w-5 h-5" /> 取消打卡</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> 立即打卡</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            每日时长上限
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dailyLimitGoals.map((goal) => {
            const { current, target, progress } = calculateGoalProgress(goal, appUsage, today);
            const cat = CATEGORIES.find((c) => c.key === goal.category);
            return (
              <div key={goal.id} className="card group relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(goal)}
                    className="p-2 rounded-lg bg-white shadow-md text-slate-400 hover:text-primary-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 rounded-lg bg-white shadow-md text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${cat?.bgColor || 'bg-slate-100'} flex items-center justify-center`}>
                    <span className={`text-xl font-bold ${cat?.color || 'text-slate-600'}`}>
                      {cat?.label?.[0] || 'A'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{goal.name}</h3>
                    <p className="text-sm text-slate-500">
                      {cat?.label || '全部'} · 每日上限 {formatDuration(target)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">今日使用</span>
                    <span className={`font-semibold ${progress > 100 ? 'text-rose-500' : 'text-slate-800'}`}>
                      {formatDuration(current)} / {formatDuration(target)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        progress > 100
                          ? 'bg-gradient-to-r from-rose-400 to-red-500'
                          : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  {progress > 100 && (
                    <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      已超出 {formatDuration(current - target)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detoxChallenges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              数字排毒挑战
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {detoxChallenges.map((challenge) => {
              const cat = CATEGORIES.find((c) => c.key === challenge.category);
              return (
                <div key={challenge.id} className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 group relative">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(challenge)}
                      className="p-2 rounded-lg bg-white shadow-md text-slate-400 hover:text-primary-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGoal(challenge.id)}
                      className="p-2 rounded-lg bg-white shadow-md text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{challenge.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {challenge.frequency === 'weekends' ? '周末' : challenge.frequency === 'weekdays' ? '工作日' : '每天'}
                        {cat && ` · 不使用${cat.label}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-100">
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                      <Target className="w-4 h-4" />
                      <span>挑战进行中，加油！</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingGoal(null);
        }}
        title={editingGoal ? '编辑目标' : '新建目标'}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">目标类型</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(goalTypeLabels) as GoalType[]).map((type) => {
                const info = goalTypeLabels[type];
                const Icon = info.icon;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      setGoalType(type);
                      setNewGoal({ ...newGoal, type });
                    }}
                    className={`p-4 rounded-xl text-center transition-all ${
                      goalType === type
                        ? 'bg-primary-50 ring-2 ring-offset-2 ring-primary-400'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto ${info.color}`} />
                    <p className="text-sm font-medium text-slate-700 mt-2">{info.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">目标名称</label>
            <input
              type="text"
              className="input-field"
              placeholder="例如：社交媒体每日上限"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            />
          </div>

          {goalType !== 'screenFreeTime' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">适用分类</label>
              <div className="grid grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setNewGoal({ ...newGoal, category: 'all' })}
                  className={`p-3 rounded-xl text-center transition-all ${
                    newGoal.category === 'all'
                      ? 'bg-slate-100 ring-2 ring-offset-2 ring-primary-400'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-700">全部</p>
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.key}
                    onClick={() => setNewGoal({ ...newGoal, category: cat.key })}
                    className={`p-3 rounded-xl text-center transition-all ${
                      newGoal.category === cat.key
                        ? `${cat.bgColor} ring-2 ring-offset-2 ring-primary-400`
                        : `bg-slate-50 hover:bg-slate-100`
                    }`}
                  >
                    <p className={`text-sm font-medium ${cat.color}`}>{cat.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {goalType === 'screenFreeTime' ? '持续时长' : '目标时长'}：{formatDuration(newGoal.targetValue)}
            </label>
            <input
              type="range"
              min="15"
              max="480"
              step="15"
              value={newGoal.targetValue}
              onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          {goalType === 'screenFreeTime' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">时间段</label>
              <input
                type="text"
                className="input-field"
                placeholder="例如：20:00-21:00"
                value={newGoal.timeRange}
                onChange={(e) => setNewGoal({ ...newGoal, timeRange: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">执行频率</label>
            <div className="grid grid-cols-4 gap-2">
              {(['daily', 'weekdays', 'weekends', 'custom'] as GoalFrequency[]).map((freq) => (
                <button
                  type="button"
                  key={freq}
                  onClick={() => setNewGoal({ ...newGoal, frequency: freq })}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    newGoal.frequency === freq
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-offset-1 ring-primary-400'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {freq === 'daily' ? '每天' : freq === 'weekdays' ? '工作日' : freq === 'weekends' ? '周末' : '自定义'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingGoal(null);
              }}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button type="button" onClick={handleSaveGoal} className="btn-primary flex-1">
              {editingGoal ? '保存修改' : '创建目标'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
