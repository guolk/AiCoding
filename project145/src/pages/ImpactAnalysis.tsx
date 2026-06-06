import { useState } from 'react';
import { Plus, Brain, Moon, Smile, Heart, TrendingUp, TrendingDown, AlertCircle, Sparkles, Edit2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { useAppStore, useEmotionalTriggerStats, useUsageQualityStats } from '../store/useAppStore';
import { EMOTIONAL_TRIGGERS, USAGE_QUALITY, AppCategory } from '../types';
import { formatDuration, getToday, getWeekDates, formatDateDisplay } from '../utils/date';
import { calculateCorrelation, calculateUsageQualityStats, calculateEmotionalTriggerStats, sumByCategory } from '../utils/statistics';

export default function ImpactAnalysis() {
  const { appUsage, healthMetrics, addHealthMetric, updateHealthMetric } = useAppStore();
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [editingHealth, setEditingHealth] = useState<string | null>(null);
  const [healthData, setHealthData] = useState({
    date: getToday(),
    sleepQuality: 7,
    sleepHours: 7,
    focusLevel: 6,
    moodLevel: 7,
    notes: '',
  });

  const emotionalStats = useEmotionalTriggerStats(7);
  const qualityStats = useUsageQualityStats(7);
  const weekDates = getWeekDates();
  const weekUsage = sumByCategory(appUsage.filter((u) => weekDates.includes(u.date)));

  const sleepCorrelation = calculateCorrelation(appUsage, healthMetrics, 'sleepQuality');
  const focusCorrelation = calculateCorrelation(appUsage, healthMetrics, 'focusLevel');
  const moodCorrelation = calculateCorrelation(appUsage, healthMetrics, 'moodLevel');

  const latestHealth = healthMetrics[healthMetrics.length - 1];

  const handleOpenHealthModal = (date?: string) => {
    if (date) {
      const existing = healthMetrics.find((h) => h.date === date);
      if (existing) {
        setEditingHealth(existing.id);
        setHealthData({
          date: existing.date,
          sleepQuality: existing.sleepQuality,
          sleepHours: existing.sleepHours,
          focusLevel: existing.focusLevel,
          moodLevel: existing.moodLevel,
          notes: existing.notes || '',
        });
      }
    } else {
      setEditingHealth(null);
      setHealthData({
        date: getToday(),
        sleepQuality: 7,
        sleepHours: 7,
        focusLevel: 6,
        moodLevel: 7,
        notes: '',
      });
    }
    setShowHealthModal(true);
  };

  const handleSaveHealth = () => {
    if (editingHealth) {
      updateHealthMetric(editingHealth, healthData);
    } else {
      const existing = healthMetrics.find((h) => h.date === healthData.date);
      if (existing) {
        updateHealthMetric(existing.id, healthData);
      } else {
        addHealthMetric(healthData);
      }
    }
    setShowHealthModal(false);
    setEditingHealth(null);
  };

  const totalQuality = qualityStats.effective + qualityStats.mixed + qualityStats.ineffective || 1;

  const getCorrelationLabel = (value: number) => {
    if (value > 0.3) return { label: '较强正相关', color: 'text-rose-500' };
    if (value > 0.1) return { label: '轻微正相关', color: 'text-amber-500' };
    if (value < -0.3) return { label: '较强负相关', color: 'text-emerald-500' };
    if (value < -0.1) return { label: '轻微负相关', color: 'text-blue-500' };
    return { label: '无明显相关', color: 'text-slate-500' };
  };

  const getCorrelationIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4" />;
    if (value < 0) return <TrendingDown className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">影响分析</h1>
          <p className="text-slate-500 mt-1">了解手机使用如何影响您的生活</p>
        </div>
        <button type="button" onClick={() => handleOpenHealthModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          记录健康数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Moon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-600 font-medium">睡眠质量</p>
              <p className="font-serif text-2xl font-bold text-slate-900">
                {latestHealth ? `${latestHealth.sleepQuality}/10` : '未记录'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getCorrelationIcon(sleepCorrelation)}
                <span className={`text-xs font-medium ${getCorrelationLabel(sleepCorrelation).color}`}>
                  {getCorrelationLabel(sleepCorrelation).label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-600 font-medium">专注力水平</p>
              <p className="font-serif text-2xl font-bold text-slate-900">
                {latestHealth ? `${latestHealth.focusLevel}/10` : '未记录'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getCorrelationIcon(focusCorrelation)}
                <span className={`text-xs font-medium ${getCorrelationLabel(focusCorrelation).color}`}>
                  {getCorrelationLabel(focusCorrelation).label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Smile className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-rose-600 font-medium">情绪状态</p>
              <p className="font-serif text-2xl font-bold text-slate-900">
                {latestHealth ? `${latestHealth.moodLevel}/10` : '未记录'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getCorrelationIcon(moodCorrelation)}
                <span className={`text-xs font-medium ${getCorrelationLabel(moodCorrelation).color}`}>
                  {getCorrelationLabel(moodCorrelation).label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="mb-6">
            <h2 className="font-serif text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              使用质量分析
            </h2>
            <p className="text-sm text-slate-500">有效使用 vs 无效使用（近7天）</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {USAGE_QUALITY.map((q) => {
              const value = qualityStats[q.key];
              const percentage = Math.round((value / totalQuality) * 100);
              return (
                <div key={q.key} className="text-center">
                  <p className={`text-3xl font-bold ${q.color}`}>{percentage}%</p>
                  <p className="text-sm text-slate-500 mt-1">{q.label}</p>
                  <p className="text-xs text-slate-400">{formatDuration(value)}</p>
                </div>
              );
            })}
          </div>
          <CategoryPieChart
            data={{
              social: qualityStats.effective,
              entertainment: qualityStats.ineffective,
              work: qualityStats.mixed,
              study: 0,
              communication: 0,
            }}
            height={200}
          />
        </div>

        <div className="card">
          <div className="mb-6">
            <h2 className="font-serif text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              情绪触发因素
            </h2>
            <p className="text-sm text-slate-500">是什么让您拿起手机（近7天）</p>
          </div>
          <div className="space-y-4">
            {EMOTIONAL_TRIGGERS.map((trigger) => {
              const count = emotionalStats[trigger.key] || 0;
              const total = Object.values(emotionalStats).reduce((a, b) => a + b, 0) || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={trigger.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{trigger.emoji}</span>
                      <span className="text-sm font-medium text-slate-700">{trigger.label}</span>
                    </div>
                    <span className="text-sm text-slate-500">{count}次 ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-900">健康记录历史</h2>
            <p className="text-sm text-slate-500">最近7天的健康指标</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">日期</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">睡眠时长</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">睡眠质量</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">专注力</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">情绪</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">手机使用</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {healthMetrics.slice(-7).reverse().map((metric) => {
                const dayUsage = appUsage
                  .filter((u) => u.date === metric.date)
                  .reduce((sum, u) => sum + u.durationMinutes, 0);
                return (
                  <tr key={metric.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-800">{formatDateDisplay(metric.date)}</p>
                      {metric.notes && <p className="text-xs text-slate-400 mt-1">{metric.notes}</p>}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium text-slate-800">{metric.sleepHours}h</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                        <Moon className="w-3 h-3" />
                        {metric.sleepQuality}/10
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                        <Brain className="w-3 h-3" />
                        {metric.focusLevel}/10
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-medium">
                        <Smile className="w-3 h-3" />
                        {metric.moodLevel}/10
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-medium ${dayUsage > 300 ? 'text-rose-500' : 'text-slate-700'}`}>
                        {formatDuration(dayUsage)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenHealthModal(metric.date)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-900">洞察与建议</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {sleepCorrelation < -0.1 && (
                <p>📊 数据显示，手机使用时间越长，您的睡眠质量越差。建议在睡前1小时停止使用手机。</p>
              )}
              {focusCorrelation < -0.1 && (
                <p>🧠 手机使用与您的专注力呈负相关。尝试使用番茄工作法，每25分钟休息5分钟。</p>
              )}
              {emotionalStats.habit > emotionalStats.intentional && (
                <p>🔄 您有较多的习惯性检查行为。下次拿起手机前，先问问自己："我真的需要用手机吗？"</p>
              )}
              {qualityStats.ineffective > qualityStats.effective && (
                <p>⚠️ 您的无效使用时间超过了有效使用。尝试设定每天的"无手机时段"来提高使用质量。</p>
              )}
              {sleepCorrelation >= -0.1 && focusCorrelation >= -0.1 && emotionalStats.habit <= emotionalStats.intentional && (
                <p>✨ 太棒了！您的手机使用习惯非常健康，继续保持！</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} title={editingHealth ? '编辑健康记录' : '记录健康数据'}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">日期</label>
            <input
              type="date"
              className="input-field"
              value={healthData.date}
              onChange={(e) => setHealthData({ ...healthData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              睡眠时长：{healthData.sleepHours} 小时
            </label>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={healthData.sleepHours}
              onChange={(e) => setHealthData({ ...healthData, sleepHours: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              睡眠质量：{healthData.sleepQuality}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={healthData.sleepQuality}
              onChange={(e) => setHealthData({ ...healthData, sleepQuality: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              专注力水平：{healthData.focusLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={healthData.focusLevel}
              onChange={(e) => setHealthData({ ...healthData, focusLevel: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              情绪状态：{healthData.moodLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={healthData.moodLevel}
              onChange={(e) => setHealthData({ ...healthData, moodLevel: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">备注（可选）</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="今天有什么特别的事情吗？"
              value={healthData.notes}
              onChange={(e) => setHealthData({ ...healthData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowHealthModal(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button type="button" onClick={handleSaveHealth} className="btn-primary flex-1">
              {editingHealth ? '保存修改' : '保存记录'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
