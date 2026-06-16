import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Scale,
  Ruler,
  StickyNote,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Heart,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useHealthStore } from '@/store';
import type { BodyMeasurementRecord } from '@/types';
import { cn, formatDate, calculateBMI, getBMIStatus } from '@/utils';

export default function BodyMeasurementTracker() {
  const { bodyMeasurementRecords, addBodyMeasurement, updateBodyMeasurement, deleteBodyMeasurement } =
    useHealthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BodyMeasurementRecord | null>(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    weightKg: '',
    heightCm: '',
    waistCm: '',
    hipCm: '',
    note: '',
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sortedRecords = useMemo(
    () => [...bodyMeasurementRecords].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [bodyMeasurementRecords]
  );

  const latestRecord = useMemo(() => {
    if (sortedRecords.length === 0) return null;
    return sortedRecords[sortedRecords.length - 1];
  }, [sortedRecords]);

  const firstRecord = useMemo(() => {
    if (sortedRecords.length === 0) return null;
    return sortedRecords[0];
  }, [sortedRecords]);

  const weightChange = useMemo(() => {
    if (!latestRecord || !firstRecord || latestRecord.weightKg === firstRecord.weightKg) return 0;
    return Number((latestRecord.weightKg - firstRecord.weightKg).toFixed(1));
  }, [latestRecord, firstRecord]);

  const chartData = useMemo(() => {
    return sortedRecords.slice(-12).map((r) => ({
      date: r.date.slice(5),
      weight: r.weightKg,
      waist: r.waistCm || 0,
      bmi: r.bmi || 0,
    }));
  }, [sortedRecords]);

  const openAddModal = () => {
    setEditingRecord(null);
    const lastHeight = latestRecord?.heightCm || '';
    setFormData({
      date: formatDate(new Date()),
      weightKg: latestRecord?.weightKg.toString() || '',
      heightCm: lastHeight ? lastHeight.toString() : '',
      waistCm: latestRecord?.waistCm ? latestRecord.waistCm.toString() : '',
      hipCm: latestRecord?.hipCm ? latestRecord.hipCm.toString() : '',
      note: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: BodyMeasurementRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      weightKg: record.weightKg.toString(),
      heightCm: record.heightCm ? record.heightCm.toString() : '',
      waistCm: record.waistCm ? record.waistCm.toString() : '',
      hipCm: record.hipCm ? record.hipCm.toString() : '',
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
    const weight = Number(formData.weightKg);
    if (!formData.date || weight <= 0) return;

    const height = formData.heightCm ? Number(formData.heightCm) : undefined;
    const bmi = height ? calculateBMI(weight, height) : undefined;

    const data = {
      date: formData.date,
      weightKg: weight,
      heightCm: height,
      waistCm: formData.waistCm ? Number(formData.waistCm) : undefined,
      hipCm: formData.hipCm ? Number(formData.hipCm) : undefined,
      bmi,
      note: formData.note || undefined,
    };

    if (editingRecord) {
      updateBodyMeasurement(editingRecord.id, data);
    } else {
      addBodyMeasurement(data);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteBodyMeasurement(id);
    setDeleteConfirmId(null);
  };

  const bmiStatus = latestRecord?.bmi ? getBMIStatus(latestRecord.bmi) : '';
  const bmiStatusColor = bmiStatus === '正常' ? 'text-green-600' : bmiStatus === '偏瘦' ? 'text-blue-600' : 'text-orange-600';

  const weightTrend = Number(weightChange);

  return (
    <>
      <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <Scale className="w-4 h-4" />
            当前体重
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">
              {latestRecord?.weightKg || '--'}
            </span>
            <span className="text-lg text-purple-100">kg</span>
          </div>
          {latestRecord && firstRecord && latestRecord.weightKg !== firstRecord.weightKg && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {weightTrend < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-green-300" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-red-300" />
              )}
              <span className={weightTrend < 0 ? 'text-green-200' : 'text-red-200'}>
                {weightTrend > 0 ? '+' : ''}{weightChange} kg
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Heart className="w-4 h-4" />
            BMI 指数
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={cn('text-3xl font-bold tabular-nums', bmiStatusColor)}>
              {latestRecord?.bmi || '--'}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {bmiStatus || '暂无数据'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Ruler className="w-4 h-4" />
            腰围
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-800 tabular-nums">
              {latestRecord?.waistCm || '--'}
            </span>
            <span className="text-lg text-gray-400">cm</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {latestRecord?.hipCm ? `臀围 ${latestRecord.hipCm} cm` : '暂无数据'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <TrendingUp className="w-4 h-4" />
            测量次数
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-blue-600 tabular-nums">
              {sortedRecords.length}
            </span>
            <span className="text-lg text-gray-400">次</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            累计记录
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-800">体重变化趋势</h3>
          </div>
        </div>
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#e5e7eb" />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#e5e7eb" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#e5e7eb" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  name="体重 (kg)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#weightGrad)"
                  dot={{ r: 3, fill: '#8b5cf6' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="waist"
                  name="腰围 (cm)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f59e0b' }}
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
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-800">测量记录</h3>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            添加记录
          </button>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="py-12 text-center">
            <Scale className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-3 text-gray-500">暂无身体测量记录</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700"
            >
              点击添加第一条记录
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">体重</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">身高</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">BMI</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">腰围</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">臀围</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {[...sortedRecords].reverse().map((record) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-800">{record.date}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-800 tabular-nums">
                        {record.weightKg} kg
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 tabular-nums">
                      {record.heightCm ? `${record.heightCm} cm` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {record.bmi ? (
                        <span className={cn('text-sm font-medium tabular-nums', bmiStatusColor)}>
                          {record.bmi}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 tabular-nums">
                      {record.waistCm ? `${record.waistCm} cm` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 tabular-nums">
                      {record.hipCm ? `${record.hipCm} cm` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(record)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRecord ? '编辑记录' : '添加身体测量记录'}
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
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    体重 (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    placeholder="70.0"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    placeholder="170"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    腰围 (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.waistCm}
                    onChange={(e) => setFormData({ ...formData, waistCm: e.target.value })}
                    placeholder="85"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    臀围 (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hipCm}
                    onChange={(e) => setFormData({ ...formData, hipCm: e.target.value })}
                    placeholder="95"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
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
                  placeholder="记录身体状态等..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none"
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
                    formData.weightKg && Number(formData.weightKg) > 0
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'cursor-not-allowed bg-purple-300'
                  )}
                  disabled={!formData.weightKg || Number(formData.weightKg) <= 0}
                >
                  {editingRecord ? '保存修改' : '添加记录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}

      {deleteConfirmId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              确定要删除这条测量记录吗？删除后无法恢复。
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
      , document.body)}
    </>
  );
}
