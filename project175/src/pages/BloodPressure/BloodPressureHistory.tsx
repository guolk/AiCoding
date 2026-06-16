import { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  Sunrise,
  Moon,
  MoreHorizontal,
} from 'lucide-react';
import type { BloodPressureRecord, TimeOfDay, MeasurementCondition, MeasurementDevice } from '@/types';
import { useHealthStore } from '@/store';
import { cn, isBloodPressureNormal } from '@/utils';

const timeLabels: Record<TimeOfDay, string> = {
  morning: '清晨',
  evening: '睡前',
  other: '其他',
};

const conditionLabels: Record<MeasurementCondition, string> = {
  resting: '静息状态',
  'after-exercise': '运动后',
  'after-meal': '饭后',
  'before-medication': '服药前',
  'after-medication': '服药后',
  other: '其他',
};

const deviceLabels: Record<MeasurementDevice, string> = {
  'upper-arm': '上臂式',
  wrist: '腕式',
  hospital: '医院设备',
  other: '其他',
};

const PAGE_SIZE = 10;

type StatusType = 'normal' | 'high' | 'low';

function getStatus(record: BloodPressureRecord): StatusType {
  if (isBloodPressureNormal(record.systolic, record.diastolic)) return 'normal';
  if (record.systolic >= 140 || record.diastolic >= 90) return 'high';
  return 'low';
}

const statusConfig: Record<StatusType, { label: string; className: string; bgClass: string }> = {
  normal: { label: '正常', className: 'text-green-600', bgClass: 'bg-green-50' },
  high: { label: '偏高', className: 'text-red-600', bgClass: 'bg-red-50' },
  low: { label: '偏低', className: 'text-blue-600', bgClass: 'bg-blue-50' },
};

