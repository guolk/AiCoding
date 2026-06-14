import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Minus, FlaskConical, Beaker, Flame, Droplets, AlertCircle } from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button, Badge } from '@/components/Common';
import { cn } from '@/lib/utils';

interface FormulaRow {
  name: string;
  amount: string;
  unit: string;
}

const STERILIZATION_OPTIONS = [
  { value: '高压蒸汽(121℃20min)', label: '高压蒸汽(121℃20min)', desc: '最常用，适合大多数培养基' },
  { value: '过滤除菌', label: '过滤除菌', desc: '适合含热敏性成分的培养基' },
  { value: '干热灭菌', label: '干热灭菌', desc: '160℃ 2小时，适合玻璃器皿' },
  { value: '其他', label: '其他', desc: '请在备注中说明具体方法' },
];

const PH_ADJUST_OPTIONS = [
  { value: 'NaOH', label: 'NaOH（氢氧化钠）' },
  { value: 'HCl', label: 'HCl（盐酸）' },
  { value: 'NaOH/HCl', label: 'NaOH/HCl 双调节' },
  { value: '其他', label: '其他' },
];

const UNIT_OPTIONS = ['g/L', 'mg/L', 'μg/L', 'mL/L', '%', '其他'];

const createEmptyRows = (count: number): FormulaRow[] => {
  return Array.from({ length: count }, () => ({ name: '', amount: '', unit: 'g/L' }));
};

const parseFormulaToRows = (formula: string): FormulaRow[] => {
  const rows: FormulaRow[] = [];
  if (!formula) return createEmptyRows(5);

  const parts = formula.split(/[，,、]/).map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes('（') || part.includes('(')) continue;
    const match = part.match(/^([^\d]+)([\d.]+)\s*([a-zA-Z\/%]+)/);
    if (match) {
      rows.push({
        name: match[1].trim(),
        amount: match[2],
        unit: match[3],
      });
    } else {
      const altMatch = part.match(/^([^\d]+)([\d.]+)/);
      if (altMatch) {
        rows.push({
          name: altMatch[1].trim(),
          amount: altMatch[2],
          unit: 'g/L',
        });
      } else if (part) {
        rows.push({
          name: part,
          amount: '',
          unit: 'g/L',
        });
      }
    }
  }

  while (rows.length < 5) {
    rows.push({ name: '', amount: '', unit: 'g/L' });
  }
  return rows;
};

const rowsToFormula = (rows: FormulaRow[]): string => {
  const parts: string[] = [];
  for (const row of rows) {
    if (row.name.trim()) {
      if (row.amount) {
        parts.push(`${row.name.trim()}${row.amount}${row.unit}`);
      } else {
        parts.push(row.name.trim());
      }
    }
  }
  return parts.join('，');
};

