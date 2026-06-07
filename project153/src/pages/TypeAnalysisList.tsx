import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ArrowLeftRight,
  History,
  Calendar,
  X
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ANALYSIS_TYPE_LABELS, type TypeAnalysis } from '../../shared/types';

const ANALYSIS_ICONS = {
  comparison: ArrowLeftRight,
  evolution: History,
  periodization: Calendar
};

const ANALYSIS_COLORS = {
  comparison: 'bg-blue-100 text-blue-700',
  evolution: 'bg-purple-100 text-purple-700',
  periodization: 'bg-green-100 text-green-700'
};

export default function TypeAnalysisList() {
  const navigate = useNavigate();
  const { analysis, setAnalysis, removeAnalysis, setLoading, loading, relics } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.analysis.getAll();
        setAnalysis(data);
      } catch (err: any) {
        console.error('Failed to load analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setAnalysis, setLoading]);

  const getRelicNames = (relicIds: string[]) => {
    return relicIds
      .map(id => relics.find(r => r.id === id)?.name)
      .filter(Boolean)
      .join('、');
  };

  const filteredAnalysis = analysis.filter(item => {
    const matchesSearch = !searchQuery ||
      item.name.includes(searchQuery) ||
      item.description.includes(searchQuery);
    const matchesType = !filterType || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    try {
      await api.analysis.delete(id);
      removeAnalysis(id);
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
          <h1 className="text-2xl font-bold text-ink">类型分析</h1>
          <p className="text-ink-light">共 {analysis.length} 份类型分析</p>
        </div>
        <button
          onClick={() => navigate('/analysis/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建分析
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" />
            <input
              type="text"
              placeholder="搜索分析名称、描述..."
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
              <option value="comparison">{ANALYSIS_TYPE_LABELS.comparison}</option>
              <option value="evolution">{ANALYSIS_TYPE_LABELS.evolution}</option>
              <option value="periodization">{ANALYSIS_TYPE_LABELS.periodization}</option>
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

      {filteredAnalysis.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnalysis.map((item, index) => {
            const TypeIcon = ANALYSIS_ICONS[item.type];
            return (
              <div
                key={item.id}
                className="card animate-fade-up hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${ANALYSIS_COLORS[item.type]}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <span className={`tag ${ANALYSIS_COLORS[item.type]}`}>
                        {ANALYSIS_TYPE_LABELS[item.type]}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/analysis/${item.id}/edit`)}
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

                  <h3 className="font-semibold text-ink text-lg mb-2 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-ink-light line-clamp-3 mb-4">
                    {item.description || '暂无描述'}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs text-ink-light mb-1">关联文物</p>
                    <p className="text-sm text-ink line-clamp-2">
                      {item.relicIds?.length ? getRelicNames(item.relicIds) : '未关联文物'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-primary-100">
                    <span className="text-xs text-ink-light">
                      创建于 {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <button
                      onClick={() => navigate(`/analysis/${item.id}/edit`)}
                      className="text-sm text-accent-teal hover:underline"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={analysis.length ? '未找到匹配的分析' : '暂无类型分析'}
          description={analysis.length ? '尝试调整搜索条件' : '开始您的类型学研究，创建第一份分析'}
          action={!analysis.length && (
            <button onClick={() => navigate('/analysis/new')} className="btn-primary">
              新建分析
            </button>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除"
        message="删除类型分析后无法恢复，确定要删除这份分析吗？"
        confirmText="删除分析"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
