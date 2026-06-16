import { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Dumbbell,
  Calendar,
  StickyNote,
  Flame,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Zap,
  Bike,
  Heart,
  Activity,
  Leaf,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useHealthStore } from '@/store';
import type { ExerciseRecord, ExerciseType } from '@/types';
import { cn, formatDate } from '@/utils';

const exerciseTypeLabels: Record<ExerciseType, string> = {
  walking: '散步',
  running: '跑步',
  cycling: '骑行',
  swimming: '游泳',
  yoga: '瑜伽',
  strength: '力量训练',
  other: '其他',
};

const exerciseTypeIcons: Record<ExerciseType, typeof Activity> = {
  walking: Activity,
  running: Zap,
  cycling: Bike,
  swimming: Heart,
  yoga: Leaf,
  strength: Dumbbell,
  other: Activity,
};

const exerciseTypeColors: Record<ExerciseType, string> = {
  walking: 'from-green-500 to-emerald-600',
  running: 'from-orange-500 to-red-600',
  cycling: 'from-blue-500 to-cyan-600',
  swimming: 'from-cyan-500 to-blue-600',
  yoga: 'from-purple-500 to-pink-600',
  strength: 'from-amber-500 to-orange-600',
  other: 'from-gray-500 to-slate-600',
};

const RECOMMENDED_MINUTES = 30;

export default function ExerciseTracker() {
  const { exerciseRecords, addExercise, updateExercise, deleteExercise } = useHealthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExerciseRecord | null>(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    type: 'walking' as ExerciseType,
    durationMinutes: '',
    caloriesBurned: '',
    note: '',
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [dayRange, setDayRange] = useState(14);

  const sortedRecords = useMemo(
    () => [...exerciseRecords].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [exerciseRecords]
  );

  const chartData = useMemo(() => {
    const dateMap = new Map<string, { duration: number; calories: number }>();
    const records = [...exerciseRecords]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .filter((r) => {
        const diff = Math.abs(
          (new Date(r.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return diff <= dayRange;
      });

    records.forEach((r) => {
      const existing = dateMap.get(r.date);
      if (existing) {
        existing.duration += r.durationMinutes;
        existing.calories += r.caloriesBurned || 0;
      } else {
        dateMap.set(r.date, { duration: r.durationMinutes, calories: r.caloriesBurned || 0 });
      }
    });

    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date: date.slice(5),
      duration: data.duration,
      calories: data.calories,
    }));
  }, [exerciseRecords, dayRange]);

  const totalDuration = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.duration, 0);
  }, [chartData]);

  const totalCalories = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.calories, 0);
  }, [chartData]);

  const activeDays = useMemo(() => chartData.length, [chartData]);

  const avgDuration = useMemo(() => {
    return activeDays > 0 ? Math.round(totalDuration / activeDays) : 0;
  }, [totalDuration, activeDays]);

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({
      date: formatDate(new Date()),
      type: 'walking',
      durationMinutes: '',
      caloriesBurned: '',
      note: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: ExerciseRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      type: record.type,
      durationMinutes: String(record.durationMinutes),
      caloriesBurned: record.caloriesBurned ? String(record.caloriesBurned) : '',
      note: record.note || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = Number(formData.durationMinutes);
    if (!formData.date || duration <= 0) return;

    const data = {
      date: formData.date,
      type: formData.type,
      durationMinutes: duration,
      caloriesBurned: formData.caloriesBurned ? Number(formData.caloriesBurned) : undefined,
      note: formData.note || undefined,
    };

    if (editingRecord) {
      updateExercise(editingRecord.id, data);
    } else {
      addExercise(data);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteExercise(id);
    setDeleteConfirmId(null);
  };

  const todayRecords = sortedRecords.filter((r) => r.date === formatDate(new Date()));
  const todayDuration = todayRecords.reduce((sum, r) => sum + r.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <Clock className="w-4 h-4" />
            今日运动
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">{todayDuration}</span>
            <span className="text-lg text-orange-100">分钟</span>
          </div>
          <div className="mt-2 text-xs text-orange-100">
            {todayDuration >= RECOMMENDED_MINUTES ? '已达标 ✓' : `目标 ${RECOMMENDED_MINUTES} 分钟`}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <TrendingUp className="w-4 h-4" />
            总运动时长
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-800 tabular-nums">{totalDuration}</span>
            <span className="text-lg text-gray-400">分钟</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            近 {dayRange} 天累计
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Flame className="w-4 h-4" />
            消耗热量
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-orange-600 tabular-nums">{totalCalories}</span>
            <span className="text-lg text-gray-400">千卡</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            近 {dayRange} 天累计
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Target className="w-4 h-4" />
            运动天数
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-green-600 tabular-nums">{activeDays}</span>
            <span className="text-lg text-gray-400">天</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            日均 {avgDuration} 分钟
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-800">运动趋势</h3>
          </div>
          <div className="flex gap-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDayRange(days)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  dayRange === days
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                近{days}天
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="exerciseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#e5e7eb" />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#e5e7eb" />
                <Tooltip
                  formatter={(value: number) => [`${value} 分钟`, '运动时长']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="duration" fill="url(#exerciseGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              暂无数据
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-800">运动记录</h3>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            添加运动
          </button>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="py-12 text-center">
            <Dumbbell className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-3 text-gray-500">暂无运动记录</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-sm text-orange-600 hover:text-orange-700"
            >
              点击添加第一条记录
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedRecords.map((record) => {
              const Icon = exerciseTypeIcons[record.type];
              const color = exerciseTypeColors[record.type];
              return (
                <div
                  key={record.id}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                      color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {exerciseTypeLabels[record.type]}
                        <span className="text-gray-400 text-sm font-normal ml-2">
                          {record.date}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {record.durationMinutes} 分钟
                        </span>
                        {record.caloriesBurned && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                            {record.caloriesBurned} 千卡
                          </span>
                        )}
                      </div>
                      {record.note && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{record.note}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(record)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(record.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRecord ? '编辑运动' : '添加运动记录'}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  运动类型
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(exerciseTypeLabels) as ExerciseType[]).map((type) => {
                    const Icon = exerciseTypeIcons[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={cn(
                          'flex flex-col items-center gap-1 py-3 rounded-xl border transition-all',
                          formData.type === type
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{exerciseTypeLabels[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    时长 (分钟) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    placeholder="30"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    消耗热量 (千卡)
                  </label>
                  <input
                    type="number"
                    value={formData.caloriesBurned}
                    onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                    placeholder="可选"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <StickyNote className="inline w-4 h-4 mr-1" />
                  备注（选填）
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="记录运动感受等..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white',
                    formData.durationMinutes && Number(formData.durationMinutes) > 0
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'cursor-not-allowed bg-orange-300'
                  )}
                  disabled={!formData.durationMinutes || Number(formData.durationMinutes) <= 0}
                >
                  {editingRecord ? '保存修改' : '添加记录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              确定要删除这条运动记录吗？删除后无法恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
