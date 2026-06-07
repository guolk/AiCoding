import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  Lightbulb,
  X,
  Link2
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { OUTPUT_TYPE_LABELS, type Output } from '../../shared/types';

const OUTPUT_ICONS = {
  outline: BookOpen,
  argument: Lightbulb
};

const OUTPUT_COLORS = {
  outline: 'bg-purple-100 text-purple-700',
  argument: 'bg-teal-100 text-teal-700'
};

export default function OutputList() {
  const navigate = useNavigate();
  const { outputs, setOutputs, removeOutput, setLoading, loading, relics, notes } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.output.getAll();
        setOutputs(data);
      } catch (err: any) {
        console.error('Failed to load outputs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setOutputs, setLoading]);

  const getRelicNames = (relicIds: string[]) => {
    return relicIds
      .map(id => relics.find(r => r.id === id)?.name)
      .filter(Boolean)
      .join('、');
  };

  const getNoteTitles = (noteIds: string[]) => {
    return noteIds
      .map(id => notes.find(n => n.id === id)?.title)
      .filter(Boolean)
      .join('、');
  };

  const filteredOutputs = outputs.filter(item => {
    const matchesSearch = !searchQuery ||
      item.title.includes(searchQuery);
    const matchesType = !filterType || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    try {
      await api.output.delete(id);
      removeOutput(id);
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
          <h1 className="text-2xl font-bold text-ink">成果输出</h1>
          <p className="text-ink-light">共 {outputs.length} 份成果</p>
        </div>
        <button
          onClick={() => navigate('/outputs/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建成果
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" />
            <input
              type="text"
              placeholder="搜索成果标题..."
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
              <option value="outline">{OUTPUT_TYPE_LABELS.outline}</option>
              <option value="argument">{OUTPUT_TYPE_LABELS.argument}</option>
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

      {filteredOutputs.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOutputs.map((item, index) => {
            const OutIcon = OUTPUT_ICONS[item.type];
            return (
              <div
                key={item.id}
                className="card animate-fade-up hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${OUTPUT_COLORS[item.type]}`}>
                        <OutIcon className="w-5 h-5" />
                      </div>
                      <span className={`tag ${OUTPUT_COLORS[item.type]}`}>
                        {OUTPUT_TYPE_LABELS[item.type]}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/outputs/${item.id}/edit`)}
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

                  <h3 className="font-semibold text-ink text-lg mb-3 line-clamp-1">{item.title}</h3>

                  {item.type === 'outline' && item.content.sections && (
                    <div className="space-y-1 mb-4">
                      {(item.content.sections as any[]).slice(0, 4).map((section, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-accent-gold font-mono">{i + 1}.</span>
                          <span className="text-ink line-clamp-1">{section.title}</span>
                        </div>
                      ))}
                      {(item.content.sections as any[]).length > 4 && (
                        <p className="text-xs text-ink-light ml-5">
                          还有 {(item.content.sections as any[]).length - 4} 个章节...
                        </p>
                      )}
                    </div>
                  )}

                  {item.type === 'argument' && item.content.points && (
                    <div className="space-y-1 mb-4">
                      {(item.content.points as any[]).slice(0, 3).map((point, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="w-3 h-3 text-accent-gold mt-1 flex-shrink-0" />
                          <span className="text-ink line-clamp-1">{point.title}</span>
                        </div>
                      ))}
                      {(item.content.points as any[]).length > 3 && (
                        <p className="text-xs text-ink-light ml-5">
                          还有 {(item.content.points as any[]).length - 3} 个论点...
                        </p>
                      )}
                    </div>
                  )}

                  {(item.relicIds?.length || item.noteIds?.length) && (
                    <div className="mb-4 space-y-2">
                      {item.relicIds?.length > 0 && (
                        <div className="flex items-start gap-2 text-xs">
                          <Link2 className="w-3 h-3 text-ink-light mt-0.5" />
                          <div>
                            <span className="text-ink-light">关联文物：</span>
                            <span className="text-ink line-clamp-1">
                              {getRelicNames(item.relicIds) || '未关联'}
                            </span>
                          </div>
                        </div>
                      )}
                      {item.noteIds?.length > 0 && (
                        <div className="flex items-start gap-2 text-xs">
                          <FileText className="w-3 h-3 text-ink-light mt-0.5" />
                          <div>
                            <span className="text-ink-light">关联笔记：</span>
                            <span className="text-ink line-clamp-1">
                              {getNoteTitles(item.noteIds) || '未关联'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-primary-100">
                    <span className="text-xs text-ink-light">
                      创建于 {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <button
                      onClick={() => navigate(`/outputs/${item.id}/edit`)}
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
          title={outputs.length ? '未找到匹配的成果' : '暂无成果输出'}
          description={outputs.length ? '尝试调整搜索条件' : '整理您的研究论文提纲和论点证据'}
          action={!outputs.length && (
            <button onClick={() => navigate('/outputs/new')} className="btn-primary">
              新建成果
            </button>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除"
        message="删除成果后无法恢复，确定要删除这份成果吗？"
        confirmText="删除成果"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
