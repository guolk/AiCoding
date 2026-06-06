import { useState } from 'react';
import { Plus, MapPin, Building2, Users, GitCompare, TrendingUp, Clock, BookOpen } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore } from '../store/useStore';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Project } from '../../shared/types';

export default function Home() {
  const {
    projects,
    observations,
    analyses,
    pedestrianStudies,
    comparisons,
    caseStudies,
    createProject,
    updateProject,
    deleteProject,
  } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleCreate = () => {
    setEditingProject(null);
    setFormData({ title: '', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ title: project.title, description: project.description });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingProject) {
      await updateProject({
        ...editingProject,
        title: formData.title,
        description: formData.description,
      });
    } else {
      await createProject(formData);
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteProject(deleteId);
      setDeleteId(null);
    }
  };

  const stats = [
    { label: '观察记录', value: observations.length, icon: MapPin, color: 'text-clay-600', bg: 'bg-clay-100' },
    { label: '空间分析', value: analyses.length, icon: Building2, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: '行人研究', value: pedestrianStudies.length, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: '比较研究', value: comparisons.length, icon: GitCompare, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '优秀案例', value: caseStudies.length, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: '研究项目', value: projects.length, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  const recentItems = [
    ...observations.slice(-3).map((o) => ({
      id: o.id,
      title: o.title,
      type: '观察记录' as const,
      date: o.observationTime,
      icon: MapPin,
      color: 'bg-clay-100 text-clay-600',
    })),
    ...analyses.slice(-2).map((a) => ({
      id: a.id,
      title: a.location,
      type: '空间分析' as const,
      date: new Date().toISOString(),
      icon: Building2,
      color: 'bg-teal-100 text-teal-600',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-full">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 noise-overlay pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-clay-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative page-container py-12">
          <div className="max-w-3xl animate-fade-in-down">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
              记录城市，
              <span className="text-gradient">理解空间</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 font-sans max-w-2xl">
              专业的城市观察与街区研究工具，帮助您系统化地记录、分析和对比城市空间品质。
              从地理位置到行人行为，从空间品质到案例对比，一站式完成您的田野调查。
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleCreate} className="btn-secondary text-base px-6 py-3">
                <Plus className="w-5 h-5" />
                创建新项目
              </button>
              <button
                onClick={() => (window.location.href = '/observations')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-all duration-200"
              >
                浏览记录
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`card p-4 animate-fade-in-up stagger-${index + 1}`}
              >
                <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-display font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500 font-sans">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">研究项目</h2>
              <button onClick={handleCreate} className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                新建项目
              </button>
            </div>

            {projects.length === 0 ? (
              <EmptyState
                title="还没有研究项目"
                description="创建您的第一个城市研究项目，开始记录观察和分析。"
                actionLabel="创建项目"
                onAction={handleCreate}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    observationCount={observations.filter((o) => o.projectId === project.id).length}
                    analysisCount={analyses.filter((a) => a.projectId === project.id).length}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="section-title mb-6">最近活动</h2>
            <div className="card overflow-hidden">
              {recentItems.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-sans">暂无活动记录</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.id}
                        className={`p-4 hover:bg-slate-50 transition-colors animate-fade-in stagger-${index + 1}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 line-clamp-1">{item.title}</p>
                            <p className="text-sm text-slate-500 font-sans">{item.type}</p>
                            <p className="text-xs text-slate-400 font-sans mt-1">
                              {new Date(item.date).toLocaleDateString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-6 card p-5 bg-gradient-to-br from-teal-50 to-cream-100 border-teal-200">
              <h3 className="font-display font-semibold text-slate-800 mb-2">研究提示</h3>
              <p className="text-sm text-slate-600 font-sans mb-3">
                开始您的城市观察之旅，建议按以下步骤进行：
              </p>
              <ol className="text-sm text-slate-600 font-sans space-y-1.5">
                <li className="flex gap-2">
                  <span className="text-teal-600 font-semibold">1.</span>
                  创建研究项目并设定研究目标
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-600 font-semibold">2.</span>
                  进行实地观察，记录位置和多媒体内容
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-600 font-semibold">3.</span>
                  分析空间要素，评估空间品质
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-600 font-semibold">4.</span>
                  观察行人活动，记录流量和路径
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-600 font-semibold">5.</span>
                  对比不同案例，总结设计经验
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
            <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 animate-scale-in">
              <Dialog.Title className="font-display text-xl font-semibold text-slate-800 mb-2">
                {editingProject ? '编辑项目' : '创建新项目'}
              </Dialog.Title>
              <Dialog.Description className="text-slate-500 font-sans mb-6">
                {editingProject
                  ? '修改项目的基本信息。'
                  : '开始一个新的城市研究项目，记录您的观察和分析。'}
              </Dialog.Description>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label-text">项目名称</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：南京西路历史街区研究"
                    className="input-field"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label-text">项目描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="简要描述您的研究目标和范围..."
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="btn-outline text-sm py-2"
                  >
                    取消
                  </button>
                  <button type="submit" className="btn-primary text-sm py-2">
                    {editingProject ? '保存修改' : '创建项目'}
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
        title="确认删除项目"
        description="删除项目将同时删除该项目下的所有观察记录、空间分析、行人研究和比较数据。此操作无法撤销。"
        confirmLabel="删除项目"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
}
