import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ArrowLeft,
  BookOpen,
  Atom,
  Mountain,
  Sparkles,
  Tag,
  FileText,
  Calendar,
  Clock,
  Link2,
  BookMarked,
  Filter,
  Menu,
  Layers,
  FlaskConical,
  Compass,
  FolderOpen,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';
import type { KnowledgeNote, Specimen } from '@/types';
import { NOTE_CATEGORY_LABELS, SPECIMEN_TYPE_LABELS, SPECIMEN_TYPE_COLORS } from '@/types';

type NoteCategory = KnowledgeNote['category'];

const NOTE_CATEGORY_ICONS: Record<NoteCategory, typeof Atom> = {
  crystallography: Atom,
  formation: Mountain,
  'mineral-properties': FlaskConical,
  'meteorite-science': Sparkles,
  'field-guide': Compass,
  other: FolderOpen,
};

const NOTE_CATEGORY_COLORS: Record<NoteCategory, { bg: string; text: string; gradient: string }> = {
  crystallography: { bg: 'bg-sky-100', text: 'text-sky-700', gradient: 'from-sky-500 to-blue-600' },
  formation: { bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-500 to-green-600' },
  'mineral-properties': { bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-500 to-orange-500' },
  'meteorite-science': { bg: 'bg-violet-100', text: 'text-violet-700', gradient: 'from-violet-500 to-purple-600' },
  'field-guide': { bg: 'bg-teal-100', text: 'text-teal-700', gradient: 'from-teal-500 to-cyan-600' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700', gradient: 'from-gray-500 to-slate-600' },
};

interface FormData {
  title: string;
  category: NoteCategory;
  content: string;
  tags: string[];
  relatedSpecimenIds: string[];
  references: string;
}

const defaultFormData: FormData = {
  title: '',
  category: 'crystallography',
  content: '',
  tags: [],
  relatedSpecimenIds: [],
  references: '',
};

function renderMarkdownSimple(text: string): JSX.Element {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listBuffer.length > 0 && listType) {
      const ListTag = listType;
      elements.push(
        <ListTag key={`list-${elements.length}`} className="my-3 ml-6 space-y-1">
          {listBuffer.map((item, i) => (
            <li key={i} className="text-gray-700 leading-relaxed text-[15px]">
              {renderInline(item)}
            </li>
          ))}
        </ListTag>
      );
      listBuffer = [];
      listType = null;
    }
  };

  const renderInline = (str: string): JSX.Element[] => {
    const parts: JSX.Element[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`t-${lastIndex}`}>{str.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-primary-800">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      parts.push(<span key={`t-${lastIndex}`}>{str.slice(lastIndex)}</span>);
    }
    return parts.length > 0 ? parts : [<span key="empty">&nbsp;</span>];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
      return;
    }

    if (/^[-*]\s/.test(trimmed)) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listBuffer.push(trimmed.replace(/^[-*]\s/, ''));
      return;
    }

    flushList();

    if (/^###\s/.test(trimmed)) {
      elements.push(
        <h3 key={idx} className="text-lg font-semibold text-primary-800 font-serif mt-5 mb-2">
          {renderInline(trimmed.replace(/^###\s/, ''))}
        </h3>
      );
    } else if (/^##\s/.test(trimmed)) {
      elements.push(
        <h2 key={idx} className="text-xl font-semibold text-primary-900 font-serif mt-6 mb-3 pb-2 border-b border-amber-100">
          {renderInline(trimmed.replace(/^##\s/, ''))}
        </h2>
      );
    } else if (/^#\s/.test(trimmed)) {
      elements.push(
        <h1 key={idx} className="text-2xl font-bold text-primary-900 font-serif mt-6 mb-4">
          {renderInline(trimmed.replace(/^#\s/, ''))}
        </h1>
      );
    } else if (trimmed === '') {
      elements.push(<div key={idx} className="h-3" />);
    } else {
      elements.push(
        <p key={idx} className="text-gray-700 leading-relaxed my-2 text-[15px]">
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

function getContentPreview(content: string, maxLines: number = 3): string {
  const lines = content
    .split('\n')
    .map((l) => l.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim())
    .filter((l) => l.length > 0);
  return lines.slice(0, maxLines).join('  ').slice(0, 150) + (lines.length > maxLines ? '...' : '');
}

export default function Knowledge() {
  const knowledgeNotes = useAppStore((s) => s.knowledgeNotes);
  const specimens = useAppStore((s) => s.specimens);
  const addKnowledgeNote = useAppStore((s) => s.addKnowledgeNote);
  const updateKnowledgeNote = useAppStore((s) => s.updateKnowledgeNote);
  const deleteKnowledgeNote = useAppStore((s) => s.deleteKnowledgeNote);

  const [categoryFilter, setCategoryFilter] = useState<'all' | NoteCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<KnowledgeNote | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<KnowledgeNote | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [tagInput, setTagInput] = useState('');
  const [specimenSearch, setSpecimenSearch] = useState('');
  const [specimenDropdownOpen, setSpecimenDropdownOpen] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts: Record<NoteCategory, number> = {
      crystallography: 0,
      formation: 0,
      'mineral-properties': 0,
      'meteorite-science': 0,
      'field-guide': 0,
      other: 0,
    };
    knowledgeNotes.forEach((n) => {
      counts[n.category]++;
    });
    return counts;
  }, [knowledgeNotes]);

  const allTags = useMemo(() => {
    const tagMap: Record<string, number> = {};
    knowledgeNotes.forEach((n) => {
      n.tags.forEach((t) => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);
  }, [knowledgeNotes]);

  const filteredNotes = useMemo(() => {
    return knowledgeNotes.filter((n) => {
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      if (tagFilter && !n.tags.includes(tagFilter)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchTags) return false;
      }
      return true;
    });
  }, [knowledgeNotes, categoryFilter, tagFilter, searchQuery]);

  const getSpecimenById = (id: string): Specimen | undefined => specimens.find((s) => s.id === id);

  const statCards = [
    {
      title: '笔记总数',
      value: knowledgeNotes.length,
      suffix: '篇',
      icon: BookOpen,
      gradient: 'from-amber-500 to-orange-500',
      description: '全部知识笔记',
    },
    {
      title: NOTE_CATEGORY_LABELS.crystallography,
      value: categoryCounts.crystallography,
      suffix: '篇',
      icon: NOTE_CATEGORY_ICONS.crystallography,
      gradient: NOTE_CATEGORY_COLORS.crystallography.gradient,
      description: '晶体对称与结构',
    },
    {
      title: NOTE_CATEGORY_LABELS.formation,
      value: categoryCounts.formation,
      suffix: '篇',
      icon: NOTE_CATEGORY_ICONS.formation,
      gradient: NOTE_CATEGORY_COLORS.formation.gradient,
      description: '地质成因与环境',
    },
    {
      title: NOTE_CATEGORY_LABELS['meteorite-science'],
      value: categoryCounts['meteorite-science'],
      suffix: '篇',
      icon: NOTE_CATEGORY_ICONS['meteorite-science'],
      gradient: NOTE_CATEGORY_COLORS['meteorite-science'].gradient,
      description: '行星科学研究',
    },
  ];

  const openAddForm = () => {
    setEditingNote(null);
    setFormData(defaultFormData);
    setTagInput('');
    setSpecimenSearch('');
    setFormOpen(true);
  };

  const openEditForm = (note: KnowledgeNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      category: note.category,
      content: note.content,
      tags: [...note.tags],
      relatedSpecimenIds: [...note.relatedSpecimenIds],
      references: note.references || '',
    });
    setTagInput('');
    setSpecimenSearch('');
    setSelectedNote(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingNote(null);
    setFormData(defaultFormData);
    setTagInput('');
    setSpecimenSearch('');
    setSpecimenDropdownOpen(false);
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setFormData((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));
  };

  const handleToggleSpecimen = (id: string) => {
    setFormData((f) => ({
      ...f,
      relatedSpecimenIds: f.relatedSpecimenIds.includes(id)
        ? f.relatedSpecimenIds.filter((x) => x !== id)
        : [...f.relatedSpecimenIds, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const noteData: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      category: formData.category,
      content: formData.content,
      tags: formData.tags,
      relatedSpecimenIds: formData.relatedSpecimenIds,
      references: formData.references.trim() || undefined,
    };

    if (editingNote) {
      updateKnowledgeNote(editingNote.id, noteData);
    } else {
      addKnowledgeNote(noteData);
    }

    closeForm();
  };

  const handleDelete = (note: KnowledgeNote) => {
    if (window.confirm(`确定要删除笔记"${note.title}"吗？`)) {
      deleteKnowledgeNote(note.id);
      if (selectedNote?.id === note.id) {
        setSelectedNote(null);
      }
    }
  };

  const filteredSpecimensForSelect = useMemo(() => {
    if (!specimenSearch.trim()) return specimens.slice(0, 50);
    const q = specimenSearch.toLowerCase();
    return specimens
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.specimenNo.toLowerCase().includes(q) ||
          s.locality?.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [specimens, specimenSearch]);

  const SidebarContent = () => (
    <div className="space-y-5 h-full overflow-y-auto scrollbar-thin p-5">
      <div>
        <button
          onClick={openAddForm}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-amber-700 hover:to-orange-600 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          新建笔记
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          搜索笔记
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="标题、内容、标签..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          分类导航
        </label>
        <div className="space-y-1">
          <button
            onClick={() => {
              setCategoryFilter('all');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            <Filter className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">全部笔记</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                categoryFilter === 'all' ? 'bg-white/25' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {knowledgeNotes.length}
            </span>
          </button>
          {(Object.keys(NOTE_CATEGORY_LABELS) as NoteCategory[]).map((cat) => {
            const Icon = NOTE_CATEGORY_ICONS[cat];
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategoryFilter(cat);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? `bg-gradient-to-r ${NOTE_CATEGORY_COLORS[cat].gradient} text-white shadow-md`
                    : `text-gray-600 hover:bg-gray-50`
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{NOTE_CATEGORY_LABELS[cat]}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    active ? 'bg-white/25' : `${NOTE_CATEGORY_COLORS[cat].bg} ${NOTE_CATEGORY_COLORS[cat].text}`
                  }`}
                >
                  {categoryCounts[cat]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          标签云
        </label>
        <div className="flex flex-wrap gap-1.5">
          {allTags.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">暂无标签</p>
          ) : (
            allTags.map(([tag, count]) => {
              const active = tagFilter === tag;
              const size = Math.min(12 + count * 1.5, 18);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setTagFilter(active ? null : tag);
                    setSidebarOpen(false);
                  }}
                  style={{ fontSize: `${size}px` }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    active
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100'
                  }`}
                >
                  {tag}
                  <span className={`ml-1 text-[10px] opacity-70`}>{count}</span>
                </button>
              );
            })
          )}
        </div>
        {tagFilter && (
          <button
            onClick={() => setTagFilter(null)}
            className="mt-2 text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> 清除标签筛选: {tagFilter}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-md">
            <BookMarked className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="page-title">知识学习</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              矿物晶体学 · 地质学 · 行星科学 学习笔记与研究资料
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-amber-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={openAddForm}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            新建笔记
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-animation">
        {statCards.map((card, idx) => (
          <div key={idx} className="card card-hover p-5 relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`}
            />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">{card.title}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-semibold text-primary-900 font-serif">
                  {card.value}
                </span>
                <span className="text-sm text-gray-500">{card.suffix}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="card sticky top-24 max-h-[calc(100vh-140px)] overflow-hidden">
            <SidebarContent />
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white animate-slide-in-right shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700 font-serif">筛选导航</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[calc(100vh-70px)]">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {selectedNote ? (
            <div className="card p-6 md:p-8 animate-fade-in">
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-amber-50">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 font-medium mb-3 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    返回笔记列表
                  </button>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary-900 font-serif leading-tight">
                    {selectedNote.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2.5 mt-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${NOTE_CATEGORY_COLORS[selectedNote.category].bg} ${NOTE_CATEGORY_COLORS[selectedNote.category].text}`}
                    >
                      {(() => {
                        const Icon = NOTE_CATEGORY_ICONS[selectedNote.category];
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {NOTE_CATEGORY_LABELS[selectedNote.category]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      创建于 {formatDate(selectedNote.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      更新于 {formatDate(selectedNote.updatedAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openEditForm(selectedNote)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑笔记
                </button>
              </div>

              {selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selectedNote.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTagFilter(t);
                        setSelectedNote(null);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100 hover:bg-amber-100 transition-colors"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 rounded-2xl p-6 md:p-8 border border-amber-50/80 mb-6">
                {renderMarkdownSimple(selectedNote.content)}
              </div>

              {selectedNote.relatedSpecimenIds.length > 0 && (
                <div className="mb-6">
                  <h3 className="section-title flex items-center gap-2 mb-4">
                    <Link2 className="w-4 h-4 text-amber-600" />
                    关联标本
                    <span className="text-xs text-gray-400 font-normal">
                      ({selectedNote.relatedSpecimenIds.length} 件)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedNote.relatedSpecimenIds.map((sid) => {
                      const spec = getSpecimenById(sid);
                      if (!spec) return null;
                      const primaryPhoto = spec.photos?.find((p) => p.isPrimary) || spec.photos?.[0];
                      return (
                        <div
                          key={sid}
                          className="rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                        >
                          <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
                            {primaryPhoto ? (
                              <img
                                src={primaryPhoto.url}
                                alt={spec.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-amber-300" />
                              </div>
                            )}
                            <span
                              className={`absolute top-2 left-2 badge ${SPECIMEN_TYPE_COLORS[spec.type]}`}
                            >
                              {SPECIMEN_TYPE_LABELS[spec.type]}
                            </span>
                          </div>
                          <div className="p-2.5">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {spec.name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {spec.specimenNo}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedNote.references && (
                <div>
                  <h3 className="section-title flex items-center gap-2 mb-3">
                    <BookMarked className="w-4 h-4 text-amber-600" />
                    参考文献
                  </h3>
                  <div className="rounded-xl bg-amber-50/50 border border-amber-100 p-5">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedNote.references}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    共筛选出 <span className="font-semibold text-primary-700">{filteredNotes.length}</span> 篇笔记
                  </span>
                  {(categoryFilter !== 'all' || tagFilter || searchQuery) && (
                    <button
                      onClick={() => {
                        setCategoryFilter('all');
                        setTagFilter(null);
                        setSearchQuery('');
                      }}
                      className="text-amber-600 hover:text-amber-800 font-medium"
                    >
                      清除筛选
                    </button>
                  )}
                </div>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="card p-16 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <BookOpen className="w-10 h-10 text-amber-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无笔记</h3>
                  <p className="text-gray-500 text-sm mb-5">
                    {knowledgeNotes.length === 0
                      ? '点击左上角"新建笔记"开始记录您的学习资料'
                      : '当前筛选条件下没有匹配的笔记，试试其他关键词或分类'}
                  </p>
                  {knowledgeNotes.length === 0 && (
                    <button
                      onClick={openAddForm}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      创建第一篇笔记
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5 stagger-animation">
                  {filteredNotes.map((note) => {
                    const catColors = NOTE_CATEGORY_COLORS[note.category];
                    const CatIcon = NOTE_CATEGORY_ICONS[note.category];
                    return (
                      <div
                        key={note.id}
                        onClick={() => setSelectedNote(note)}
                        className="card card-hover p-5 cursor-pointer group relative"
                      >
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForm(note);
                            }}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(note);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-start gap-3 mb-3 pr-16">
                          <div
                            className={`w-10 h-10 rounded-xl ${catColors.bg} flex items-center justify-center flex-shrink-0`}
                          >
                            <CatIcon className={`w-5 h-5 ${catColors.text}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-800 font-serif text-lg leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
                              {note.title}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${catColors.bg} ${catColors.text}`}
                            >
                              {NOTE_CATEGORY_LABELS[note.category]}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                            {getContentPreview(note.content, 3)}
                          </p>
                        </div>

                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {note.tags.slice(0, 4).map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[11px] border border-gray-100"
                              >
                                #{t}
                              </span>
                            ))}
                            {note.tags.length > 4 && (
                              <span className="text-[11px] text-gray-400 px-1">
                                +{note.tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            {note.relatedSpecimenIds.length} 件标本
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ChevronLeft className="w-3 h-3 rotate-180" />
                            {formatDate(note.updatedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeForm}
          />
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-xl animate-fade-in-up flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50/50">
              <h2 className="text-lg font-semibold text-gray-800 font-serif flex items-center gap-2">
                {editingNote ? (
                  <>
                    <Edit2 className="w-4 h-4 text-amber-600" />
                    编辑笔记
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-amber-600" />
                    新建笔记
                  </>
                )}
              </h2>
              <button
                onClick={closeForm}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="p-6 space-y-5">
                <div>
                  <label className="label">
                    笔记标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                    placeholder="输入笔记标题，如：七大晶系概述"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="label">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value as NoteCategory }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                  >
                    {(Object.keys(NOTE_CATEGORY_LABELS) as NoteCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {NOTE_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">内容（支持 Markdown 简单格式）</label>
                  <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-50 rounded"># 标题</span>
                    <span className="px-2 py-0.5 bg-gray-50 rounded">## 二级标题</span>
                    <span className="px-2 py-0.5 bg-gray-50 rounded">- 列表项</span>
                    <span className="px-2 py-0.5 bg-gray-50 rounded">1. 有序列表</span>
                    <span className="px-2 py-0.5 bg-gray-50 rounded">**加粗文字**</span>
                  </div>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
                    placeholder="# 标题&#10;&#10;正文内容，支持 **加粗**、- 列表、## 小标题等 Markdown 语法..."
                    rows={14}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm font-mono leading-relaxed resize-y"
                  />
                </div>

                <div>
                  <label className="label">标签</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="输入标签后回车添加"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      添加
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="ml-0.5 text-amber-500 hover:text-amber-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">关联标本</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={specimenSearch}
                      onChange={(e) => {
                        setSpecimenSearch(e.target.value);
                        setSpecimenDropdownOpen(true);
                      }}
                      onFocus={() => setSpecimenDropdownOpen(true)}
                      placeholder="搜索并选择标本（名称/编号/产地）"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
                    />
                    {specimenDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setSpecimenDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto scrollbar-thin">
                          {filteredSpecimensForSelect.length === 0 ? (
                            <div className="p-4 text-sm text-gray-400 text-center">
                              暂无匹配的标本
                            </div>
                          ) : (
                            filteredSpecimensForSelect.map((s) => {
                              const selected = formData.relatedSpecimenIds.includes(s.id);
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => handleToggleSpecimen(s.id)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-amber-50/60 transition-colors border-b border-gray-50 last:border-b-0 ${
                                    selected ? 'bg-amber-50' : ''
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                                      selected
                                        ? 'bg-amber-500 border-amber-500'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {selected && (
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                      {s.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 font-mono truncate">
                                      {s.specimenNo}
                                      {s.locality && ` · ${s.locality}`}
                                    </p>
                                  </div>
                                  <span
                                    className={`badge ${SPECIMEN_TYPE_COLORS[s.type]}`}
                                  >
                                    {SPECIMEN_TYPE_LABELS[s.type]}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {formData.relatedSpecimenIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.relatedSpecimenIds.map((sid) => {
                        const s = getSpecimenById(sid);
                        if (!s) return null;
                        return (
                          <span
                            key={sid}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100"
                          >
                            {s.name}
                            <span className="text-emerald-500/70 font-mono text-[10px]">
                              {s.specimenNo}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSpecimen(sid)}
                              className="ml-0.5 text-emerald-500 hover:text-emerald-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">参考文献（可选）</label>
                  <textarea
                    value={formData.references}
                    onChange={(e) => setFormData((f) => ({ ...f, references: e.target.value }))}
                    placeholder="一行一条参考文献，如：&#10;《结晶学及矿物学》，赵珊茸等编，高等教育出版社&#10;《Manual of Mineralogy》，Klein & Hurlbut"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm leading-relaxed resize-y"
                  />
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
              >
                {editingNote ? '保存修改' : '创建笔记'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
