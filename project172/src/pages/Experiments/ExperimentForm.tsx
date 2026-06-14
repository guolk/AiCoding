import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FlaskConical,
  Target,
  ClipboardList,
  Beaker,
  FileText,
  Plus,
  Trash2,
  User,
  AlertCircle,
} from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/Common';
import { cn } from '@/lib/utils';

// 重复实验行数据类型
interface RepeatRow {
  id: string;
  repeatNo: number;
  dataSummary: string;
  consistencyScore: number;
  date: string;
}

// 对照组行数据类型
interface ControlRow {
  id: string;
  type: string;
  setup: string;
  result: string;
}

// 实验步骤类型
interface ProtocolStep {
  id: string;
  content: string;
}

// 类型选项
const statusOptions = ['进行中', '已完成', '待审核', '已取消'];
const controlTypes = [
  { value: '阴性对照', label: '阴性对照' },
  { value: '阳性对照', label: '阳性对照' },
  { value: '实验组', label: '实验组' },
  { value: '空白对照', label: '空白对照' },
  { value: '质控对照', label: '质控对照' },
];

export default function ExperimentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    strains,
    experiments,
    repeats,
    controls,
    addExperiment,
    updateExperiment,
    addRepeat,
    removeRepeat,
    addControl,
    removeControl,
  } = useLabStore();

  // 是否为编辑模式
  const isEditMode = Boolean(id);

  // ========== 表单状态 ==========
  // 基本信息
  const [title, setTitle] = useState('');
  const [strainId, setStrainId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('进行中');

  // 实验目的
  const [purpose, setPurpose] = useState('');

  // 实验方案步骤
  const [protocolSteps, setProtocolSteps] = useState<ProtocolStep[]>([
    { id: crypto.randomUUID(), content: '' },
  ]);

  // 对照组
  const [controlRows, setControlRows] = useState<ControlRow[]>([
    { id: crypto.randomUUID(), type: '阴性对照', setup: '', result: '' },
    { id: crypto.randomUUID(), type: '阳性对照', setup: '', result: '' },
    { id: crypto.randomUUID(), type: '实验组', setup: '', result: '' },
  ]);

  // 重复性实验
  const [repeatRows, setRepeatRows] = useState<RepeatRow[]>([
    {
      id: crypto.randomUUID(),
      repeatNo: 1,
      dataSummary: '',
      consistencyScore: 90,
      date: new Date().toISOString().split('T')[0],
    },
  ]);

  // 原始数据与结论
  const [data, setData] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [operator, setOperator] = useState('张研究员');

  // 表单错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ========== 编辑模式回填数据 ==========
  useEffect(() => {
    if (isEditMode && id) {
      const exp = experiments.find((e) => e.id === id);
      if (exp) {
        setTitle(exp.title);
        setStrainId(exp.strainId);
        setDate(exp.date);
        setStatus(exp.status);
        setPurpose(exp.purpose);
        setData(exp.data);
        setConclusion(exp.conclusion);

        // 回填实验方案步骤
        if (exp.protocol) {
          const steps = exp.protocol
            .split(/\d+\.\s*/)
            .filter((s) => s.trim().length > 0)
            .map((s) => ({ id: crypto.randomUUID(), content: s.trim() }));
          if (steps.length > 0) setProtocolSteps(steps);
        }

        // 回填重复性实验
        const expRepeats = repeats
          .filter((r) => r.experimentId === id)
          .sort((a, b) => a.repeatNo - b.repeatNo)
          .map((r) => ({
            id: r.id,
            repeatNo: r.repeatNo,
            dataSummary: r.dataSummary,
            consistencyScore: r.consistencyScore,
            date: r.date,
          }));
        if (expRepeats.length > 0) setRepeatRows(expRepeats);

        // 回填对照组
        const expControls = controls
          .filter((c) => c.experimentId === id)
          .map((c) => ({
            id: c.id,
            type: c.type,
            setup: c.setup,
            result: c.result,
          }));
        if (expControls.length > 0) setControlRows(expControls);
      }
    }
  }, [isEditMode, id, experiments, repeats, controls]);

  // ========== 辅助函数 ==========
  // 清除错误
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // 组装实验方案字符串
  const buildProtocolString = (): string => {
    return protocolSteps
      .filter((s) => s.content.trim().length > 0)
      .map((s, idx) => `${idx + 1}. ${s.content.trim()}`)
      .join('；');
  };

  // 表单校验
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '请输入实验标题';
    if (!strainId) newErrors.strainId = '请选择关联菌株';
    if (!purpose.trim()) newErrors.purpose = '请输入实验目的';
    if (protocolSteps.every((s) => !s.content.trim()))
      newErrors.protocol = '请至少输入一条实验方案步骤';
    if (!operator.trim()) newErrors.operator = '请输入操作人姓名';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== 操作函数 ==========
  // 提交表单
  const handleSubmit = () => {
    if (!validateForm()) return;

    // 1. 保存/更新 Experiment
    const experimentData = {
      title: title.trim(),
      strainId,
      purpose: purpose.trim(),
      protocol: buildProtocolString(),
      data: data.trim(),
      conclusion: conclusion.trim(),
      status,
      date,
      operator: operator.trim(),
    };

    let experimentId = id || '';

    if (isEditMode && id) {
      updateExperiment(id, experimentData);

      // 编辑模式：先删除旧的重复和对照（通过removeRepeat/removeControl）
      // 这里简化处理，实际应该做差异对比
      const oldRepeats = repeats.filter((r) => r.experimentId === id);
      oldRepeats.forEach((r) => removeRepeat(r.id));
      const oldControls = controls.filter((c) => c.experimentId === id);
      oldControls.forEach((c) => removeControl(c.id));
    } else {
      // 新增模式
      addExperiment(experimentData);
      // 获取刚创建的实验ID
      const created = [...experiments].reverse().find(
        (e) => e.title === experimentData.title
      );
      if (created) {
        experimentId = created.id;
      } else {
        // fallback: 直接去取最后一个
        experimentId = experiments[experiments.length - 1]?.id || '';
      }
    }

    // 2. 保存 Repeats
    repeatRows
      .filter((r) => r.dataSummary.trim().length > 0)
      .forEach((r, idx) => {
        addRepeat({
          experimentId,
          repeatNo: idx + 1,
          dataSummary: r.dataSummary.trim(),
          consistencyScore: r.consistencyScore,
          date: r.date,
        });
      });

    // 3. 保存 Controls
    controlRows
      .filter((c) => c.setup.trim().length > 0 || c.result.trim().length > 0)
      .forEach((c) => {
        addControl({
          experimentId,
          type: c.type,
          setup: c.setup.trim(),
          result: c.result.trim(),
        });
      });

    // 返回列表或详情
    navigate(`/experiments/${experimentId}`);
  };

  // 计算一致性评分颜色
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#00B42A';
    if (score >= 75) return '#165DFF';
    if (score >= 60) return '#FF7D00';
    return '#F53F3F';
  };

  // 计算平均评分
  const avgScore = useMemo(() => {
    if (repeatRows.length === 0) return 0;
    const sum = repeatRows.reduce((acc, r) => acc + r.consistencyScore, 0);
    return Math.round(sum / repeatRows.length);
  }, [repeatRows]);

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '实验记录', path: '/experiments' },
        { label: isEditMode ? '编辑实验' : '新建实验' },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6 pb-28">
        <div className="max-w-[1200px] mx-auto">
          {/* 顶部栏 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/experiments')}
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-[#165DFF] hover:text-[#165DFF] transition-colors shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-[22px] font-bold text-gray-900">
                  {isEditMode ? '编辑实验' : '新建实验'}
                </h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  {isEditMode
                    ? '修改实验记录的详细信息'
                    : '填写实验方案与记录，创建新的实验记录'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* ===== 1. 基本信息 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#165DFF]/10">
                    <FlaskConical className="h-4 w-4 text-[#165DFF]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">
                    基本信息
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* 实验标题 */}
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      实验标题 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：大肠杆菌BL21在LB培养基中的生长曲线测定"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearError('title');
                      }}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.title
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400'
                      )}
                    />
                    {errors.title && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* 菌株Select */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      关联菌株 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <select
                      value={strainId}
                      onChange={(e) => {
                        setStrainId(e.target.value);
                        clearError('strainId');
                      }}
                      className={cn(
                        'w-full h-10 px-3 rounded-lg border bg-white transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.strainId
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700'
                      )}
                    >
                      <option value="">请选择菌株</option>
                      {strains.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}（{s.code}）
                        </option>
                      ))}
                    </select>
                    {errors.strainId && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.strainId}
                      </p>
                    )}
                  </div>

                  {/* 实验日期 */}
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      实验日期
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 transition-all'
                      )}
                    />
                  </div>

                  {/* 状态 */}
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">
                      实验状态
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setStatus(opt)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-[13px] font-medium transition-all border',
                            status === opt
                              ? opt === '已完成'
                                ? 'bg-[#00B42A] text-white border-[#00B42A] shadow-sm'
                                : opt === '进行中'
                                ? 'bg-[#FF7D00] text-white border-[#FF7D00] shadow-sm'
                                : opt === '待审核'
                                ? 'bg-[#165DFF] text-white border-[#165DFF] shadow-sm'
                                : 'bg-[#F53F3F] text-white border-[#F53F3F] shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#165DFF] hover:text-[#165DFF]'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== 2. 目的与方案 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00B42A]/10">
                    <Target className="h-4 w-4 text-[#00B42A]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">
                    实验目的与方案
                  </h2>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-6">
                {/* 实验目的 */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    实验目的 <span className="text-[#F53F3F]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="描述实验的研究背景、目标和预期成果..."
                    value={purpose}
                    onChange={(e) => {
                      setPurpose(e.target.value);
                      clearError('purpose');
                    }}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg border resize-none transition-all',
                      'focus:outline-none focus:ring-2',
                      errors.purpose
                        ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                        : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                      'text-[14px] text-gray-700 placeholder-gray-400'
                    )}
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.purpose}
                    </p>
                  )}
                </div>

                {/* 实验方案步骤 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[13px] font-medium text-gray-700">
                      实验方案（步骤）
                      {errors.protocol && (
                        <span className="ml-2 text-[#F53F3F] flex items-center gap-0.5 inline-flex">
                          <AlertCircle className="h-3 w-3" />
                          {errors.protocol}
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setProtocolSteps((prev) => [
                          ...prev,
                          { id: crypto.randomUUID(), content: '' },
                        ])
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#165DFF] hover:bg-[#165DFF]/10 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      添加步骤
                    </button>
                  </div>
                  <div className="space-y-3">
                    {protocolSteps.map((step, idx) => (
                      <div key={step.id} className="flex gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#165DFF]/10 text-[#165DFF] text-[13px] font-semibold mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder={`输入第 ${idx + 1} 步操作内容...`}
                            value={step.content}
                            onChange={(e) => {
                              setProtocolSteps((prev) =>
                                prev.map((s, i) =>
                                  i === idx
                                    ? { ...s, content: e.target.value }
                                    : s
                                )
                              );
                              clearError('protocol');
                            }}
                            className={cn(
                              'flex-1 h-9 px-3 rounded-lg border border-gray-200',
                              'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                              'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
                            )}
                          />
                          {protocolSteps.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setProtocolSteps((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="p-2 rounded-md text-gray-400 hover:bg-[#F53F3F]/10 hover:text-[#F53F3F] transition-colors"
                              title="删除步骤"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== 3. 对照组设置 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                    <Beaker className="h-4 w-4 text-cyan-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">
                    对照组设置
                  </h2>
                  <span className="text-[12px] text-gray-400 ml-2">
                    （包含阴性对照、阳性对照、实验组等）
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {controlRows.map((row, idx) => (
                    <div
                      key={row.id}
                      className={cn(
                        'p-4 rounded-xl border-2',
                        row.type === '阴性对照' || row.type === '空白对照'
                          ? 'bg-[#FEECEE] border-[#F53F3F]/30'
                          : row.type === '阳性对照' || row.type === '质控对照'
                          ? 'bg-[#E6F8EC] border-[#00B42A]/30'
                          : 'bg-[#E8F3FF] border-[#165DFF]/30'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <select
                            value={row.type}
                            onChange={(e) =>
                              setControlRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx ? { ...r, type: e.target.value } : r
                                )
                              )
                            }
                            className={cn(
                              'h-9 px-3 rounded-lg border bg-white transition-all',
                              'focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20',
                              'text-[13px] font-semibold',
                              row.type === '阴性对照' || row.type === '空白对照'
                                ? 'border-[#F53F3F]/40 text-[#F53F3F]'
                                : row.type === '阳性对照' ||
                                  row.type === '质控对照'
                                ? 'border-[#00B42A]/40 text-[#00B42A]'
                                : 'border-[#165DFF]/40 text-[#165DFF]'
                            )}
                          >
                            {controlTypes.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {controlRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setControlRows((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="p-2 rounded-md text-gray-400 hover:bg-white/80 hover:text-[#F53F3F] transition-colors"
                            title="删除对照组"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                            设置说明
                          </label>
                          <textarea
                            rows={2}
                            placeholder="描述该对照组的设置条件..."
                            value={row.setup}
                            onChange={(e) =>
                              setControlRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx ? { ...r, setup: e.target.value } : r
                                )
                              )
                            }
                            className={cn(
                              'w-full px-3 py-2 rounded-lg border border-gray-200/70 bg-white/70 resize-none',
                              'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                              'text-[13px] text-gray-700 placeholder-gray-400 transition-all'
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                            预期/实际结果
                          </label>
                          <textarea
                            rows={2}
                            placeholder="记录该对照组的预期结果或实际观察结果..."
                            value={row.result}
                            onChange={(e) =>
                              setControlRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx ? { ...r, result: e.target.value } : r
                                )
                              )
                            }
                            className={cn(
                              'w-full px-3 py-2 rounded-lg border border-gray-200/70 bg-white/70 resize-none',
                              'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                              'text-[13px] text-gray-700 placeholder-gray-400 transition-all'
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setControlRows((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          type: '实验组',
                          setup: '',
                          result: '',
                        },
                      ])
                    }
                    className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-[13px] font-medium hover:border-[#165DFF]/50 hover:bg-[#165DFF]/5 hover:text-[#165DFF] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    添加对照组
                  </button>
                </div>
              </div>
            </div>

            {/* ===== 4. 重复性实验 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                      <FileText className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <h2 className="text-[16px] font-semibold text-gray-800">
                        重复性实验
                      </h2>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        当前 {repeatRows.length} 次重复，平均一致性{' '}
                        <span
                          className="font-semibold"
                          style={{ color: getScoreColor(avgScore) }}
                        >
                          {avgScore}
                        </span>{' '}
                        分
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {repeatRows.map((row, idx) => (
                    <div
                      key={row.id}
                      className="border border-gray-100 rounded-xl p-4 bg-gradient-to-br from-gray-50/50 to-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold',
                              'bg-[#165DFF]/10 text-[#165DFF]'
                            )}
                          >
                            第 {idx + 1} 次重复
                          </span>
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) =>
                              setRepeatRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx ? { ...r, date: e.target.value } : r
                                )
                              )
                            }
                            className="h-8 px-2.5 rounded-md border border-gray-200 text-[12px] text-gray-600 focus:outline-none focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 bg-white"
                          />
                        </div>
                        {repeatRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setRepeatRows((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="p-2 rounded-md text-gray-400 hover:bg-[#F53F3F]/10 hover:text-[#F53F3F] transition-colors"
                            title="删除重复"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr,280px] gap-4">
                        <div>
                          <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                            数据摘要
                          </label>
                          <textarea
                            rows={2}
                            placeholder="简要描述本次重复的关键数据和观察结果..."
                            value={row.dataSummary}
                            onChange={(e) =>
                              setRepeatRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx
                                    ? { ...r, dataSummary: e.target.value }
                                    : r
                                )
                              )
                            }
                            className={cn(
                              'w-full px-3 py-2 rounded-lg border border-gray-200 resize-none',
                              'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                              'text-[13px] text-gray-700 placeholder-gray-400 transition-all'
                            )}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[12px] font-medium text-gray-600">
                              一致性评分
                            </label>
                            <span
                              className="text-[18px] font-bold"
                              style={{
                                color: getScoreColor(row.consistencyScore),
                              }}
                            >
                              {row.consistencyScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={row.consistencyScore}
                              onChange={(e) =>
                                setRepeatRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? {
                                          ...r,
                                          consistencyScore: Number(
                                            e.target.value
                                          ),
                                        }
                                      : r
                                  )
                                )
                              }
                              className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#165DFF]"
                              style={{
                                accentColor: getScoreColor(
                                  row.consistencyScore
                                ),
                              }}
                            />
                          </div>
                          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${row.consistencyScore}%`,
                                backgroundColor: getScoreColor(
                                  row.consistencyScore
                                ),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setRepeatRows((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          repeatNo: prev.length + 1,
                          dataSummary: '',
                          consistencyScore: 90,
                          date: new Date().toISOString().split('T')[0],
                        },
                      ])
                    }
                    className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-[13px] font-medium hover:border-violet-400/50 hover:bg-violet-50/50 hover:text-violet-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    添加重复实验
                  </button>
                </div>
              </div>
            </div>

            {/* ===== 5. 数据与结论 ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <ClipboardList className="h-4 w-4 text-amber-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">
                    数据与结论
                  </h2>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-5">
                {/* 原始数据 */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    原始数据
                  </label>
                  <textarea
                    rows={5}
                    placeholder="记录实验的原始测量数据，如：OD值、浓度、时间序列数据等..."
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg border border-gray-200 resize-none font-mono',
                      'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                      'text-[13px] text-gray-700 placeholder-gray-400 transition-all'
                    )}
                  />
                </div>

                {/* 实验结论 */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    实验结论
                  </label>
                  <textarea
                    rows={4}
                    placeholder="总结实验结果、是否达到预期目的、关键发现和后续建议..."
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg border border-gray-200 resize-none',
                      'focus:outline-none focus:border-[#00B42A] focus:ring-2 focus:ring-[#00B42A]/20',
                      'text-[14px] text-gray-700 placeholder-gray-400 transition-all'
                    )}
                  />
                </div>

                {/* 操作人 */}
                <div className="max-w-md">
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    操作人 <span className="text-[#F53F3F]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="请输入操作人姓名"
                      value={operator}
                      onChange={(e) => {
                        setOperator(e.target.value);
                        clearError('operator');
                      }}
                      className={cn(
                        'w-full h-10 pl-10 pr-4 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.operator
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400'
                      )}
                    />
                  </div>
                  {errors.operator && (
                    <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.operator}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-6 py-4 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/experiments')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            取消
          </Button>
          <Button
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSubmit}
          >
            {isEditMode ? '保存修改' : '保存实验'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
