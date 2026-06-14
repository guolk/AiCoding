import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectId } from '@/hooks/useProjectId';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  Target,
  DollarSign,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore, useProjectById, useProjectTargets, useProjectBudgets } from '@/store/projectStore';
import { ConfirmDialog } from '@/components/UI';
import {
  ProjectTypeMap,
  ProjectStatusMap,
  type Project,
  type QuantitativeTarget,
  type BudgetItem,
} from '@/types';

interface TargetFormItem {
  id: string;
  indicatorName: string;
  baselineValue: string;
  targetValue: string;
  unit: string;
  description: string;
}

interface BudgetFormItem {
  id: string;
  subProjectName: string;
  budgetAmount: string;
  description: string;
}

const PROJECT_TYPES = [
  { value: 'infrastructure', label: '基础设施' },
  { value: 'industry', label: '产业发展' },
  { value: 'training', label: '技能培训' },
  { value: 'environment', label: '环境治理' },
  { value: 'other', label: '其他' },
];

const PROJECT_STATUSES = [
  { value: 'planning', label: '规划中' },
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'suspended', label: '已暂停' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function ProjectForm() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const isEdit = projectId && projectId !== 'new';

  const {
    addProject,
    updateProject,
    deleteProject,
    addTarget,
    updateTarget,
    deleteTarget,
    addBudget,
    updateBudget,
    deleteBudget,
    initializeData,
  } = useProjectStore();

  const project = useProjectById(projectId);
  const existingTargets = useProjectTargets(projectId);
  const existingBudgets = useProjectBudgets(projectId);

  const [formData, setFormData] = useState({
    name: '',
    village: '',
    type: 'infrastructure' as Project['type'],
    fundSource: '',
    responsibleUnit: '',
    responsiblePerson: '',
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    status: 'planning' as Project['status'],
    description: '',
  });

  const [targets, setTargets] = useState<TargetFormItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetFormItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (isEdit && project) {
      setFormData({
        name: project.name,
        village: project.village,
        type: project.type,
        fundSource: project.fundSource,
        responsibleUnit: project.responsibleUnit,
        responsiblePerson: project.responsiblePerson,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        description: project.description,
      });
    }
  }, [isEdit, project]);

  useEffect(() => {
    if (isEdit && existingTargets.length > 0) {
      setTargets(
        existingTargets.map((t) => ({
          id: t.id,
          indicatorName: t.indicatorName,
          baselineValue: String(t.baselineValue),
          targetValue: String(t.targetValue),
          unit: t.unit,
          description: t.description,
        }))
      );
    }
  }, [isEdit, existingTargets]);

  useEffect(() => {
    if (isEdit && existingBudgets.length > 0) {
      setBudgets(
        existingBudgets.map((b) => ({
          id: b.id,
          subProjectName: b.subProjectName,
          budgetAmount: String(b.budgetAmount),
          description: b.description,
        }))
      );
    }
  }, [isEdit, existingBudgets]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = '请输入项目名称';
    if (!formData.village.trim()) newErrors.village = '请输入实施村庄';
    if (!formData.type) newErrors.type = '请选择项目类型';
    if (!formData.fundSource.trim()) newErrors.fundSource = '请输入资金来源';
    if (!formData.responsibleUnit.trim()) newErrors.responsibleUnit = '请输入负责单位';
    if (!formData.responsiblePerson.trim()) newErrors.responsiblePerson = '请输入负责人';
    if (!formData.startDate) newErrors.startDate = '请选择开始日期';
    if (!formData.endDate) newErrors.endDate = '请选择结束日期';
    if (formData.startDate && formData.endDate && dayjs(formData.startDate).isAfter(formData.endDate)) {
      newErrors.endDate = '结束日期必须晚于开始日期';
    }
    if (!formData.status) newErrors.status = '请选择项目状态';

    targets.forEach((target, index) => {
      if (!target.indicatorName.trim()) {
        newErrors[`target_${index}_indicatorName`] = '请输入指标名称';
      }
      if (!target.baselineValue) {
        newErrors[`target_${index}_baselineValue`] = '请输入基线值';
      }
      if (!target.targetValue) {
        newErrors[`target_${index}_targetValue`] = '请输入目标值';
      }
      if (!target.unit.trim()) {
        newErrors[`target_${index}_unit`] = '请输入单位';
      }
    });

    budgets.forEach((budget, index) => {
      if (!budget.subProjectName.trim()) {
        newErrors[`budget_${index}_subProjectName`] = '请输入子项目名称';
      }
      if (!budget.budgetAmount) {
        newErrors[`budget_${index}_budgetAmount`] = '请输入预算金额';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const projectData = {
      name: formData.name.trim(),
      village: formData.village.trim(),
      type: formData.type,
      fundSource: formData.fundSource.trim(),
      responsibleUnit: formData.responsibleUnit.trim(),
      responsiblePerson: formData.responsiblePerson.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      description: formData.description.trim(),
    };

    if (isEdit && projectId) {
      updateProject(projectId, projectData);

      const existingTargetIds = existingTargets.map((t) => t.id);
      targets.forEach((target) => {
        const targetData = {
          projectId,
          indicatorName: target.indicatorName.trim(),
          baselineValue: parseFloat(target.baselineValue),
          targetValue: parseFloat(target.targetValue),
          unit: target.unit.trim(),
          description: target.description.trim(),
        };
        if (existingTargetIds.includes(target.id)) {
          updateTarget(target.id, targetData);
        } else {
          addTarget(targetData);
        }
      });
      existingTargets.forEach((t) => {
        if (!targets.find((formTarget) => formTarget.id === t.id)) {
          deleteTarget(t.id);
        }
      });

      const existingBudgetIds = existingBudgets.map((b) => b.id);
      budgets.forEach((budget) => {
        const existingBudget = existingBudgets.find((b) => b.id === budget.id);
        const budgetData = {
          projectId,
          subProjectName: budget.subProjectName.trim(),
          budgetAmount: parseFloat(budget.budgetAmount),
          actualAmount: existingBudget?.actualAmount || 0,
          description: budget.description.trim(),
        };
        if (existingBudgetIds.includes(budget.id)) {
          updateBudget(budget.id, budgetData);
        } else {
          addBudget(budgetData);
        }
      });
      existingBudgets.forEach((b) => {
        if (!budgets.find((formBudget) => formBudget.id === b.id)) {
          deleteBudget(b.id);
        }
      });

      navigate(`/projects/${projectId}`);
    } else {
      const newProjectId = generateId();
      addProject(projectData);

      const storedProjects = JSON.parse(localStorage.getItem('rural_revival_data') || '{}');
      const createdProject = storedProjects.projects?.find(
        (p: Project) => p.name === projectData.name && p.village === projectData.village
      );

      if (createdProject) {
        targets.forEach((target) => {
          addTarget({
            projectId: createdProject.id,
            indicatorName: target.indicatorName.trim(),
            baselineValue: parseFloat(target.baselineValue),
            targetValue: parseFloat(target.targetValue),
            unit: target.unit.trim(),
            description: target.description.trim(),
          });
        });

        budgets.forEach((budget) => {
          addBudget({
            projectId: createdProject.id,
            subProjectName: budget.subProjectName.trim(),
            budgetAmount: parseFloat(budget.budgetAmount),
            actualAmount: 0,
            description: budget.description.trim(),
          });
        });
      }

      navigate('/projects');
    }
  };

  const handleDelete = () => {
    if (projectId) {
      deleteProject(projectId);
      navigate('/projects');
    }
  };

  const handleCancel = () => {
    if (isEdit && projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/projects');
    }
  };

  const addTargetItem = () => {
    setTargets([
      ...targets,
      {
        id: generateId(),
        indicatorName: '',
        baselineValue: '',
        targetValue: '',
        unit: '',
        description: '',
      },
    ]);
  };

  const removeTargetItem = (id: string) => {
    setTargets(targets.filter((t) => t.id !== id));
  };

  const updateTargetItem = (id: string, field: keyof TargetFormItem, value: string) => {
    setTargets(
      targets.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const addBudgetItem = () => {
    setBudgets([
      ...budgets,
      {
        id: generateId(),
        subProjectName: '',
        budgetAmount: '',
        description: '',
      },
    ]);
  };

  const removeBudgetItem = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const updateBudgetItem = (id: string, field: keyof BudgetFormItem, value: string) => {
    setBudgets(
      budgets.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            返回
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? '编辑项目' : '新建项目'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEdit ? '修改项目的基本信息' : '创建一个新的乡村振兴项目'}
            </p>
          </div>
        </div>
        {isEdit && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <Trash2 size={18} />
            删除项目
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 text-primary-600">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="label">
                项目名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn('input-field', errors.name && 'border-red-500')}
                placeholder="请输入项目名称"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label">
                实施村庄 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className={cn('input-field', errors.village && 'border-red-500')}
                placeholder="请输入实施村庄"
              />
              {errors.village && <p className="text-xs text-red-500 mt-1">{errors.village}</p>}
            </div>

            <div>
              <label className="label">
                项目类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Project['type'] })}
                className={cn('input-field', errors.type && 'border-red-500')}
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className="label">
                资金来源 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fundSource}
                onChange={(e) => setFormData({ ...formData, fundSource: e.target.value })}
                className={cn('input-field', errors.fundSource && 'border-red-500')}
                placeholder="如：财政拨款、社会捐助"
              />
              {errors.fundSource && <p className="text-xs text-red-500 mt-1">{errors.fundSource}</p>}
            </div>

            <div>
              <label className="label">
                负责单位 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.responsibleUnit}
                onChange={(e) => setFormData({ ...formData, responsibleUnit: e.target.value })}
                className={cn('input-field', errors.responsibleUnit && 'border-red-500')}
                placeholder="请输入负责单位"
              />
              {errors.responsibleUnit && <p className="text-xs text-red-500 mt-1">{errors.responsibleUnit}</p>}
            </div>

            <div>
              <label className="label">
                负责人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                className={cn('input-field', errors.responsiblePerson && 'border-red-500')}
                placeholder="请输入负责人姓名"
              />
              {errors.responsiblePerson && <p className="text-xs text-red-500 mt-1">{errors.responsiblePerson}</p>}
            </div>

            <div>
              <label className="label">
                开始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={cn('input-field', errors.startDate && 'border-red-500')}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="label">
                结束日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={cn('input-field', errors.endDate && 'border-red-500')}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>

            <div>
              <label className="label">
                项目状态 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className={cn('input-field', errors.status && 'border-red-500')}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="label">项目描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[120px] resize-y"
                placeholder="请输入项目详细描述..."
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">量化目标</h2>
                <p className="text-sm text-gray-500 mt-0.5">项目的可量化指标和目标值</p>
              </div>
            </div>
            <button
              onClick={addTargetItem}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus size={18} />
              添加目标
            </button>
          </div>

          {targets.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <AlertCircle size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">暂无量化目标，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              {targets.map((target, index) => (
                <div
                  key={target.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">目标项 {index + 1}</span>
                    <button
                      onClick={() => removeTargetItem(target.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="label">
                        指标名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={target.indicatorName}
                        onChange={(e) => updateTargetItem(target.id, 'indicatorName', e.target.value)}
                        className={cn(
                          'input-field',
                          errors[`target_${index}_indicatorName`] && 'border-red-500'
                        )}
                        placeholder="如：人均收入"
                      />
                      {errors[`target_${index}_indicatorName`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`target_${index}_indicatorName`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">
                        基线值 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={target.baselineValue}
                        onChange={(e) => updateTargetItem(target.id, 'baselineValue', e.target.value)}
                        className={cn(
                          'input-field',
                          errors[`target_${index}_baselineValue`] && 'border-red-500'
                        )}
                        placeholder="0"
                      />
                      {errors[`target_${index}_baselineValue`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`target_${index}_baselineValue`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">
                        目标值 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={target.targetValue}
                        onChange={(e) => updateTargetItem(target.id, 'targetValue', e.target.value)}
                        className={cn(
                          'input-field',
                          errors[`target_${index}_targetValue`] && 'border-red-500'
                        )}
                        placeholder="0"
                      />
                      {errors[`target_${index}_targetValue`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`target_${index}_targetValue`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">
                        单位 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={target.unit}
                        onChange={(e) => updateTargetItem(target.id, 'unit', e.target.value)}
                        className={cn(
                          'input-field',
                          errors[`target_${index}_unit`] && 'border-red-500'
                        )}
                        placeholder="如：元、户、%"
                      />
                      {errors[`target_${index}_unit`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`target_${index}_unit`]}</p>
                      )}
                    </div>
                    <div className="md:col-span-2 lg:col-span-4">
                      <label className="label">描述</label>
                      <input
                        type="text"
                        value={target.description}
                        onChange={(e) => updateTargetItem(target.id, 'description', e.target.value)}
                        className="input-field"
                        placeholder="目标说明"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-600">
                <DollarSign size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">资金分配</h2>
                <p className="text-sm text-gray-500 mt-0.5">项目资金的预算分配</p>
              </div>
            </div>
            <button
              onClick={addBudgetItem}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus size={18} />
              添加预算项
            </button>
          </div>

          {budgets.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <AlertCircle size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">暂无预算分配，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget, index) => (
                <div
                  key={budget.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">预算项 {index + 1}</span>
                    <button
                      onClick={() => removeBudgetItem(budget.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">
                        子项目名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={budget.subProjectName}
                        onChange={(e) => updateBudgetItem(budget.id, 'subProjectName', e.target.value)}
                        className={cn(
                          'input-field',
                          errors[`budget_${index}_subProjectName`] && 'border-red-500'
                        )}
                        placeholder="如：道路建设"
                      />
                      {errors[`budget_${index}_subProjectName`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`budget_${index}_subProjectName`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">
                        预算金额(万) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={budget.budgetAmount}
                        onChange={(e) => updateBudgetItem(budget.id, 'budgetAmount', e.target.value)}
                        className={cn(
                          'input-field',
                          errors[`budget_${index}_budgetAmount`] && 'border-red-500'
                        )}
                        placeholder="0.00"
                      />
                      {errors[`budget_${index}_budgetAmount`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`budget_${index}_budgetAmount`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">描述</label>
                      <input
                        type="text"
                        value={budget.description}
                        onChange={(e) => updateBudgetItem(budget.id, 'description', e.target.value)}
                        className="input-field"
                        placeholder="预算说明"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={handleCancel} className="btn-secondary flex items-center gap-2">
            <X size={18} />
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Save size={18} />
            {isEdit ? '保存修改' : '创建项目'}
          </button>
        </div>
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