export default function BloodPressureHistory() {
  const records = useHealthStore((s) => s.bloodPressureRecords);
  const updateBloodPressure = useHealthStore((s) => s.updateBloodPressure);
  const deleteBloodPressure = useHealthStore((s) => s.deleteBloodPressure);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [periodFilter, setPeriodFilter] = useState<TimeOfDay | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BloodPressureRecord>>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (dateFrom) {
      result = result.filter((r) => r.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((r) => r.date <= dateTo);
    }
    if (periodFilter !== 'all') {
      result = result.filter((r) => r.timeOfDay === periodFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => getStatus(r) === statusFilter);
    }

    return result.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      const order = { morning: 0, other: 1, evening: 2 };
      return order[b.timeOfDay] - order[a.timeOfDay];
    });
  }, [records, dateFrom, dateTo, periodFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters = dateFrom || dateTo || periodFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPeriodFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const startEdit = (record: BloodPressureRecord) => {
    setEditingId(record.id);
    setEditData({
      date: record.date,
      timeOfDay: record.timeOfDay,
      systolic: record.systolic,
      diastolic: record.diastolic,
      pulse: record.pulse,
      condition: record.condition,
      device: record.device,
      note: record.note,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateBloodPressure(editingId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteBloodPressure(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-gray-500">
          共 <span className="font-semibold text-gray-700">{filteredRecords.length}</span> 条记录
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            showFilters || hasActiveFilters
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Filter className="w-4 h-4" />
          筛选
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              筛选条件
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                清空
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">开始日期</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">结束日期</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">时段</label>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'morning', 'evening', 'other'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriodFilter(p);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    periodFilter === p
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {p === 'all' ? '全部' : timeLabels[p]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">状态</label>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'normal', 'high', 'low'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    statusFilter === s
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {s === 'all' ? '全部' : statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">暂无记录</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              清除筛选条件
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500">
              <div className="col-span-2">日期</div>
              <div className="col-span-1">时段</div>
              <div className="col-span-2">收缩压</div>
              <div className="col-span-2">舒张压</div>
              <div className="col-span-1">心率</div>
              <div className="col-span-2">状态</div>
              <div className="col-span-2 text-right">操作</div>
            </div>

            <div className="divide-y divide-gray-50">
              {pageRecords.map((record) => {
                const isEditing = editingId === record.id;
                const status = getStatus(record);
                const sConfig = statusConfig[status];

                if (isEditing) {
                  return (
                    <div
                      key={record.id}
                      className="p-4 bg-red-50/50 border-b border-red-100"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">日期</label>
                          <input
                            type="date"
                            value={editData.date || ''}
                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">时段</label>
                          <select
                            value={editData.timeOfDay || 'morning'}
                            onChange={(e) =>
                              setEditData({ ...editData, timeOfDay: e.target.value as TimeOfDay })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                          >
                            <option value="morning">清晨</option>
                            <option value="evening">睡前</option>
                            <option value="other">其他</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">收缩压</label>
                          <input
                            type="number"
                            value={editData.systolic || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, systolic: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">舒张压</label>
                          <input
                            type="number"
                            value={editData.diastolic || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, diastolic: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">心率</label>
                          <input
                            type="number"
                            value={editData.pulse || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, pulse: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">条件</label>
                          <select
                            value={editData.condition || 'resting'}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                condition: e.target.value as MeasurementCondition,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                          >
                            {Object.entries(conditionLabels).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">设备</label>
                          <select
                            value={editData.device || 'upper-arm'}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                device: e.target.value as MeasurementDevice,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                          >
                            {Object.entries(deviceLabels).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">备注</label>
                        <textarea
                          value={editData.note || ''}
                          onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          保存
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={record.id}
                    className="p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">{record.date}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            {record.timeOfDay === 'morning' ? (
                              <Sunrise className="w-3.5 h-3.5 text-orange-500" />
                            ) : record.timeOfDay === 'evening' ? (
                              <Moon className="w-3.5 h-3.5 text-indigo-500" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            {timeLabels[record.timeOfDay]}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            sConfig.bgClass,
                            sConfig.className
                          )}
                        >
                          {sConfig.label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-lg font-bold text-red-600 tabular-nums">
                          {record.systolic}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-lg font-bold text-blue-600 tabular-nums">
                          {record.diastolic}
                        </span>
                        <span className="text-xs text-gray-400">mmHg</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          <span className="font-medium text-gray-600">{record.pulse}</span> 次/分
                        </span>
                      </div>
                      {record.note && (
                        <p className="text-xs text-gray-400 line-clamp-1">{record.note}</p>
                      )}
                      <div className="flex justify-end gap-1 pt-1">
                        <button
                          onClick={() => startEdit(record)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-2 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{record.date}</span>
                      </div>
                      <div className="col-span-1 flex items-center gap-1 text-sm text-gray-600">
                        {record.timeOfDay === 'morning' ? (
                          <Sunrise className="w-4 h-4 text-orange-500" />
                        ) : record.timeOfDay === 'evening' ? (
                          <Moon className="w-4 h-4 text-indigo-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        {timeLabels[record.timeOfDay]}
                      </div>
                      <div className="col-span-2">
                        <span className="text-lg font-bold text-red-600 tabular-nums">
                          {record.systolic}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">mmHg</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-lg font-bold text-blue-600 tabular-nums">
                          {record.diastolic}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">mmHg</span>
                      </div>
                      <div className="col-span-1 text-sm text-gray-600 tabular-nums">
                        {record.pulse}
                        <span className="text-xs text-gray-400 ml-0.5">bpm</span>
                      </div>
                      <div className="col-span-2">
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            sConfig.bgClass,
                            sConfig.className
                          )}
                        >
                          {sConfig.label}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(record)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="hidden sm:flex mt-2 gap-4 flex-wrap">
                      {record.condition && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                          {conditionLabels[record.condition]}
                        </span>
                      )}
                      {record.device && (
                        <span className="text-xs text-gray-400">
                          设备: {deviceLabels[record.device]}
                        </span>
                      )}
                      {record.note && (
                        <span className="text-xs text-gray-400 truncate max-w-md">
                          备注: {record.note}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  safePage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                      page === safePage
                        ? 'bg-red-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  safePage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <span className="ml-3 text-xs text-gray-400">
                第 {safePage} / {totalPages} 页
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
