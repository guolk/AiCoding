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
  Users,
  Lightbulb,
  Tag,
  X
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { ResearchNote } from '../../shared/types';

export default function ResearchNoteList() {
  const navigate = useNavigate();
  const { notes, setNotes, removeNote, setLoading, loading, relics } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRelic, setFilterRelic] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [notesData, relicsData] = await Promise.all([
          api.notes.getAll(),
          api.relics.getAll()
        ]);
        setNotes(notesData);
      } catch (err: any) {
        console.error('Failed to load notes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setNotes, setLoading]);

  const getRelicName = (relicId?: string) => {
    return relics.find(r => r.id === relicId)?.name || '未关联文物';
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery ||
      note.title.includes(searchQuery) ||
      note.content.includes(searchQuery) ||
      note.personalInsights?.includes(searchQuery) ||
      note.tags?.some(t => t.includes(searchQuery));
    const matchesRelic = !filterRelic || note.relicId === filterRelic;
    return matchesSearch && matchesRelic;
  });

  const handleDelete = async (id: string) => {
    try {
      await api.notes.delete(id);
      removeNote(id);
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
          <h1 className="text-2xl font-bold text-ink">研究笔记</h1>
          <p className="text-ink-light">共 {notes.length} 篇研究笔记</p>
        </div>
        <button
          onClick={() => navigate('/notes/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建笔记
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" />
            <input
              type="text"
              placeholder="搜索笔记标题、内容、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRelic}
              onChange={(e) => setFilterRelic(e.target.value)}
              className="input-field min-w-[160px]"
            >
              <option value="">全部文物</option>
              {relics.map(relic => (
                <option key={relic.id} value={relic.id}>{relic.name}</option>
              ))}
            </select>
            {filterRelic && (
              <button
                onClick={() => setFilterRelic('')}
                className="btn-ghost flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredNotes.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              relicName={getRelicName(note.relicId)}
              onView={() => navigate(`/notes/${note.id}`)}
              onEdit={() => navigate(`/notes/${note.id}/edit`)}
              onDelete={() => setDeleteConfirm(note.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={notes.length ? '未找到匹配的笔记' : '暂无研究笔记'}
          description={notes.length ? '尝试调整搜索条件' : '记录您的研究见解，开始第一篇笔记'}
          action={!notes.length && (
            <button onClick={() => navigate('/notes/new')} className="btn-primary">
              新建笔记
            </button>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除"
        message="删除笔记将同时删除关联的参考文献和研究观点，此操作不可撤销。"
        confirmText="删除笔记"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function NoteCard({
  note,
  index,
  relicName,
  onView,
  onEdit,
  onDelete,
}: {
  note: ResearchNote;
  index: number;
  relicName: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="card animate-fade-up hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink text-lg line-clamp-1">{note.title}</h3>
            <p className="text-sm text-accent-gold">{relicName}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-accent-gold/10 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-ink" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        <p className="text-ink-light text-sm line-clamp-3 mb-4">
          {note.content || note.personalInsights || '暂无内容'}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-ink-light mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {note.references?.length || 0} 文献
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {note.viewpoints?.length || 0} 观点
          </span>
          <span className="flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            {note.personalInsights ? '有见解' : '待记录'}
          </span>
        </div>

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag text-xs flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="tag text-xs">+{note.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-primary-100">
          <span className="text-xs text-ink-light">
            更新于 {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
          </span>
          <button onClick={onView} className="text-sm text-accent-teal hover:underline">
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}
