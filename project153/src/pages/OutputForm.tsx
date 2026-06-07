import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Lightbulb,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  GripVertical
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import { OUTPUT_TYPE_LABELS, type Output } from '../../shared/types';

const OUTPUT_ICONS = {
  outline: BookOpen,
  argument: Lightbulb
};

export default function OutputForm() {
  const { id, mode } = useParams<{ id?: string; mode?: string }>();
  const navigate = useNavigate();
  const { addOutput, updateOutput, setLoading, loading, relics, notes } = useAppStore();
  const isEdit = !!id;
  const isNew = !id;

  const [formData, setFormData] = useState<Partial<Output>>({
    title: '',
    type: 'outline',
    relicIds: [],
    noteIds: [],
    content: {}
  });

  const [outlineSections, setOutlineSections] = useState<{ title: string; content: string; subsections: { title: string }[] }[]>([
    { title: '', content: '', subsections: [{ title: '' }] }
  ]);

  const [argumentPoints, setArgumentPoints] = useState<{ title: string; evidence: string; conclusion: string }[]>([
    { title: '', evidence: '', conclusion: '' }
  ]);

  useEffect(() => {
    if (relics.length === 0) {
      api.relics.getAll().then(data => useAppStore.getState().setRelics(data));
    }
    if (notes.length === 0) {
      api.notes.getAll().then(data => useAppStore.getState().setNotes(data));
    }
  }, [relics.length, notes.length]);

  useEffect(() => {
    if (id) {
      const loadOutput = async () => {
        try {
          setLoading(true);
          const data = await api.output.getById(id);
          setFormData(data);
          if (data.content) {
            if (data.type === 'outline' && data.content.sections) {
              setOutlineSections(data.content.sections as any);
            } else if (data.type === 'argument' && data.content.points) {
              setArgumentPoints(data.content.points as any);
            }
          }
        } catch (err: any) {
          alert(err.message);
          navigate('/outputs');
        } finally {
          setLoading(false);
        }
      };
      loadOutput();
    }
  }, [id, setLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('请输入成果标题');
      return;
    }

    let content: Record<string, unknown> = {};
    if (formData.type === 'outline') {
      content = { sections: outlineSections.filter(s => s.title.trim()) };
    } else if (formData.type === 'argument') {
      content = { points: argumentPoints.filter(p => p.title.trim()) };
    }

    const submitData = { ...formData, content };

    try {
      setLoading(true);
      if (isNew) {
        const newItem = await api.output.create(submitData);
        addOutput(newItem);
        navigate('/outputs');
      } else if (isEdit && id) {
        const updated = await api.output.update(id, submitData);
        updateOutput(updated);
        navigate('/outputs');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRelic = (relicId: string) => {
    setFormData(prev => ({
      ...prev,
      relicIds: prev.relicIds?.includes(relicId)
        ? prev.relicIds.filter(id => id !== relicId)
        : [...(prev.relicIds || []), relicId]
    }));
  };

  const toggleNote = (noteId: string) => {
    setFormData(prev => ({
      ...prev,
      noteIds: prev.noteIds?.includes(noteId)
        ? prev.noteIds.filter(id => id !== noteId)
        : [...(prev.noteIds || []), noteId]
    }));
  };

  if (loading && id) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  const TypeIcon = OUTPUT_ICONS[formData.type || 'outline'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/outputs')}
            className="p-2 rounded-lg hover:bg-accent-gold/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {isNew ? '新建成果输出' : '编辑成果输出'}
            </h1>
            <p className="text-ink-light">
              {OUTPUT_TYPE_LABELS[formData.type || 'outline']}
            </p>
          </div>
        </div>
        <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-border-gold p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">基本信息</h2>
          <div className="divider-gold mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="input-label">成果标题 *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="请输入成果标题"
              />
            </div>
            <div>
              <label className="input-label">成果类型</label>
              <div className="grid grid-cols-2 gap-2">
                {(['outline', 'argument'] as const).map(type => {
                  const Icon = OUTPUT_ICONS[type];
                  const selected = formData.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                        selected
                          ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                          : 'border-primary-200 hover:border-accent-gold/50 text-ink-light'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{OUTPUT_TYPE_LABELS[type]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="input-label">关联文物</label>
                <div className="max-h-[120px] overflow-y-auto border border-primary-200 rounded-lg p-2 space-y-1">
                  {relics.map(relic => {
                    const selected = formData.relicIds?.includes(relic.id);
                    return (
                      <button
                        key={relic.id}
                        type="button"
                        onClick={() => toggleRelic(relic.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                          selected ? 'bg-accent-gold/10 text-ink' : 'hover:bg-primary-50 text-ink-light'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${selected ? 'text-accent-gold' : 'opacity-30'}`} />
                        <span className="text-sm truncate">{relic.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="input-label">关联笔记</label>
                <div className="max-h-[120px] overflow-y-auto border border-primary-200 rounded-lg p-2 space-y-1">
                  {notes.map(note => {
                    const selected = formData.noteIds?.includes(note.id);
                    return (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => toggleNote(note.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                          selected ? 'bg-accent-gold/10 text-ink' : 'hover:bg-primary-50 text-ink-light'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${selected ? 'text-accent-gold' : 'opacity-30'}`} />
                        <span className="text-sm truncate">{note.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {formData.type === 'outline' && (
          <div className="card-border-gold p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-gold" />
                论文提纲
              </h2>
              <button
                type="button"
                onClick={() => setOutlineSections([...outlineSections, { title: '', content: '', subsections: [{ title: '' }] }])}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加章节
              </button>
            </div>
            <div className="divider-gold mb-6" />

            <div className="space-y-4">
              {outlineSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-2">
                      <GripVertical className="w-5 h-5 text-ink-light/50" />
                      <div className="w-8 h-8 rounded-full bg-gradient-gold text-white flex items-center justify-center text-sm font-bold mt-2">
                        {sectionIndex + 1}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => setOutlineSections(sections => sections.map((s, i) =>
                            i === sectionIndex ? { ...s, title: e.target.value } : s
                          ))}
                          className="input-field flex-1 font-semibold"
                          placeholder="章节标题"
                        />
                        {outlineSections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setOutlineSections(sections => sections.filter((_, i) => i !== sectionIndex))}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={section.content}
                        onChange={(e) => setOutlineSections(sections => sections.map((s, i) =>
                          i === sectionIndex ? { ...s, content: e.target.value } : s
                        ))}
                        className="input-field min-h-[60px]"
                        placeholder="章节内容概要..."
                      />
                      <div className="space-y-2">
                        {section.subsections.map((sub, subIndex) => (
                          <div key={subIndex} className="flex items-center gap-2 pl-4">
                            <span className="text-accent-gold font-mono text-sm">{sectionIndex + 1}.{subIndex + 1}</span>
                            <input
                              type="text"
                              value={sub.title}
                              onChange={(e) => {
                                const newSections = [...outlineSections];
                                newSections[sectionIndex].subsections[subIndex].title = e.target.value;
                                setOutlineSections(newSections);
                              }}
                              className="input-field flex-1 text-sm"
                              placeholder="小节标题"
                            />
                            {section.subsections.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSections = [...outlineSections];
                                  newSections[sectionIndex].subsections = section.subsections.filter((_, i) => i !== subIndex);
                                  setOutlineSections(newSections);
                                }}
                                className="p-1 hover:bg-red-50 rounded"
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newSections = [...outlineSections];
                            newSections[sectionIndex].subsections.push({ title: '' });
                            setOutlineSections(newSections);
                          }}
                          className="flex items-center gap-1 text-sm text-ink-light hover:text-accent-gold pl-4"
                        >
                          <Plus className="w-3 h-3" />
                          添加小节
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.type === 'argument' && (
          <div className="card-border-gold p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent-gold" />
                主要论点与证据链
              </h2>
              <button
                type="button"
                onClick={() => setArgumentPoints([...argumentPoints, { title: '', evidence: '', conclusion: '' }])}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加论点
              </button>
            </div>
            <div className="divider-gold mb-6" />

            <div className="space-y-4">
              {argumentPoints.map((point, pointIndex) => (
                <div key={pointIndex} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-teal text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      {pointIndex + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={point.title}
                          onChange={(e) => setArgumentPoints(points => points.map((p, i) =>
                            i === pointIndex ? { ...p, title: e.target.value } : p
                          ))}
                          className="input-field flex-1 font-semibold"
                          placeholder="论点标题"
                        />
                        {argumentPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setArgumentPoints(points => points.filter((_, i) => i !== pointIndex))}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="input-label text-sm">证据/论据</label>
                          <textarea
                            value={point.evidence}
                            onChange={(e) => setArgumentPoints(points => points.map((p, i) =>
                              i === pointIndex ? { ...p, evidence: e.target.value } : p
                            ))}
                            className="input-field min-h-[80px]"
                            placeholder="支持本论点的证据..."
                          />
                        </div>
                        <div>
                          <label className="input-label text-sm">结论/推导</label>
                          <textarea
                            value={point.conclusion}
                            onChange={(e) => setArgumentPoints(points => points.map((p, i) =>
                              i === pointIndex ? { ...p, conclusion: e.target.value } : p
                            ))}
                            className="input-field min-h-[80px]"
                            placeholder="从证据推导的结论..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
