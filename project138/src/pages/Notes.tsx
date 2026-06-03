import { useState } from 'react';
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  X,
} from 'lucide-react';
import type { LearningNote, NoteCategory, ReadingMaterial } from '@/types';
import { NOTE_CATEGORY_LABELS } from '@/types';
import { useMuseumStore } from '@/store/useMuseumStore';
import Modal from '@/components/Modal';

const CATEGORY_COLORS: Record<NoteCategory, string> = {
  event: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  person: 'bg-crimson-500/15 text-crimson-400 border-crimson-500/30',
  culture: 'bg-green-500/15 text-green-400 border-green-500/30',
  other: 'bg-slate-600/15 text-slate-400 border-slate-600/30',
};

const CATEGORY_TABS: { key: NoteCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'event', label: NOTE_CATEGORY_LABELS.event },
  { key: 'person', label: NOTE_CATEGORY_LABELS.person },
  { key: 'culture', label: NOTE_CATEGORY_LABELS.culture },
  { key: 'other', label: NOTE_CATEGORY_LABELS.other },
];

const STATUS_BADGE: Record<ReadingMaterial['status'], { label: string; cls: string }> = {
  unread: { label: '未读', cls: 'bg-ink-400/20 text-ink-300' },
  reading: { label: '阅读中', cls: 'bg-yellow-500/15 text-yellow-400' },
  read: { label: '已读', cls: 'bg-green-500/15 text-green-400' },
};

interface FormData {
  title: string;
  category: NoteCategory;
  content: string;
  beforeUnderstanding: string;
  afterUnderstanding: string;
  readingMaterials: ReadingMaterial[];
  visitId: string;
}

const emptyForm = (): FormData => ({
  title: '',
  category: 'event',
  content: '',
  beforeUnderstanding: '',
  afterUnderstanding: '',
  readingMaterials: [],
  visitId: '',
});

