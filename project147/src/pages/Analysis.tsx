import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Plus, Edit2, Trash2, X, Check, AlertTriangle, Lamp, TreeDeciduous, Building2, MapPin, Users, Armchair, Star } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { elementCategoryLabels, severityLabels, scoreLabels, generateId } from '../../shared/types';
import type { SpatialAnalysis, SpatialElement, ProblemItem, ElementCategory, Severity, SpatialScores } from '../../shared/types';

const categoryIcons: Record<ElementCategory, React.ReactNode> = {
  furniture: <Armchair className="w-5 h-5" />,
  signage: <Lamp className="w-5 h-5" />,
  vegetation: <TreeDeciduous className="w-5 h-5" />,
  building: <Building2 className="w-5 h-5" />,
  activity: <Users className="w-5 h-5" />,
};

const severityColors: Record<Severity, string> = {
  low: 'bg-teal-100 text-teal-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export default function Analysis() {
  const { analyses, projects, activeProjectId, createAnalysis, updateAnalysis, deleteAnalysis } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<SpatialAnalysis | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    location: '',
    projectId: '',
    scores: { safety: 70, vitality: 70, accessibility: 70, comfort: 70 } as SpatialScores,
    elements: [] as SpatialElement[],
    problems: [] as ProblemItem[],
  });

  const [newElement, setNewElement] = useState({
    category: 'furniture' as ElementCategory,
    description: '',
    photo: '',
  });

  const [newProblem, setNewProblem] = useState({
    description: '',
    severity: 'medium' as Severity,
    suggestion: '',
  });

  const filteredAnalyses = activeProjectId
    ? analyses.filter((a) => a.projectId === activeProjectId)
    : analyses;

  const handleCreate = () => {
    setEditingAnalysis(null);
    setFormError(null);
    setFormData({
      location: '',
      projectId: activeProjectId || (projects[0]?.id ?? ''),
      scores: { safety: 70, vitality: 70, accessibility: 70, comfort: 70 },
      elements: [],
      problems: [],
    });
    setDialogOpen(true);
  };

  const handleEdit = (analysis: SpatialAnalysis) => {
    setEditingAnalysis(analysis);
    setFormError(null);
    setFormData({
      location: analysis.location,
      projectId: analysis.projectId,
      scores: { ...analysis.scores },
      elements: [...analysis.elements],
      problems: [...analysis.problems],
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleAddElement = () => {
    if (!newElement.description.trim()) return;
    const element: SpatialElement = {
      id: generateId(),
      category: newElement.category,
      description: newElement.description,
      photo: newElement.photo || undefined,
    };
    setFormData((prev) => ({
      ...prev,
      elements: [...prev.elements, element],
    }));
    setNewElement({ category: 'furniture', description: '', photo: '' });
  };

  const handleRemoveElement = (elementId: string) => {
    setFormData((prev) => ({
      ...prev,
      elements: prev.elements.filter((e) => e.id !== elementId),
    }));
  };

  const handleAddProblem = () => {
    if (!newProblem.description.trim()) return;
    const problem: ProblemItem = {
      id: generateId(),
      description: newProblem.description,
      severity: newProblem.severity,
      suggestion: newProblem.suggestion,
    };
    setFormData((prev) => ({
      ...prev,
      problems: [...prev.problems, problem],
    }));
    setNewProblem({ description: '', severity: 'medium', suggestion: '' });
  };

  const handleRemoveProblem = (problemId: string) => {
    setFormData((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p.id !== problemId),
    }));
  };

  const handleScoreChange = (key: keyof SpatialScores, value: number) => {
    setFormData((prev) => ({
      ...prev,
      scores: { ...prev.scores, [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.location.trim()) {
      setFormError('请填写分析地点');
      return;
    }
    if (!formData.projectId) {
      setFormError('请选择所属项目');
      return;
    }

    try {
      if (editingAnalysis) {
        await updateAnalysis({
          ...editingAnalysis,
          ...formData,
        });
      } else {
        await createAnalysis(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('保存失败:', error);
      setFormError('保存失败，请重试');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteAnalysis(deleteId);
      setDeleteId(null);
    }
  };

  const getAverageScore = (scores: SpatialScores) => {
    const values = Object.values(scores);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-teal-600';
    if (score >= 70) return 'text-clay-600';
    if (score >= 55) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-teal-100';
    if (score >= 70) return 'bg-clay-100';
    if (score >= 55) return 'bg-amber-100';
    return 'bg-red-100';
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">空间分析</h1>
          <p className="text-slate-500 font-sans">
            分类标注城市要素，评估空间品质，整理设计问题
          </p>
        </div>
        <button onClick={handleCreate} className="btn-secondary">
          <Plus className="w-5 h-5" />
          新建分析
        </button>
      </div>

      {filteredAnalyses.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-10 h-10 text-slate-400" />}
          title="还没有空间分析"
          description="开始分析城市空间品质，评估安全性、活力度、可达性和舒适度。"
          actionLabel="新建分析"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredAnalyses.map((analysis, index) => {
            const radarData = Object.entries(analysis.scores).map(([key, value]) => ({
              subject: scoreLabels[key as keyof SpatialScores],
              score: value,
              fullMark: 100,
            }));

            return (
              <div
                key={analysis.id}
                className={`card p-6 animate-fade-in-up stagger-${(index % 6) + 1}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-clay-600" />
                      <h3 className="font-display text-lg font-semibold text-slate-800">
                        {analysis.location}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 font-sans">
                      项目：{projects.find((p) => p.id === analysis.projectId)?.title || '未分类'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(analysis)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-sans text-sm font-semibold text-slate-600">综合评分</h4>
                      <div
                        className={`w-12 h-12 rounded-xl ${getScoreBg(getAverageScore(analysis.scores))} flex items-center justify-center`}
                      >
                        <span className={`font-display text-xl font-bold ${getScoreColor(getAverageScore(analysis.scores))}`}>
                          {getAverageScore(analysis.scores)}
                        </span>
                      </div>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
                          />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
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
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {Object.entries(analysis.scores).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-slate-500 font-sans">
                            {scoreLabels[key as keyof SpatialScores]}
                          </span>
                          <span className={`text-sm font-semibold ${getScoreColor(value)}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {analysis.elements.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="font-sans text-sm font-semibold text-slate-600 mb-3">城市要素标注</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.elements.map((element) => (
                        <div
                          key={element.id}
                          className="chip flex items-center gap-1.5 py-1.5"
                          title={element.description}
                        >
                          <span className="text-clay-600">{categoryIcons[element.category]}</span>
                          <span className="line-clamp-1">{elementCategoryLabels[element.category]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.problems.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="font-sans text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      问题清单 ({analysis.problems.length})
                    </h4>
                    <div className="space-y-2">
                      {analysis.problems.slice(0, 2).map((problem) => (
                        <div key={problem.id} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                          <span className={`chip ${severityColors[problem.severity]} flex-shrink-0`}>
                            {severityLabels[problem.severity]}
                          </span>
                          <p className="text-sm text-slate-600 font-sans line-clamp-1">
                            {problem.description}
                          </p>
                        </div>
                      ))}
                      {analysis.problems.length > 2 && (
                        <p className="text-xs text-slate-400 font-sans text-center">
                          还有 {analysis.problems.length - 2} 个问题
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
                  {editingAnalysis ? '编辑空间分析' : '新建空间分析'}
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
                    <label className="label-text">分析地点</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="例如：南京西路（陕西北路-石门一路）"
                      className="input-field"
                      autoFocus
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label-text">所属项目</label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="input-field"
                    >
                      <option value="">选择项目</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-text mb-3">空间品质评分</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(formData.scores) as Array<keyof SpatialScores>).map((key) => (
                      <div key={key} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-sans text-sm text-slate-600">{scoreLabels[key]}</span>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 cursor-pointer transition-colors ${
                                  formData.scores[key] >= star * 20
                                    ? 'text-clay-500 fill-clay-500'
                                    : 'text-slate-300'
                                }`}
                                onClick={() => handleScoreChange(key, star * 20)}
                              />
                            ))}
                            <span className={`text-sm font-semibold w-8 text-right ${getScoreColor(formData.scores[key])}`}>
                              {formData.scores[key]}
                            </span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.scores[key]}
                          onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-clay-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-text mb-3">城市要素分类标注</label>
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(elementCategoryLabels) as ElementCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewElement({ ...newElement, category: cat })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                            newElement.category === cat
                              ? 'border-clay-500 bg-clay-50 text-clay-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {categoryIcons[cat]}
                          <span className="text-sm font-sans">{elementCategoryLabels[cat]}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="要素描述"
                        value={newElement.description}
                        onChange={(e) => setNewElement({ ...newElement, description: e.target.value })}
                        className="input-field flex-1"
                      />
                      <input
                        type="text"
                        placeholder="图片URL（可选）"
                        value={newElement.photo}
                        onChange={(e) => setNewElement({ ...newElement, photo: e.target.value })}
                        className="input-field flex-1"
                      />
                      <button type="button" onClick={handleAddElement} className="btn-primary py-2">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {formData.elements.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.elements.map((element) => (
                        <div
                          key={element.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <span className="text-clay-600">{categoryIcons[element.category]}</span>
                          <span className="chip">{elementCategoryLabels[element.category]}</span>
                          <span className="flex-1 text-sm text-slate-600 font-sans">
                            {element.description}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveElement(element.id)}
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
                  <label className="label-text mb-3">问题清单</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="问题描述"
                        value={newProblem.description}
                        onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                        className="input-field col-span-1"
                      />
                      <select
                        value={newProblem.severity}
                        onChange={(e) => setNewProblem({ ...newProblem, severity: e.target.value as Severity })}
                        className="input-field"
                      >
                        <option value="low">轻微</option>
                        <option value="medium">中等</option>
                        <option value="high">严重</option>
                      </select>
                      <input
                        type="text"
                        placeholder="改进建议"
                        value={newProblem.suggestion}
                        onChange={(e) => setNewProblem({ ...newProblem, suggestion: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <button type="button" onClick={handleAddProblem} className="btn-outline w-full">
                      <Plus className="w-4 h-4" />
                      添加问题
                    </button>
                  </div>
                  {formData.problems.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.problems.map((problem) => (
                        <div
                          key={problem.id}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <span className={`chip ${severityColors[problem.severity]} flex-shrink-0`}>
                            {severityLabels[problem.severity]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 font-sans">{problem.description}</p>
                            {problem.suggestion && (
                              <p className="text-xs text-slate-500 font-sans mt-1">
                                建议：{problem.suggestion}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProblem(problem.id)}
                            className="p-1 text-slate-400 hover:text-red-500 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
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
                    disabled={!formData.location.trim() || !formData.projectId}
                  >
                    {editingAnalysis ? '保存修改' : '创建分析'}
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
        title="确认删除空间分析"
        description="删除此空间分析将同时删除关联的要素标注和问题清单。此操作无法撤销。"
        confirmLabel="删除分析"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
}
