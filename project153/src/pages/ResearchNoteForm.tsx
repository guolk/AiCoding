import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Users,
  Lightbulb,
  Plus,
  Trash2,
  Edit3,
  X,
  Tag,
  CheckCircle,
  AlertCircle,
  MinusCircle
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  ASPECT_LABELS,
  CONFIDENCE_LABELS,
  type ResearchNote,
  type Reference,
  type Viewpoint
} from '../../shared/types';

const CONFIDENCE_COLORS = {
  high: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-red-100 text-red-700 border-red-200'
};

const CONFIDENCE_ICONS = {
  high: CheckCircle,
  medium: AlertCircle,
  low: MinusCircle
};

export default function ResearchNoteForm() {
  const { id, mode } = useParams<{ id?: string; mode?: string }>();
  const navigate = useNavigate();
  const { addNote, updateNote, setLoading, loading, relics } = useAppStore();
  const isEdit = id && mode === 'edit';
  const isView = id && !mode;
  const isNew = !id;
  const [activeTab, setActiveTab] = useState<'references' | 'viewpoints' | 'insights'>('references');

  const [formData, setFormData] = useState<Partial<ResearchNote>>({
    title: '',
    content: '',
    relicId: '',
    personalInsights: '',
    tags: [],
    references: [],
    viewpoints: []
  });

  const [tagInput, setTagInput] = useState('');
  const [referenceDialog, setReferenceDialog] = useState<Partial<Reference> | null>(null);
  const [viewpointDialog, setViewpointDialog] = useState<Partial<Viewpoint> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'reference' | 'viewpoint'; id: string } | null>(null);

  useEffect(() => {
    if (relics.length === 0) {
      api.relics.getAll().then(data => useAppStore.getState().setRelics(data));
    }
  }, [relics.length]);

  useEffect(() => {
    if (id) {
      const loadNote = async () => {
        try {
          setLoading(true);
          const data = await api.notes.getById(id);
          setFormData(data);
        } catch (err: any) {
          alert(err.message);
          navigate('/notes');
        } finally {
          setLoading(false);
        }
      };
      loadNote();
    }
  }, [id, setLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('请输入笔记标题');
      return;
    }

    try {
      setLoading(true);
      if (isNew) {
        const newNote = await api.notes.create(formData);
        addNote(newNote);
        navigate(`/notes/${newNote.id}`);
      } else if (isEdit && id) {
        const updated = await api.notes.update(id, formData);
        updateNote(updated);
        navigate(`/notes/${id}`);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSaveReference = async () => {
    if (!referenceDialog?.title || !id && isView) return;

    try {
      if (referenceDialog.id) {
        await api.notes.updateReference(referenceDialog.id, referenceDialog);
        setFormData(prev => ({
          ...prev,
          references: prev.references?.map(r => r.id === referenceDialog.id ? { ...r, ...referenceDialog } as Reference : r) || []
        }));
      } else if (id) {
        const newRef = await api.notes.addReference(id, referenceDialog);
        setFormData(prev => ({
          ...prev,
          references: [...(prev.references || []), newRef]
        }));
      }
      setReferenceDialog(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveViewpoint = async () => {
    if (!viewpointDialog?.scholar || !id && isView) return;

    try {
      if (viewpointDialog.id) {
        await api.notes.updateViewpoint(viewpointDialog.id, viewpointDialog);
        setFormData(prev => ({
          ...prev,
          viewpoints: prev.viewpoints?.map(v => v.id === viewpointDialog.id ? { ...v, ...viewpointDialog } as Viewpoint : v) || []
        }));
      } else if (id) {
        const newVp = await api.notes.addViewpoint(id, viewpointDialog);
        setFormData(prev => ({
          ...prev,
          viewpoints: [...(prev.viewpoints || []), newVp]
        }));
      }
      setViewpointDialog(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirm || !id) return;

    try {
      if (deleteConfirm.type === 'reference') {
        await api.notes.deleteReference(deleteConfirm.id);
        setFormData(prev => ({
          ...prev,
          references: prev.references?.filter(r => r.id !== deleteConfirm.id) || []
        }));
      } else {
        await api.notes.deleteViewpoint(deleteConfirm.id);
        setFormData(prev => ({
          ...prev,
          viewpoints: prev.viewpoints?.filter(v => v.id !== deleteConfirm.id) || []
        }));
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && id) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  const relicName = relics.find(r => r.id === formData.relicId)?.name || '';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notes')}
            className="p-2 rounded-lg hover:bg-accent-gold/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {isNew ? '新建研究笔记' : isEdit ? '编辑研究笔记' : '研究笔记详情'}
            </h1>
            <p className="text-ink-light">
              {isNew ? '记录您的研究发现和思考' : formData.title}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isView && id && (
            <button
              onClick={() => navigate(`/notes/${id}/edit`)}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
          )}
          {!isView && (
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              保存
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-border-gold p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">基本信息</h2>
          <div className="divider-gold mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="input-label">笔记标题 *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                disabled={isView}
                className="input-field"
                placeholder="请输入笔记标题"
              />
            </div>
            <div>
              <label className="input-label">关联文物</label>
              <select
                value={formData.relicId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, relicId: e.target.value }))}
                disabled={isView}
                className="input-field"
              >
                <option value="">选择关联的文物</option>
                {relics.map(relic => (
                  <option key={relic.id} value={relic.id}>{relic.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label flex items-center gap-1">
                <Tag className="w-3 h-3" /> 标签
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  disabled={isView}
                  className="input-field flex-1"
                  placeholder="输入标签后回车"
                />
                {!isView && (
                  <button type="button" onClick={handleAddTag} className="btn-secondary px-4">
                    添加
                  </button>
                )}
              </div>
              {formData.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, i) => (
                    <span key={i} className="tag flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                      {!isView && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="input-label">研究内容摘要</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              disabled={isView}
              className="input-field min-h-[100px]"
              placeholder="简要描述本笔记的研究内容..."
            />
          </div>
        </div>

        {!isNew && (
          <div className="card-border-gold p-6">
            <div className="flex gap-2 mb-6 border-b border-primary-100 pb-2">
              {[
                { key: 'references', label: '参考文献', icon: BookOpen, count: formData.references?.length || 0 },
                { key: 'viewpoints', label: '研究观点', icon: Users, count: formData.viewpoints?.length || 0 },
                { key: 'insights', label: '个人见解', icon: Lightbulb }
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === key
                      ? 'bg-gradient-gold text-white shadow-md'
                      : 'text-ink hover:bg-accent-gold/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {typeof count === 'number' && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      activeTab === key ? 'bg-white/20' : 'bg-primary-100 text-ink-light'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'references' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent-gold" />
                    参考文献
                  </h3>
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setReferenceDialog({ noteId: id!, title: '', author: '', publication: '', year: new Date().getFullYear(), page: '', excerpt: '' })}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      添加文献
                    </button>
                  )}
                </div>

                {formData.references?.length ? (
                  <div className="space-y-3">
                    {formData.references.map((ref, index) => (
                      <div key={ref.id} className="card p-4 animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-ink">{ref.title}</h4>
                            <p className="text-sm text-ink-light mt-1">
                              {ref.author} · {ref.publication} · {ref.year}
                              {ref.page && ` · 第${ref.page}页`}
                            </p>
                            {ref.excerpt && (
                              <blockquote className="mt-3 pl-4 border-l-2 border-accent-gold/50 text-ink-light text-sm italic">
                                "{ref.excerpt}"
                              </blockquote>
                            )}
                          </div>
                          {!isView && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setReferenceDialog(ref)}
                                className="p-2 hover:bg-accent-gold/10 rounded-lg"
                              >
                                <Edit3 className="w-4 h-4 text-ink" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm({ type: 'reference', id: ref.id })}
                                className="p-2 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-ink-light">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无参考文献</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'viewpoints' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent-gold" />
                    研究观点对比
                  </h3>
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setViewpointDialog({ noteId: id!, scholar: '', aspect: 'dating', content: '', evidence: '', confidence: 'medium' })}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      添加观点
                    </button>
                  )}
                </div>

                {formData.viewpoints?.length ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {(['dating', 'usage', 'origin'] as const).map(aspect => {
                        const aspectViews = formData.viewpoints!.filter(v => v.aspect === aspect);
                        return (
                          <div key={aspect} className="card p-4">
                            <h4 className="font-semibold text-ink mb-3 text-accent-gold">
                              {ASPECT_LABELS[aspect]}
                            </h4>
                            {aspectViews.length ? (
                              <div className="space-y-3">
                                {aspectViews.map(view => {
                                  const ConfIcon = CONFIDENCE_ICONS[view.confidence];
                                  return (
                                    <div key={view.id} className="p-3 bg-primary-50 rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-ink">{view.scholar}</span>
                                        <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${CONFIDENCE_COLORS[view.confidence]}`}>
                                          <ConfIcon className="w-3 h-3" />
                                          {CONFIDENCE_LABELS[view.confidence]}
                                        </span>
                                      </div>
                                      <p className="text-sm text-ink">{view.content}</p>
                                      {view.evidence && (
                                        <p className="text-xs text-ink-light mt-2">证据：{view.evidence}</p>
                                      )}
                                      {!isView && (
                                        <div className="flex justify-end gap-1 mt-2">
                                          <button
                                            type="button"
                                            onClick={() => setViewpointDialog(view)}
                                            className="p-1 hover:bg-white/50 rounded"
                                          >
                                            <Edit3 className="w-3 h-3 text-ink" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setDeleteConfirm({ type: 'viewpoint', id: view.id })}
                                            className="p-1 hover:bg-red-100 rounded"
                                          >
                                            <Trash2 className="w-3 h-3 text-red-600" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-ink-light">暂无观点</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-ink-light">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无研究观点</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div>
                <h3 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent-gold" />
                  个人研究见解
                </h3>
                <textarea
                  value={formData.personalInsights || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalInsights: e.target.value }))}
                  disabled={isView}
                  className="input-field min-h-[300px]"
                  placeholder="记录您基于现有资料的独立判断和推断..."
                />
              </div>
            )}
          </div>
        )}
      </form>

      {referenceDialog && (
        <Dialog title={referenceDialog.id ? '编辑参考文献' : '添加参考文献'} onClose={() => setReferenceDialog(null)}>
          <div className="space-y-4">
            <div>
              <label className="input-label">文献标题 *</label>
              <input
                type="text"
                value={referenceDialog.title || ''}
                onChange={(e) => setReferenceDialog({ ...referenceDialog, title: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">作者 *</label>
                <input
                  type="text"
                  value={referenceDialog.author || ''}
                  onChange={(e) => setReferenceDialog({ ...referenceDialog, author: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">出版物</label>
                <input
                  type="text"
                  value={referenceDialog.publication || ''}
                  onChange={(e) => setReferenceDialog({ ...referenceDialog, publication: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">年份</label>
                <input
                  type="number"
                  value={referenceDialog.year || ''}
                  onChange={(e) => setReferenceDialog({ ...referenceDialog, year: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">页码</label>
                <input
                  type="text"
                  value={referenceDialog.page || ''}
                  onChange={(e) => setReferenceDialog({ ...referenceDialog, page: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="input-label">摘录内容</label>
              <textarea
                value={referenceDialog.excerpt || ''}
                onChange={(e) => setReferenceDialog({ ...referenceDialog, excerpt: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="重要的引用内容..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setReferenceDialog(null)} className="btn-secondary">
                取消
              </button>
              <button type="button" onClick={handleSaveReference} className="btn-primary">
                保存
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {viewpointDialog && (
        <Dialog title={viewpointDialog.id ? '编辑研究观点' : '添加研究观点'} onClose={() => setViewpointDialog(null)}>
          <div className="space-y-4">
            <div>
              <label className="input-label">学者/研究者 *</label>
              <input
                type="text"
                value={viewpointDialog.scholar || ''}
                onChange={(e) => setViewpointDialog({ ...viewpointDialog, scholar: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">研究方面</label>
                <select
                  value={viewpointDialog.aspect || 'dating'}
                  onChange={(e) => setViewpointDialog({ ...viewpointDialog, aspect: e.target.value as any })}
                  className="input-field"
                >
                  <option value="dating">{ASPECT_LABELS.dating}</option>
                  <option value="usage">{ASPECT_LABELS.usage}</option>
                  <option value="origin">{ASPECT_LABELS.origin}</option>
                </select>
              </div>
              <div>
                <label className="input-label">可信度</label>
                <select
                  value={viewpointDialog.confidence || 'medium'}
                  onChange={(e) => setViewpointDialog({ ...viewpointDialog, confidence: e.target.value as any })}
                  className="input-field"
                >
                  <option value="high">{CONFIDENCE_LABELS.high}</option>
                  <option value="medium">{CONFIDENCE_LABELS.medium}</option>
                  <option value="low">{CONFIDENCE_LABELS.low}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">观点内容</label>
              <textarea
                value={viewpointDialog.content || ''}
                onChange={(e) => setViewpointDialog({ ...viewpointDialog, content: e.target.value })}
                className="input-field min-h-[80px]"
                placeholder="该学者的主要观点..."
              />
            </div>
            <div>
              <label className="input-label">证据/依据</label>
              <textarea
                value={viewpointDialog.evidence || ''}
                onChange={(e) => setViewpointDialog({ ...viewpointDialog, evidence: e.target.value })}
                className="input-field min-h-[80px]"
                placeholder="支持该观点的证据..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setViewpointDialog(null)} className="btn-secondary">
                取消
              </button>
              <button type="button" onClick={handleSaveViewpoint} className="btn-primary">
                保存
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative card p-6 w-full max-w-md animate-fade-up">
            <h3 className="text-lg font-semibold text-ink mb-2">确认删除</h3>
            <p className="text-ink-light mb-6">
              删除{deleteConfirm.type === 'reference' ? '参考文献' : '研究观点'}后无法恢复，确定删除吗？
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleDeleteItem} className="btn-danger">
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Dialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-primary-100 rounded-lg">
            <X className="w-5 h-5 text-ink" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
