import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { X, Check } from 'lucide-react';
import type { OnlineAction } from '../../../shared/types';

interface OnlineActionFormProps {
  initialData?: Partial<OnlineAction>;
  onSubmit: (data: Partial<OnlineAction>) => void;
  onCancel: () => void;
}

const actionTypes = ['网络签名', '在线捐赠', '知识问答', '社交媒体传播', '网络悼念', '其他'];

export default function OnlineActionForm({ initialData, onSubmit, onCancel }: OnlineActionFormProps) {
  const { institutions } = useAppStore();
  const [formData, setFormData] = useState({
    action_date: new Date().toISOString().split('T')[0],
    action_type: '网络签名',
    initiative_name: '',
    institution_id: 0,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        action_date: initialData.action_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        action_type: initialData.action_type || '网络签名',
        initiative_name: initialData.initiative_name || '',
        institution_id: initialData.institution_id || 0,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.action_date) newErrors.action_date = '请选择行动日期';
    if (!formData.action_type) newErrors.action_type = '请选择行动类型';
    if (!formData.initiative_name.trim()) newErrors.initiative_name = '请输入活动名称';
    if (!formData.institution_id) newErrors.institution_id = '请选择机构';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      institution_id: Number(formData.institution_id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">行动日期 <span className="text-red-500">*</span></label>
          <input
            type="date"
            className="input-field"
            value={formData.action_date}
            onChange={(e) => setFormData({ ...formData, action_date: e.target.value })}
          />
          {errors.action_date && <p className="text-red-500 text-xs mt-1">{errors.action_date}</p>}
        </div>
        <div>
          <label className="label">行动类型 <span className="text-red-500">*</span></label>
          <select
            className="input-field"
            value={formData.action_type}
            onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
          >
            {actionTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">活动名称 <span className="text-red-500">*</span></label>
        <input
          type="text"
          className="input-field"
          placeholder="请输入活动名称"
          value={formData.initiative_name}
          onChange={(e) => setFormData({ ...formData, initiative_name: e.target.value })}
        />
        {errors.initiative_name && <p className="text-red-500 text-xs mt-1">{errors.initiative_name}</p>}
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
