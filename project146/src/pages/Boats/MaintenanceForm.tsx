import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Ship,
  ArrowLeft,
  Save,
  X,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../../store';
import type { Maintenance } from '../../types';

interface FormData {
  category: Maintenance['category'];
  description: string;
  date: string;
  cost: string;
  notes: string;
}

interface FormErrors {
  category?: string;
  description?: string;
  date?: string;
  cost?: string;
}

const categories: { value: Maintenance['category']; label: string; icon: string }[] = [
  { value: 'engine', label: '发动机', icon: '⚙️' },
  { value: 'sails', label: '帆具', icon: '⛵' },
  { value: 'rigging', label: '索具', icon: '🔗' },
  { value: 'safety', label: '安全设备', icon: '🛟' },
  { value: 'other', label: '其他', icon: '📋' },
];

export default function MaintenanceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getBoatById = useAppStore((state) => state.getBoatById);
  const addMaintenance = useAppStore((state) => state.addMaintenance);

  const boat = id ? getBoatById(id) : undefined;

  const [formData, setFormData] = useState<FormData>({
    category: 'engine',
    description: '',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category) {
      newErrors.category = '请选择维护类别';
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入维护描述';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = '描述至少需要5个字符';
    }

    if (!formData.date) {
      newErrors.date = '请选择维护日期';
    }

    if (!formData.cost) {
      newErrors.cost = '请输入维护费用';
    } else if (parseFloat(formData.cost) < 0) {
      newErrors.cost = '费用不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const { [field as keyof FormErrors]: removed, ...rest } = prev;
        void removed;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    setIsSubmitting(true);

    try {
      const maintenanceData = {
        boatId: id,
        category: formData.category,
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        cost: parseFloat(formData.cost),
        notes: formData.notes.trim(),
      };

      addMaintenance(maintenanceData);

      await new Promise((resolve) => setTimeout(resolve, 500));

      navigate(`/boats/${id}`, { state: { activeTab: 'maintenance' } });
    } catch (error) {
      console.error('Failed to add maintenance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!boat) {
    return (
      <div className="card p-12 text-center">
        <Ship className="w-16 h-16 text-ocean-300 mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold text-ocean-700 mb-2">
          船艇不存在
        </h3>
        <p className="text-ocean-500 mb-6">请检查您访问的链接是否正确</p>
        <button onClick={() => navigate('/boats')} className="btn-primary">
          返回船艇列表
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(`/boats/${id}`)}
          className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ocean-600" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ocean-800 mb-1">
            新增维护记录
          </h1>
          <p className="text-ocean-500">
            为 <span className="font-medium text-ocean-700">{boat.name}</span> 添加维护记录
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-8">
          <div className="mb-8">
            <label className="block text-ocean-700 font-medium mb-4">
              维护类别 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((cat) => {
                const isSelected = formData.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleInputChange('category', cat.value)}
                    className={`p-4 rounded-xl text-center transition-all duration-200 border-2 ${
                      isSelected
                        ? 'border-ocean-600 bg-ocean-50 shadow-md'
                        : 'border-ocean-100 bg-white hover:border-ocean-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <div
                      className={`text-sm font-medium ${
                        isSelected ? 'text-ocean-700' : 'text-ocean-600'
                      }`}
                    >
                      {cat.label}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.category}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-ocean-700 font-medium mb-2">
              维护描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请详细描述维护内容..."
              rows={3}
              className={`input-field resize-none ${
                errors.description ? 'border-red-400 focus:ring-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-ocean-700 font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  维护日期 <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`input-field ${
                  errors.date ? 'border-red-400 focus:ring-red-500' : ''
                }`}
              />
              {errors.date && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-ocean-700 font-medium mb-2">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  费用（元） <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0.00"
                className={`input-field ${
                  errors.cost ? 'border-red-400 focus:ring-red-500' : ''
                }`}
              />
              {errors.cost && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.cost}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-ocean-700 font-medium mb-2">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                备注
              </span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="添加备注信息（可选）"
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/boats/${id}`)}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? '保存中...' : '保存记录'}
          </button>
        </div>
      </form>
    </div>
  );
}
