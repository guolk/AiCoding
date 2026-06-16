import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Stethoscope,
  User,
  MapPin,
  StickyNote,
  FileText,
  AlertCircle,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useHealthStore } from '@/store';
import type { VisitRecord } from '@/types';
import { cn, formatDate } from '@/utils';

export default function VisitRecords() {
  const { visitRecords, addVisitRecord, updateVisitRecord, deleteVisitRecord } = useHealthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VisitRecord | null>(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    doctor: '',
    department: '',
    hospital: '',
    diagnosis: '',
    treatment: '',
    note: '',
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<VisitRecord | null>(null);

  const sortedRecords = useMemo(
    () => [...visitRecords].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [visitRecords]
  );

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({
      date: formatDate(new Date()),
      doctor: '',
      department: '',
      hospital: '',
      diagnosis: '',
      treatment: '',
      note: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: VisitRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      doctor: record.doctor,
      department: record.department,
      hospital: record.hospital,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
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
    if (!formData.date || !formData.doctor.trim() || !formData.diagnosis.trim()) return;

    const data = {
      date: formData.date,
      doctor: formData.doctor,
      department: formData.department,
      hospital: formData.hospital,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      note: formData.note || undefined,
    };

    if (editingRecord) {
      updateVisitRecord(editingRecord.id, data);
    } else {
      addVisitRecord(data);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteVisitRecord(id);
    setDeleteConfirmId(null);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <Stethoscope className="w-4 h-4" />
            就诊次数
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">{visitRecords.length}</span>
            <span className="text-lg text-blue-100">次</span>
          </div>
          <div className="mt-2 text-xs text-blue-100">
            累计就诊
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            最近就诊
          </div>
          <div className="mt-2">
            {sortedRecords.length > 0 ? (
              <>
                <p className="text-xl font-bold text-gray-800">{sortedRecords[0].date}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {sortedRecords[0].doctor} · {sortedRecords[0].department}
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-gray-400">暂无记录</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FileText className="w-4 h-4" />
            主要诊断
          </div>
          <div className="mt-2">
            {sortedRecords.length > 0 ? (
              <p className="text-base font-medium text-gray-800 line-clamp-2">
                {sortedRecords[0].diagnosis}
              </p>
            ) : (
              <p className="text-base text-gray-400">暂无记录</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">就诊记录</h3>
              <p className="text-xs text-gray-500">记录每次就诊的诊断和治疗方案</p>
            </div>
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
            <Stethoscope className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-3 text-gray-500">暂无就诊记录</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              点击添加第一条记录
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRecords.map((record) => (
              <div
                key={record.id}
                className={cn(
                  'group p-4 rounded-xl transition-all cursor-pointer',
                  selectedRecord?.id === record.id
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50/50 hover:bg-gray-50 border-2 border-transparent'
                )}
                onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-white border border-gray-100 flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString('zh-CN', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold text-gray-800">
                        {new Date(record.date).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-gray-900">{record.diagnosis}</h4>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {record.doctor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5" />
                          {record.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {record.hospital}
                        </span>
                      </div>
                      {selectedRecord?.id === record.id && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">治疗方案</p>
                            <p className="text-sm text-gray-700 bg-white rounded-lg p-3">
                              {record.treatment}
                            </p>
                          </div>
                          {record.note && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">备注</p>
                              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                {record.note}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(record);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(record.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={cn(
                      'w-4 h-4 text-gray-400 transition-transform',
                      selectedRecord?.id === record.id && 'rotate-90'
                    )} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRecord ? '编辑就诊记录' : '添加就诊记录'}
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
                  就诊日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    医生 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    placeholder="请输入医生姓名"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    科室
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="如：心内科"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  医院
                </label>
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  placeholder="请输入医院名称"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  诊断结果 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="请输入诊断结果"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  治疗方案
                </label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="记录用药调整、治疗方案等..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <StickyNote className="inline w-4 h-4 mr-1" />
                  备注（选填）
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="其他注意事项..."
                  rows={2}
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
                    formData.doctor.trim() && formData.diagnosis.trim() && formData.date
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'cursor-not-allowed bg-blue-300'
                  )}
                  disabled={!formData.doctor.trim() || !formData.diagnosis.trim() || !formData.date}
                >
                  {editingRecord ? '保存修改' : '添加记录'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

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
              确定要删除这条就诊记录吗？删除后无法恢复。
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
        </div>,
        document.body
      )}
    </>
  );
}
