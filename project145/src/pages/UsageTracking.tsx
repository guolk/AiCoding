import { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, BarChart3, PieChart, ArrowUpDown } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { UsageTrendChart } from '../components/charts/UsageTrendChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { ComparisonBarChart } from '../components/charts/ComparisonBarChart';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, EMOTIONAL_TRIGGERS, USAGE_QUALITY, AppCategory, EmotionalTrigger, UsageQuality } from '../types';
import { formatDuration, getWeekDates, getMonthDates, getToday, formatDateDisplay, isWeekend, getDayOfWeek } from '../utils/date';
import { sumByCategory, sumByDate, compareWeekdayVsWeekend } from '../utils/statistics';
import { generateId } from '../utils/storage';

type ViewMode = 'list' | 'trend' | 'comparison';
type TimeRange = 'week' | 'month';

export default function UsageTracking() {
  const { appUsage, addAppUsage, deleteAppUsage } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsage, setNewUsage] = useState({
    category: 'social' as AppCategory,
    appName: '',
    durationMinutes: 30,
    date: getToday(),
    emotionalTrigger: 'habit' as EmotionalTrigger,
    usageQuality: 'mixed' as UsageQuality,
    notes: '',
  });

  const dates = useMemo(() => {
    const today = new Date();
    if (timeRange === 'week') {
      return getWeekDates(today);
    }
    return getMonthDates(today.getFullYear(), today.getMonth());
  }, [timeRange]);

  const filteredUsage = useMemo(() => {
    return appUsage.filter((u) => dates.includes(u.date));
  }, [appUsage, dates]);

  const dailyTotals = useMemo(() => {
    return dates.map((d) => sumByDate(appUsage, [d])[d] || 0);
  }, [appUsage, dates]);

  const categoryTotals = useMemo(() => {
    return sumByCategory(filteredUsage);
  }, [filteredUsage]);

  const weekdayComparison = useMemo(() => {
    return compareWeekdayVsWeekend(filteredUsage);
  }, [filteredUsage]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof appUsage> = {};
    filteredUsage.forEach((u) => {
      if (!groups[u.date]) groups[u.date] = [];
      groups[u.date].push(u);
    });
    return groups;
  }, [filteredUsage]);

  const handleAddUsage = () => {
    if (!newUsage.appName.trim()) return;
    addAppUsage(newUsage);
    setShowAddModal(false);
    setNewUsage({
      category: 'social',
      appName: '',
      durationMinutes: 30,
      date: getToday(),
      emotionalTrigger: 'habit',
      usageQuality: 'mixed',
      notes: '',
    });
  };

  const getCategoryColor = (category: AppCategory) => {
    const cat = CATEGORIES.find((c) => c.key === category);
    return cat?.color || 'text-slate-600';
  };

  const getCategoryBg = (category: AppCategory) => {
    const cat = CATEGORIES.find((c) => c.key === category);
    return cat?.bgColor || 'bg-slate-100';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">使用追踪</h1>
          <p className="text-slate-500 mt-1">记录和分析您的手机使用习惯</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-full p-1 shadow-sm border border-slate-200">
            {(['list', 'trend', 'comparison'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'list' && <Calendar className="w-4 h-4" />}
                {mode === 'trend' && <BarChart3 className="w-4 h-4" />}
                {mode === 'comparison' && <ArrowUpDown className="w-4 h-4" />}
                {mode === 'list' ? '记录' : mode === 'trend' ? '趋势' : '对比'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加记录
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">时间范围：</span>
        {(['week', 'month'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {range === 'week' ? '本周' : '本月'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className={`${cat.bgColor} rounded-2xl p-4 transition-all hover:shadow-md`}>
            <p className={`text-sm font-medium ${cat.color}`}>{cat.label}</p>
            <p className="font-serif text-xl font-bold text-slate-900 mt-1">
              {formatDuration(categoryTotals[cat.key] || 0)}
            </p>
          </div>
        ))}
      </div>

      {viewMode === 'list' && (
        <div className="space-y-6">
          {dates.slice().reverse().map((date) => {
            const dayUsage = groupedByDate[date] || [];
            const dayTotal = dayUsage.reduce((sum, u) => sum + u.durationMinutes, 0);
            if (dayUsage.length === 0) return null;
            return (
              <div key={date} className="card animate-slide-up" style={{ animationDelay: `${dates.indexOf(date) * 50}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-slate-900">
                      {formatDateDisplay(date)}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {getDayOfWeek(date)} {isWeekend(date) && <span className="text-amber-600">· 周末</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xl font-bold text-slate-900">{formatDuration(dayTotal)}</p>
                    <p className="text-xs text-slate-500">{dayUsage.length} 条记录</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {dayUsage.map((usage) => {
                    const trigger = EMOTIONAL_TRIGGERS.find((t) => t.key === usage.emotionalTrigger);
                    const quality = USAGE_QUALITY.find((q) => q.key === usage.usageQuality);
                    return (
                      <div
                        key={usage.id}
                        className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl group hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-3 h-3 rounded-full ${getCategoryBg(usage.category)} ${getCategoryColor(usage.category)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{usage.appName}</span>
                            <span className={`tag ${getCategoryBg(usage.category)} ${getCategoryColor(usage.category)}`}>
                              {CATEGORIES.find((c) => c.key === usage.category)?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{trigger?.emoji} {trigger?.label}</span>
                            <span className={quality?.color}>{quality?.label}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">{formatDuration(usage.durationMinutes)}</p>
                        </div>
                        <button
                          onClick={() => deleteAppUsage(usage.id)}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'trend' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card col-span-1 lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-semibold text-slate-900">使用趋势</h2>
              <p className="text-sm text-slate-500">{timeRange === 'week' ? '本周' : '本月'}每日使用时间变化</p>
            </div>
            <UsageTrendChart dates={dates} values={dailyTotals} height={300} />
          </div>
          <div className="card">
            <div className="mb-4">
              <h2 className="font-serif text-xl font-semibold text-slate-900">分类占比</h2>
              <p className="text-sm text-slate-500">{timeRange === 'week' ? '本周' : '本月'}各类别使用</p>
            </div>
            <CategoryPieChart data={categoryTotals} height={300} />
          </div>
        </div>
      )}

      {viewMode === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-semibold text-slate-900">工作日 vs 周末</h2>
              <p className="text-sm text-slate-500">日均使用时间对比</p>
            </div>
            <ComparisonBarChart
              labels={['工作日', '周末']}
              datasets={[
                {
                  label: '日均使用时间',
                  data: [weekdayComparison.weekday, weekdayComparison.weekend],
                  color: 'rgba(16, 185, 129, 0.8)',
                },
              ]}
              height={250}
            />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-600 font-medium">工作日日均</p>
                <p className="font-serif text-2xl font-bold text-slate-900 mt-1">
                  {formatDuration(weekdayComparison.weekday)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-600 font-medium">周末日均</p>
                <p className="font-serif text-2xl font-bold text-slate-900 mt-1">
                  {formatDuration(weekdayComparison.weekend)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-semibold text-slate-900">各分类对比</h2>
              <p className="text-sm text-slate-500">{timeRange === 'week' ? '本周' : '本月'}各类别使用时间</p>
            </div>
            <ComparisonBarChart
              labels={CATEGORIES.map((c) => c.label)}
              datasets={[
                {
                  label: '使用时间',
                  data: CATEGORIES.map((c) => categoryTotals[c.key] || 0),
                  color: 'rgba(139, 92, 246, 0.8)',
                },
              ]}
              height={250}
            />
          </div>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="添加使用记录">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">日期</label>
            <input
              type="date"
              className="input-field"
              value={newUsage.date}
              onChange={(e) => setNewUsage({ ...newUsage, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
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
              max="300"
              step="5"
              value={newUsage.durationMinutes}
              onChange={(e) => setNewUsage({ ...newUsage, durationMinutes: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">使用原因</label>
            <div className="grid grid-cols-4 gap-2">
              {EMOTIONAL_TRIGGERS.slice(0, 4).map((trigger) => (
                <button
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
                  key={q.key}
                  onClick={() => setNewUsage({ ...newUsage, usageQuality: q.key })}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    newUsage.usageQuality === q.key
                      ? `${q.color} bg-slate-100 ring-2 ring-offset-1 ring-primary-400`
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button onClick={handleAddUsage} className="btn-primary flex-1">
              保存记录
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
