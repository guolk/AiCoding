import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Plus,
  Edit3,
  Trash2,
  Users,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { Modal, EmptyState, ConfirmDialog, StatusBadge } from '@/components/UI';
import type { DataTableColumn } from '@/components/UI/DataTable';
import {
  type VisitRecord,
} from '@/types';

interface VisitFormData {
  visitDate: string;
  visitor: string;
  problemsFound: string;
  measuresTaken: string;
  remarks: string;
}

const initialFormData: VisitFormData = {
  visitDate: '',
  visitor: '',
  problemsFound: '',
  measuresTaken: '',
  remarks: '',
};

export default function VisitList() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const {
    getProjectById,
    getProjectVisits,
    addVisit,
    updateVisit,
    deleteVisit,
    setCurrentProjectId,
    loading,
    initializeData,
  } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);
  const [formData, setFormData] = useState<VisitFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<VisitRecord | null>(null);

  const project = projectId ? getProjectById(projectId) : undefined;
  const visits = projectId ? getProjectVisits(projectId) : [];

  const sortedVisits = useMemo(() => {
    return [...visits].sort((a, b) =>
      dayjs(b.visitDate).valueOf() - dayjs(a.visitDate).valueOf()
    );
  }, [visits]);

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

  const hasManyProblems = (problems: string) => {
    return problems.length > 50 || problems.includes('严重') || problems.includes('重大');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.visitDate) newErrors.visitDate = '请选择走访日期';
    if (!formData.visitor.trim()) newErrors.visitor = '请输入走访人';
    if (!formData.problemsFound.trim()) newErrors.problemsFound = '请输入发现的问题';
    if (!formData.measuresTaken.trim()) newErrors.measuresTaken = '请输入采取的措施';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (visit?: VisitRecord) => {
    if (visit) {
      setEditingVisit(visit);
      setFormData({
        visitDate: visit.visitDate,
        visitor: visit.visitor,
        problemsFound: visit.problemsFound,
        measuresTaken: visit.measuresTaken,
        remarks: visit.remarks,
      });
    } else {
      setEditingVisit(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVisit(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm() || !projectId) return;

    const visitData = {
      projectId,
      visitDate: formData.visitDate,
      visitor: formData.visitor.trim(),
      problemsFound: formData.problemsFound.trim(),
      measuresTaken: formData.measuresTaken.trim(),
      remarks: formData.remarks.trim(),
    };

    if (editingVisit) {
      updateVisit(editingVisit.id, visitData);
    } else {
      addVisit(visitData);
    }

    handleCloseModal();
  };

  const handleDelete = (visit: VisitRecord) => {
    deleteVisit(visit.id);
    setDeleteConfirm(null);
  };

  const columns: DataTableColumn<VisitRecord>[] = [
    {
      key: 'visitDate',
      title: '走访日期',
      width: '12%',
      render: (row: VisitRecord) => (
        <span className="font-medium text-gray-900">
          {dayjs(row.visitDate).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      key: 'visitor',
      title: '走访人',
      width: '12%',
      render: (row: VisitRecord) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
            <Users size={14} className="text-primary-600" />
          </div>
          <span className="text-gray-900">{row.visitor}</span>
        </div>
      ),
    },
    {
      key: 'problemsFound',
      title: '发现的问题',
      width: '28%',
      render: (row: VisitRecord) => (
        <p className="text-gray-700 line-clamp-2" title={row.problemsFound}>
          {row.problemsFound}
        </p>
      ),
    },
    {
      key: 'measuresTaken',
      title: '采取的措施',
      width: '28%',
      render: (row: VisitRecord) => (
        <p className="text-gray-700 line-clamp-2" title={row.measuresTaken}>
          {row.measuresTaken}
        </p>
      ),
    },
    {
      key: 'remarks',
      title: '备注',
      width: '12%',
      render: (row: VisitRecord) => (
        <p className="text-gray-500 line-clamp-2" title={row.remarks}>
          {row.remarks || '-'}
        </p>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: '8%',
      render: (row: VisitRecord) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(row);
            }}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="编辑"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirm(row);
            }}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

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
              <p className="mt-1 text-sm text-gray-500">{project.village} · 走访记录</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              新增走访
            </button>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">走访记录列表</h2>
              <p className="text-sm text-gray-500 mt-1">
                共 {sortedVisits.length} 条走访记录
              </p>
            </div>
          </div>

          {sortedVisits.length === 0 ? (
            <EmptyState
              icon={Users}
              title="暂无走访记录"
              description="点击右上角按钮添加走访记录"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                        style={{ width: column.width }}
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedVisits.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'transition-colors',
                        hasManyProblems(row.problemsFound)
                          ? 'bg-red-50 hover:bg-red-100'
                          : rowIndex % 2 === 0
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50/50 hover:bg-gray-100'
                      )}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-4 py-3 text-sm text-gray-700"
                        >
                          {column.render
                            ? column.render(row, rowIndex)
                            : ((row as unknown as Record<string, unknown>)[column.key] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingVisit ? '编辑走访记录' : '新增走访记录'}
        size="lg"
        footer={
          <>
            <button onClick={handleCloseModal} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              {editingVisit ? '保存修改' : '确认添加'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                走访日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className={cn('input-field', errors.visitDate && 'border-red-500')}
              />
              {errors.visitDate && (
                <p className="text-xs text-red-500 mt-1">{errors.visitDate}</p>
              )}
            </div>
            <div>
              <label className="label">
                走访人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.visitor}
                onChange={(e) => setFormData({ ...formData, visitor: e.target.value })}
                className={cn('input-field', errors.visitor && 'border-red-500')}
                placeholder="请输入走访人姓名"
              />
              {errors.visitor && (
                <p className="text-xs text-red-500 mt-1">{errors.visitor}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">
              发现的问题 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.problemsFound}
              onChange={(e) => setFormData({ ...formData, problemsFound: e.target.value })}
              className={cn('input-field min-h-[80px] resize-y', errors.problemsFound && 'border-red-500')}
              placeholder="请详细描述走访中发现的问题"
              rows={3}
            />
            {errors.problemsFound && (
              <p className="text-xs text-red-500 mt-1">{errors.problemsFound}</p>
            )}
          </div>

          <div>
            <label className="label">
              采取的措施 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.measuresTaken}
              onChange={(e) => setFormData({ ...formData, measuresTaken: e.target.value })}
              className={cn('input-field min-h-[80px] resize-y', errors.measuresTaken && 'border-red-500')}
              placeholder="请详细描述针对问题采取的措施"
              rows={3}
            />
            {errors.measuresTaken && (
              <p className="text-xs text-red-500 mt-1">{errors.measuresTaken}</p>
            )}
          </div>

          <div>
            <label className="label">备注</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="input-field min-h-[60px] resize-y"
              placeholder="请输入其他备注信息"
              rows={2}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="确认删除走访记录"
        message={`确定要删除这条走访记录吗？此操作无法恢复。`}
        confirmText="确认删除"
        cancelText="取消"
      />
    </div>
  );
}