export default function Notes() {
  const { learningNotes, visits, addLearningNote, updateLearningNote, deleteLearningNote } =
    useMuseumStore();

  const [activeTab, setActiveTab] = useState<NoteCategory | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());

  const filtered =
    activeTab === 'all'
      ? learningNotes
      : learningNotes.filter((n) => n.category === activeTab);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (note: LearningNote) => {
    setEditingId(note.id);
    setForm({
      title: note.title,
      category: note.category,
      content: note.content,
      beforeUnderstanding: note.beforeUnderstanding,
      afterUnderstanding: note.afterUnderstanding,
      readingMaterials: [...note.readingMaterials],
      visitId: note.visitId ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const readingMaterials = form.readingMaterials.filter(
      (m) => m.title.trim() || m.author.trim()
    );
    const visitId = form.visitId || undefined;

    if (editingId) {
      updateLearningNote(editingId, {
        title: form.title.trim(),
        category: form.category,
        content: form.content.trim(),
        beforeUnderstanding: form.beforeUnderstanding.trim(),
        afterUnderstanding: form.afterUnderstanding.trim(),
        readingMaterials,
        visitId,
      });
    } else {
      addLearningNote({
        id: crypto.randomUUID(),
        title: form.title.trim(),
        category: form.category,
        content: form.content.trim(),
        beforeUnderstanding: form.beforeUnderstanding.trim(),
        afterUnderstanding: form.afterUnderstanding.trim(),
        readingMaterials,
        visitId,
        createdAt: new Date().toISOString(),
      });
    }
    setModalOpen(false);
  };

  const addReadingMaterial = () => {
    setForm((prev) => ({
      ...prev,
      readingMaterials: [
        ...prev.readingMaterials,
        { id: crypto.randomUUID(), title: '', author: '', status: 'unread' },
      ],
    }));
  };

  const updateReadingMaterial = (idx: number, patch: Partial<ReadingMaterial>) => {
    setForm((prev) => ({
      ...prev,
      readingMaterials: prev.readingMaterials.map((m, i) =>
        i === idx ? { ...m, ...patch } : m
      ),
    }));
  };

  const removeReadingMaterial = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      readingMaterials: prev.readingMaterials.filter((_, i) => i !== idx),
    }));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const linkedVisit = (visitId?: string) =>
    visitId ? visits.find((v) => v.id === visitId) : null;

  return (
    <div className="min-h-screen bg-ink-900 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-gold-500" />
            <h1 className="font-serif text-2xl font-bold text-ink-50">学习笔记</h1>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg border-2 border-gold-500 px-4 py-2 text-sm font-medium text-gold-500 transition-colors hover:bg-gold-500/10"
          >
            <Plus size={16} />
            新增笔记
          </button>
        </div>

        <div className="mb-6 flex gap-2 border-b border-gold-500/10 pb-3">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-gold-500/15 text-gold-400'
                  : 'text-ink-300 hover:bg-gold-500/5 hover:text-ink-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-ink-400">
            <BookOpen size={48} className="mb-4 opacity-30" />
            <p className="text-lg">暂无学习笔记</p>
            <p className="mt-1 text-sm">点击「新增笔记」开始记录你的学习心得</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((note) => {
              const expanded = expandedIds.has(note.id);
              const visit = linkedVisit(note.visitId);
              return (
                <div
                  key={note.id}
                  className="card-shine rounded-xl border border-gold-500/10 p-5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-lg font-semibold text-ink-50">
                          {note.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            CATEGORY_COLORS[note.category]
                          }`}
                        >
                          {NOTE_CATEGORY_LABELS[note.category]}
                        </span>
                        {visit && (
                          <span className="inline-flex items-center rounded-full border border-gold-500/20 bg-gold-500/5 px-2 py-0.5 text-xs text-gold-400">
                            {visit.name}
                          </span>
                        )}
                      </div>
                      {!expanded && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-ink-200">
                          {note.content}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-ink-400">{formatDate(note.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(note)}
                        className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-gold-500/10 hover:text-gold-400"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteLearningNote(note.id)}
                        className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleExpand(note.id)}
                        className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-gold-500/10 hover:text-gold-400"
                      >
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 space-y-5 border-t border-gold-500/10 pt-4">
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-ink-100">笔记内容</h4>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-200">
                          {note.content}
                        </p>
                      </div>

                      {(note.beforeUnderstanding || note.afterUnderstanding) && (
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-ink-100">理解变化</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-crimson-500/5 border border-crimson-500/10 p-4">
                              <p className="mb-2 text-xs font-semibold text-crimson-400">
                                参观前
                              </p>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-200">
                                {note.beforeUnderstanding || '—'}
                              </p>
                            </div>
                            <div className="rounded-lg bg-green-500/5 border border-green-500/10 p-4">
                              <p className="mb-2 text-xs font-semibold text-green-400">
                                参观后
                              </p>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-200">
                                {note.afterUnderstanding || '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {note.readingMaterials.length > 0 && (
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-ink-100">推荐阅读</h4>
                          <div className="space-y-2">
                            {note.readingMaterials.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center justify-between rounded-lg bg-ink-900/50 px-4 py-2.5 border border-gold-500/5"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="text-sm font-medium text-ink-100">
                                    {m.title}
                                  </span>
                                  {m.author && (
                                    <span className="ml-2 text-xs text-ink-400">
                                      {m.author}
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`ml-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    STATUS_BADGE[m.status].cls
                                  }`}
                                >
                                  {STATUS_BADGE[m.status].label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '编辑笔记' : '新增笔记'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">标题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-lg border border-gold-500/15 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-gold-500/40"
              placeholder="输入笔记标题"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">分类</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value as NoteCategory }))
              }
              className="w-full rounded-lg border border-gold-500/15 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-50 outline-none focus:border-gold-500/40"
            >
              {(Object.keys(NOTE_CATEGORY_LABELS) as NoteCategory[]).map((k) => (
                <option key={k} value={k}>
                  {NOTE_CATEGORY_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">关联参观</label>
            <select
              value={form.visitId}
              onChange={(e) => setForm((p) => ({ ...p, visitId: e.target.value }))}
              className="w-full rounded-lg border border-gold-500/15 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-50 outline-none focus:border-gold-500/40"
            >
              <option value="">不关联</option>
              {visits.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">内容</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="w-full rounded-lg border border-gold-500/15 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-gold-500/40 resize-none"
              placeholder="输入学习内容"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-crimson-400">
                参观前理解
              </label>
              <textarea
                rows={3}
                value={form.beforeUnderstanding}
                onChange={(e) =>
                  setForm((p) => ({ ...p, beforeUnderstanding: e.target.value }))
                }
                className="w-full rounded-lg border border-crimson-500/15 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-crimson-500/40 resize-none"
                placeholder="参观前的理解"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-green-400">
                参观后理解
              </label>
              <textarea
                rows={3}
                value={form.afterUnderstanding}
                onChange={(e) =>
                  setForm((p) => ({ ...p, afterUnderstanding: e.target.value }))
                }
                className="w-full rounded-lg border border-green-500/15 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-green-500/40 resize-none"
                placeholder="参观后的理解"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-ink-200">推荐阅读</label>
              <button
                type="button"
                onClick={addReadingMaterial}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gold-400 transition-colors hover:bg-gold-500/10"
              >
                <Plus size={14} />
                添加
              </button>
            </div>
            {form.readingMaterials.length > 0 && (
              <div className="space-y-2">
                {form.readingMaterials.map((m, i) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-lg border border-gold-500/10 bg-ink-900/40 p-3"
                  >
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) =>
                        updateReadingMaterial(i, { title: e.target.value })
                      }
                      placeholder="书名"
                      className="min-w-0 flex-1 rounded-md border border-gold-500/10 bg-ink-900/60 px-3 py-1.5 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-gold-500/30"
                    />
                    <input
                      type="text"
                      value={m.author}
                      onChange={(e) =>
                        updateReadingMaterial(i, { author: e.target.value })
                      }
                      placeholder="作者"
                      className="min-w-0 flex-1 rounded-md border border-gold-500/10 bg-ink-900/60 px-3 py-1.5 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-gold-500/30"
                    />
                    <select
                      value={m.status}
                      onChange={(e) =>
                        updateReadingMaterial(i, {
                          status: e.target.value as ReadingMaterial['status'],
                        })
                      }
                      className="rounded-md border border-gold-500/10 bg-ink-900/60 px-2 py-1.5 text-sm text-ink-50 outline-none focus:border-gold-500/30"
                    >
                      <option value="unread">未读</option>
                      <option value="reading">阅读中</option>
                      <option value="read">已读</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeReadingMaterial(i)}
                      className="rounded-md p-1.5 text-ink-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gold-500/10 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-5 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-ink-800"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-gold-400"
            >
              {editingId ? '保存' : '添加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
