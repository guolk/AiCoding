import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { X, Check } from 'lucide-react';
import type { ItemDonation } from '../../../shared/types';

interface ItemDonationFormProps {
  initialData?: Partial<ItemDonation>;
  onSubmit: (data: Partial<ItemDonation>) => void;
  onCancel: () => void;
}

const conditions = ['全新', '九成新', '八成新', '可使用'];

export default function ItemDonationForm({ initialData, onSubmit, onCancel }: ItemDonationFormProps) {
  const { institutions } = useAppStore();
  const [formData, setFormData] = useState({
    donation_date: new Date().toISOString().split('T')[0],
    item_name: '',
    quantity: '',
    condition: '全新',
    institution_id: 0,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        donation_date: initialData.donation_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        item_name: initialData.item_name || '',
        quantity: initialData.quantity?.toString() || '',
        condition: initialData.condition || '全新',
        institution_id: initialData.institution_id || 0,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.donation_date) newErrors.donation_date = '请选择捐赠日期';
    if (!formData.item_name.trim()) newErrors.item_name = '请输入物品名称';
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = '请输入有效数量';
    if (!formData.condition) newErrors.condition = '请选择物品状态';
    if (!formData.institution_id) newErrors.institution_id = '请选择机构';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      institution_id: Number(formData.institution_id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">捐赠日期 <span className="text-red-500">*</span></label>
          <input
            type="date"
            className="input-field"
            value={formData.donation_date}
            onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
          />
          {errors.donation_date && <p className="text-red-500 text-xs mt-1">{errors.donation_date}</p>}
        </div>
        <div>
          <label className="label">物品状态 <span className="text-red-500">*</span></label>
          <select
            className="input-field"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          >
            {conditions.map((cond) => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">物品名称 <span className="text-red-500">*</span></label>
          <input
            type="text"
            className="input-field"
            placeholder="请输入物品名称"
            value={formData.item_name}
            onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
          />
          {errors.item_name && <p className="text-red-500 text-xs mt-1">{errors.item_name}</p>}
        </div>
        <div>
          <label className="label">数量 <span className="text-red-500">*</span></label>
          <input
            type="number"
            className="input-field"
            placeholder="请输入数量"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            min="1"
            step="1"
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>
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
