import { useState, useEffect } from 'react';
import { Star, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Institution } from '../../../shared/types';

interface InstitutionFormProps {
  initialData?: Partial<Institution>;
  onSubmit: (data: Partial<Institution>) => void;
  onCancel: () => void;
}

export default function InstitutionForm({ initialData, onSubmit, onCancel }: InstitutionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    mission: '',
    operation_mode: '',
    transparency_rating: 3,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        mission: initialData.mission || '',
        operation_mode: initialData.operation_mode || '',
        transparency_rating: initialData.transparency_rating || 3,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入机构名称';
    if (!formData.mission.trim()) newErrors.mission = '请输入机构使命';
    if (!formData.operation_mode.trim()) newErrors.operation_mode = '请输入运作方式';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, transparency_rating: rating });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">机构名称 <span className="text-red-500">*</span></label>
        <input
          type="text"
          className="input-field"
          placeholder="请输入机构名称"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="label">机构使命 <span className="text-red-500">*</span></label>
        <textarea
          className="input-field min-h-[100px]"
          placeholder="请描述机构的使命和愿景"
          value={formData.mission}
          onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
        />
        {errors.mission && <p className="text-red-500 text-xs mt-1">{errors.mission}</p>}
      </div>
      <div>
        <label className="label">运作方式 <span className="text-red-500">*</span></label>
        <textarea
          className="input-field min-h-[100px]"
          placeholder="请描述机构的运作方式"
          value={formData.operation_mode}
          onChange={(e) => setFormData({ ...formData, operation_mode: e.target.value })}
        />
        {errors.operation_mode && <p className="text-red-500 text-xs mt-1">{errors.operation_mode}</p>}
      </div>
      <div>
        <label className="label">透明度评分 <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={28}
                className={cn(
                  'transition-all duration-200',
                  star <= formData.transparency_rating
                    ? 'fill-terracotta-400 text-terracotta-400'
                    : 'text-forest-200 hover:text-terracotta-300'
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-forest-500 font-semibold">
            {formData.transparency_rating} 分
          </span>
        </div>
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
