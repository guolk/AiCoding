import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import {
  StatusBadge,
  EmptyState,
  Modal,
  ConfirmDialog,
  Timeline,
} from '@/components/UI';
import type { TimelineItem } from '@/components/UI/Timeline';
import {
  IssueTypeMap,
  IssueLevelMap,
  IssueStatusMap,
} from '@/types';
import type { Issue } from '@/types';

interface FilterState {
  type: string;
  level: string;
  status: string;
}

interface IssueFormData {
  title: string;
  type: 'policy' | 'fund' | 'participation' | 'technology' | 'other';
  level: 'high' | 'medium' | 'low';
  description: string;
}

interface HistoryFormData {
  action: string;
  operator: string;
  remarks: string;
}

export default function IssueList() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const {
    getProjectById,
    getProjectIssues,
    setCurrentProjectId,
    loading,
    initializeData,
    addIssue,
    updateIssue,
    addIssueHistory,
    deleteIssue,
  } = useProjectStore();

  const project = projectId ? getProjectById(projectId) : undefined;
  const issues = projectId ? getProjectIssues(projectId) : [];

  const [filters, setFilters] = useState<FilterState>({
    type: '',
    level: '',
    status: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Issue | null>(null);

  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    type: 'policy',
    level: 'medium',
    description: '',
  });

  const [historyForm, setHistoryForm] = useState<HistoryFormData>({
    action: '',
    operator: '',
    remarks: '',
  });

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

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (filters.type && issue.type !== filters.type) return false;
      if (filters.level && issue.level !== filters.level) return false;
      if (filters.status && issue.status !== filters.status) return false;
      return true;
    });
  }, [issues, filters]);

  const getStatusFlow = (currentStatus: string) => {
    const flows: Record<string, string[]> = {
      open: ['processing'],
      processing: ['resolved'],
      resolved: ['closed'],
      closed: [],
    };
    return flows[currentStatus] || [];
  };

  const getStatusActionLabel = (status: string) => {
    const labels: Record<string, string> = {
      processing: '开始处理',
      resolved: '标记解决',
      closed: '关闭问题',
    };
    return labels[status] || status;
  };

  const handleStatusChange = (issue: Issue, nextStatus: 'processing' | 'resolved' | 'closed') => {
    const actionMap: Record<string, string> = {
      processing: '开始处理',
      resolved: '标记解决',
      closed: '关闭问题',
    };

    updateIssue(issue.id, {
      status: nextStatus,
      resolveTime: nextStatus === 'resolved' ? dayjs().format('YYYY-MM-DD') : undefined,
    });

    addIssueHistory(issue.id, {
      issueId: issue.id,
      action: actionMap[nextStatus] || '状态更新',
      operator: '当前用户',
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      remarks: `状态从 ${IssueStatusMap[issue.status]} 变为 ${IssueStatusMap[nextStatus]}`,
    });
  };

  const handleAddIssue = () => {
    if (!projectId) return;

    if (editingIssue) {
      updateIssue(editingIssue.id, {
        title: formData.title,
        type: formData.type,
        level: formData.level,
        description: formData.description,
      });

      addIssueHistory(editingIssue.id, {
        issueId: editingIssue.id,
        action: '编辑问题',
        operator: '当前用户',
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        remarks: '更新了问题信息',
      });
    } else {
      addIssue({
        ...formData,
        projectId,
        status: 'open',
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteIssue = (issue: Issue) => {
    deleteIssue(issue.id);
    setDeleteConfirm(null);
    if (expandedId === issue.id) {
      setExpandedId(null);
    }
  };

  const handleAddHistory = () => {
    if (!selectedIssue) return;

    addIssueHistory(selectedIssue.id, {
      issueId: selectedIssue.id,
      action: historyForm.action,
      operator: historyForm.operator || '当前用户',
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      remarks: historyForm.remarks,
    });

    setIsHistoryModalOpen(false);
    setHistoryForm({ action: '', operator: '', remarks: '' });
  };

  const openEditModal = (issue: Issue) => {
    setEditingIssue(issue);
    setFormData({
      title: issue.title,
      type: issue.type,
      level: issue.level,
      description: issue.description,
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingIssue(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openHistoryModal = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsHistoryModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'policy',
      level: 'medium',
      description: '',
    });
  };

  const getHistoryTimeline = (issue: Issue): TimelineItem[] => {
    const items: TimelineItem[] = [];

    items.push({
      date: dayjs(issue.createTime).format('YYYY-MM-DD HH:mm'),
      title: '问题创建',
      description: issue.description,
      status: 'open',
      type: 'issue',
    });

    const sortedHistory = [...issue.history].sort(
      (a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf()
    );

    sortedHistory.forEach((h) => {
      items.push({
        date: dayjs(h.time).format('YYYY-MM-DD HH:mm'),
        title: h.action,
        description: h.remarks,
        status: 'processing',
        type: 'issue',
      });
    });

    return items;
  };



  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
              <p className="mt-1 text-sm text-gray-500">{project.village} · 问题管理</p>
            </div>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Filter size={18} />
                <span className="text-sm font-medium">筛选：</span>
              </div>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="input-field text-sm py-1.5 w-auto min-w-[120px]"
              >
                <option value="">全部类型</option>
                {Object.entries(IssueTypeMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="input-field text-sm py-1.5 w-auto min-w-[100px]"
              >
                <option value="">全部等级</option>
                {Object.entries(IssueLevelMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field text-sm py-1.5 w-auto min-w-[120px]"
              >
                <option value="">全部状态</option>
                {Object.entries(IssueStatusMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              新增问题
            </button>
          </div>

          <div className="space-y-0">
            {filteredIssues.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="暂无问题记录"
                description="点击右上角新增问题按钮添加问题"
              />
            ) : (
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                >
                  <div
                    className="grid grid-cols-[40px_1fr_repeat(4,auto)_160px] items-center gap-4 px-4 py-3"
                    onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(expandedId === issue.id ? null : issue.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedId === issue.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <span className="font-medium text-gray-900">{issue.title}</span>
                    <span className="text-sm text-gray-600">{IssueTypeMap[issue.type]}</span>
                    <StatusBadge status={issue.level} type="level" />
                    <StatusBadge status={issue.status} type="issue" />
                    <span className="text-sm text-gray-500">
                      {dayjs(issue.createTime).format('YYYY-MM-DD')}
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(issue)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openHistoryModal(issue)}
                        className="p-1.5 text-green-500 hover:bg-green-50 rounded transition-colors"
                        title="添加处理记录"
                      >
                        <Clock size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(issue)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedId === issue.id && (
                    <div className="px-8 pb-6 pt-2 bg-gray-50/50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">问题描述</h4>
                          <p className="text-sm text-gray-600 bg-white rounded-lg p-4 border border-gray-100">
                            {issue.description || '暂无描述'}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-4">
                            {getStatusFlow(issue.status).map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() =>
                                  handleStatusChange(
                                    issue,
                                    nextStatus as 'processing' | 'resolved' | 'closed'
                                  )
                                }
                                className="btn-primary text-sm py-1.5"
                              >
                                {getStatusActionLabel(nextStatus)}
                              </button>
                            ))}
                            <button
                              onClick={() => openHistoryModal(issue)}
                              className="btn-secondary text-sm py-1.5"
                            >
                              添加处理记录
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">处理历史</h4>
                          <div className="bg-white rounded-lg p-4 border border-gray-100 max-h-80 overflow-y-auto">
                            <Timeline items={getHistoryTimeline(issue)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIssue ? '编辑问题' : '新增问题'}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddIssue} className="btn-primary">
              {editingIssue ? '保存修改' : '创建问题'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">问题标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="请输入问题标题"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">问题类型</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as IssueFormData['type'],
                  })
                }
                className="input-field"
              >
                {Object.entries(IssueTypeMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">问题等级</label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as IssueFormData['level'],
                  })
                }
                className="input-field"
              >
                {Object.entries(IssueLevelMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">问题描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[120px] resize-y"
              placeholder="请详细描述问题情况..."
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="添加处理记录"
        size="md"
        footer={
          <>
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddHistory} className="btn-primary">
              添加记录
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">操作类型</label>
            <input
              type="text"
              value={historyForm.action}
              onChange={(e) => setHistoryForm({ ...historyForm, action: e.target.value })}
              className="input-field"
              placeholder="如：现场排查、协调资源、技术指导等"
            />
          </div>
          <div>
            <label className="label">处理人</label>
            <input
              type="text"
              value={historyForm.operator}
              onChange={(e) => setHistoryForm({ ...historyForm, operator: e.target.value })}
              className="input-field"
              placeholder="默认为当前用户"
            />
          </div>
          <div>
            <label className="label">处理备注</label>
            <textarea
              value={historyForm.remarks}
              onChange={(e) => setHistoryForm({ ...historyForm, remarks: e.target.value })}
              className="input-field min-h-[100px] resize-y"
              placeholder="请描述处理过程和结果..."
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteIssue(deleteConfirm)}
        title="确认删除"
        message={
          <p>
            确定要删除问题 <span className="font-semibold text-gray-900">"{deleteConfirm?.title}"</span> 吗？
            此操作无法撤销。
          </p>
        }
        confirmText="删除"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}
