import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { X, Check } from 'lucide-react';
import type { ProjectProgress } from '../../../shared/types';

interface ProgressFormProps {
  initialData?: Partial<ProjectProgress>;
  onSubmit: (data: Partial<ProjectProgress>) => void;
  onCancel: () => void;
}

const statusOptions = ['进行中', '已完成', '已取消', '待跟进'];

export default function ProgressForm({ initialData, onSubmit, onCancel }: ProgressFormProps) {
  const { donations } = useAppStore();
  const [formData, setFormData] = useState({
    donation_id: 0,
    update_date: new Date().toISOString().split('T')[0],
    progress_description: '',
    status: '进行中',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        donation_id: initialData.donation_id || 0,
        update_date: initialData.update_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        progress_description: initialData.progress_description || '',
        status: initialData.status || '进行中',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.donation_id) newErrors.donation_id = '请选择关联捐款';
    if (!formData.update_date) newErrors.update_date = '请选择更新日期';
    if (!formData.progress_description.trim()) newErrors.progress_description = '请输入进展描述';
    if (!formData.status) newErrors.status = '请选择状态';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      donation_id: Number(formData.donation_id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">关联捐款 <span className="text-red-500">*</span></label>
          <select
            className="input-field"
            value={formData.donation_id}
            onChange={(e) => setFormData({ ...formData, donation_id: Number(e.target.value) })}
          >
            <option value={0}>请选择关联捐款</option>
            {donations.map((donation) => (
              <option key={donation.id} value={donation.id}>
                {donation.institution_name || `捐款 #${donation.id}`} - ¥{donation.amount}
              </option>
            ))}
          </select>
          {errors.donation_id && <p className="text-red-500 text-xs mt-1">{errors.donation_id}</p>}
        </div>
        <div>
          <label className="label">更新日期 <span className="text-red-500">*</span></label>
          <input
            type="date"
            className="input-field"
            value={formData.update_date}
            onChange={(e) => setFormData({ ...formData, update_date: e.target.value })}
          />
          {errors.update_date && <p className="text-red-500 text-xs mt-1">{errors.update_date}</p>}
        </div>
      </div>
      <div>
        <label className="label">状态 <span className="text-red-500">*</span></label>
        <select
          className="input-field"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">进展描述 <span className="text-red-500">*</span></label>
        <textarea
          className="input-field min-h-[100px]"
          placeholder="请描述项目进展情况"
          value={formData.progress_description}
          onChange={(e) => setFormData({ ...formData, progress_description: e.target.value })}
        />
        {errors.progress_description && <p className="text-red-500 text-xs mt-1">{errors.progress_description}</p>}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2">
          <X size={18} /> 取消
        </button>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Check size={18} /> 提交
        </button>
      </div>
    </form>
  );
}
