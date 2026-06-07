import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  File,
  Image,
  Map,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MATERIAL_TYPE_LABELS, type Material } from '../../shared/types';

const MATERIAL_ICONS = {
  pdf: File,
  rubbing: Image,
  map: Map
};

const MATERIAL_COLORS = {
  pdf: 'bg-red-100 text-red-700 border-red-200',
  rubbing: 'bg-amber-100 text-amber-700 border-amber-200',
  map: 'bg-blue-100 text-blue-700 border-blue-200'
};

const MATERIAL_ACCEPT = {
  pdf: '.pdf',
  rubbing: 'image/*',
  map: 'image/*'
};

export default function MaterialForm() {
  const { id, mode } = useParams<{ id?: string; mode?: string }>();
  const navigate = useNavigate();
  const { addMaterial, updateMaterial, setLoading, loading } = useAppStore();
  const isEdit = !!id;
  const isNew = !id;

  const [formData, setFormData] = useState<Partial<Material>>({
    title: '',
    type: 'pdf',
    description: '',
    filePath: '',
    metadata: {}
  });

  const [metadataEntries, setMetadataEntries] = useState<{ key: string; value: string }[]>([]);
  const [newMetaKey, setNewMetaKey] = useState('');
  const [newMetaValue, setNewMetaValue] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      const loadMaterial = async () => {
        try {
          setLoading(true);
          const data = await api.materials.getById(id);
          setFormData(data);
          if (data.metadata) {
            setMetadataEntries(Object.entries(data.metadata).map(([k, v]) => ({ key: k, value: String(v) })));
          }
        } catch (err: any) {
          alert(err.message);
          navigate('/materials');
        } finally {
          setLoading(false);
        }
      };
      loadMaterial();
    }
  }, [id, setLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('请输入资料标题');
      return;
    }
    if (!formData.filePath) {
      alert('请上传资料文件');
      return;
    }

    const metadata: Record<string, unknown> = {};
    metadataEntries.forEach(entry => {
      if (entry.key.trim()) {
        metadata[entry.key.trim()] = entry.value;
      }
    });

    const submitData = { ...formData, metadata };

    try {
      setLoading(true);
      if (isNew) {
        const newItem = await api.materials.create(submitData);
        addMaterial(newItem);
        navigate('/materials');
      } else if (isEdit && id) {
        const updated = await api.materials.update(id, submitData);
        updateMaterial(updated);
        navigate('/materials');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formDataFile = new FormData();
    formDataFile.append('file', file);
    formDataFile.append('type', formData.type || 'pdf');
    formDataFile.append('title', formData.title || file.name);

    try {
      setUploading(true);
      const result = await api.materials.upload(formDataFile);
      setFormData(prev => ({
        ...prev,
        filePath: result.filePath,
        title: prev.title || result.title
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const addMetadata = () => {
    if (!newMetaKey.trim()) return;
    setMetadataEntries([...metadataEntries, { key: newMetaKey.trim(), value: newMetaValue }]);
    setNewMetaKey('');
    setNewMetaValue('');
  };

  const removeMetadata = (index: number) => {
    setMetadataEntries(metadataEntries.filter((_, i) => i !== index));
  };

  if (loading && id) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  const MatIcon = MATERIAL_ICONS[formData.type || 'pdf'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/materials')}
            className="p-2 rounded-lg hover:bg-accent-gold/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {isNew ? '上传图像资料' : '编辑图像资料'}
            </h1>
            <p className="text-ink-light">
              {MATERIAL_TYPE_LABELS[formData.type || 'pdf']}
            </p>
          </div>
        </div>
        <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-border-gold p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">基本信息</h2>
          <div className="divider-gold mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="input-label">资料标题 *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="请输入资料标题"
              />
            </div>
            <div>
              <label className="input-label">资料类型</label>
              <div className="grid grid-cols-3 gap-2">
                {(['pdf', 'rubbing', 'map'] as const).map(type => {
                  const Icon = MATERIAL_ICONS[type];
                  const selected = formData.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                        selected
                          ? `border-accent-gold bg-accent-gold/10 text-accent-gold`
                          : `border-primary-200 hover:border-accent-gold/50 text-ink-light`
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{MATERIAL_TYPE_LABELS[type]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="input-label">上传文件 *</label>
              <div className="space-y-3">
                {formData.filePath ? (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${MATERIAL_COLORS[formData.type || 'pdf']}`}>
                    <MatIcon className="w-8 h-8 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{formData.title || '已上传文件'}</p>
                      <p className="text-xs opacity-75">
                        {formData.filePath.split('/').pop()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, filePath: '' }))}
                      className="p-1 hover:bg-white/50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:border-accent-gold/50 hover:bg-accent-gold/5 transition-colors">
                    {uploading ? (
                      <>
                        <div className="animate-spin w-8 h-8 border-3 border-accent-gold border-t-transparent rounded-full" />
                        <span className="text-ink-light">上传中...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-ink-light" />
                        <span className="text-ink-light">
                          点击上传{MATERIAL_TYPE_LABELS[formData.type || 'pdf']}
                        </span>
                        <span className="text-xs text-ink-light/70">
                          支持 {MATERIAL_ACCEPT[formData.type || 'pdf']} 格式
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept={MATERIAL_ACCEPT[formData.type || 'pdf']}
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="input-label">资料描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field min-h-[80px]"
                placeholder="简要描述这份资料的内容、来源、用途..."
              />
            </div>
          </div>
        </div>

        <div className="card-border-gold p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">元数据</h2>
          </div>
          <div className="divider-gold mb-6" />

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newMetaKey}
              onChange={(e) => setNewMetaKey(e.target.value)}
              placeholder="字段名"
              className="input-field flex-1"
            />
            <input
              type="text"
              value={newMetaValue}
              onChange={(e) => setNewMetaValue(e.target.value)}
              placeholder="字段值"
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={addMetadata}
              className="btn-secondary px-4"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {metadataEntries.length > 0 && (
            <div className="space-y-2">
              {metadataEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg">
                  <span className="font-medium text-ink">{entry.key}：</span>
                  <span className="flex-1 text-ink-light">{entry.value}</span>
                  <button
                    type="button"
                    onClick={() => removeMetadata(index)}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
