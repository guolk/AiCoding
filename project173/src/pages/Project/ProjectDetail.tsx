import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import {
  MapPin,
  User,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  Edit3,
  Trash2,
  Plus,
  TrendingUp,
  Target,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore, useProjectById, useProjectTargets, useProjectBudgets } from '@/store/projectStore';
import { ProjectSubNav } from '@/components/Layout';
import { DataTable, EmptyState, StatusBadge, ConfirmDialog } from '@/components/UI';
import type { DataTableColumn } from '@/components/UI/DataTable';
import {
  ProjectTypeMap,
  ProjectStatusMap,
  type Project,
  type QuantitativeTarget,
  type BudgetItem,
} from '@/types';

function InfoSection({ project }: { project: Project }) {
  const infoItems = [
    { icon: Tag, label: '项目名称', value: project.name, span: 2 },
    { icon: MapPin, label: '实施村庄', value: project.village },
    { icon: Building2, label: '项目类型', value: ProjectTypeMap[project.type] },
    { icon: DollarSign, label: '资金来源', value: project.fundSource },
    { icon: Calendar, label: '开始日期', value: dayjs(project.startDate).format('YYYY-MM-DD') },
    { icon: Calendar, label: '结束日期', value: dayjs(project.endDate).format('YYYY-MM-DD') },
    { icon: Building2, label: '负责单位', value: project.responsibleUnit },
    { icon: User, label: '负责人', value: project.responsiblePerson },
  ];

  const leftItems = infoItems.slice(0, Math.ceil(infoItems.length / 2));
  const rightItems = infoItems.slice(Math.ceil(infoItems.length / 2));

  const InfoItem = ({ icon: Icon, label, value, span = 1 }: {
    icon: typeof Tag;
    label: string;
    value: string;
    span?: number;
  }) => (
    <div className={cn('flex gap-3 p-4', span === 2 && 'col-span-2')}>
      <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-primary-50 text-primary-600">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-1 text-base font-medium text-gray-900 truncate">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} type="project" />
              <span className="text-sm text-gray-500">
                {dayjs(project.startDate).format('YYYY-MM-DD')} ~ {dayjs(project.endDate).format('YYYY-MM-DD')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'rounded-full px-3 py-1 text-sm font-medium',
              'bg-primary-100 text-primary-700'
            )}>
              {ProjectTypeMap[project.type]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50">
            {leftItems.map((item, index) => (
              <div key={index} className={cn(index !== 0 && 'border-t border-gray-100')}>
                <InfoItem {...item} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50">
            {rightItems.map((item, index) => (
              <div key={index} className={cn(index !== 0 && 'border-t border-gray-100')}>
                <InfoItem {...item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">项目描述</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
      </div>
    </div>
  );
}

function TargetsSection({ targets, projectId }: {
  targets: QuantitativeTarget[];
  projectId: string;
}) {
  const navigate = useNavigate();
  const { addTarget, deleteTarget } = useProjectStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTarget, setNewTarget] = useState({
    indicatorName: '',
    baselineValue: '',
    targetValue: '',
    unit: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const columns: DataTableColumn<QuantitativeTarget>[] = [
    { key: 'indicatorName', title: '指标名称', width: '20%' },
    { key: 'baselineValue', title: '基线值', width: '12%',
      render: (row: QuantitativeTarget) => (
        <span className="font-mono">{row.baselineValue}</span>
      )
    },
    { key: 'targetValue', title: '目标值', width: '12%',
      render: (row: QuantitativeTarget) => (
        <span className="font-mono font-medium text-primary-600">{row.targetValue}</span>
      )
    },
    { key: 'unit', title: '单位', width: '10%' },
    { key: 'progress', title: '完成进度', width: '15%',
      render: (row: QuantitativeTarget) => {
        const progress = Math.min(100, Math.round((row.baselineValue / row.targetValue) * 100));
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 w-12">{progress}%</span>
          </div>
        );
      }
    },
    { key: 'description', title: '描述', width: '26%' },
    { key: 'actions', title: '操作', width: '5%',
      render: (row: QuantitativeTarget) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('确定要删除这个目标吗？')) {
              deleteTarget(row.id);
            }
          }}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 size={16} />
        </button>
      )
    },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newTarget.indicatorName.trim()) newErrors.indicatorName = '请输入指标名称';
    if (!newTarget.baselineValue) newErrors.baselineValue = '请输入基线值';
    if (!newTarget.targetValue) newErrors.targetValue = '请输入目标值';
    if (!newTarget.unit.trim()) newErrors.unit = '请输入单位';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTarget = () => {
    if (!validateForm()) return;

    addTarget({
      projectId,
      indicatorName: newTarget.indicatorName.trim(),
      baselineValue: parseFloat(newTarget.baselineValue),
      targetValue: parseFloat(newTarget.targetValue),
      unit: newTarget.unit.trim(),
      description: newTarget.description.trim(),
    });

    setNewTarget({
      indicatorName: '',
      baselineValue: '',
      targetValue: '',
      unit: '',
      description: '',
    });
    setShowAddForm(false);
    setErrors({});
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">量化目标</h3>
          <p className="text-sm text-gray-500 mt-1">项目的可量化指标和目标值</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          添加目标
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <h4 className="font-medium text-gray-900 mb-4">新增量化目标</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">指标名称 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newTarget.indicatorName}
                onChange={(e) => setNewTarget({ ...newTarget, indicatorName: e.target.value })}
                className={cn('input-field', errors.indicatorName && 'border-red-500')}
                placeholder="如：人均收入"
              />
              {errors.indicatorName && (
                <p className="text-xs text-red-500 mt-1">{errors.indicatorName}</p>
              )}
            </div>
            <div>
              <label className="label">基线值 <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={newTarget.baselineValue}
                onChange={(e) => setNewTarget({ ...newTarget, baselineValue: e.target.value })}
                className={cn('input-field', errors.baselineValue && 'border-red-500')}
                placeholder="0"
              />
              {errors.baselineValue && (
                <p className="text-xs text-red-500 mt-1">{errors.baselineValue}</p>
              )}
            </div>
            <div>
              <label className="label">目标值 <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={newTarget.targetValue}
                onChange={(e) => setNewTarget({ ...newTarget, targetValue: e.target.value })}
                className={cn('input-field', errors.targetValue && 'border-red-500')}
                placeholder="0"
              />
              {errors.targetValue && (
                <p className="text-xs text-red-500 mt-1">{errors.targetValue}</p>
              )}
            </div>
            <div>
              <label className="label">单位 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newTarget.unit}
                onChange={(e) => setNewTarget({ ...newTarget, unit: e.target.value })}
                className={cn('input-field', errors.unit && 'border-red-500')}
                placeholder="如：元、户、%"
              />
              {errors.unit && (
                <p className="text-xs text-red-500 mt-1">{errors.unit}</p>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="label">描述</label>
              <input
                type="text"
                value={newTarget.description}
                onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
                className="input-field"
                placeholder="目标说明"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                setErrors({});
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddTarget} className="btn-primary">
              确认添加
            </button>
          </div>
        </div>
      )}

      {targets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="暂无量化目标"
          description="点击上方按钮添加项目的量化目标"
        />
      ) : (
        <DataTable<QuantitativeTarget> columns={columns} data={targets} />
      )}
    </div>
  );
}

