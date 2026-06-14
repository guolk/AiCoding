import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { X, Check } from 'lucide-react';
import type { ImpactEstimate } from '../../../shared/types';

interface ImpactFormProps {
  initialData?: Partial<ImpactEstimate>;
  onSubmit: (data: Partial<ImpactEstimate>) => void;
  onCancel: () => void;
}

export default function ImpactForm({ initialData, onSubmit, onCancel }: ImpactFormProps) {
  const { donations } = useAppStore();
  const [formData, setFormData] = useState({
    donation_id: 0,
    people_helped: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        donation_id: initialData.donation_id || 0,
        people_helped: initialData.people_helped?.toString() || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.donation_id) newErrors.donation_id = '请选择关联捐款';
    if (!formData.people_helped || Number(formData.people_helped) < 0) newErrors.people_helped = '请输入有效帮助人数';
    if (!formData.description.trim()) newErrors.description = '请输入影响力描述';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      donation_id: Number(formData.donation_id),
      people_helped: Number(formData.people_helped),
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
          <label className="label">帮助人数 <span className="text-red-500">*</span></label>
          <input
            type="number"
            className="input-field"
            placeholder="请输入帮助人数"
            value={formData.people_helped}
            onChange={(e) => setFormData({ ...formData, people_helped: e.target.value })}
            min="0"
            step="1"
          />
          {errors.people_helped && <p className="text-red-500 text-xs mt-1">{errors.people_helped}</p>}
        </div>
      </div>
      <div>
        <label className="label">描述 <span className="text-red-500">*</span></label>
        <textarea
          className="input-field min-h-[120px]"
          placeholder="请描述本次捐款产生的具体影响力..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
