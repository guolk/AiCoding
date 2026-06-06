import { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  GitCompare,
  BookOpen,
  Star,
  ArrowRight,
  LayoutGrid,
  LayoutList,
  AlertTriangle,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { useStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { dimensionLabels } from '../../shared/types';
import type { Comparison, CaseStudy } from '../../shared/types';

export default function Comparison() {
  const { comparisons, caseStudies, projects, createComparison, updateComparison, deleteComparison } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Comparison | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseIds: [] as string[],
    notes: [] as { id: string; title: string; content: string }[],
  });

  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleCreate = () => {
    setEditingComp(null);
    setFormError(null);
    setFormData({
      title: '',
      description: '',
      caseIds: [],
      notes: [],
    });
    setDialogOpen(true);
  };

  const handleEdit = (comp: Comparison) => {
    setEditingComp(comp);
    setFormError(null);
    setFormData({
      title: comp.title,
      description: comp.description,
      caseIds: [...comp.caseIds],
      notes: [...comp.notes],
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleAddNote = () => {
    if (!newNote.title.trim()) return;
    setFormData((prev) => ({
      ...prev,
      notes: [...prev.notes, { id: crypto.randomUUID(), ...newNote }],
    }));
    setNewNote({ title: '', content: '' });
  };

  const handleRemoveNote = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  const handleCaseToggle = (caseId: string) => {
    setFormData((prev) => ({
      ...prev,
      caseIds: prev.caseIds.includes(caseId)
        ? prev.caseIds.filter((id) => id !== caseId)
        : [...prev.caseIds, caseId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('请填写对比标题');
      return;
    }
    if (formData.caseIds.length < 2) {
      setFormError('请至少选择2个案例');
      return;
    }

    const compData = {
      ...formData,
    };

    try {
      if (editingComp) {
        await updateComparison({
          ...editingComp,
          ...compData,
        });
      } else {
        await createComparison(compData);
      }
      setDialogOpen(false);
    } catch {
      setFormError('保存失败，请重试');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteComparison(deleteId);
      setDeleteId(null);
    }
  };

  const getCaseById = (id: string) => caseStudies.find((c) => c.id === id);

  const getRadarData = (caseItem: CaseStudy | undefined) => {
    if (!caseItem) return [];
    return Object.keys(dimensionLabels).map((key) => ({
      dimension: dimensionLabels[key as keyof typeof dimensionLabels],
      score: caseItem.dimensions[key as keyof typeof caseItem.dimensions],
      fullMark: 10,
    }));
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">比较研究</h1>
          <p className="text-slate-500 font-sans">
            横向对比不同街区和空间，整理优秀案例的学习笔记
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleCreate} className="btn-secondary">
            <Plus className="w-5 h-5" />
            新建对比
          </button>
        </div>
      </div>

      {comparisons.length === 0 ? (
        <EmptyState
          icon={<GitCompare className="w-10 h-10 text-slate-400" />}
          title="还没有比较研究"
          description="创建对比研究，横向分析多个街区或空间的设计特点。"
          actionLabel="新建对比"
          onAction={handleCreate}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {comparisons.map((comp, index) => {
            const cases = comp.caseIds.map(getCaseById).filter(Boolean) as CaseStudy[];

            return (
              <div
                key={comp.id}
                className={`card p-6 animate-fade-in-up stagger-${(index % 6) + 1}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-800 mb-1">
                      {comp.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-sans">{comp.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(comp)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(comp.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {cases.map((c, i) => (
                    <div key={c.id} className="flex items-center">
                      <span className="chip">{c.title}</span>
                      {i < cases.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 mx-1" />}
                    </div>
                  ))}
                </div>

                {cases.length >= 2 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {cases.slice(0, 2).map((caseItem) => (
                      <div key={caseItem.id} className="h-48 bg-slate-50 rounded-xl p-3">
                        <div className="text-xs font-semibold text-slate-500 mb-2 font-sans truncate">
                          {caseItem.title}
                        </div>
                        <ResponsiveContainer width="100%" height="85%">
                          <RadarChart data={getRadarData(caseItem)}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                              dataKey="dimension"
                              tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'Inter, sans-serif' }}
                            />
                            <PolarRadiusAxis
                              angle={30}
                              domain={[0, 10]}
                              tick={{ fill: '#94a3b8', fontSize: 8, fontFamily: 'Inter, sans-serif' }}
                            />
                            <Radar
                              name={caseItem.title}
                              dataKey="score"
                              stroke={cases.indexOf(caseItem) === 0 ? '#ea580c' : '#0d9488'}
                              fill={cases.indexOf(caseItem) === 0 ? '#ea580c' : '#0d9488'}
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                )}

                {comp.notes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 font-sans">
                      <BookOpen className="w-4 h-4" />
                      学习笔记 ({comp.notes.length})
                    </div>
                    {comp.notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-cream-50 rounded-lg border border-cream-100"
                      >
                        <div className="font-medium text-slate-700 font-sans text-sm mb-1">
                          {note.title}
                        </div>
                        <p className="text-sm text-slate-500 font-sans line-clamp-2">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {comparisons.map((comp, index) => {
            const cases = comp.caseIds.map(getCaseById).filter(Boolean) as CaseStudy[];

            return (
              <div
                key={comp.id}
                className={`card p-6 animate-fade-in-up stagger-${(index % 6) + 1}`}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-slate-800 mb-1">
                      {comp.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-sans">{comp.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {cases.map((c, i) => (
                        <div key={c.id} className="flex items-center">
                          <span className="chip">{c.title}</span>
                          {i < cases.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 mx-1" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip">{comp.notes.length} 笔记</span>
                    <button
                      onClick={() => handleEdit(comp)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(comp.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-[1000]" />
          <Dialog.Content className="fixed top-0 right-0 bottom-0 z-[1000] w-full max-w-2xl overflow-y-auto">
            <div className="bg-white min-h-full shadow-2xl p-6 animate-slide-in-right">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="font-display text-xl font-semibold text-slate-800">
                  {editingComp ? '编辑对比研究' : '新建对比研究'}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label-text">对比标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：历史街区 vs 现代商圈步行空间对比"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="label-text">对比描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="简要说明本次对比研究的目的和重点"
                    className="input-field min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <label className="label-text">选择案例（至少2个）</label>
                  <div className="grid grid-cols-2 gap-2">
                    {caseStudies.map((caseItem) => (
                      <button
                        key={caseItem.id}
                        type="button"
                        onClick={() => handleCaseToggle(caseItem.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.caseIds.includes(caseItem.id)
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {formData.caseIds.includes(caseItem.id) && (
                            <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 font-sans text-sm truncate">
                              {caseItem.title}
                            </div>
                            <div className="text-xs text-slate-500 font-sans truncate">
                              {caseItem.location}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < caseItem.rating
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-text mb-3">学习笔记</label>
                  <div className="space-y-3 mb-3">
                    <input
                      type="text"
                      placeholder="笔记标题"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="input-field"
                    />
                    <textarea
                      placeholder="笔记内容"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      className="input-field min-h-[80px] resize-none"
                    />
                    <button type="button" onClick={handleAddNote} className="btn-outline w-full">
                      <Plus className="w-4 h-4" />
                      添加笔记
                    </button>
                  </div>
                  {formData.notes.length > 0 && (
                    <div className="space-y-2">
                      {formData.notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-medium text-slate-700 font-sans text-sm mb-1">
                              {note.title}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveNote(note.id)}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-500 font-sans">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-sans flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="btn-outline text-sm py-2"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.title.trim() || formData.caseIds.length < 2}
                  >
                    {editingComp ? '保存修改' : '创建对比'}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除对比研究"
        description="删除此对比研究将同时删除关联的学习笔记。此操作无法撤销。"
        confirmLabel="删除对比"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
}
