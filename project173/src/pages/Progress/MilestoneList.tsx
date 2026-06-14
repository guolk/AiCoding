import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import dayjs from 'dayjs';
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore, useProjectById, useProjectMilestones } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { Modal, StatusBadge, ProgressBar, EmptyState, ConfirmDialog } from '@/components/UI';
import {
  type Milestone,
} from '@/types';

const statusIconMap: Record<string, { icon: typeof Circle; color: string }> = {
  completed: { icon: CheckCircle, color: 'text-primary-500 border-primary-500' },
  in_progress: { icon: Clock, color: 'text-blue-500 border-blue-500' },
  pending: { icon: Circle, color: 'text-gray-400 border-gray-400' },
  delayed: { icon: AlertCircle, color: 'text-red-500 border-red-500' },
};

const statusColorMap: Record<string, string> = {
  completed: 'bg-primary-500',
  in_progress: 'bg-blue-500',
  pending: 'bg-gray-400',
  delayed: 'bg-red-500',
};

interface MilestoneFormData {
  name: string;
  plannedDate: string;
  actualDate: string;
  status: Milestone['status'];
  progress: number;
  description: string;
}

const initialFormData: MilestoneFormData = {
  name: '',
  plannedDate: '',
  actualDate: '',
  status: 'pending',
  progress: 0,
  description: '',
};

