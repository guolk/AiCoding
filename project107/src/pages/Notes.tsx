import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Save,
  Trash2,
  Edit3,
  Clock,
  Tag,
  MapPin,
  BookOpen,
  Target,
  Flag,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNoteStore } from '@/store/useNoteStore';
import { openings } from '@/data/openings';
import type { Note, NoteCategory } from '@/types';

const categoryConfig: Record<NoteCategory, { key: NoteCategory; label: string; icon: typeof BookOpen }> = {
  opening: { key: 'opening', label: '开局笔记', icon: BookOpen },
  tactic: { key: 'tactic', label: '战术记录', icon: Target },
  endgame: { key: 'endgame', label: '残局笔记', icon: Flag },
};

interface NoteFormData {
  title: string;
  content: string;
  tags: string;
  fen: string;
  relatedOpeningId: string;
  relatedVariationId: string;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Notes() {
  const navigate = useNavigate();
  const {
    notes,
    selectedCategory,
    searchQuery,
    addNote,
    updateNote,
    deleteNote,
    setCategory,
    setSearchQuery,
  } = useNoteStore();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    tags: '',
    fen: '',
    relatedOpeningId: '',
    relatedVariationId: '',
  });

  useEffect(() => {
    if (selectedCategory === 'all') {
      setCategory('opening');
    }
  }, []);

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (selectedCategory !== 'all') {
      result = result.filter((note) => note.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, selectedCategory, searchQuery]);

  const handleCreateNote = () => {
    console.log('handleCreateNote called');
    const category = selectedCategory === 'all' ? 'opening' : selectedCategory;
    setSelectedNote(null);
    setIsEditing(true);
    setFormData({
      title: '',
      content: '',
      tags: '',
      fen: '',
      relatedOpeningId: '',
      relatedVariationId: '',
    });
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      fen: '',
      relatedOpeningId: note.relatedOpeningId || '',
      relatedVariationId: '',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      content: '',
      tags: '',
      fen: '',
      relatedOpeningId: '',
      relatedVariationId: '',
    });
    if (!selectedNote && filteredNotes.length > 0) {
      setSelectedNote(filteredNotes[0]);
    }
  };

  const handleSaveNote = () => {
    if (!formData.title.trim()) {
      alert('请输入笔记标题');
      return;
    }

    const category = selectedNote?.category || (selectedCategory === 'all' ? 'opening' : selectedCategory);
    const tags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    if (selectedNote) {
      updateNote(selectedNote.id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags,
        relatedOpeningId: formData.relatedOpeningId || undefined,
      });
    } else {
      addNote({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: category as NoteCategory,
        tags,
        relatedOpeningId: formData.relatedOpeningId || undefined,
      });
    }

    setIsEditing(false);
  };

  const handleDeleteNote = (note: Note) => {
    if (window.confirm('确定要删除这条笔记吗？')) {
      deleteNote(note.id);
      if (selectedNote?.id === note.id) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    }
  };

  const selectedOpening = formData.relatedOpeningId
    ? openings.find((o) => o.id === formData.relatedOpeningId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-500 via-ivory-400 to-ivory-300">
      <header className="bg-gradient-to-r from-wood-brown-700 to-wood-brown-900">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-ivory-100 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回首页</span>
              </button>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">学习笔记</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
          <aside className="lg:col-span-4 flex flex-col">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-wood-brown-200 space-y-4">
                <div className="flex gap-2">
                  {(['opening', 'tactic', 'endgame'] as NoteCategory[]).map((category) => {
                    const config = categoryConfig[category];
                    const Icon = config.icon;
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          console.log('切换分类:', category);
                          setCategory(category);
                        }}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-wood-brown-600 text-white'
                            : 'bg-wood-brown-100 text-wood-brown-700 hover:bg-wood-brown-200'
                        )}
                      >
                        <Icon size={16} />
                        <span className="hidden md:inline">{config.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-brown-400" size={18} />
                  <input
                    type="text"
                    placeholder="搜索笔记标题、内容或标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-wood-brown-200 bg-white focus:outline-none focus:ring-2 focus:ring-wood-brown-500 text-wood-brown-800 placeholder:text-wood-brown-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-wood-brown-600 to-wood-brown-700 text-white rounded-lg font-medium hover:from-wood-brown-700 hover:to-wood-brown-800 transition-all shadow-md active:scale-95"
                >
                  <Plus size={18} />
                  <span>新建笔记</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {filteredNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <BookOpen className="text-wood-brown-300 mb-3" size={48} />
                    <p className="text-wood-brown-600 font-medium">暂无笔记</p>
                    <p className="text-wood-brown-500 text-sm mt-1">点击上方按钮创建第一条笔记</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotes.map((note) => {
                      const config = categoryConfig[note.category];
                      const Icon = config.icon;
                      const isSelected = selectedNote?.id === note.id;
                      return (
                        <div
                          key={note.id}
                          className={cn(
                            'p-4 rounded-xl border transition-all cursor-pointer group',
                            isSelected
                              ? 'bg-wood-brown-600 text-white border-wood-brown-600'
                              : 'bg-white hover:bg-wood-brown-50 border-wood-brown-200 hover:border-wood-brown-300'
                          )}
                          onClick={() => {
                            if (!isEditing) {
                              setSelectedNote(note);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon
                                  size={14}
                                  className={cn(isSelected ? 'text-ivory-200' : 'text-wood-brown-500')}
                                />
                                <span
                                  className={cn(
                                    'font-semibold truncate',
                                    isSelected ? 'text-white' : 'text-wood-brown-800'
                                  )}
                                >
                                  {note.title}
                                </span>
                              </div>
                              <p
                                className={cn(
                                  'text-sm line-clamp-2 mb-2',
                                  isSelected ? 'text-ivory-200' : 'text-wood-brown-600'
                                )}
                              >
                                {note.content || '暂无内容'}
                              </p>
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    'flex items-center gap-1 text-xs',
                                    isSelected ? 'text-ivory-300' : 'text-wood-brown-400'
                                  )}
                                >
                                  <Clock size={12} />
                                  {formatDate(note.updatedAt)}
                                </span>
                                {note.tags.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Tag
                                      size={12}
                                      className={cn(isSelected ? 'text-ivory-300' : 'text-wood-brown-400')}
                                    />
                                    <span
                                      className={cn(
                                        'text-xs truncate max-w-24',
                                        isSelected ? 'text-ivory-300' : 'text-wood-brown-400'
                                      )}
                                    >
                                      {note.tags.slice(0, 2).join(', ')}
                                      {note.tags.length > 2 ? '...' : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditNote(note);
                                }}
                                className={cn(
                                  'p-1.5 rounded-lg transition-colors',
                                  isSelected
                                    ? 'hover:bg-white/20 text-white'
                                    : 'hover:bg-wood-brown-100 text-wood-brown-600'
                                )}
                                title="编辑"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note);
                                }}
                                className={cn(
                                  'p-1.5 rounded-lg transition-colors',
                                  isSelected
                                    ? 'hover:bg-white/20 text-red-200'
                                    : 'hover:bg-red-50 text-red-500'
                                )}
                                title="删除"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden h-full">
              {isEditing ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-wood-brown-200 flex items-center justify-between">
                    <h2 className="font-display font-semibold text-lg text-wood-brown-800">
                      {selectedNote ? '编辑笔记' : '新建笔记'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-wood-brown-100 text-wood-brown-700 hover:bg-wood-brown-200 transition-colors"
                      >
                        <X size={16} />
                        <span>取消</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-colors"
                      >
                        <Save size={16} />
                        <span>保存</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-wood-brown-700 mb-2">
                          标题 *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="输入笔记标题..."
                          className="w-full px-4 py-3 rounded-lg border border-wood-brown-200 bg-white focus:outline-none focus:ring-2 focus:ring-wood-brown-500 text-wood-brown-800 placeholder:text-wood-brown-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-wood-brown-700 mb-2">
                          标签
                        </label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-brown-400" size={16} />
                          <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="多个标签用逗号分隔，如：西班牙开局, 主变, 陷阱"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-wood-brown-200 bg-white focus:outline-none focus:ring-2 focus:ring-wood-brown-500 text-wood-brown-800 placeholder:text-wood-brown-400"
                          />
                        </div>
                      </div>

                      {selectedCategory === 'opening' && (
                        <div className="bg-ivory-100 rounded-xl p-4 border border-wood-brown-200">
                          <h3 className="font-medium text-wood-brown-800 mb-3 flex items-center gap-2">
                            <BookOpen size={18} />
                            关联开局
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-wood-brown-600 mb-1">选择开局</label>
                              <select
                                value={formData.relatedOpeningId}
                                onChange={(e) =>
                                  setFormData({ ...formData, relatedOpeningId: e.target.value, relatedVariationId: '' })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-wood-brown-200 bg-white focus:outline-none focus:ring-2 focus:ring-wood-brown-500 text-wood-brown-800"
                              >
                                <option value="">无关联开局</option>
                                {openings.map((opening) => (
                                  <option key={opening.id} value={opening.id}>
                                    {opening.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {selectedOpening && selectedOpening.variations.length > 0 && (
                              <div>
                                <label className="block text-sm text-wood-brown-600 mb-1">选择变例</label>
                                <select
                                  value={formData.relatedVariationId}
                                  onChange={(e) =>
                                    setFormData({ ...formData, relatedVariationId: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-wood-brown-200 bg-white focus:outline-none focus:ring-2 focus:ring-wood-brown-500 text-wood-brown-800"
                                >
                                  <option value="">无关联变例</option>
                                  {selectedOpening.variations.map((variation) => (
                                    <option key={variation.id} value={variation.id}>
                                      {variation.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedCategory === 'tactic' && (
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <h3 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                            <Target size={18} />
                            战术记录提示
                          </h3>
                          <p className="text-sm text-red-700 leading-relaxed">
                            记录你遇到的强制杀棋、得子手段、战术组合等。
                          </p>
                        </div>
                      )}

                      {selectedCategory === 'endgame' && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                            <Flag size={18} />
                            残局理论提示
                          </h3>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            记录残局理论和关键局面，如王兵残局、车类残局等。
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-wood-brown-700 mb-2">
                          FEN 位置（可选）
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-brown-400" size={16} />
                          <input
                            type="text"
                            value={formData.fen}
                            onChange={(e) => setFormData({ ...formData, fen: e.target.value })}
                            placeholder="粘贴 FEN 字符串"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-wood-brown-200 bg-white focus:outline-none focus:ring-2 focus:ring-wood-brown-500 text-wood-brown-800 placeholder:text-wood-brown-400 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium text-wood-brown-700 mb-2">
                          内容
                        </label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="记录你的学习心得、分析思路、关键要点..."
                          rows={12}
                          className="w-full px-4 py-3 rounded-lg border border-wood-brown-200 bg-white focus:outline-none focus:ring-2 focus:ring-wood-brown-500 text-wood-brown-800 placeholder:text-wood-brown-400 resize-none font-mono text-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedNote ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-wood-brown-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const config = categoryConfig[selectedNote.category];
                        const Icon = config.icon;
                        return (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-wood-brown-100 text-wood-brown-700 text-sm">
                            <Icon size={14} />
                            {config.label}
                          </span>
                        );
                      })()}
                      {selectedNote.tags.length > 0 &&
                        selectedNote.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory-100 text-wood-brown-600 text-xs"
                          >
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditNote(selectedNote)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-wood-brown-600 text-white hover:bg-wood-brown-700 transition-colors"
                    >
                      <Edit3 size={16} />
                      <span>编辑</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                      <h2 className="text-2xl font-display font-bold text-wood-brown-900 mb-4">
                        {selectedNote.title}
                      </h2>

                      <div className="flex items-center gap-4 text-sm text-wood-brown-500 mb-6 pb-6 border-b border-wood-brown-200">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          创建于 {formatDate(selectedNote.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Edit3 size={14} />
                          更新于 {formatDate(selectedNote.updatedAt)}
                        </span>
                      </div>

                      {selectedNote.relatedOpeningId && (
                        <div className="mb-6 p-4 bg-ivory-100 rounded-xl border border-wood-brown-200">
                          <div className="flex items-center gap-2 text-wood-brown-700">
                            <BookOpen size={18} />
                            <span className="font-medium">关联开局：</span>
                            <span className="text-wood-brown-800">
                              {openings.find((o) => o.id === selectedNote.relatedOpeningId)?.name || '未知开局'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap text-wood-brown-800 leading-relaxed text-lg">
                        {selectedNote.content || (
                          <span className="text-wood-brown-400 italic">暂无内容</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Edit3 className="text-wood-brown-300 mb-4" size={64} />
                  <h3 className="text-xl font-display font-semibold text-wood-brown-800 mb-2">
                    选择或创建笔记
                  </h3>
                  <p className="text-wood-brown-600 max-w-md">
                    从左侧列表选择一条笔记查看详情，或点击"新建笔记"按钮开始记录你的学习心得
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
