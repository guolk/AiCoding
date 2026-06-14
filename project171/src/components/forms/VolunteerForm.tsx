import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { X, Check } from 'lucide-react';
import type { VolunteerRecord } from '../../../shared/types';

interface VolunteerFormProps {
  initialData?: Partial<VolunteerRecord>;
  onSubmit: (data: Partial<VolunteerRecord>) => void;
  onCancel: () => void;
}

const serviceTypes = ['物资整理', '支教', '环保活动', '关怀探访', '社区服务', '其他'];

export default function VolunteerForm({ initialData, onSubmit, onCancel }: VolunteerFormProps) {
  const { institutions } = useAppStore();
  const [formData, setFormData] = useState({
    service_date: new Date().toISOString().split('T')[0],
    hours: '',
    service_type: '物资整理',
    beneficiary_group: '',
    institution_id: 0,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        service_date: initialData.service_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        hours: initialData.hours?.toString() || '',
        service_type: initialData.service_type || '物资整理',
        beneficiary_group: initialData.beneficiary_group || '',
        institution_id: initialData.institution_id || 0,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.service_date) newErrors.service_date = '请选择服务日期';
    if (!formData.hours || Number(formData.hours) <= 0) newErrors.hours = '请输入有效时长';
    if (!formData.service_type) newErrors.service_type = '请选择服务类型';
    if (!formData.beneficiary_group.trim()) newErrors.beneficiary_group = '请输入受益群体';
    if (!formData.institution_id) newErrors.institution_id = '请选择机构';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      hours: Number(formData.hours),
      institution_id: Number(formData.institution_id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">服务日期 <span className="text-red-500">*</span></label>
          <input
            type="date"
            className="input-field"
            value={formData.service_date}
            onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
          />
          {errors.service_date && <p className="text-red-500 text-xs mt-1">{errors.service_date}</p>}
        </div>
        <div>
          <label className="label">时长(小时) <span className="text-red-500">*</span></label>
          <input
            type="number"
            className="input-field"
            placeholder="请输入服务时长"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            min="0"
            step="0.5"
          />
          {errors.hours && <p className="text-red-500 text-xs mt-1">{errors.hours}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">服务类型 <span className="text-red-500">*</span></label>
          <select
            className="input-field"
            value={formData.service_type}
            onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
          >
            {serviceTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">机构 <span className="text-red-500">*</span></label>
          <select
            className="input-field"
            value={formData.institution_id}
            onChange={(e) => setFormData({ ...formData, institution_id: Number(e.target.value) })}
          >
            <option value={0}>请选择机构</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
          {errors.institution_id && <p className="text-red-500 text-xs mt-1">{errors.institution_id}</p>}
        </div>
      </div>
      <div>
        <label className="label">受益群体 <span className="text-red-500">*</span></label>
        <input
          type="text"
          className="input-field"
          placeholder="请输入受益群体"
          value={formData.beneficiary_group}
          onChange={(e) => setFormData({ ...formData, beneficiary_group: e.target.value })}
        />
        {errors.beneficiary_group && <p className="text-red-500 text-xs mt-1">{errors.beneficiary_group}</p>}
      </div>
      <div>
        <label className="label">备注</label>
        <textarea
          className="input-field min-h-[80px]"
          placeholder="请输入备注"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
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
