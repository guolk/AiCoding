import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Ruler,
  Scale,
  Camera,
  Image,
  X,
  Edit3,
  Eye
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PHOTO_TYPE_LABELS, type PhotoType, type Relic, type RelicPhoto } from '../../shared/types';

const CATEGORIES = ['青铜器', '瓷器', '玉器', '陶器', '书画', '钱币', '金银器', '石刻', '其他'];
const ERAS = ['新石器时代', '夏', '商', '西周', '春秋', '战国', '秦', '汉', '三国', '晋', '南北朝', '隋', '唐', '宋', '元', '明', '清', '近现代'];
const MATERIALS = ['青铜', '瓷', '玉', '陶', '金', '银', '铁', '石', '木', '竹', '纸', '丝', '其他'];
const UNITS = ['cm', 'mm', 'm'];

export default function RelicForm() {
  const { id, mode } = useParams<{ id?: string; mode?: string }>();
  const navigate = useNavigate();
  const { addRelic, updateRelic, setLoading, loading } = useAppStore();
  const isEdit = id && mode === 'edit';
  const isView = id && !mode;
  const isNew = !id;

  const [formData, setFormData] = useState<Partial<Relic>>({
    name: '',
    category: '',
    era: '',
    material: '',
    decoration: '',
    inscription: '',
    excavateLocation: '',
    currentLocation: '',
    relicNumber: '',
    dimensions: {
      height: undefined,
      width: undefined,
      length: undefined,
      diameter: undefined,
      weight: undefined,
      unit: 'cm'
    },
    photos: []
  });

  const [activePhotoTab, setActivePhotoTab] = useState<PhotoType>('front');
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const loadRelic = async () => {
        try {
          setLoading(true);
          const data = await api.relics.getById(id);
          setFormData(data);
        } catch (err: any) {
          alert(err.message);
          navigate('/relics');
        } finally {
          setLoading(false);
        }
      };
      loadRelic();
    }
  }, [id, setLoading, navigate]);

  const handleChange = (field: keyof Relic, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions!,
        [field]: field === 'unit' ? value : value ? parseFloat(value) : undefined
      }
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: PhotoType) => {
    if (!id || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('type', type);
    formData.append('caption', `${PHOTO_TYPE_LABELS[type]}视图`);

    try {
      const photo = await api.relics.addPhoto(id, formData);
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), photo]
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await api.relics.deletePhoto(photoId);
      setFormData(prev => ({
        ...prev,
        photos: prev.photos?.filter(p => p.id !== photoId) || []
      }));
      setPhotoToDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('请输入文物名称');
      return;
    }

    try {
      setLoading(true);
      if (isNew) {
        const newRelic = await api.relics.create(formData);
        addRelic(newRelic);
        navigate(`/relics/${newRelic.id}`);
      } else if (isEdit && id) {
        const updated = await api.relics.update(id, formData);
        updateRelic(updated);
        navigate(`/relics/${id}`);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPhotosByType = (type: PhotoType) => {
    return formData.photos?.filter(p => p.type === type) || [];
  };

  if (loading && id) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/relics')}
            className="p-2 rounded-lg hover:bg-accent-gold/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {isNew ? '新建文物档案' : isEdit ? '编辑文物档案' : '文物档案详情'}
            </h1>
            <p className="text-ink-light">
              {isNew ? '录入文物的详细信息' : formData.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isView && id && (
            <button
              onClick={() => navigate(`/relics/${id}/edit`)}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
          )}
          {!isView && (
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              保存
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-border-gold p-6">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-accent-gold" />
            基础信息
          </h2>
          <div className="divider-gold mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="input-label">文物名称 *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="请输入文物名称"
              />
            </div>
            
            <div>
              <label className="input-label">文物类别</label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                disabled={isView}
                className="input-field"
              >
                <option value="">请选择类别</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="input-label">年代</label>
              <select
                value={formData.era || ''}
                onChange={(e) => handleChange('era', e.target.value)}
                disabled={isView}
                className="input-field"
              >
                <option value="">请选择年代</option>
                {ERAS.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="input-label">质地</label>
              <select
                value={formData.material || ''}
                onChange={(e) => handleChange('material', e.target.value)}
                disabled={isView}
                className="input-field"
              >
                <option value="">请选择质地</option>
                {MATERIALS.map(mat => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="input-label">文物编号</label>
              <input
                type="text"
                value={formData.relicNumber || ''}
                onChange={(e) => handleChange('relicNumber', e.target.value)}
                disabled={isView}
                className="input-field font-mono"
                placeholder="如：GB001"
              />
            </div>
            
            <div>
              <label className="input-label">纹饰</label>
              <input
                type="text"
                value={formData.decoration || ''}
                onChange={(e) => handleChange('decoration', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="如：饕餮纹、云雷纹"
              />
            </div>
            
            <div>
              <label className="input-label">铭文</label>
              <input
                type="text"
                value={formData.inscription || ''}
                onChange={(e) => handleChange('inscription', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="如：司母戊三字铭文"
              />
            </div>
            
            <div>
              <label className="input-label">出土地点</label>
              <input
                type="text"
                value={formData.excavateLocation || ''}
                onChange={(e) => handleChange('excavateLocation', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="如：河南安阳武官村"
              />
            </div>
            
            <div>
              <label className="input-label">现藏地</label>
              <input
                type="text"
                value={formData.currentLocation || ''}
                onChange={(e) => handleChange('currentLocation', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="如：中国国家博物馆"
              />
            </div>
          </div>
        </div>

        <div className="card-border-gold p-6">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-accent-gold" />
            尺寸与重量
          </h2>
          <div className="divider-gold mb-6" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="input-label flex items-center gap-1">
                <Ruler className="w-3 h-3" /> 高度
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.dimensions?.height ?? ''}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="input-label flex items-center gap-1">
                <Ruler className="w-3 h-3" /> 宽度
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.dimensions?.width ?? ''}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="input-label flex items-center gap-1">
                <Ruler className="w-3 h-3" /> 长度
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.dimensions?.length ?? ''}
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="input-label flex items-center gap-1">
                <Ruler className="w-3 h-3" /> 口径
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.dimensions?.diameter ?? ''}
                onChange={(e) => handleDimensionChange('diameter', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="input-label flex items-center gap-1">
                <Scale className="w-3 h-3" /> 重量 (g)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.dimensions?.weight ?? ''}
                onChange={(e) => handleDimensionChange('weight', e.target.value)}
                disabled={isView}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="input-label">单位</label>
              <select
                value={formData.dimensions?.unit || 'cm'}
                onChange={(e) => handleDimensionChange('unit', e.target.value)}
                disabled={isView}
                className="input-field"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!isNew && (
          <div className="card-border-gold p-6">
            <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-accent-gold" />
              照片资料
            </h2>
            <div className="divider-gold mb-6" />
            
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
              {(Object.keys(PHOTO_TYPE_LABELS) as PhotoType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActivePhotoTab(type)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activePhotoTab === type
                      ? 'bg-gradient-gold text-white shadow-md'
                      : 'bg-white border border-primary-200 text-ink hover:bg-accent-gold/5'
                  }`}
                >
                  {PHOTO_TYPE_LABELS[type]} ({getPhotosByType(type).length})
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {!isView && (
                <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:border-accent-gold/50 hover:bg-accent-gold/5 transition-colors">
                  <Upload className="w-6 h-6 text-ink-light" />
                  <span className="text-ink-light">点击或拖拽上传{PHOTO_TYPE_LABELS[activePhotoTab]}照片</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, activePhotoTab)}
                  />
                </label>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getPhotosByType(activePhotoTab).map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    isView={isView}
                    onDelete={() => setPhotoToDelete(photo.id)}
                  />
                ))}
              </div>

              {getPhotosByType(activePhotoTab).length === 0 && (
                <div className="text-center py-12 text-ink-light">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无{PHOTO_TYPE_LABELS[activePhotoTab]}照片</p>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPhotoToDelete(null)} />
          <div className="relative card p-6 w-full max-w-md animate-fade-up">
            <h3 className="text-lg font-semibold text-ink mb-2">确认删除照片</h3>
            <p className="text-ink-light mb-6">删除后无法恢复，确定要删除这张照片吗？</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPhotoToDelete(null)} className="btn-secondary">
                取消
              </button>
              <button onClick={() => handleDeletePhoto(photoToDelete)} className="btn-danger">
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoCard({
  photo,
  index,
  isView,
  onDelete
}: {
  photo: RelicPhoto;
  index: number;
  isView: boolean;
  onDelete: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div
        className="relative group aspect-square rounded-lg overflow-hidden bg-primary-100 animate-fade-up"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {!imageError ? (
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setPreviewOpen(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-ink-light/50" />
          </div>
        )}
        {!isView && (
          <button
            onClick={onDelete}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        )}
        {photo.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white text-xs">{photo.caption}</p>
          </div>
        )}
      </div>

      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setPreviewOpen(false)}
        >
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={photo.url}
            alt={photo.caption}
            className="max-w-full max-h-full object-contain animate-fade-in"
          />
        </div>
      )}
    </>
  );
}
