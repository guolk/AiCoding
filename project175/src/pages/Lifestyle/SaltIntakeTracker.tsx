import { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Droplets,
  Calendar,
  StickyNote,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useHealthStore } from '@/store';
import { cn, formatDate } from '@/utils';

const RECOMMENDED_SALT = 5;

export default function SaltIntakeTracker() {
  const { saltIntakeRecords, addSaltIntake, updateSaltIntake, deleteSaltIntake } =
    useHealthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: formatDate(new Date()), amountGrams: '', note: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [dayRange, setDayRange] = useState(14);

  const sortedRecords = useMemo(
    () => [...saltIntakeRecords].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [saltIntakeRecords]
  );

  const chartData = useMemo(() => {
    const records = [...saltIntakeRecords]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(-dayRange);
    return records.map((r) => ({
      date: r.date.slice(5),
      amount: r.amountGrams,
    }));
  }, [saltIntakeRecords, dayRange]);

  const averageIntake = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, d) => acc + d.amount, 0);
    return Number((sum / chartData.length).toFixed(1));
  }, [chartData]);

  const daysOverLimit = useMemo(() => {
    return chartData.filter((d) => d.amount > RECOMMENDED_SALT).length;
  }, [chartData]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ date: formatDate(new Date()), amountGrams: '', note: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (record: { id: string; date: string; amountGrams: number; note?: string }) => {
    setEditingId(record.id);
    setFormData({
      date: record.date,
      amountGrams: String(record.amountGrams),
      note: record.note || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(formData.amountGrams);
    if (!formData.date || amount <= 0) return;

    const data = {
      date: formData.date,
      amountGrams: amount,
      note: formData.note || undefined,
    };

    if (editingId) {
      updateSaltIntake(editingId, data);
    } else {
      addSaltIntake(data);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteSaltIntake(id);
    setDeleteConfirmId(null);
  };

  const getSaltStatus = (amount: number) => {
    if (amount <= 5) return { label: '达标', className: 'text-green-600', bgClass: 'bg-green-100' };
    if (amount <= 8) return { label: '偏高', className: 'text-yellow-600', bgClass: 'bg-yellow-100' };
    return { label: '超标', className: 'text-red-600', bgClass: 'bg-red-100' };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <Droplets className="w-4 h-4" />
            平均盐摄入
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">{averageIntake}</span>
            <span className="text-lg text-blue-100">g/天</span>
          </div>
          <div className="mt-2 text-xs text-blue-100">
            近 {dayRange} 天平均
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Target className="w-4 h-4" />
            推荐摄入量
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-800 tabular-nums">{RECOMMENDED_SALT}</span>
            <span className="text-lg text-gray-400">g/天</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            WHO 推荐标准
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            超标天数
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={cn(
              'text-3xl font-bold tabular-nums',
              daysOverLimit === 0 ? 'text-green-600' : daysOverLimit <= 3 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {daysOverLimit}
            </span>
            <span className="text-lg text-gray-400">天</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            近 {dayRange} 天内
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">盐摄入趋势</h3>
          </div>
          <div className="flex gap-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDayRange(days)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  dayRange === days
                    ? 'bg-blue-500 text-white'
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
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="saltGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#e5e7eb" />
                <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#e5e7eb" />
                <Tooltip
                  formatter={(value: number) => [`${value} g`, '盐摄入']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <ReferenceLine y={RECOMMENDED_SALT} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#saltGrad)"
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              暂无数据
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span className="w-8 h-px bg-red-500 border-dashed" />
          推荐上限 ({RECOMMENDED_SALT}g)
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">历史记录</h3>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            添加记录
          </button>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="py-12 text-center">
            <Droplets className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-3 text-gray-500">暂无盐摄入记录</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              点击添加第一条记录
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedRecords.map((record) => {
              const status = getSaltStatus(record.amountGrams);
              return (
                <div
                  key={record.id}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-gray-800 tabular-nums">
                        {record.amountGrams}
                      </span>
                      <span className="text-xs text-gray-400">g</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{record.date}</p>
                      {record.note && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{record.note}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-full',
                      status.bgClass,
                      status.className
                    )}>
                      {status.label}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(record)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                {editingId ? '编辑记录' : '添加盐摄入记录'}
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
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  盐摄入量 (克) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.amountGrams}
                  onChange={(e) => setFormData({ ...formData, amountGrams: e.target.value })}
                  placeholder="请输入盐摄入量"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  WHO 建议每日不超过 {RECOMMENDED_SALT} 克
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <StickyNote className="inline w-4 h-4 mr-1" />
                  备注（选填）
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="记录饮食情况等..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
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
                    formData.amountGrams && Number(formData.amountGrams) > 0
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'cursor-not-allowed bg-blue-300'
                  )}
                  disabled={!formData.amountGrams || Number(formData.amountGrams) <= 0}
                >
                  {editingId ? '保存修改' : '添加记录'}
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
              确定要删除这条盐摄入记录吗？删除后无法恢复。
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
