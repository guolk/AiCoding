import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Calendar, Filter, Search, CheckCircle2, Circle, X, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import StatusBadge from '../components/common/StatusBadge';
import { ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS } from '../utils/constants';
import { formatHours, formatDate } from '../utils/helpers';

const statusOptions: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'planning', label: PROJECT_STATUS_LABELS.planning },
  { value: 'in_progress', label: PROJECT_STATUS_LABELS['in_progress'] },
  { value: 'completed', label: PROJECT_STATUS_LABELS.completed },
];

export default function Projects() {
  const navigate = useNavigate();
  const { projects, searchQuery, addProject, sets } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    related_set_id: '',
    status: 'planning' as ProjectStatus,
    total_hours: 0,
  });

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch = !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getProjectProgress = (projectId: string) => {
    const steps = useAppStore.getState().getProjectSteps(projectId);
    if (steps.length === 0) return 0;
    const completed = steps.filter((s) => s.is_completed).length;
    return Math.round((completed / steps.length) * 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addProject({
      name: formData.name,
      description: formData.description,
      related_set_id: formData.related_set_id || undefined,
      status: formData.status,
      total_hours: formData.total_hours,
      design_documents: [],
      metadata: {},
      started_at: formData.status === 'in_progress' ? new Date().toISOString() : undefined,
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      description: '',
      related_set_id: '',
      status: 'planning',
      total_hours: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="brick-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-brick bg-purple-100 text-purple-600">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">规划中</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {projects.filter((p) => p.status === 'planning').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-brick bg-amber-100 text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">进行中</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {projects.filter((p) => p.status === 'in_progress').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-brick bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {projects.filter((p) => p.status === 'completed').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-brick bg-lego-blue/10 text-lego-blue">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">总搭建时长</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {formatHours(projects.reduce((sum, p) => sum + p.total_hours, 0))}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:border-lego-blue rounded-brick transition-all"
          >
            <Filter size={18} />
            <span>筛选</span>
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
            className="brick-input w-40"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            共 {filteredProjects.length} 个项目
          </span>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="brick-btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>创建项目</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProjects.map((project, index) => {
          const progress = getProjectProgress(project.id);
          const steps = useAppStore.getState().getProjectSteps(project.id);
          const completedSteps = steps.filter((s) => s.is_completed).length;

          return (
            <div
              key={project.id}
              className="brick-card p-5 cursor-pointer hover:shadow-lego-lg transition-all animate-slide-up group"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={project.status} type="project" />
                    <span className="text-xs text-gray-500">
                      {project.started_at ? formatDate(project.started_at) : '未开始'}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-lego-dark group-hover:text-lego-blue transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">进度</span>
                  <span className="font-medium text-lego-dark">
                    {completedSteps}/{steps.length} 步骤 · {progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      project.status === 'completed'
                        ? 'bg-emerald-500'
                        : project.status === 'in_progress'
                        ? 'bg-gradient-lego'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatHours(project.total_hours)}
                  </span>
                  {steps.length > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {completedSteps} 完成
                    </span>
                  )}
                </div>
                {project.status === 'in_progress' && steps.some((s) => !s.is_completed) && (
                  <span className="text-sm text-lego-blue group-hover:underline">
                    继续搭建 →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="brick-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-brick flex items-center justify-center">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-lego-dark mb-2">没有找到项目</h3>
          <p className="text-gray-500 mb-4">创建第一个MOC项目开始你的搭建之旅</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="brick-btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            <span>创建项目</span>
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-brick shadow-lego-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-display font-semibold text-lego-dark">创建新项目</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-brick transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="brick-input"
                  placeholder="如：城市消防站MOC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="brick-input resize-none"
                  rows={3}
                  placeholder="描述这个项目的搭建目标和想法..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联套装（可选）</label>
                <select
                  value={formData.related_set_id}
                  onChange={(e) => setFormData({ ...formData, related_set_id: e.target.value })}
                  className="brick-input"
                >
                  <option value="">不关联任何套装</option>
                  {sets.map((set) => (
                    <option key={set.id} value={set.id}>
                      {set.set_num} - {set.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">初始状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="brick-input"
                  >
                    <option value="planning">{PROJECT_STATUS_LABELS.planning}</option>
                    <option value="in_progress">{PROJECT_STATUS_LABELS['in_progress']}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预计工时（小时）</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.total_hours}
                    onChange={(e) => setFormData({ ...formData, total_hours: Number(e.target.value) })}
                    className="brick-input"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="brick-btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="brick-btn-primary flex items-center gap-2">
                  <Check size={16} />
                  创建项目
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
