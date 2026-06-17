import { useState, useEffect } from 'react';
import { MapPin, Calendar, FileText, Navigation } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store';
import { MonitoringSite } from '@/types';
import { cn } from '@/lib/utils';

const ecosystemTypes = [
  '亚热带常绿阔叶林',
  '淡水湿地生态系统',
  '山地针叶林',
  '海岸红树林生态系统',
  '草原生态系统',
  '荒漠生态系统',
  '高山草甸',
];

interface SiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSite?: MonitoringSite | null;
}

export default function SiteFormModal({ isOpen, onClose, editingSite }: SiteFormModalProps) {
  const { addSite, updateSite } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    ecosystemType: ecosystemTypes[0],
    description: '',
    establishmentDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingSite) {
      setFormData({
        name: editingSite.name,
        latitude: editingSite.latitude,
        longitude: editingSite.longitude,
        ecosystemType: editingSite.ecosystemType,
        description: editingSite.description,
        establishmentDate: editingSite.establishmentDate,
      });
    } else {
      setFormData({
        name: '',
        latitude: 0,
        longitude: 0,
        ecosystemType: ecosystemTypes[0],
        description: '',
        establishmentDate: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [editingSite, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '监测点名称不能为空';
    }
    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = '纬度范围应为 -90 到 90';
    }
    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = '经度范围应为 -180 到 180';
    }
    if (!formData.establishmentDate) {
      newErrors.establishmentDate = '请选择建立日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingSite) {
      updateSite(editingSite.id, formData);
    } else {
      addSite(formData);
    }
    onClose();
  };

  const inputClass = cn(
    'w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm',
    'text-forest-800 placeholder-forest-400',
    'focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400',
    'transition-all duration-200'
  );

  const labelClass = 'block text-sm font-medium text-forest-700 mb-1.5';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSite ? '编辑监测点' : '新增监测点'}
      footer={
        <>
          <button
            onClick={onClose}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium',
              'border border-forest-200 text-forest-600 bg-white',
              'hover:bg-forest-50 hover:border-forest-300',
              'transition-colors duration-200'
            )}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium',
              'bg-forest-500 text-white',
              'hover:bg-forest-600 active:bg-forest-700',
              'transition-colors duration-200 shadow-sm'
            )}
          >
            确认提交
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className={labelClass}>
            <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            监测点名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入监测点名称"
            className={cn(inputClass, errors.name && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Navigation className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              纬度
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              placeholder="如: 30.2741"
              className={cn(inputClass, errors.latitude && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
            />
            {errors.latitude && <p className="mt-1 text-xs text-red-500">{errors.latitude}</p>}
          </div>
          <div>
            <label className={labelClass}>
              <Navigation className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              经度
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              placeholder="如: 120.1551"
              className={cn(inputClass, errors.longitude && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
            />
            {errors.longitude && <p className="mt-1 text-xs text-red-500">{errors.longitude}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            生态系统类型
          </label>
          <select
            value={formData.ecosystemType}
            onChange={(e) => setFormData({ ...formData, ecosystemType: e.target.value })}
            className={inputClass}
          >
            {ecosystemTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            周边环境描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请描述监测点的周边环境、地形地貌、植被特征等"
            rows={4}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div>
          <label className={labelClass}>
            <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            建立日期 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.establishmentDate}
            onChange={(e) => setFormData({ ...formData, establishmentDate: e.target.value })}
            className={cn(inputClass, errors.establishmentDate && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
          />
          {errors.establishmentDate && <p className="mt-1 text-xs text-red-500">{errors.establishmentDate}</p>}
        </div>
      </div>
    </Modal>
  );
}
