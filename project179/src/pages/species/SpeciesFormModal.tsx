import { useState, useEffect } from 'react';
import {
  Leaf,
  FileText,
  MapPin,
  Users,
  Calendar,
  Image,
  Music,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store';
import { SpeciesRecord } from '@/types';
import { cn } from '@/lib/utils';

interface SpeciesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSpecies?: SpeciesRecord | null;
}

export default function SpeciesFormModal({
  isOpen,
  onClose,
  editingSpecies,
}: SpeciesFormModalProps) {
  const { sites, addSpecies, updateSpecies } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    taxonomy: '',
    siteId: sites[0]?.id || '',
    count: 1,
    location: '',
    behavior: '',
    isInvasive: false,
    spreadRange: '',
    photos: [''] as string[],
    audios: [''] as string[],
    date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingSpecies) {
      setFormData({
        name: editingSpecies.name,
        taxonomy: editingSpecies.taxonomy,
        siteId: editingSpecies.siteId,
        count: editingSpecies.count,
        location: editingSpecies.location,
        behavior: editingSpecies.behavior,
        isInvasive: editingSpecies.isInvasive,
        spreadRange: editingSpecies.spreadRange,
        photos:
          editingSpecies.photos.length > 0
            ? [...editingSpecies.photos]
            : [''],
        audios:
          editingSpecies.audios.length > 0
            ? [...editingSpecies.audios]
            : [''],
        date: editingSpecies.date,
      });
    } else {
      setFormData({
        name: '',
        taxonomy: '',
        siteId: sites[0]?.id || '',
        count: 1,
        location: '',
        behavior: '',
        isInvasive: false,
        spreadRange: '',
        photos: [''],
        audios: [''],
        date: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [editingSpecies, isOpen, sites]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '物种名称不能为空';
    }
    if (!formData.taxonomy.trim()) {
      newErrors.taxonomy = '分类地位不能为空';
    }
    if (!formData.siteId) {
      newErrors.siteId = '请选择所属监测点';
    }
    if (formData.count <= 0 || isNaN(formData.count)) {
      newErrors.count = '数量必须大于0';
    }
    if (!formData.location.trim()) {
      newErrors.location = '分布位置不能为空';
    }
    if (!formData.date) {
      newErrors.date = '请选择记录日期';
    }
    if (formData.isInvasive && !formData.spreadRange.trim()) {
      newErrors.spreadRange = '入侵物种请填写扩散范围';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const photos = formData.photos.filter((p) => p.trim());
    const audios = formData.audios.filter((a) => a.trim());

    const payload = {
      name: formData.name.trim(),
      taxonomy: formData.taxonomy.trim(),
      siteId: formData.siteId,
      count: Number(formData.count),
      location: formData.location.trim(),
      behavior: formData.behavior.trim(),
      isInvasive: formData.isInvasive,
      spreadRange: formData.isInvasive ? formData.spreadRange.trim() : '',
      photos,
      audios,
      date: formData.date,
    };

    if (editingSpecies) {
      updateSpecies(editingSpecies.id, payload);
    } else {
      addSpecies(payload);
    }
    onClose();
  };

  const addPhotoField = () => {
    setFormData({ ...formData, photos: [...formData.photos, ''] });
  };

  const removePhotoField = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      photos: newPhotos.length > 0 ? newPhotos : [''],
    });
  };

  const updatePhoto = (index: number, value: string) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = value;
    setFormData({ ...formData, photos: newPhotos });
  };

  const addAudioField = () => {
    setFormData({ ...formData, audios: [...formData.audios, ''] });
  };

  const removeAudioField = (index: number) => {
    const newAudios = formData.audios.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      audios: newAudios.length > 0 ? newAudios : [''],
    });
  };

  const updateAudio = (index: number, value: string) => {
    const newAudios = [...formData.audios];
    newAudios[index] = value;
    setFormData({ ...formData, audios: newAudios });
  };

  const inputClass = cn(
    'w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm',
    'text-forest-800 placeholder-forest-400',
    'focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400',
    'transition-all duration-200'
  );

  const labelClass = 'block text-sm font-medium text-forest-700 mb-1.5';

  const inputErrorClass = 'border-red-400 focus:ring-red-200 focus:border-red-400';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSpecies ? '编辑物种记录' : '新增物种记录'}
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
            <Leaf className="w-4 h-4 inline mr-1.5 -mt-0.5 text-lake-500" />
            物种名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入物种名称（如：天目木兰）"
            className={cn(inputClass, errors.name && inputErrorClass)}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className={labelClass}>
            <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5 text-forest-500" />
            分类地位 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.taxonomy}
            onChange={(e) => setFormData({ ...formData, taxonomy: e.target.value })}
            placeholder="请输入分类地位（如：木兰科 木兰属）"
            className={cn(inputClass, errors.taxonomy && inputErrorClass)}
          />
          {errors.taxonomy && <p className="mt-1 text-xs text-red-500">{errors.taxonomy}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5 text-forest-500" />
              所属监测点 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              className={cn(inputClass, errors.siteId && inputErrorClass)}
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            {errors.siteId && <p className="mt-1 text-xs text-red-500">{errors.siteId}</p>}
          </div>
          <div>
            <label className={labelClass}>
              <Users className="w-4 h-4 inline mr-1.5 -mt-0.5 text-lake-500" />
              数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 0 })}
              placeholder="观测数量"
              className={cn(inputClass, errors.count && inputErrorClass)}
            />
            {errors.count && <p className="mt-1 text-xs text-red-500">{errors.count}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5 text-sun-500" />
            分布位置 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="请输入具体分布位置（如：青林湾东区）"
            className={cn(inputClass, errors.location && inputErrorClass)}
          />
          {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
        </div>

        <div>
          <label className={labelClass}>
            <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5 text-forest-500" />
            行为观察描述
          </label>
          <textarea
            value={formData.behavior}
            onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
            placeholder="请描述物种的行为特征、生长状态、栖息环境等"
            rows={3}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-forest-50/50 border border-forest-100">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                formData.isInvasive ? 'bg-red-100 text-red-600' : 'bg-forest-100 text-forest-600'
              )}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-forest-800">是否为入侵物种</p>
              <p className="text-xs text-forest-600 mt-0.5">
                开启后需填写扩散范围等入侵相关信息
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, isInvasive: !formData.isInvasive })
            }
            className={cn(
              'relative w-14 h-8 rounded-full transition-colors duration-300',
              formData.isInvasive ? 'bg-red-500' : 'bg-forest-200'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300',
                formData.isInvasive ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>

        {formData.isInvasive && (
          <div className="animate-fade-in">
            <label className={labelClass}>
              <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5 text-red-500" />
              扩散范围 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.spreadRange}
              onChange={(e) => setFormData({ ...formData, spreadRange: e.target.value })}
              placeholder="请描述扩散范围（如：约500平方米，沿道路两侧分布）"
              rows={2}
              className={cn(inputClass, 'resize-none', errors.spreadRange && inputErrorClass)}
            />
            {errors.spreadRange && <p className="mt-1 text-xs text-red-500">{errors.spreadRange}</p>}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass + ' mb-0'}>
              <Image className="w-4 h-4 inline mr-1.5 -mt-0.5 text-lake-500" />
              照片URL
            </label>
            <button
              type="button"
              onClick={addPhotoField}
              className="flex items-center gap-1 text-xs text-forest-600 hover:text-forest-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              添加照片
            </button>
          </div>
          <div className="space-y-2">
            {formData.photos.map((photo, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={photo}
                  onChange={(e) => updatePhoto(index, e.target.value)}
                  placeholder={`照片链接 ${index + 1}`}
                  className={cn(inputClass, 'flex-1')}
                />
                {formData.photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhotoField(index)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass + ' mb-0'}>
              <Music className="w-4 h-4 inline mr-1.5 -mt-0.5 text-sun-500" />
              音频文件URL
            </label>
            <button
              type="button"
              onClick={addAudioField}
              className="flex items-center gap-1 text-xs text-forest-600 hover:text-forest-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              添加音频
            </button>
          </div>
          <div className="space-y-2">
            {formData.audios.map((audio, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={audio}
                  onChange={(e) => updateAudio(index, e.target.value)}
                  placeholder={`音频链接 ${index + 1}`}
                  className={cn(inputClass, 'flex-1')}
                />
                {formData.audios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAudioField(index)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5 text-sun-500" />
            记录日期 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={cn(inputClass, errors.date && inputErrorClass)}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>
      </div>
    </Modal>
  );
}
