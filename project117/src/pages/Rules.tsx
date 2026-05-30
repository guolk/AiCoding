import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getRuleNoteTypeLabel,
  getRuleNoteTypeColor,
} from '@/utils/helpers';
import { RuleNoteType } from '@/types';

const typeOptions: { value: RuleNoteType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'keyPoint', label: '规则要点' },
  { value: 'qa', label: 'Q&A' },
  { value: 'teaching', label: '教学引导' },
];

export default function Rules() {
  const { games, ruleNotes, addRuleNote, updateRuleNote, deleteRuleNote } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<RuleNoteType | 'all'>('all');
  const [gameFilter, setGameFilter] = useState<string | 'all'>('all');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newNote, setNewNote] = useState({
    gameId: '',
    type: 'keyPoint' as RuleNoteType,
    title: '',
    content: '',
    tags: [] as string[],
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  const getGameById = (id: string) => games.find((g) => g.id === id);

  const filteredNotes = ruleNotes.filter((note) => {
    const game = getGameById(note.gameId);
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || note.type === typeFilter;
    const matchesGame = gameFilter === 'all' || note.gameId === gameFilter;

    return matchesSearch && matchesType && matchesGame;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.gameId || !newNote.title || !newNote.content) {
      alert('请填写完整信息');
      return;
    }

    addRuleNote({
      gameId: newNote.gameId,
      type: newNote.type,
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags,
    });

    setNewNote({
      gameId: '',
      type: 'keyPoint',
      title: '',
      content: '',
      tags: [],
    });
    setShowAddForm(false);
  };

  const startEdit = (note: typeof ruleNotes[0]) => {
    setEditingId(note.id);
    setEditForm({
      title: note.title,
      content: note.content,
      tags: note.tags,
    });
  };

  const saveEdit = () => {
    if (editingId) {
      updateRuleNote(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条笔记吗？')) {
      deleteRuleNote(id);
    }
  };

  const addTag = (tags: string[], setTags: (tags: string[]) => void) => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">规则速查</h1>
          <p className="text-gray-400 mt-1">整理游戏规则要点、常见问题和教学笔记</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">添加笔记</span>
        </button>
      </div>

      {showAddForm && (
        <div className="card p-6 animate-slide-up">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            添加规则笔记
          </h2>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">关联游戏</label>
                <select
                  value={newNote.gameId}
                  onChange={(e) => setNewNote((prev) => ({ ...prev, gameId: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">请选择游戏</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">笔记类型</label>
                <select
                  value={newNote.type}
                  onChange={(e) =>
                    setNewNote((prev) => ({ ...prev, type: e.target.value as RuleNoteType }))
                  }
                  className="input-field"
                >
                  <option value="keyPoint">规则要点</option>
                  <option value="qa">Q&A</option>
                  <option value="teaching">教学引导</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">标题</label>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="简洁的标题"
                required
              />
            </div>

            <div>
              <label className="label">内容</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                className="input-field h-32 resize-none"
                placeholder="详细的规则说明..."
                required
              />
            </div>

            <div>
              <label className="label">标签</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addTag(newNote.tags, (tags) =>
                      setNewNote((prev) => ({ ...prev, tags }))
                    ))
                  }
                  className="input-field flex-1"
                  placeholder="输入标签后按回车添加"
                />
                <button
                  type="button"
                  onClick={() => addTag(newNote.tags, (tags) =>
                    setNewNote((prev) => ({ ...prev, tags }))
                  )}
                  className="btn-secondary"
                >
                  添加
                </button>
              </div>
              {newNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag bg-accent-500/20 text-accent-400 flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() =>
                          setNewNote((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((t) => t !== tag),
                          }))
                        }
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RuleNoteType | 'all')}
            className="input-field w-full sm:w-auto"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">全部游戏</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">没有找到匹配的笔记</p>
          <p className="text-gray-500 text-sm mt-2">
            {ruleNotes.length === 0 ? '点击上方按钮添加第一条笔记' : '尝试调整搜索条件'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const game = getGameById(note.gameId);
            const isExpanded = expandedNote === note.id;
            const isEditing = editingId === note.id;

            return (
              <div key={note.id} className="card overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-surface-200/50 transition-colors"
                  onClick={() => !isEditing && setExpandedNote(isExpanded ? null : note.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`tag ${getRuleNoteTypeColor(note.type)}`}>
                          {getRuleNoteTypeLabel(note.type)}
                        </span>
                        {game && (
                          <Link
                            to={`/collection/${game.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-accent-500 hover:text-accent-400"
                          >
                            {game.name}
                          </Link>
                        )}
                      </div>
                      <h3 className="text-white font-medium">{note.title}</h3>
                      {!isExpanded && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {note.content}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {isEditing ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEdit();
                          }}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(note);
                            }}
                            className="p-2 text-gray-400 hover:text-accent-500 hover:bg-accent-500/10 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(note.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="px-4 pb-4 border-t border-surface-100">
                    <div className="pt-4 space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="input-field"
                        placeholder="标题"
                      />
                      <textarea
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, content: e.target.value }))
                        }
                        className="input-field h-24 resize-none"
                        placeholder="内容"
                      />
                    </div>
                  </div>
                )}

                {isExpanded && !isEditing && (
                  <div className="px-4 pb-4 border-t border-surface-100">
                    <div className="pt-4">
                      <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="tag bg-surface-200 text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
