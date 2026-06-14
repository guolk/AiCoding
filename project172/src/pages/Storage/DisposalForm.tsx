import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  User,
  Flame,
  ClipboardList,
} from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button, Badge } from '@/components/Common';
import { cn } from '@/lib/utils';

interface DisposalFormState {
  strainId: string;
  reason: string;
  reasonOther: string;
  method: string;
  operator: string;
  approver: string;
  notes: string;
}

const OPERATORS = ['张研究员', '李实验员', '王工程师', '赵技术员'];
const REASON_OPTIONS = ['污染', '项目结束', '过期', '其他'];
const METHOD_OPTIONS = ['高温高压灭菌', '化学消毒', '焚烧'];

const REASON_STYLES: Record<string, string> = {
  污染: 'bg-[#F53F3F]/10 text-[#F53F3F] border-[#F53F3F]',
  项目结束: 'bg-[#165DFF]/10 text-[#165DFF] border-[#165DFF]',
  过期: 'bg-[#FF7D00]/10 text-[#FF7D00] border-[#FF7D00]',
  其他: 'bg-[#86909C]/10 text-[#86909C] border-[#86909C]',
};

export default function DisposalForm() {
  const navigate = useNavigate();
  const { strains, disposals, addDisposal, storages } = useLabStore();

  const [form, setForm] = useState<DisposalFormState>({
    strainId: '',
    reason: '',
    reasonOther: '',
    method: METHOD_OPTIONS[0],
    operator: OPERATORS[0],
    approver: '',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const availableStrains = useMemo(() => {
    return strains.filter((s) => {
      const isDisposed = disposals.some((d) => d.strainId === s.id);
      return !isDisposed;
    });
  }, [strains, disposals]);

  const selectedStrain = useMemo(
    () => strains.find((s) => s.id === form.strainId),
    [strains, form.strainId]
  );

  const strainStorage = useMemo(() => {
    if (!form.strainId) return undefined;
    return storages.find((s) => s.strainId === form.strainId);
  }, [storages, form.strainId]);

  const handleSave = () => {
    if (!form.strainId || !form.reason) return;

    setIsSaving(true);
    const reason = form.reason === '其他'
      ? form.reasonOther || '其他原因'
      : form.reason;

    addDisposal({
      strainId: form.strainId,
      reason,
      operator: form.operator,
      approver: form.approver || '待审批',
      date: new Date().toISOString().split('T')[0],
    });

    setTimeout(() => {
      setIsSaving(false);
      navigate('/storage?tab=disposal');
    }, 300);
  };

  const canSubmit = form.strainId && form.reason && (form.reason !== '其他' || form.reasonOther);

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '储存管理', path: '/storage' },
        { label: '申请销毁' },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/storage?tab=disposal')}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">申请菌株销毁</h1>
              <p className="text-[13px] text-gray-500 mt-1">
                按生物安全规范申请销毁不再需要的菌株
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            <div className="bg-gradient-to-r from-[#F53F3F]/5 to-transparent px-6 py-5 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F53F3F]/10 shrink-0">
                  <AlertTriangle className="h-6 w-6 text-[#F53F3F]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-semibold text-[#F53F3F]">
                    生物安全提示
                  </h3>
                  <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                    菌株销毁操作必须严格遵守实验室生物安全规范，选择合适的灭菌方式，并在操作前获得相关审批人员签字确认。销毁过程需有双人监督，确保完全灭活。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
            <h3 className="text-[16px] font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#165DFF]" />
              填写销毁信息
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  选择销毁菌株 <span className="text-[#F53F3F]">*</span>
                </label>
                <select
                  value={form.strainId}
                  onChange={(e) =>
                    setForm({ ...form, strainId: e.target.value })
                  }
                  className={cn(
                    'w-full h-12 px-4 rounded-lg border border-gray-200 bg-white',
                    'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                    'text-[14px] text-gray-700 transition-all'
                  )}
                >
                  <option value="">请选择要销毁的菌株</option>
                  {availableStrains.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - BSL-{s.safetyLevel}
                    </option>
                  ))}
                </select>

                {selectedStrain && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] text-gray-500 mb-1">菌株名称</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-gray-800">
                            {selectedStrain.name}
                          </span>
                          <Badge type="info">{selectedStrain.code}</Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 mb-1">
                          生物安全等级
                        </div>
                        <div className="text-[14px] font-semibold text-gray-800">
                          BSL-{selectedStrain.safetyLevel}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 mb-1">储存位置</div>
                        <div className="text-[14px] font-semibold text-gray-800">
                          {strainStorage
                            ? `${strainStorage.fridgeCode}-${strainStorage.boxCode}-${strainStorage.position}`
                            : '未分配位置'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 mb-1">创建时间</div>
                        <div className="text-[14px] font-semibold text-gray-800">
                          {selectedStrain.createdAt}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-3">
                  销毁原因 <span className="text-[#F53F3F]">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {REASON_OPTIONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setForm({ ...form, reason })}
                      className={cn(
                        'py-4 px-3 rounded-xl border-2 text-[14px] font-medium transition-all text-center',
                        form.reason === reason
                          ? REASON_STYLES[reason] + ' border-2'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {reason === '污染' && (
                        <Flame className="h-4 w-4 mx-auto mb-1" />
                      )}
                      {reason}
                    </button>
                  ))}
                </div>

                {form.reason === '其他' && (
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="请输入具体销毁原因..."
                      value={form.reasonOther}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          reasonOther: e.target.value,
                        })
                      }
                      className={cn(
                        'w-full h-11 px-4 rounded-lg border border-gray-200',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 transition-all'
                      )}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  销毁方式
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {METHOD_OPTIONS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setForm({ ...form, method })}
                      className={cn(
                        'py-3 px-4 rounded-xl border-2 text-[13px] font-medium transition-all text-left',
                        form.method === method
                          ? 'border-[#165DFF] bg-[#165DFF]/5 text-[#165DFF]'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 shrink-0" />
                        {method}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    操作人 <span className="text-[#F53F3F]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={form.operator}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          operator: e.target.value,
                        })
                      }
                      className={cn(
                        'w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-white',
                        'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 transition-all'
                      )}
                    >
                      {OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    审批人
                  </label>
                  <input
                    type="text"
                    placeholder="请输入审批人姓名"
                    value={form.approver}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        approver: e.target.value,
                      })
                    }
                    className={cn(
                      'w-full h-11 px-4 rounded-lg border border-gray-200',
                      'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                      'text-[14px] text-gray-700 transition-all'
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  rows={4}
                  placeholder="请输入其他需要说明的信息，如菌株处理前的状态、特殊注意事项等..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-200 resize-none',
                    'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                    'text-[14px] text-gray-700 transition-all'
                  )}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#F53F3F]/5 rounded-xl border border-[#F53F3F]/20 p-5 mb-5">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-[#F53F3F] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-[#F53F3F] mb-1">
                  确认销毁声明
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  我确认已评估该菌株销毁的必要性，并将严格按照实验室生物安全规范执行销毁操作。销毁过程将全程记录，确保无任何遗漏风险。
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/storage?tab=disposal')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              取消返回
            </Button>
            <Button
              variant="danger"
              onClick={handleSave}
              loading={isSaving}
              disabled={!canSubmit}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              提交销毁申请
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
