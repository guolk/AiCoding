import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
  X
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Relic } from '../../shared/types';

export default function RelicList() {
  const navigate = useNavigate();
  const { relics, setRelics, removeRelic, setLoading, loading } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEra, setFilterEra] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.relics.getAll();
        setRelics(data);
      } catch (err: any) {
        console.error('Failed to load relics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setRelics, setLoading]);

  const eras = Array.from(new Set(relics.map((r) => r.era).filter(Boolean)));
  const categories = Array.from(new Set(relics.map((r) => r.category).filter(Boolean)));

  const filteredRelics = relics.filter((relic) => {
    const matchesSearch = !searchQuery ||
      relic.name.includes(searchQuery) ||
      relic.relicNumber?.includes(searchQuery) ||
      relic.material?.includes(searchQuery);
    const matchesEra = !filterEra || relic.era === filterEra;
    const matchesCategory = !filterCategory || relic.category === filterCategory;
    return matchesSearch && matchesEra && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    try {
      await api.relics.delete(id);
      removeRelic(id);
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">文物档案</h1>
          <p className="text-ink-light">共 {relics.length} 件文物档案</p>
        </div>
        <button
          onClick={() => navigate('/relics/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建档案
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" />
            <input
              type="text"
              placeholder="搜索文物名称、编号、材质..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterEra}
              onChange={(e) => setFilterEra(e.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="">全部年代</option>
              {eras.map((era) => (
                <option key={era} value={era}>{era}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="">全部类别</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {(filterEra || filterCategory) && (
              <button
                onClick={() => { setFilterEra(''); setFilterCategory(''); }}
                className="btn-ghost flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                清除筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredRelics.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRelics.map((relic, index) => (
            <RelicCard
              key={relic.id}
              relic={relic}
              index={index}
              onView={() => navigate(`/relics/${relic.id}`)}
              onEdit={() => navigate(`/relics/${relic.id}/edit`)}
              onDelete={() => setDeleteConfirm(relic.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={relics.length ? '未找到匹配的文物' : '暂无文物档案'}
          description={relics.length ? '尝试调整搜索条件或筛选项' : '点击右上角按钮创建您的第一份文物档案'}
          action={!relics.length && (
            <button onClick={() => navigate('/relics/new')} className="btn-primary">
              新建档案
            </button>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除"
        message="删除文物档案将同时删除关联的照片数据，此操作不可撤销。"
        confirmText="删除档案"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function RelicCard({
  relic,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  relic: Relic;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="card overflow-hidden animate-fade-up hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div
        className="aspect-[4/3] bg-primary-100 relative cursor-pointer overflow-hidden"
        onClick={onView}
      >
        {relic.photos[0] && !imageError ? (
          <img
            src={relic.photos[0].url}
            alt={relic.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Archive className="w-16 h-16 text-ink-light/50" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-md transition-colors"
          >
            <Edit2 className="w-4 h-4 text-ink" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 shadow-md transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
        {relic.era && (
          <div className="absolute bottom-3 left-3">
            <span className="tag bg-white/90 backdrop-blur-sm">
              {relic.era}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-ink text-lg line-clamp-1">{relic.name}</h3>
          {relic.relicNumber && (
            <span className="text-xs font-mono text-accent-gold flex-shrink-0">
              {relic.relicNumber}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-light mb-3">
          {relic.category && <span>{relic.category}</span>}
          {relic.category && relic.material && <span>·</span>}
          {relic.material && <span>{relic.material}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-ink-light">
            <Eye className="w-3 h-3" />
            {relic.photos.length} 张照片
          </div>
          <button onClick={onView} className="text-sm text-accent-teal hover:underline">
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}
