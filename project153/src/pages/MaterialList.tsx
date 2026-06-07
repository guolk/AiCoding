import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  File,
  Image,
  Map,
  Download,
  X
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { MATERIAL_TYPE_LABELS, type Material } from '../../shared/types';

const MATERIAL_ICONS = {
  pdf: File,
  rubbing: Image,
  map: Map
};

const MATERIAL_COLORS = {
  pdf: 'bg-red-100 text-red-700',
  rubbing: 'bg-amber-100 text-amber-700',
  map: 'bg-blue-100 text-blue-700'
};

export default function MaterialList() {
  const navigate = useNavigate();
  const { materials, setMaterials, removeMaterial, setLoading, loading } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.materials.getAll();
        setMaterials(data);
      } catch (err: any) {
        console.error('Failed to load materials:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setMaterials, setLoading]);

  const filteredMaterials = materials.filter(item => {
    const matchesSearch = !searchQuery ||
      item.title.includes(searchQuery) ||
      item.description.includes(searchQuery);
    const matchesType = !filterType || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    try {
      await api.materials.delete(id);
      removeMaterial(id);
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownload = (material: Material) => {
    window.open(material.filePath, '_blank');
  };

  if (loading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">图像资料</h1>
          <p className="text-ink-light">共 {materials.length} 份资料</p>
        </div>
        <button
          onClick={() => navigate('/materials/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          上传资料
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" />
            <input
              type="text"
              placeholder="搜索资料标题、描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="">全部类型</option>
              <option value="pdf">{MATERIAL_TYPE_LABELS.pdf}</option>
              <option value="rubbing">{MATERIAL_TYPE_LABELS.rubbing}</option>
              <option value="map">{MATERIAL_TYPE_LABELS.map}</option>
            </select>
            {filterType && (
              <button
                onClick={() => setFilterType('')}
                className="btn-ghost flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredMaterials.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((item, index) => {
            const MatIcon = MATERIAL_ICONS[item.type];
            return (
              <div
                key={item.id}
                className="card animate-fade-up hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`h-32 flex items-center justify-center ${MATERIAL_COLORS[item.type]}`}>
                  <MatIcon className="w-16 h-16 opacity-50" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`tag ${MATERIAL_COLORS[item.type]}`}>
                      {MATERIAL_TYPE_LABELS[item.type]}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-2 hover:bg-accent-gold/10 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 text-ink" />
                      </button>
                      <button
                        onClick={() => navigate(`/materials/${item.id}/edit`)}
                        className="p-2 hover:bg-accent-gold/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-ink" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-ink text-lg mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-ink-light line-clamp-2 mb-4">
                    {item.description || '暂无描述'}
                  </p>

                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(item.metadata).slice(0, 4).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-ink-light">{key}：</span>
                            <span className="text-ink">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-primary-100">
                    <span className="text-xs text-ink-light">
                      {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <button
                      onClick={() => handleDownload(item)}
                      className="text-sm text-accent-teal hover:underline"
                    >
                      查看/下载
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={materials.length ? '未找到匹配的资料' : '暂无图像资料'}
          description={materials.length ? '尝试调整搜索条件' : '上传考古报告、拓片、地图等研究资料'}
          action={!materials.length && (
            <button onClick={() => navigate('/materials/new')} className="btn-primary">
              上传资料
            </button>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除"
        message="删除资料后无法恢复，确定要删除这份资料吗？"
        confirmText="删除资料"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
