import { useState, useMemo } from 'react';
import {
  Plus,
  Clock,
  Moon,
  Brain,
  Smile,
  TrendingUp,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { ProgressRing } from '../components/ui/ProgressRing';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { UsageTrendChart } from '../components/charts/UsageTrendChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { useAppStore, useTodayUsage } from '../store/useAppStore';
import { CATEGORIES, EMOTIONAL_TRIGGERS, USAGE_QUALITY, AppCategory, EmotionalTrigger, UsageQuality } from '../types';
import { formatDuration, getWeekDates, getToday, formatDateDisplay } from '../utils/date';
import { sumByCategory, sumByDate, getGoalProgress, calculateGoalProgress } from '../utils/statistics';

export default function Dashboard() {
  const { appUsage, goals, healthMetrics, alternatives, addAppUsage } = useAppStore();
  const todayUsage = useTodayUsage();
  const today = useMemo(() => getToday(), []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsage, setNewUsage] = useState({
    category: 'social' as AppCategory,
    appName: '',
    durationMinutes: 30,
    emotionalTrigger: 'habit' as EmotionalTrigger,
    usageQuality: 'mixed' as UsageQuality,
    notes: '',
  });

  const todayTotal = todayUsage.reduce((sum, u) => sum + u.durationMinutes, 0);
  const todayByCategory = sumByCategory(appUsage, getToday());
  const weekDates = getWeekDates();
  const weekValues = weekDates.map((d) => sumByDate(appUsage, [d])[d] || 0);
  const weekTotal = weekValues.reduce((a, b) => a + b, 0);
  const avgDaily = Math.round(weekTotal / 7);

  const activeGoals = goals.filter((g) => g.active);
  const latestHealth = healthMetrics[healthMetrics.length - 1];
  const topAlternatives = alternatives.filter((a) => a.active).slice(0, 3);

  const handleAddUsage = () => {
    if (!newUsage.appName.trim()) return;
    addAppUsage({
      ...newUsage,
      date: getToday(),
    });
    setShowAddModal(false);
    setNewUsage({
      category: 'social',
      appName: '',
      durationMinutes: 30,
      emotionalTrigger: 'habit',
      usageQuality: 'mixed',
      notes: '',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            今日概览
          </h1>
          <p className="text-slate-500 mt-1">{formatDateDisplay(new Date())}</p>
        </div>
        <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          记录使用
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center text-center p-8">
          <ProgressRing
            progress={getGoalProgress(todayTotal, 300)}
            size={160}
            strokeWidth={12}
            color="#10B981"
            label={formatDuration(todayTotal)}
            subLabel="今日使用"
          />
          <p className="text-sm text-slate-500 mt-4">
            目标：{formatDuration(300)} · 还剩 {formatDuration(Math.max(0, 300 - todayTotal))}
          </p>
        </div>

        <StatCard
          title="本周总计"
          value={formatDuration(weekTotal)}
          subtitle={`日均 ${formatDuration(avgDaily)}`}
          icon={<Clock className="w-5 h-5 text-primary-600" />}
          trend={weekTotal > avgDaily * 7 ? 'up' : 'down'}
          trendValue={weekTotal > avgDaily * 7 ? '较上周上升' : '较上周下降'}
          color="primary"
        />

        <StatCard
          title="昨晚睡眠"
          value={latestHealth ? `${latestHealth.sleepHours}小时` : '未记录'}
          subtitle={latestHealth ? `质量评分 ${latestHealth.sleepQuality}/10` : '去记录睡眠'}
          icon={<Moon className="w-5 h-5 text-purple-600" />}
          color="study"
        />

        <StatCard
          title="今日专注力"
          value={latestHealth ? `${latestHealth.focusLevel}/10` : '未记录'}
          subtitle={latestHealth?.focusLevel && latestHealth.focusLevel >= 7 ? '状态良好' : '需要提升'}
          icon={<Brain className="w-5 h-5 text-blue-600" />}
          color="work"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl font-semibold text-slate-900">本周趋势</h2>
              <p className="text-sm text-slate-500">最近7天使用时间变化</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {weekValues[weekValues.length - 1] > weekValues[0] ? (
                <TrendingUp className="w-4 h-4 text-rose-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              )}
              <span className={weekValues[weekValues.length - 1] > weekValues[0] ? 'text-rose-500' : 'text-emerald-500'}>
                {weekValues[weekValues.length - 1] > weekValues[0] ? '呈上升趋势' : '呈下降趋势'}
              </span>
            </div>
          </div>
          <UsageTrendChart dates={weekDates} values={weekValues} height={220} />
        </div>

        <div className="card">
          <div className="mb-4">
            <h2 className="font-serif text-xl font-semibold text-slate-900">分类占比</h2>
            <p className="text-sm text-slate-500">今日各类别使用</p>
          </div>
          <CategoryPieChart data={todayByCategory} height={220} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="mb-4">
            <h2 className="font-serif text-xl font-semibold text-slate-900">目标进度</h2>
            <p className="text-sm text-slate-500">今日目标完成情况</p>
          </div>
          <div className="space-y-4">
            {activeGoals.slice(0, 3).map((goal) => {
              const { current, target, progress } = calculateGoalProgress(goal, appUsage, today);
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{goal.name}</span>
                    <span className={progress > 100 ? 'text-rose-500' : 'text-slate-500'}>
                      {formatDuration(current)} / {formatDuration(target)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        progress > 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-primary-400 to-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="mb-4">
            <h2 className="font-serif text-xl font-semibold text-slate-900">今日情绪触发</h2>
            <p className="text-sm text-slate-500">拿起手机的原因</p>
          </div>
          <div className="space-y-3">
            {EMOTIONAL_TRIGGERS.slice(0, 4).map((trigger) => {
              const count = todayUsage.filter((u) => u.emotionalTrigger === trigger.key).length;
              const total = todayUsage.length || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={trigger.key} className="flex items-center gap-3">
                  <span className="text-xl">{trigger.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700">{trigger.label}</span>
                      <span className="text-slate-500">{count}次</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-300 to-emerald-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="mb-4">
            <h2 className="font-serif text-xl font-semibold text-slate-900">推荐替代活动</h2>
            <p className="text-sm text-slate-500">想玩手机时试试这些</p>
          </div>
          <div className="space-y-3">
            {topAlternatives.map((alt) => (
              <div
                key={alt.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {alt.emoji}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{alt.name}</p>
                  <p className="text-xs text-slate-500">
                    {alt.durationMinutes}分钟 · 效果 {alt.effectivenessScore}/5
                  </p>
                </div>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="记录App使用">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setNewUsage({ ...newUsage, category: cat.key })}
                  className={`p-3 rounded-xl text-center transition-all ${
                    newUsage.category === cat.key
                      ? `${cat.bgColor} ring-2 ring-offset-2 ring-primary-400`
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <p className={`text-sm font-medium ${cat.color}`}>{cat.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">App名称</label>
            <input
              type="text"
              className="input-field"
              placeholder="例如：微信、抖音..."
              value={newUsage.appName}
              onChange={(e) => setNewUsage({ ...newUsage, appName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              使用时长：{newUsage.durationMinutes}分钟
            </label>
            <input
              type="range"
              min="5"
              max="240"
              step="5"
              value={newUsage.durationMinutes}
              onChange={(e) => setNewUsage({ ...newUsage, durationMinutes: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>5分钟</span>
              <span>4小时</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">使用原因</label>
            <div className="grid grid-cols-4 gap-2">
              {EMOTIONAL_TRIGGERS.slice(0, 4).map((trigger) => (
                <button
                  type="button"
                  key={trigger.key}
                  onClick={() => setNewUsage({ ...newUsage, emotionalTrigger: trigger.key })}
                  className={`p-2 rounded-xl text-center transition-all ${
                    newUsage.emotionalTrigger === trigger.key
                      ? 'bg-primary-100 ring-2 ring-offset-1 ring-primary-400'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-lg">{trigger.emoji}</p>
                  <p className="text-xs text-slate-600 mt-1">{trigger.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">使用质量</label>
            <div className="flex gap-2">
              {USAGE_QUALITY.map((q) => (
                <button
                  type="button"
                  key={q.key}
                  onClick={() => setNewUsage({ ...newUsage, usageQuality: q.key })}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    newUsage.usageQuality === q.key
                      ? `${q.color} bg-slate-100 ring-2 ring-offset-1 ring-primary-400`
                      : `bg-slate-50 text-slate-600 hover:bg-slate-100`
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="button" onClick={handleAddUsage} className="btn-primary flex-1">
              保存记录
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
