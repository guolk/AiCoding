import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
  Pill,
  CheckCircle,
  XCircle,
  Stethoscope,
} from 'lucide-react';
import { useHealthStore } from '@/store';
import type { SideEffectRecord, SideEffectSeverity } from '@/types';
import { cn, formatDate } from '@/utils';

const severityLabels: Record<SideEffectSeverity, string> = {
  mild: '轻度',
  moderate: '中度',
  severe: '重度',
};

const severityStyles: Record<SideEffectSeverity, string> = {
  mild: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  severe: 'bg-red-100 text-red-700 border-red-200',
};

const severityDotStyles: Record<SideEffectSeverity, string> = {
  mild: 'bg-green-500',
  moderate: 'bg-yellow-500',
  severe: 'bg-red-500',
};

interface FormData {
  date: string;
  medicationId: string;
  symptom: string;
  severity: SideEffectSeverity;
  note: string;
  resolved: boolean;
  resolvedDate: string;
  doctorNotified: boolean;
}

const defaultFormData: FormData = {
  date: formatDate(new Date()),
  medicationId: '',
  symptom: '',
  severity: 'mild',
  note: '',
  resolved: false,
  resolvedDate: '',
  doctorNotified: false,
};

export default function SideEffectRecords() {
  const { medications, sideEffectRecords, addSideEffect, updateSideEffect, deleteSideEffect } =
    useHealthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SideEffectRecord | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getMedicationName = (id: string) => {
    return medications.find((m) => m.id === id)?.name || '未知药物';
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({
      ...defaultFormData,
      medicationId: medications[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: SideEffectRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      medicationId: record.medicationId,
      symptom: record.symptom,
      severity: record.severity,
      note: record.note || '',
      resolved: record.resolved,
      resolvedDate: record.resolvedDate || '',
      doctorNotified: record.doctorNotified,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symptom.trim() || !formData.medicationId) return;

    const submitData = {
      date: formData.date,
      medicationId: formData.medicationId,
      symptom: formData.symptom,
      severity: formData.severity,
      note: formData.note || undefined,
      resolved: formData.resolved,
      resolvedDate: formData.resolved ? formData.resolvedDate || undefined : undefined,
      doctorNotified: formData.doctorNotified,
    };

    if (editingRecord) {
      updateSideEffect(editingRecord.id, submitData);
    } else {
      addSideEffect(submitData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteSideEffect(id);
    setDeleteConfirmId(null);
  };

  const sortedRecords = [...sideEffectRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">副作用记录</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          添加记录
        </button>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
          <AlertTriangle className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">暂无副作用记录</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            点击添加第一条记录
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRecords.map((record) => (
            <div
              key={record.id}
              className="group rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900">{record.symptom}</h3>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                        severityStyles[record.severity]
                      )}
                    >
                      <span
                        className={cn('h-1.5 w-1.5 rounded-full', severityDotStyles[record.severity])}
                      />
                      {severityLabels[record.severity]}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>发生日期：{record.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span>关联药物：{getMedicationName(record.medicationId)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {record.resolved ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>
                        {record.resolved
                          ? `已缓解${record.resolvedDate ? `（${record.resolvedDate}）` : ''}`
                          : '未缓解'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Stethoscope className="h-4 w-4 text-blue-500" />
                      <span>{record.doctorNotified ? '已告知医生' : '未告知医生'}</span>
                    </div>
                  </div>
                  {record.note && (
                    <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                      {record.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEditModal(record)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(record.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {deleteConfirmId === record.id && (
                <div className="mt-4 rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-700">确定要删除这条副作用记录吗？</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      确定删除
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {isModalOpen && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRecord ? '编辑副作用记录' : '添加副作用记录'}
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
                  发生日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  关联药物 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.medicationId}
                  onChange={(e) => setFormData({ ...formData, medicationId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">请选择药物</option>
                  {medications.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  症状描述 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.symptom}
                  onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                  placeholder="如：轻微头痛、恶心等"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">严重程度</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mild', 'moderate', 'severe'] as SideEffectSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: sev })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        formData.severity === sev
                          ? severityStyles[sev]
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {severityLabels[sev]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">备注</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="请输入其他详细信息（可选）"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="resolved"
                    checked={formData.resolved}
                    onChange={(e) => setFormData({ ...formData, resolved: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="resolved" className="text-sm text-gray-700">
                    症状已缓解
                  </label>
                </div>
                {formData.resolved && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      缓解日期
                    </label>
                    <input
                      type="date"
                      value={formData.resolvedDate}
                      onChange={(e) => setFormData({ ...formData, resolvedDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doctorNotified"
                    checked={formData.doctorNotified}
                    onChange={(e) =>
                      setFormData({ ...formData, doctorNotified: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="doctorNotified" className="text-sm text-gray-700">
                    已告知医生
                  </label>
                </div>
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
                    formData.symptom.trim() && formData.medicationId
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'cursor-not-allowed bg-blue-300'
                  )}
                  disabled={!formData.symptom.trim() || !formData.medicationId}
                >
                  {editingRecord ? '保存修改' : '添加记录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </>
  );
}