export default function MilestoneList() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const {
    addMilestone,
    updateMilestone,
    deleteMilestone,
    setCurrentProjectId,
    initializeData,
  } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState<MilestoneFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<Milestone | null>(null);
  const [progressModal, setProgressModal] = useState<Milestone | null>(null);
  const [newProgress, setNewProgress] = useState(0);

  const project = useProjectById(projectId);
  const milestones = useProjectMilestones(projectId);

  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => 
      dayjs(a.plannedDate).valueOf() - dayjs(b.plannedDate).valueOf()
    );
  }, [milestones]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
    return () => {
      setCurrentProjectId(null);
    };
  }, [projectId, setCurrentProjectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入里程碑名称';
    if (!formData.plannedDate) newErrors.plannedDate = '请选择计划日期';
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = '进度必须在0-100之间';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        name: milestone.name,
        plannedDate: milestone.plannedDate,
        actualDate: milestone.actualDate || '',
        status: milestone.status,
        progress: milestone.progress,
        description: milestone.description,
      });
    } else {
      setEditingMilestone(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMilestone(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm() || !projectId) return;

    const milestoneData = {
      projectId,
      name: formData.name.trim(),
      plannedDate: formData.plannedDate,
      actualDate: formData.actualDate || null,
      status: formData.status,
      progress: formData.progress,
      description: formData.description.trim(),
    };

    if (editingMilestone) {
      updateMilestone(editingMilestone.id, milestoneData);
    } else {
      addMilestone(milestoneData);
    }

    handleCloseModal();
  };

  const handleDelete = (milestone: Milestone) => {
    deleteMilestone(milestone.id);
    setDeleteConfirm(null);
  };

  const handleOpenProgressModal = (milestone: Milestone) => {
    setProgressModal(milestone);
    setNewProgress(milestone.progress);
  };

  const handleUpdateProgress = () => {
    if (!progressModal) return;
    
    let newStatus: Milestone['status'] = progressModal.status;
    if (newProgress === 100) {
      newStatus = 'completed';
    } else if (newProgress > 0) {
      newStatus = 'in_progress';
    }

    updateMilestone(progressModal.id, {
      progress: newProgress,
      status: newStatus,
    });
    setProgressModal(null);
  };

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="项目不存在"
          description="该项目可能已被删除或不存在"
          action={
            <button onClick={() => navigate('/projects')} className="btn-primary">
              返回项目列表
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <StatusBadge status={project.status} type="project" />
              </div>
              <p className="mt-1 text-sm text-gray-500">{project.village} · 里程碑管理</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              新增里程碑
            </button>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">里程碑列表</h2>
              <p className="text-sm text-gray-500 mt-1">
                共 {sortedMilestones.length} 个里程碑
              </p>
            </div>
          </div>

          {sortedMilestones.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="暂无里程碑"
              description="点击右上角按钮添加项目里程碑"
            />
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-8">
                {sortedMilestones.map((milestone, index) => {
                  const IconComponent = statusIconMap[milestone.status].icon;
                  const iconColor = statusIconMap[milestone.status].color;
                  const lineColor = statusColorMap[milestone.status];
                  const isLast = index === sortedMilestones.length - 1;

                  return (
                    <div key={milestone.id} className="relative flex gap-4">
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border-2">
                        <IconComponent
                          size={16}
                          className={cn(iconColor.split(' ')[0])}
                        />
                      </div>

                      {!isLast && (
                        <div
                          className={cn(
                            'absolute left-4 top-8 w-0.5 -translate-x-1/2',
                            milestone.status === 'completed' ? lineColor : 'bg-gray-200'
                          )}
                          style={{ height: 'calc(100% + 32px)' }}
                        />
                      )}

                      <div className="flex-1 pb-8">
                        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="text-base font-semibold text-gray-900">
                                  {milestone.name}
                                </h4>
                                <StatusBadge status={milestone.status} type="milestone" />
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span>
                                  计划日期：{dayjs(milestone.plannedDate).format('YYYY-MM-DD')}
                                </span>
                                {milestone.actualDate && (
                                  <span>
                                    实际日期：{dayjs(milestone.actualDate).format('YYYY-MM-DD')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenProgressModal(milestone)}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="更新进度"
                              >
                                <RefreshCw size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenModal(milestone)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                title="编辑"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(milestone)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="删除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                完成进度
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {milestone.progress}%
                              </span>
                            </div>
                            <ProgressBar
                              value={milestone.progress}
                              color={
                                milestone.status === 'completed'
                                  ? 'green'
                                  : milestone.status === 'delayed'
                                  ? 'red'
                                  : milestone.status === 'in_progress'
                                  ? 'blue'
                                  : 'primary'
                              }
                              height={8}
                            />
                          </div>

                          {milestone.description && (
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingMilestone ? '编辑里程碑' : '新增里程碑'}
        size="lg"
        footer={
          <>
            <button onClick={handleCloseModal} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              {editingMilestone ? '保存修改' : '确认添加'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">
              里程碑名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn('input-field', errors.name && 'border-red-500')}
              placeholder="请输入里程碑名称"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                计划日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.plannedDate}
                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                className={cn('input-field', errors.plannedDate && 'border-red-500')}
              />
              {errors.plannedDate && (
                <p className="text-xs text-red-500 mt-1">{errors.plannedDate}</p>
              )}
            </div>
            <div>
              <label className="label">实际日期</label>
              <input
                type="date"
                value={formData.actualDate}
                onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">状态</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Milestone['status'],
                  })
                }
                className="input-field"
              >
                <option value="pending">待开始</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="delayed">已延期</option>
              </select>
            </div>
            <div>
              <label className="label">
                进度 (%) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })
                  }
                  className={cn(
                    'w-20 text-center input-field',
                    errors.progress && 'border-red-500'
                  )}
                />
              </div>
              {errors.progress && (
                <p className="text-xs text-red-500 mt-1">{errors.progress}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] resize-y"
              placeholder="请输入里程碑描述"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!progressModal}
        onClose={() => setProgressModal(null)}
        title="更新进度"
        size="md"
        footer={
          <>
            <button onClick={() => setProgressModal(null)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleUpdateProgress} className="btn-primary">
              确认更新
            </button>
          </>
        }
      >
        {progressModal && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {progressModal.name}
              </p>
              <p className="text-sm text-gray-500">
                当前进度：{progressModal.progress}%
              </p>
            </div>
            <div>
              <label className="label">新进度 (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value) || 0)}
                  className="w-20 text-center input-field"
                />
              </div>
            </div>
            <ProgressBar value={newProgress} color="primary" height={10} />
            <p className="text-sm text-gray-500">
              提示：进度为100%时状态将自动标记为"已完成"，进度大于0%时状态将自动标记为"进行中"
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="确认删除里程碑"
        message={`确定要删除里程碑"${deleteConfirm?.name}"吗？此操作无法恢复。`}
        confirmText="确认删除"
        cancelText="取消"
      />
    </div>
  );
}
