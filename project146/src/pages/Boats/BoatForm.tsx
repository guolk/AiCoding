import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Ship,
  ArrowLeft,
  Save,
  X,
  Plus,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../store';

interface FormData {
  name: string;
  type: string;
  length: string;
  displacement: string;
  engine: string;
  equipment: string[];
}

interface FormErrors {
  name?: string;
  type?: string;
  length?: string;
  displacement?: string;
  engine?: string;
}

const commonEquipment = [
  '主帆',
  '前帆',
  '球帆',
  '热那亚帆',
  '飘帆',
  'GPS导航仪',
  'AIS自动识别系统',
  '雷达',
  '甚高频电台',
  '卫星电话',
  '自动舵',
  '船载计算机',
  '救生筏',
  'EPIRB应急示位标',
  '救生衣',
  '灭火器',
  '海水淡化器',
  '渔探仪',
  '双救生筏',
];

const boatTypes = ['单体帆船', '双体帆船', '单体动力艇', '双体动力艇', '钓鱼艇', '游艇', '快艇', '其他'];

export default function BoatForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const getBoatById = useAppStore((state) => state.getBoatById);
  const addBoat = useAppStore((state) => state.addBoat);
  const updateBoat = useAppStore((state) => state.updateBoat);

  const boat = id ? getBoatById(id) : undefined;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    length: '',
    displacement: '',
    engine: '',
    equipment: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [customEquipment, setCustomEquipment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && boat) {
      setFormData({
        name: boat.name,
        type: boat.type,
        length: boat.length.toString(),
        displacement: boat.displacement.toString(),
        engine: boat.engine,
        equipment: [...boat.equipment],
      });
    }
  }, [isEdit, boat]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入船名';
    } else if (formData.name.length < 2) {
      newErrors.name = '船名至少2个字符';
    }

    if (!formData.type) {
      newErrors.type = '请选择船型';
    }

    if (!formData.length) {
      newErrors.length = '请输入船长';
    } else if (parseFloat(formData.length) <= 0) {
      newErrors.length = '船长必须大于0';
    }

    if (!formData.displacement) {
      newErrors.displacement = '请输入排水量';
    } else if (parseFloat(formData.displacement) <= 0) {
      newErrors.displacement = '排水量必须大于0';
    }

    if (!formData.engine.trim()) {
      newErrors.engine = '请输入发动机信息';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const { [field as keyof FormErrors]: removed, ...rest } = prev;
        void removed;
        return rest;
      });
    }
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const handleAddCustomEquipment = () => {
    const trimmed = customEquipment.trim();
    if (trimmed && !formData.equipment.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        equipment: [...prev.equipment, trimmed],
      }));
      setCustomEquipment('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const boatData = {
        name: formData.name.trim(),
        type: formData.type,
        length: parseFloat(formData.length),
        displacement: parseFloat(formData.displacement),
        engine: formData.engine.trim(),
        equipment: formData.equipment,
      };

      if (isEdit && id) {
        updateBoat(id, boatData);
      } else {
        addBoat(boatData);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (isEdit) {
        navigate(`/boats/${id}`);
      } else {
        navigate('/boats');
      }
    } catch (error) {
      console.error('Failed to save boat:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && !boat) {
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
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(isEdit ? `/boats/${id}` : '/boats')}
          className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ocean-600" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ocean-800 mb-1">
            {isEdit ? '编辑船艇' : '新增船艇'}
          </h1>
          <p className="text-ocean-500">
            {isEdit ? '修改船艇的基本信息和设备清单' : '填写船艇的基本信息和设备清单'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-8">
          <h2 className="section-title mb-6">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-ocean-700 font-medium mb-2">
                船名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入船名"
                className={`input-field ${
                  errors.name ? 'border-red-400 focus:ring-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-ocean-700 font-medium mb-2">
                船型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={`input-field ${
                  errors.type ? 'border-red-400 focus:ring-red-500' : ''
                }`}
              >
                <option value="">请选择船型</option>
                {boatTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-ocean-700 font-medium mb-2">
                长度（米） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                placeholder="例如：12.5"
                className={`input-field ${
                  errors.length ? 'border-red-400 focus:ring-red-500' : ''
                }`}
              />
              {errors.length && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.length}
                </p>
              )}
            </div>

            <div>
              <label className="block text-ocean-700 font-medium mb-2">
                排水量（公斤） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.displacement}
                onChange={(e) => handleInputChange('displacement', e.target.value)}
                placeholder="例如：8500"
                className={`input-field ${
                  errors.displacement ? 'border-red-400 focus:ring-red-500' : ''
                }`}
              />
              {errors.displacement && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.displacement}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-ocean-700 font-medium mb-2">
                发动机 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.engine}
                onChange={(e) => handleInputChange('engine', e.target.value)}
                placeholder="例如：Yanmar 3JH5E 39马力"
                className={`input-field ${
                  errors.engine ? 'border-red-400 focus:ring-red-500' : ''
                }`}
              />
              {errors.engine && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.engine}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="section-title mb-6">设备清单</h2>
          <div className="mb-4">
            <p className="text-ocean-500 text-sm mb-4">
              选择船艇上的设备（可多选，也可自定义添加）
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {commonEquipment.map((equipment) => {
                const isSelected = formData.equipment.includes(equipment);
                return (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => handleEquipmentToggle(equipment)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isSelected
                        ? 'bg-ocean-600 text-white shadow-md'
                        : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100 border border-ocean-200'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                    {equipment}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomEquipment();
                  }
                }}
                placeholder="输入自定义设备名称"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomEquipment}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>

          {formData.equipment.length > 0 && (
            <div className="mt-6 pt-6 border-t border-ocean-100">
              <h3 className="font-medium text-ocean-700 mb-3">
                已选择设备 ({formData.equipment.length} 件)
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((equipment) => (
                  <span
                    key={equipment}
                    className="px-3 py-1.5 bg-ocean-100 text-ocean-700 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    {equipment}
                    <button
                      type="button"
                      onClick={() => handleEquipmentToggle(equipment)}
                      className="hover:bg-ocean-200 rounded p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/boats/${id}` : '/boats')}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? '保存中...' : isEdit ? '保存修改' : '创建船艇'}
          </button>
        </div>
      </form>
    </div>
  );
}
