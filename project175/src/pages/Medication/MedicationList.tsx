import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, Trash2, X, Pill, User, Calendar, Clock, Stethoscope } from 'lucide-react';
import { useHealthStore } from '@/store';
import type { Medication, MedicationFrequency } from '@/types';
import { cn, formatDate } from '@/utils';

const frequencyLabels: Record<MedicationFrequency, string> = {
  'daily': '每日一次',
  'twice-daily': '每日两次',
  'three-times-daily': '每日三次',
  'as-needed': '按需服用',
};

interface FormData {
  name: string;
  genericName: string;
  dosage: string;
  frequency: MedicationFrequency;
  startTime: string;
  prescribedBy: string;
  isActive: boolean;
}

const defaultFormData: FormData = {
  name: '',
  genericName: '',
  dosage: '',
  frequency: 'daily',
  startTime: formatDate(new Date()),
  prescribedBy: '',
  isActive: true,
};

export default function MedicationList() {
  const { medications, addMedication, updateMedication, deleteMedication } = useHealthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingMedication(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMedication(med);
    setFormData({
      name: med.name,
      genericName: med.genericName || '',
      dosage: med.dosage,
      frequency: med.frequency,
      startTime: med.startTime,
      prescribedBy: med.prescribedBy,
      isActive: med.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMedication(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) return;

    if (editingMedication) {
      updateMedication(editingMedication.id, formData);
    } else {
      addMedication(formData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteMedication(id);
    setDeleteConfirmId(null);
  };

  return (
    <>
      <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">我的药物</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          添加药物
        </button>
      </div>

      {medications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
          <Pill className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">暂无用药记录</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            点击添加第一种药物
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {medications.map((med) => (
            <div
              key={med.id}
              className="group rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{med.name}</h3>
                    {med.isActive && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        服用中
                      </span>
                    )}
                  </div>
                  {med.genericName && (
                    <p className="mt-0.5 text-sm text-gray-500">{med.genericName}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEditModal(med)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(med.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Pill className="h-4 w-4 text-blue-500" />
                  <span>{med.dosage}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{frequencyLabels[med.frequency]}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Stethoscope className="h-4 w-4 text-blue-500" />
                  <span>处方医生：{med.prescribedBy}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>开始日期：{med.startTime}</span>
                </div>
              </div>

              {deleteConfirmId === med.id && (
                <div className="mt-4 rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-700">确定要删除这个药物吗？相关的依从性记录也会被删除。</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleDelete(med.id)}
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
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMedication ? '编辑药物' : '添加新药'}
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
                  药名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入药名"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">通用名</label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="如 Amlodipine"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    剂量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="如 5mg"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">频率</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as MedicationFrequency })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="daily">每日一次</option>
                    <option value="twice-daily">每日两次</option>
                    <option value="three-times-daily">每日三次</option>
                    <option value="as-needed">按需服用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">开始日期</label>
                <input
                  type="date"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <User className="mr-1 inline h-4 w-4" />
                  处方医生
                </label>
                <input
                  type="text"
                  value={formData.prescribedBy}
                  onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                  placeholder="请输入处方医生姓名"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  正在服用
                </label>
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
                    formData.name.trim() && formData.dosage.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'cursor-not-allowed bg-blue-300'
                  )}
                  disabled={!formData.name.trim() || !formData.dosage.trim()}
                >
                  {editingMedication ? '保存修改' : '添加药物'}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </>
  );
}
