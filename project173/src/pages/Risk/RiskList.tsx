import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import dayjs from 'dayjs';
import {
  AlertTriangle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  User,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Filter,
} from 'lucide-react';
import { useProjectStore, useProjectById, useProjectRisks } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import {
  StatusBadge,
  EmptyState,
  Modal,
  ConfirmDialog,
} from '@/components/UI';
import {
  RiskTypeMap,
  RiskLevelMap,
  RiskStatusMap,
} from '@/types';
import type { Risk, RiskMeasure } from '@/types';

interface FilterState {
  type: string;
  level: string;
  status: string;
}

interface RiskFormData {
  title: string;
  type: 'policy' | 'economic' | 'natural' | 'social' | 'other';
  level: 'high' | 'medium' | 'low';
  description: string;
  impactAnalysis: string;
}

interface MeasureFormData {
  measure: string;
  responsiblePerson: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export default function RiskList() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const {
    setCurrentProjectId,
    initializeData,
    addRisk,
    updateRisk,
    addRiskMeasure,
    updateRiskMeasure,
    deleteRisk,
  } = useProjectStore();

  const project = useProjectById(projectId);
  const risks = useProjectRisks(projectId);

  const [filters, setFilters] = useState<FilterState>({
    type: '',
    level: '',
    status: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedMeasures, setExpandedMeasures] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Risk | null>(null);

  const [formData, setFormData] = useState<RiskFormData>({
    title: '',
    type: 'policy',
    level: 'medium',
    description: '',
    impactAnalysis: '',
  });

  const [measureForm, setMeasureForm] = useState<MeasureFormData>({
    measure: '',
    responsiblePerson: '',
    deadline: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    status: 'pending',
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

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      if (filters.type && risk.type !== filters.type) return false;
      if (filters.level && risk.level !== filters.level) return false;
      if (filters.status && risk.status !== filters.status) return false;
      return true;
    });
  }, [risks, filters]);

  const highRisks = useMemo(() => filteredRisks.filter((r) => r.level === 'high'), [filteredRisks]);
  const mediumRisks = useMemo(() => filteredRisks.filter((r) => r.level === 'medium'), [filteredRisks]);
  const lowRisks = useMemo(() => filteredRisks.filter((r) => r.level === 'low'), [filteredRisks]);

  const getLevelBorderColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-50';
      case 'medium':
        return 'bg-orange-50';
      case 'low':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getLevelHeaderColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMeasureStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'in_progress':
        return <Play size={16} className="text-blue-500" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  const handleAddRisk = () => {
    if (!projectId) return;

    if (editingRisk) {
      updateRisk(editingRisk.id, {
        title: formData.title,
        type: formData.type,
        level: formData.level,
        description: formData.description,
        impactAnalysis: formData.impactAnalysis,
      });
    } else {
      addRisk({
        ...formData,
        projectId,
        status: 'identified',
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteRisk = (risk: Risk) => {
    deleteRisk(risk.id);
    setDeleteConfirm(null);
    if (expandedId === risk.id) {
      setExpandedId(null);
    }
  };

  const handleAddMeasure = () => {
    if (!selectedRisk) return;

    addRiskMeasure(selectedRisk.id, {
      riskId: selectedRisk.id,
      measure: measureForm.measure,
      responsiblePerson: measureForm.responsiblePerson || '当前用户',
      deadline: measureForm.deadline,
      status: measureForm.status,
    });

    setIsMeasureModalOpen(false);
    setMeasureForm({
      measure: '',
      responsiblePerson: '',
      deadline: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      status: 'pending',
    });
  };

  const handleMeasureStatusToggle = (measure: RiskMeasure) => {
    const nextStatus: Record<string, RiskMeasure['status']> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
    };
    updateRiskMeasure(measure.id, {
      status: nextStatus[measure.status],
    });
  };

  const handleRiskStatusUpdate = (risk: Risk, status: Risk['status']) => {
    updateRisk(risk.id, { status });
  };

  const toggleMeasures = (riskId: string) => {
    setExpandedMeasures((prev) => {
      const next = new Set(prev);
      if (next.has(riskId)) {
        next.delete(riskId);
      } else {
        next.add(riskId);
      }
      return next;
    });
  };

  const openEditModal = (risk: Risk) => {
    setEditingRisk(risk);
    setFormData({
      title: risk.title,
      type: risk.type,
      level: risk.level,
      description: risk.description,
      impactAnalysis: risk.impactAnalysis,
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingRisk(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openMeasureModal = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsMeasureModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'policy',
      level: 'medium',
      description: '',
      impactAnalysis: '',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderRiskCard = (risk: Risk) => {
    const isExpanded = expandedId === risk.id;
    const measuresExpanded = expandedMeasures.has(risk.id);
    const isHigh = risk.level === 'high';

    return (
      <div
        key={risk.id}
        className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${getLevelBorderColor(risk.level)} 
          hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer
          ${isHigh ? 'animate-pulse-soft' : ''}`}
      >
        <div
          className="p-4"
          onClick={() => setExpandedId(isExpanded ? null : risk.id)}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-gray-900 flex-1">{risk.title}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelBgColor(risk.level)} text-gray-700`}>
              {RiskTypeMap[risk.type]}
            </span>
            <StatusBadge status={risk.level} type="level" />
            <StatusBadge status={risk.status} type="risk" />
          </div>

          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {truncateText(risk.description, 80)}
          </p>

          {!isExpanded && (
            <div className="text-xs text-gray-500 mb-3">
              <span className="font-medium">影响分析：</span>
              {truncateText(risk.impactAnalysis, 50)}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMeasures(risk.id);
              }}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              {measuresExpanded ? '收起' : '展开'}应对措施 ({risk.measures.length})
              {measuresExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <span className="text-xs text-gray-400">
              {dayjs(risk.createTime).format('MM-DD')}
            </span>
          </div>
        </div>

        {measuresExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3" onClick={(e) => e.stopPropagation()}>
            {risk.measures.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">暂无应对措施</p>
            ) : (
              <div className="space-y-2">
                {risk.measures.map((measure) => (
                  <div
                    key={measure.id}
                    className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <button
                      onClick={() => handleMeasureStatusToggle(measure)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {getMeasureStatusIcon(measure.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${measure.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {measure.measure}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {measure.responsiblePerson}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {dayjs(measure.deadline).format('MM-DD')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => openMeasureModal(risk)}
              className="mt-3 w-full text-xs text-primary-600 hover:text-primary-700 font-medium py-2 border border-dashed border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
            >
              + 添加应对措施
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-1">完整描述</h5>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {risk.description || '暂无描述'}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-1">影响分析</h5>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {risk.impactAnalysis || '暂无影响分析'}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">应对措施</h5>
                {risk.measures.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-3 bg-gray-50 rounded-lg">暂无应对措施</p>
                ) : (
                  <div className="space-y-2">
                    {risk.measures.map((measure) => (
                      <div
                        key={measure.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <button
                          onClick={() => handleMeasureStatusToggle(measure)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {getMeasureStatusIcon(measure.status)}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${measure.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {measure.measure}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              负责人：{measure.responsiblePerson}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              截止：{dayjs(measure.deadline).format('YYYY-MM-DD')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              measure.status === 'completed' ? 'bg-green-100 text-green-700' :
                              measure.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {measure.status === 'completed' ? '已完成' :
                               measure.status === 'in_progress' ? '进行中' : '待开始'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => openMeasureModal(risk)}
                  className="mt-3 w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2 border border-dashed border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  + 添加应对措施
                </button>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">状态更新</h5>
                <div className="flex flex-wrap gap-2">
                  {(['identified', 'monitoring', 'mitigated', 'occurred'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleRiskStatusUpdate(risk, status)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        risk.status === status
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {RiskStatusMap[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => openEditModal(risk)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Edit size={14} />
                  编辑风险
                </button>
                <button
                  onClick={() => setDeleteConfirm(risk)}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  删除风险
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderKanbanColumn = (title: string, level: 'high' | 'medium' | 'low', risks: Risk[]) => {
    return (
      <div className="flex flex-col min-h-0">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${getLevelHeaderColor(level)} text-white`}>
          <AlertTriangle size={18} />
          <span className="font-semibold">{title}</span>
          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-sm">
            {risks.length}
          </span>
        </div>
        <div className="flex-1 bg-gray-100 rounded-b-xl p-3 min-h-[400px] overflow-y-auto">
          {risks.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-400">暂无{title}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {risks.map((risk) => renderRiskCard(risk))}
            </div>
          )}
        </div>
      </div>
    );
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
              <p className="mt-1 text-sm text-gray-500">{project.village} · 风险预警</p>
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
                {Object.entries(RiskTypeMap).map(([key, label]) => (
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
                {Object.entries(RiskLevelMap).map(([key, label]) => (
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
                {Object.entries(RiskStatusMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              新增风险
            </button>
          </div>

          {filteredRisks.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="暂无风险记录"
              description="点击右上角新增风险按钮添加风险预警"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderKanbanColumn('高风险', 'high', highRisks)}
              {renderKanbanColumn('中风险', 'medium', mediumRisks)}
              {renderKanbanColumn('低风险', 'low', lowRisks)}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRisk ? '编辑风险' : '新增风险'}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddRisk} className="btn-primary">
              {editingRisk ? '保存修改' : '创建风险'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">风险标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="请输入风险标题"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">风险类型</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as RiskFormData['type'],
                  })
                }
                className="input-field"
              >
                {Object.entries(RiskTypeMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">风险等级</label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as RiskFormData['level'],
                  })
                }
                className="input-field"
              >
                {Object.entries(RiskLevelMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">风险描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] resize-y"
              placeholder="请详细描述风险情况..."
            />
          </div>
          <div>
            <label className="label">影响分析</label>
            <textarea
              value={formData.impactAnalysis}
              onChange={(e) => setFormData({ ...formData, impactAnalysis: e.target.value })}
              className="input-field min-h-[100px] resize-y"
              placeholder="请描述风险可能造成的影响..."
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={isMeasureModalOpen}
        onClose={() => setIsMeasureModalOpen(false)}
        title="添加应对措施"
        size="md"
        footer={
          <>
            <button
              onClick={() => setIsMeasureModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddMeasure} className="btn-primary">
              添加措施
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">措施内容</label>
            <textarea
              value={measureForm.measure}
              onChange={(e) => setMeasureForm({ ...measureForm, measure: e.target.value })}
              className="input-field min-h-[80px] resize-y"
              placeholder="请描述具体的应对措施..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">负责人</label>
              <input
                type="text"
                value={measureForm.responsiblePerson}
                onChange={(e) => setMeasureForm({ ...measureForm, responsiblePerson: e.target.value })}
                className="input-field"
                placeholder="默认为当前用户"
              />
            </div>
            <div>
              <label className="label">截止日期</label>
              <input
                type="date"
                value={measureForm.deadline}
                onChange={(e) => setMeasureForm({ ...measureForm, deadline: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label">初始状态</label>
            <select
              value={measureForm.status}
              onChange={(e) =>
                setMeasureForm({
                  ...measureForm,
                  status: e.target.value as MeasureFormData['status'],
                })
              }
              className="input-field"
            >
              <option value="pending">待开始</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteRisk(deleteConfirm)}
        title="确认删除"
        message={
          <p>
            确定要删除风险 <span className="font-semibold text-gray-900">"{deleteConfirm?.title}"</span> 吗？
            此操作无法撤销。
          </p>
        }
        confirmText="删除"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}