export default function MediaForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { media, addMedium, updateMedium } = useLabStore();

  const isEditMode = Boolean(id);

  const [name, setName] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);
  const [formulaRows, setFormulaRows] = useState<FormulaRow[]>(createEmptyRows(5));
  const [sterilizationMethod, setSterilizationMethod] = useState('高压蒸汽(121℃20min)');
  const [targetPh, setTargetPh] = useState('7.2');
  const [phAdjustMethod, setPhAdjustMethod] = useState('NaOH/HCl');
  const [phNotes, setPhNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && id) {
      const medium = media.find((m) => m.id === id);
      if (medium) {
        setName(medium.name);
        setCreatedAt(medium.createdAt);
        setFormulaRows(parseFormulaToRows(medium.formula));
        const sterilValue = STERILIZATION_OPTIONS.find((opt) =>
          medium.sterilizationMethod.includes(opt.value.split('(')[0])
        )?.value;
        setSterilizationMethod(sterilValue || '高压蒸汽(121℃20min)');
        setTargetPh(String(medium.phValue));
      }
    }
  }, [isEditMode, id, media]);

  const updateRow = (index: number, field: keyof FormulaRow, value: string) => {
    setFormulaRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addRow = () => {
    setFormulaRows((prev) => [...prev, { name: '', amount: '', unit: 'g/L' }]);
  };

  const removeRow = (index: number) => {
    if (formulaRows.length <= 1) return;
    setFormulaRows((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '请输入培养基名称';
    }

    const hasValidRow = formulaRows.some((r) => r.name.trim());
    if (!hasValidRow) {
      newErrors.formula = '请至少填写一个配方成分';
    }

    if (!targetPh) {
      newErrors.targetPh = '请输入目标pH值';
    } else if (Number(targetPh) < 1 || Number(targetPh) > 14) {
      newErrors.targetPh = 'pH值应在1-14之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formula = rowsToFormula(formulaRows);
    const phValue = Number(targetPh);

    const mediumData = {
      name: name.trim(),
      formula,
      sterilizationMethod,
      phValue,
      createdAt,
    };

    if (isEditMode && id) {
      updateMedium(id, mediumData);
    } else {
      addMedium(mediumData);
    }

    navigate('/cultures');
  };

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '培养记录', path: '/cultures' },
        { label: isEditMode ? '编辑培养基配方' : '新增培养基配方' },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/cultures')}
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-[#165DFF] hover:text-[#165DFF] transition-colors shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-[22px] font-bold text-gray-900">
                  {isEditMode ? '编辑培养基配方' : '新增培养基配方'}
                </h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  {isEditMode ? '修改已有的培养基配方信息' : '填写培养基配方信息，创建新的培养基配方'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#165DFF]/10">
                    <FlaskConical className="h-4 w-4 text-[#165DFF]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">基本信息</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      培养基名称 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：LB培养基、PDA培养基"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.name;
                            return n;
                          });
                        }
                      }}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.name
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400',
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      创建日期
                    </label>
                    <input
                      type="date"
                      value={createdAt}
                      onChange={(e) => setCreatedAt(e.target.value)}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'border-gray-200 focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white',
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="bg-gradient-to-r from-cyan-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Beaker className="h-4 w-4 text-cyan-600" />
                    </div>
                    <h2 className="text-[16px] font-semibold text-gray-800">配方成分</h2>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={addRow}
                  >
                    添加一行
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[12px] font-medium text-gray-500 pb-3 pr-4 w-[40%]">
                          成分名称
                        </th>
                        <th className="text-left text-[12px] font-medium text-gray-500 pb-3 pr-4 w-[20%]">
                          数量
                        </th>
                        <th className="text-left text-[12px] font-medium text-gray-500 pb-3 pr-4 w-[25%]">
                          单位
                        </th>
                        <th className="text-center text-[12px] font-medium text-gray-500 pb-3 w-[15%]">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formulaRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-b-0">
                          <td className="py-2.5 pr-4">
                            <input
                              type="text"
                              placeholder="如：胰蛋白胨"
                              value={row.name}
                              onChange={(e) => {
                                updateRow(idx, 'name', e.target.value);
                                if (errors.formula) {
                                  setErrors((prev) => {
                                    const n = { ...prev };
                                    delete n.formula;
                                    return n;
                                  });
                                }
                              }}
                              className={cn(
                                'w-full h-9 px-3 rounded-lg border transition-all',
                                'border-gray-200 focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                                'text-[14px] text-gray-700 placeholder-gray-400',
                              )}
                            />
                          </td>
                          <td className="py-2.5 pr-4">
                            <input
                              type="number"
                              step="any"
                              placeholder="10"
                              value={row.amount}
                              onChange={(e) => updateRow(idx, 'amount', e.target.value)}
                              className={cn(
                                'w-full h-9 px-3 rounded-lg border transition-all',
                                'border-gray-200 focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                                'text-[14px] text-gray-700 placeholder-gray-400',
                              )}
                            />
                          </td>
                          <td className="py-2.5 pr-4">
                            <select
                              value={row.unit}
                              onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                              className={cn(
                                'w-full h-9 px-3 rounded-lg border transition-all',
                                'border-gray-200 focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                                'text-[14px] text-gray-700 bg-white',
                              )}
                            >
                              {UNIT_OPTIONS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(idx)}
                              disabled={formulaRows.length <= 1}
                              className={cn(
                                'p-1.5 rounded-md transition-colors',
                                formulaRows.length <= 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:bg-[#F53F3F]/10 hover:text-[#F53F3F]',
                              )}
                              title="删除行"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {errors.formula && (
                  <p className="mt-3 text-[12px] text-[#F53F3F] flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.formula}
                  </p>
                )}
                <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-[12px] text-gray-500 mb-1">配方预览</div>
                  <div className="text-[13px] text-gray-700">
                    {formulaRows.some((r) => r.name.trim())
                      ? rowsToFormula(formulaRows)
                      : <span className="text-gray-400">填写成分后此处显示完整配方预览...</span>}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <Flame className="h-4 w-4 text-orange-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">灭菌方法</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STERILIZATION_OPTIONS.map((opt) => {
                    const isSelected = sterilizationMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSterilizationMethod(opt.value)}
                        className={cn(
                          'relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-sm',
                          isSelected
                            ? 'border-[#165DFF] bg-gradient-to-br from-[#165DFF]/5 to-white shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className={cn(
                              'text-[14px] font-semibold mb-1',
                              isSelected ? 'text-[#165DFF]' : 'text-gray-800',
                            )}>
                              {opt.label}
                            </div>
                            <div className="text-[12px] text-gray-500 leading-relaxed">
                              {opt.desc}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#165DFF]">
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                    <Droplets className="h-4 w-4 text-green-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">pH调节</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      目标pH值 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        min={1}
                        max={14}
                        step={0.1}
                        placeholder="7.2"
                        value={targetPh}
                        onChange={(e) => {
                          setTargetPh(e.target.value);
                          if (errors.targetPh) {
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.targetPh;
                              return n;
                            });
                          }
                        }}
                        className={cn(
                          'w-full h-10 pl-10 pr-3 rounded-lg border transition-all',
                          'focus:outline-none focus:ring-2',
                          errors.targetPh
                            ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                            : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 placeholder-gray-400',
                        )}
                      />
                    </div>
                    {errors.targetPh && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.targetPh}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      调节方法
                    </label>
                    <select
                      value={phAdjustMethod}
                      onChange={(e) => setPhAdjustMethod(e.target.value)}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'border-gray-200 focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white',
                      )}
                    >
                      {PH_ADJUST_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      pH调节备注
                    </label>
                    <textarea
                      rows={3}
                      placeholder="记录pH调节过程中的注意事项、实际调节结果等..."
                      value={phNotes}
                      onChange={(e) => setPhNotes(e.target.value)}
                      className={cn(
                        'w-full px-3.5 py-2.5 rounded-lg border transition-all resize-none',
                        'border-gray-200 focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400',
                      )}
                    />
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="text-[13px] font-medium text-gray-700 mb-3">配方预览卡片</div>
                  <div
                    className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 overflow-hidden"
                    style={{ borderRadius: '8px' }}
                  >
                    <div className="px-5 py-3 bg-gradient-to-r from-blue-50/50 to-white border-b border-gray-100">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-[16px] font-bold text-gray-900">
                          {name || '培养基名称预览'}
                        </h3>
                        <div className="flex items-center gap-2">
                          {targetPh && <Badge type="info">pH {targetPh}</Badge>}
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium bg-[#722ED1]/10 text-[#722ED1]">
                            {sterilizationMethod.split('(')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[12px] font-medium text-gray-500 mb-2">配方成分</div>
                      <div className="flex flex-wrap gap-1.5">
                        {formulaRows.filter((r) => r.name.trim()).length > 0 ? (
                          formulaRows
                            .filter((r) => r.name.trim())
                            .map((r, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-[12px] text-gray-700"
                              >
                                <span className="font-medium">{r.name}</span>
                                {r.amount && (
                                  <span className="text-[#165DFF] font-semibold">
                                    {r.amount}{r.unit}
                                  </span>
                                )}
                              </span>
                            ))
                        ) : (
                          <span className="text-[12px] text-gray-400">暂无成分</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm border-t border-gray-100">
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/cultures')}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  取消
                </Button>
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSubmit}
                >
                  {isEditMode ? '保存修改' : '保存配方'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