function BudgetSection({ budgets, projectId }: {
  budgets: BudgetItem[];
  projectId: string;
}) {
  const { addBudget, deleteBudget } = useProjectStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    subProjectName: '',
    budgetAmount: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const chartOption = useMemo(() => {
    if (budgets.length === 0) return {};

    const data = budgets.map((b) => ({
      value: b.budgetAmount,
      name: b.subProjectName,
    }));

    const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalActual = budgets.reduce((sum, b) => sum + b.actualAmount, 0);
    const usageRate = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c}万 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        itemGap: 12,
        textStyle: {
          fontSize: 13,
          color: '#666',
        },
      },
      series: [
        {
          name: '预算分配',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data,
          color: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'],
        },
      ],
      graphic: {
        type: 'text',
        left: '35%',
        top: 'center',
        style: {
          text: `使用率\n${usageRate}%`,
          textAlign: 'center',
          fill: '#374151',
          fontSize: 16,
          fontWeight: 'bold',
          lineHeight: 24,
        },
      },
    };
  }, [budgets]);

  const columns: DataTableColumn<BudgetItem>[] = [
    { key: 'subProjectName', title: '子项目名称', width: '25%' },
    { key: 'budgetAmount', title: '预算金额(万)', width: '15%',
      render: (row: BudgetItem) => (
        <span className="font-mono font-medium text-gray-900">¥{row.budgetAmount}</span>
      )
    },
    { key: 'actualAmount', title: '实际金额(万)', width: '15%',
      render: (row: BudgetItem) => (
        <span className="font-mono font-medium text-primary-600">¥{row.actualAmount}</span>
      )
    },
    { key: 'progress', title: '执行进度', width: '20%',
      render: (row: BudgetItem) => {
        const progress = row.budgetAmount > 0
          ? Math.min(100, Math.round((row.actualAmount / row.budgetAmount) * 100))
          : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  progress >= 90 ? 'bg-green-500' : progress >= 60 ? 'bg-primary-500' : 'bg-yellow-500'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 w-12">{progress}%</span>
          </div>
        );
      }
    },
    { key: 'description', title: '描述', width: '20%' },
    { key: 'actions', title: '操作', width: '5%',
      render: (row: BudgetItem) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('确定要删除这个预算项吗？')) {
              deleteBudget(row.id);
            }
          }}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 size={16} />
        </button>
      )
    },
  ];

  const totalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.budgetAmount, 0), [budgets]);
  const totalActual = useMemo(() => budgets.reduce((sum, b) => sum + b.actualAmount, 0), [budgets]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newBudget.subProjectName.trim()) newErrors.subProjectName = '请输入子项目名称';
    if (!newBudget.budgetAmount) newErrors.budgetAmount = '请输入预算金额';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBudget = () => {
    if (!validateForm()) return;

    addBudget({
      projectId,
      subProjectName: newBudget.subProjectName.trim(),
      budgetAmount: parseFloat(newBudget.budgetAmount),
      actualAmount: 0,
      description: newBudget.description.trim(),
    });

    setNewBudget({
      subProjectName: '',
      budgetAmount: '',
      description: '',
    });
    setShowAddForm(false);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">预算分配</h3>
            <p className="text-sm text-gray-500 mt-1">项目资金的分配和使用情况</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            添加预算项
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-medium text-gray-900 mb-4">新增预算项</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">子项目名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newBudget.subProjectName}
                  onChange={(e) => setNewBudget({ ...newBudget, subProjectName: e.target.value })}
                  className={cn('input-field', errors.subProjectName && 'border-red-500')}
                  placeholder="如：道路建设"
                />
                {errors.subProjectName && (
                  <p className="text-xs text-red-500 mt-1">{errors.subProjectName}</p>
                )}
              </div>
              <div>
                <label className="label">预算金额(万) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  value={newBudget.budgetAmount}
                  onChange={(e) => setNewBudget({ ...newBudget, budgetAmount: e.target.value })}
                  className={cn('input-field', errors.budgetAmount && 'border-red-500')}
                  placeholder="0.00"
                />
                {errors.budgetAmount && (
                  <p className="text-xs text-red-500 mt-1">{errors.budgetAmount}</p>
                )}
              </div>
              <div>
                <label className="label">描述</label>
                <input
                  type="text"
                  value={newBudget.description}
                  onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                  className="input-field"
                  placeholder="预算说明"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setErrors({});
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleAddBudget} className="btn-primary">
                确认添加
              </button>
            </div>
          </div>
        )}

        {budgets.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="暂无预算数据"
            description="点击上方按钮添加项目预算分配"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500">总预算</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">¥{totalBudget}万</div>
              </div>
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div className="text-sm text-primary-600">已使用</div>
                <div className="mt-1 text-2xl font-bold text-primary-700">¥{totalActual}万</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-sm text-green-600">使用率</div>
                <div className="mt-1 text-2xl font-bold text-green-700">
                  {totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0}%
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="text-sm text-orange-600">预算项数</div>
                <div className="mt-1 text-2xl font-bold text-orange-700">{budgets.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {budgets.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">预算明细</h3>
          <DataTable<BudgetItem> columns={columns} data={budgets} />
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = useProjectId();
  const {
    setCurrentProjectId,
    deleteProject,
    initializeData,
  } = useProjectStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const project = useProjectById(projectId);
  const targets = useProjectTargets(projectId);
  const budgets = useProjectBudgets(projectId);

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

  const handleEdit = () => {
    navigate(`/projects/${projectId}/edit`);
  };

  const handleDelete = () => {
    if (projectId) {
      deleteProject(projectId);
      navigate('/projects');
    }
  };

  const getActiveTab = () => {
    if (location.pathname.includes('/targets')) return 'targets';
    if (location.pathname.includes('/budget')) return 'budget';
    return 'info';
  };

  const activeTab = getActiveTab();

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
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              <StatusBadge status={project.status} type="project" />
            </div>
            <p className="mt-1 text-sm text-gray-500">{project.village} · {ProjectTypeMap[project.type]}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleEdit} className="btn-secondary flex items-center gap-2">
              <Edit3 size={16} />
              编辑
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <Trash2 size={16} />
              删除
            </button>
          </div>
        </div>
        <ProjectSubNav />
      </div>

      <div className="p-6">
        {activeTab === 'info' && <InfoSection project={project} />}
        {activeTab === 'targets' && <TargetsSection targets={targets} projectId={projectId!} />}
        {activeTab === 'budget' && <BudgetSection budgets={budgets} projectId={projectId!} />}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="确认删除项目"
        message="确定要删除这个项目吗？此操作将同时删除该项目的所有关联数据（目标、预算、里程碑等），且无法恢复。"
        confirmText="确认删除"
        cancelText="取消"
      />
    </div>
  );
}
