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
  BookOpen,
  Star,
  MapPin,
  ExternalLink,
  Award,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import { useStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { dimensionLabels, generateId } from '../../shared/types';
import type { CaseStudy } from '../../shared/types';

export default function Cases() {
  const { caseStudies, projects, createCaseStudy, updateCaseStudy, deleteCaseStudy } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailCase, setDetailCase] = useState<CaseStudy | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    rating: 4,
    sourceUrl: '',
    dimensions: {
      safety: 7,
      liveliness: 7,
      accessibility: 7,
      comfort: 7,
    },
    highlights: [] as { id: string; content: string }[],
    improvements: [] as { id: string; content: string }[],
    projectId: '',
  });

  const [newHighlight, setNewHighlight] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  const handleCreate = () => {
    setEditingCase(null);
    setFormData({
      title: '',
      location: '',
      description: '',
      rating: 4,
      sourceUrl: '',
      dimensions: { safety: 7, liveliness: 7, accessibility: 7, comfort: 7 },
      highlights: [],
      improvements: [],
      projectId: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (caseItem: CaseStudy) => {
    setEditingCase(caseItem);
    setFormData({
      title: caseItem.title,
      location: caseItem.location,
      description: caseItem.description,
      rating: caseItem.rating,
      sourceUrl: caseItem.sourceUrl || '',
      dimensions: { ...caseItem.dimensions },
      highlights: [...caseItem.highlights],
      improvements: [...caseItem.improvements],
      projectId: caseItem.projectId || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, { id: generateId(), content: newHighlight }],
    }));
    setNewHighlight('');
  };

  const handleRemoveHighlight = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((h) => h.id !== id),
    }));
  };

  const handleAddImprovement = () => {
    if (!newImprovement.trim()) return;
    setFormData((prev) => ({
      ...prev,
      improvements: [...prev.improvements, { id: generateId(), content: newImprovement }],
    }));
    setNewImprovement('');
  };

  const handleRemoveImprovement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      improvements: prev.improvements.filter((i) => i.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim()) return;

    if (editingCase) {
      await updateCaseStudy({
        ...editingCase,
        ...formData,
      });
    } else {
      await createCaseStudy(formData);
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteCaseStudy(deleteId);
      setDeleteId(null);
    }
  };

  const getRadarData = (dimensions: CaseStudy['dimensions']) => {
    return Object.keys(dimensionLabels).map((key) => ({
      dimension: dimensionLabels[key as keyof typeof dimensionLabels],
      score: dimensions[key as keyof typeof dimensions],
      fullMark: 10,
    }));
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">优秀案例库</h1>
          <p className="text-slate-500 font-sans">
            收藏和学习国内外优秀的城市设计案例
          </p>
        </div>
        <button onClick={handleCreate} className="btn-secondary">
          <Plus className="w-5 h-5" />
          添加案例
        </button>
      </div>

      {caseStudies.length === 0 ? (
        <EmptyState
          icon={<Award className="w-10 h-10 text-slate-400" />}
          title="还没有案例"
          description="添加优秀的城市设计案例，建立您的学习资料库。"
          actionLabel="添加案例"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((caseItem, index) => (
            <div
              key={caseItem.id}
              className={`card p-6 animate-fade-in-up stagger-${(index % 6) + 1} group cursor-pointer hover:shadow-lg transition-shadow`}
              onClick={() => setDetailCase(caseItem)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-slate-800 mb-1 line-clamp-1">
                    {caseItem.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-sans">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{caseItem.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < caseItem.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="h-40 bg-slate-50 rounded-xl p-3 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData(caseItem.dimensions)}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 10]}
                      tick={{ fill: '#94a3b8', fontSize: 8, fontFamily: 'Inter, sans-serif' }}
                    />
                    <Radar
                      name="评分"
                      dataKey="score"
                      stroke="#ea580c"
                      fill="#ea580c"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-sm text-slate-600 font-sans line-clamp-2 mb-4">
                {caseItem.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  {caseItem.highlights.length > 0 && (
                    <span className="chip text-xs">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      {caseItem.highlights.length} 亮点
                    </span>
                  )}
                  {caseItem.improvements.length > 0 && (
                    <span className="chip text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {caseItem.improvements.length} 可改进
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {caseItem.sourceUrl && (
                    <a
                      href={caseItem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(caseItem)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(caseItem.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-[1000]" />
          <Dialog.Content className="fixed top-0 right-0 bottom-0 z-[1000] w-full max-w-2xl overflow-y-auto">
            <div className="bg-white min-h-full shadow-2xl p-6 animate-slide-in-right">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="font-display text-xl font-semibold text-slate-800">
                  {editingCase ? '编辑案例' : '添加案例'}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label-text">案例名称</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="例如：巴塞罗那超级街区"
                      className="input-field"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label-text">所在城市</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="例如：西班牙巴塞罗那"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-text">所属项目</label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="input-field"
                    >
                      <option value="">通用案例</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="label-text">案例描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="描述这个案例的设计理念、特点和值得学习的地方"
                      className="input-field min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label-text">参考链接</label>
                    <input
                      type="url"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://..."
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">综合评分</label>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: i + 1 })}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            i < formData.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-text mb-3">空间品质评分</label>
                  <div className="space-y-4">
                    {(Object.keys(dimensionLabels) as Array<keyof typeof dimensionLabels>).map((key) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600 font-sans">
                            {dimensionLabels[key]}
                          </span>
                          <span className="text-sm font-semibold text-slate-800 font-mono">
                            {formData.dimensions[key]} / 10
                          </span>
                        </div>
                        <Slider.Root
                          className="relative flex items-center select-none touch-none w-full h-5"
                          value={[formData.dimensions[key]]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                [key]: value[0],
                              },
                            })
                          }
                        >
                          <Slider.Track className="bg-slate-200 relative grow rounded-full h-1.5">
                            <Slider.Range className="absolute bg-clay-500 rounded-full h-full" />
                          </Slider.Track>
                          <Slider.Thumb
                            className="block w-5 h-5 bg-white shadow-md border-2 border-clay-500 rounded-full hover:bg-clay-50 focus:outline-none focus:ring-2 focus:ring-clay-500 focus:ring-offset-2"
                            aria-label={dimensionLabels[key]}
                          />
                        </Slider.Root>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-text mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-teal-600" />
                    设计亮点
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="例如：人性化的街道家具设计"
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      className="input-field"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                    />
                    <button type="button" onClick={handleAddHighlight} className="btn-primary py-2">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.highlights.length > 0 && (
                    <div className="space-y-2">
                      {formData.highlights.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-100"
                        >
                          <Lightbulb className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          <span className="text-sm text-slate-700 font-sans flex-1">{h.content}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(h.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label-text mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    可改进之处
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="例如：夜间照明可以进一步优化"
                      value={newImprovement}
                      onChange={(e) => setNewImprovement(e.target.value)}
                      className="input-field"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImprovement())}
                    />
                    <button type="button" onClick={handleAddImprovement} className="btn-primary py-2">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.improvements.length > 0 && (
                    <div className="space-y-2">
                      {formData.improvements.map((i) => (
                        <div
                          key={i.id}
                          className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="text-sm text-slate-700 font-sans flex-1">{i.content}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImprovement(i.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="btn-outline text-sm py-2"
                  >
                    取消
                  </button>
                  <button type="submit" className="btn-primary text-sm py-2">
                    {editingCase ? '保存修改' : '添加案例'}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={detailCase !== null} onOpenChange={(open) => !open && setDetailCase(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-[1000]" />
          <Dialog.Content className="fixed inset-0 z-[1000] overflow-y-auto m-4 md:m-8 rounded-2xl">
            <div className="bg-white min-h-full shadow-2xl p-8 animate-scale-in">
              {detailCase && (
                <>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-clay-500" />
                        <Dialog.Title className="font-display text-2xl font-bold text-slate-800">
                          {detailCase.title}
                        </Dialog.Title>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 font-sans">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {detailCase.location}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < detailCase.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        {detailCase.sourceUrl && (
                          <a
                            href={detailCase.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-teal-600 hover:text-teal-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            查看来源
                          </a>
                        )}
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-800 mb-4">空间品质评估</h3>
                      <div className="h-80 bg-slate-50 rounded-xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={getRadarData(detailCase.dimensions)}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                              dataKey="dimension"
                              tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
                            />
                            <PolarRadiusAxis
                              angle={30}
                              domain={[0, 10]}
                              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                            />
                            <Radar
                              name="评分"
                              dataKey="score"
                              stroke="#ea580c"
                              fill="#ea580c"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-800 mb-4">案例描述</h3>
                      <p className="text-slate-600 font-serif leading-relaxed mb-6">
                        {detailCase.description}
                      </p>

                      <h4 className="font-sans text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-teal-600" />
                        设计亮点
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {detailCase.highlights.map((h) => (
                          <li key={h.id} className="flex items-start gap-2 text-sm text-slate-600 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                            {h.content}
                          </li>
                        ))}
                      </ul>

                      <h4 className="font-sans text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        可改进之处
                      </h4>
                      <ul className="space-y-2">
                        {detailCase.improvements.map((i) => (
                          <li key={i.id} className="flex items-start gap-2 text-sm text-slate-600 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                            {i.content}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Dialog.Close asChild>
                      <button className="btn-secondary">
                        关闭
                      </button>
                    </Dialog.Close>
                  </div>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除案例"
        description="删除此案例将同时删除关联的亮点和改进建议。此操作无法撤销。"
        confirmLabel="删除案例"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
}
