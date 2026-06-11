import { useState } from 'react';
import { useFireStore } from '@/store/useFireStore';
import type { EmergencyPlan, PlanStep } from '@/types';
import { planStatusMap } from '@/utils/constants';
import { Plus, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';

const defaultStep: PlanStep = { order: 1, phase: '', action: '', responsible: '', description: '' };

const emptyForm = (): EmergencyPlan => ({
  id: Date.now().toString(),
  scenarioType: '',
  title: '',
  createDate: new Date().toISOString().slice(0, 10),
  version: '1.0',
  steps: [{ ...defaultStep }],
  status: 'draft',
});

export default function PlanList() {
  const { plans, addPlan, deletePlan } = useFireStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState<EmergencyPlan>(emptyForm());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded((p) => (p === id ? null : id));

  const handleAdd = () => {
    const plan = { ...form, steps: form.steps.map((s, i) => ({ ...s, order: i + 1 })) };
    addPlan(plan);
    setDrawer(false);
    setForm(emptyForm());
  };

  const updateStep = (idx: number, field: keyof PlanStep, value: string) => {
    const steps = form.steps.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setForm({ ...form, steps });
  };

  const addStep = () => setForm({ ...form, steps: [...form.steps, { ...defaultStep, order: form.steps.length + 1 }] });

  const removeStep = (idx: number) => {
    const steps = form.steps.filter((_, i) => i !== idx);
    setForm({ ...form, steps });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif-title text-gray-900">预案文档</h1>
        <button onClick={() => { setForm(emptyForm()); setDrawer(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm"
          style={{ background: '#C41E3A' }}>
          <Plus size={16} /> 新增预案
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const statusInfo = planStatusMap[plan.status];
          const isOpen = expanded === plan.id;
          return (
            <div key={plan.id} className="rounded-xl shadow-sm bg-white overflow-hidden">
              <div className="p-5 cursor-pointer" onClick={() => toggle(plan.id)}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-500">{plan.scenarioType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">v{plan.version}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmId(plan.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="删除预案">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{plan.createDate}</span>
                  <span>{plan.steps.length} 个步骤</span>
                </div>
                <div className="mt-2 flex justify-end">
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="border-t px-5 py-4 bg-gray-50/50">
                  <div className="relative ml-4">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
                    {plan.steps.map((step) => (
                      <div key={step.order} className="relative flex items-start gap-4 pb-4 last:pb-0">
                        <div className="relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: '#C41E3A' }}>
                          {step.order}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{step.phase}</span>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{step.action}</p>
                          <p className="text-sm text-gray-500 mt-1">{step.responsible} · {step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmId(null)} />
          <div className="relative bg-white rounded-xl p-6 w-80 shadow-xl space-y-4">
            <h3 className="text-gray-900 font-medium text-base">确认删除预案</h3>
            <p className="text-sm text-gray-500">删除后将无法恢复，确定要删除该预案吗？</p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={() => { deletePlan(confirmId); setConfirmId(null); setExpanded(null); }}
                className="px-4 py-2 rounded-lg text-sm text-white transition-colors hover:opacity-90" style={{ background: '#C41E3A' }}>确认删除</button>
            </div>
          </div>
        </div>
      )}

      {drawer && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawer(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold font-serif-title">新增预案</h2>
              <button onClick={() => setDrawer(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">场景类型</label>
                <input value={form.scenarioType} onChange={(e) => setForm({ ...form, scenarioType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">预案标题</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">版本</label>
                  <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmergencyPlan['status'] })}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="draft">草稿</option>
                    <option value="active">启用</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">步骤列表</span>
                  <button onClick={addStep} className="text-sm text-white px-3 py-1 rounded" style={{ background: '#C41E3A' }}>
                    <Plus size={14} className="inline mr-1" />添加步骤
                  </button>
                </div>
                {form.steps.map((step, idx) => (
                  <div key={idx} className="border rounded-lg p-3 mb-3 space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">步骤 {idx + 1}</span>
                      {form.steps.length > 1 && (
                        <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      )}
                    </div>
                    <input placeholder="阶段" value={step.phase} onChange={(e) => updateStep(idx, 'phase', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm" />
                    <input placeholder="行动" value={step.action} onChange={(e) => updateStep(idx, 'action', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm" />
                    <input placeholder="负责人" value={step.responsible} onChange={(e) => updateStep(idx, 'responsible', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm" />
                    <input placeholder="描述" value={step.description} onChange={(e) => updateStep(idx, 'description', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm" />
                  </div>
                ))}
              </div>

              <button onClick={handleAdd}
                className="w-full py-2.5 rounded-lg text-white font-medium text-sm" style={{ background: '#C41E3A' }}>
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
