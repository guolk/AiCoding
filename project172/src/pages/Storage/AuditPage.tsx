import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Map,
  User,
  Calendar,
  FileCheck,
  ThermometerSnowflake,
} from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button, Badge } from '@/components/Common';
import { cn } from '@/lib/utils';

interface AuditFormState {
  viability: string;
  survivalRate: number;
  colorObservation: string;
  microscopyResult: string;
  needsRefresh: boolean;
  operator: string;
  nextAuditDate: string;
}

const OPERATORS = ['张研究员', '李实验员', '王工程师', '赵技术员'];
const VIABILITY_OPTIONS = ['良好', '一般', '活性下降', '较差', '死亡'];
const VIABILITY_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  良好: 'success',
  一般: 'warning',
  活性下降: 'warning',
  较差: 'danger',
  失效: 'danger',
  死亡: 'danger',
};

export default function AuditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const storageId = params.id || '';

  const { storages, strains, audits, addAudit } = useLabStore();

  const storage = useMemo(
    () => storages.find((s) => s.id === storageId),
    [storages, storageId]
  );

  const strain = useMemo(
    () => (storage ? strains.find((s) => s.id === storage.strainId) : undefined),
    [storage, strains]
  );

  const latestAudit = useMemo(() => {
    if (!storage) return undefined;
    const list = audits.filter((a) => a.storageId === storage.id);
    return list.sort(
      (a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime()
    )[0];
  }, [storage, audits]);

  const [form, setForm] = useState<AuditFormState>({
    viability: latestAudit?.viability || '良好',
    survivalRate: 100,
    colorObservation: '正常',
    microscopyResult: '',
    needsRefresh: latestAudit?.needsRefresh || false,
    operator: OPERATORS[0],
    nextAuditDate: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!storage) return;
    setIsSaving(true);
    addAudit({
      storageId: storage.id,
      auditDate: new Date().toISOString().split('T')[0],
      viability: form.viability,
      needsRefresh: form.needsRefresh,
      operator: form.operator,
    });
    setTimeout(() => {
      setIsSaving(false);
      navigate('/storage');
    }, 300);
  };

  if (!storage) {
    return (
      <AppLayout breadcrumbItems={[{ label: '储存管理', path: '/storage' }, { label: '核查详情' }]}>
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileCheck className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-[14px]">未找到对应的储存位置</p>
          <Button
            variant="secondary"
            className="mt-4"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/storage')}
          >
            返回储存管理
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '储存管理', path: '/storage' },
        { label: '核查详情' },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/storage')}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">冻存活性核查</h1>
              <p className="text-[13px] text-gray-500 mt-1">
                对菌株冻存状态进行活性检测与记录
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#165DFF]/10 shrink-0">
                <ThermometerSnowflake className="h-7 w-7 text-[#165DFF]" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[18px] font-bold text-gray-900">
                        {strain?.name || '未知菌株'}
                      </h2>
                      {strain && <Badge type="info">{strain.code}</Badge>}
                    </div>
                    <div className="text-[13px] text-gray-500 mt-1">
                      位置：{storage.fridgeCode}-{storage.boxCode}-{storage.position}
                    </div>
                  </div>
                  {latestAudit && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[11px] text-gray-400">上次核查</div>
                        <div className="text-[14px] font-semibold text-gray-700">
                          {latestAudit.auditDate}
                        </div>
                      </div>
                      <Badge
                        type={VIABILITY_BADGE[latestAudit.viability] || 'default'}
                      >
                        {latestAudit.viability}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Map className="h-4 w-4 text-gray-400" />
                  <span className="text-[12px] text-gray-500">储存位置</span>
                </div>
                <div className="text-[16px] font-bold text-gray-800 mt-1">
                  {storage.fridgeCode}
                  <span className="text-gray-400 mx-1">/</span>
                  {storage.boxCode}
                  <span className="text-gray-400 mx-1">/</span>
                  {storage.position}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-[12px] text-gray-500">核查日期</span>
                </div>
                <div className="text-[16px] font-bold text-gray-800 mt-1">
                  {new Date().toISOString().split('T')[0]}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-[12px] text-gray-500">菌株编号</span>
                </div>
                <div className="text-[16px] font-bold text-gray-800 mt-1">
                  {strain?.code || '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
            <h3 className="text-[16px] font-semibold text-gray-800 mb-5">
              活性检测表单
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    存活率 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.survivalRate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        survivalRate: Number(e.target.value),
                      })
                    }
                    className={cn(
                      'w-full h-11 px-4 rounded-lg border border-gray-200',
                      'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                      'text-[14px] text-gray-700 transition-all'
                    )}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    颜色观察
                  </label>
                  <select
                    value={form.colorObservation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        colorObservation: e.target.value,
                      })
                    }
                    className={cn(
                      'w-full h-11 px-4 rounded-lg border border-gray-200 bg-white',
                      'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                      'text-[14px] text-gray-700 transition-all'
                    )}
                  >
                    <option value="正常">正常</option>
                    <option value="异常">异常</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  镜检结果
                </label>
                <textarea
                  rows={4}
                  placeholder="请输入显微镜下观察结果，描述菌体形态、数量、污染情况等..."
                  value={form.microscopyResult}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      microscopyResult: e.target.value,
                    })
                  }
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-200 resize-none',
                    'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                    'text-[14px] text-gray-700 transition-all'
                  )}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-3">
                  活性评价
                </label>
                <div className="flex flex-wrap gap-3">
                  {VIABILITY_OPTIONS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setForm({ ...form, viability: v })}
                      className={cn(
                        'px-5 py-2.5 rounded-lg border-2 text-[14px] font-medium transition-all',
                        form.viability === v
                          ? 'border-[#165DFF] bg-[#165DFF]/10 text-[#165DFF]'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    下次核查日期
                  </label>
                  <input
                    type="date"
                    value={form.nextAuditDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nextAuditDate: e.target.value,
                      })
                    }
                    className={cn(
                      'w-full h-11 px-4 rounded-lg border border-gray-200',
                      'focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                      'text-[14px] text-gray-700 transition-all'
                    )}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    操作人
                  </label>
                  <select
                    value={form.operator}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        operator: e.target.value,
                      })
                    }
                    className={cn(
                      'w-full h-11 px-4 rounded-lg border border-gray-200 bg-white',
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

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="needsRefresh"
                  checked={form.needsRefresh}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      needsRefresh: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#165DFF] focus:ring-[#165DFF]"
                />
                <label htmlFor="needsRefresh" className="text-[13px] text-gray-700">
                  需要补充传代（菌株活性下降或代数过高，需要重新制备新鲜批次）
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/storage')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              返回
            </Button>
            <Button
              onClick={handleSave}
              loading={isSaving}
              leftIcon={<FileCheck className="h-4 w-4" />}
            >
              保存核查记录
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
