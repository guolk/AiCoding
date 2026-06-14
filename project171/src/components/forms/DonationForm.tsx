import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { X, Check } from 'lucide-react';
import type { Donation } from '../../../shared/types';

interface DonationFormProps {
  initialData?: Partial<Donation>;
  onSubmit: (data: Partial<Donation>) => void;
  onCancel: () => void;
}

const paymentMethods = ['微信支付', '支付宝', '银行卡', '现金', '其他'];

export default function DonationForm({ initialData, onSubmit, onCancel }: DonationFormProps) {
  const { institutions } = useAppStore();
  const [formData, setFormData] = useState({
    donation_date: new Date().toISOString().split('T')[0],
    institution_id: 0,
    amount: '',
    payment_method: '微信支付',
    purpose: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        donation_date: initialData.donation_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        institution_id: initialData.institution_id || 0,
        amount: initialData.amount?.toString() || '',
        payment_method: initialData.payment_method || '微信支付',
        purpose: initialData.purpose || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.donation_date) newErrors.donation_date = '请选择捐款日期';
    if (!formData.institution_id) newErrors.institution_id = '请选择机构';
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = '请输入有效金额';
    if (!formData.payment_method) newErrors.payment_method = '请选择付款方式';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      institution_id: Number(formData.institution_id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">捐款日期 <span className="text-red-500">*</span></label>
          <input
            type="date"
            className="input-field"
            value={formData.donation_date}
            onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
          />
          {errors.donation_date && <p className="text-red-500 text-xs mt-1">{errors.donation_date}</p>}
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">金额 <span className="text-red-500">*</span></label>
          <input
            type="number"
            className="input-field"
            placeholder="请输入金额"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            min="0"
            step="0.01"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
        <div>
          <label className="label">付款方式 <span className="text-red-500">*</span></label>
          <select
            className="input-field"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">用途</label>
        <input
          type="text"
          className="input-field"
          placeholder="请输入用途"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
        />
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
