import { useState } from 'react';
import { useFireStore } from '@/store/useFireStore';
import type { DrillRecord } from '@/types';
import { evaluationMap } from '@/utils/constants';
import { Plus, List, Clock, Trash2, X, Calendar } from 'lucide-react';

const evalOptions: DrillRecord['evaluation'][] = ['excellent', 'good', 'average', 'poor'];

const emptyForm = (plans: { id: string; title: string }[]): DrillRecord => ({
  id: Date.now().toString(),
  name: '',
  date: new Date().toISOString().slice(0, 10),
  type: '',
  participants: 0,
  evaluation: 'good',
  summary: '',
  planId: plans[0]?.id ?? '',
});

export default function DrillList() {
  const { drills, plans, addDrill, deleteDrill } = useFireStore();
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState<DrillRecord>(emptyForm(plans));
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const sorted = [...drills].sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    addDrill(form);
    setDrawer(false);
    setForm(emptyForm(plans));
  };

  const getPlanTitle = (planId: string) => plans.find((p) => p.id === planId)?.title ?? '-';

  const truncate = (s: string, n = 30) => (s.length > n ? s.slice(0, n) + '...' : s);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif-title text-gray-900">演练管理</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              <List size={14} /> 列表
            </button>
            <button onClick={() => setView('timeline')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${view === 'timeline' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              <Clock size={14} /> 时间线
            </button>
          </div>
          <button onClick={() => { setForm(emptyForm(plans)); setDrawer(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm"
            style={{ background: '#C41E3A' }}>
            <Plus size={16} /> 新增演练
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="rounded-xl shadow-sm bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-5 py-3 font-medium">演练名称</th>
                <th className="px-5 py-3 font-medium">日期</th>
                <th className="px-5 py-3 font-medium">类型</th>
                <th className="px-5 py-3 font-medium">参与人数</th>
                <th className="px-5 py-3 font-medium">评价</th>
                <th className="px-5 py-3 font-medium">总结</th>
                <th className="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((d) => {
                const ev = evaluationMap[d.evaluation];
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-5 py-3 text-gray-600">{d.date}</td>
                    <td className="px-5 py-3 text-gray-600">{d.type}</td>
                    <td className="px-5 py-3 text-gray-600">{d.participants}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ev.color}`}>{ev.label}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{truncate(d.summary)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setConfirmId(d.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative ml-4">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          {sorted.map((d) => {
            const ev = evaluationMap[d.evaluation];
            return (
              <div key={d.id} className="relative flex items-start gap-5 pb-8">
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#C41E3A' }}>
                  <Calendar size={16} className="text-white" />
                </div>
                <div className="flex-1 rounded-xl shadow-sm bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{d.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{d.date} · {d.type}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ev.color}`}>{ev.label}</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p>参与人数：{d.participants}</p>
                    <p>关联预案：{getPlanTitle(d.planId)}</p>
                    <p>总结：{d.summary}</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={() => setConfirmId(d.id)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm">
                      <Trash2 size={13} /> 删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg space-y-4">
            <p className="text-gray-900 font-medium">确认删除该演练记录？</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmId(null)} className="px-4 py-1.5 rounded-lg text-sm text-gray-600 border">取消</button>
              <button onClick={() => { deleteDrill(confirmId); setConfirmId(null); }}
                className="px-4 py-1.5 rounded-lg text-sm text-white" style={{ background: '#C41E3A' }}>确认</button>
            </div>
          </div>
        </div>
      )}

      {drawer && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawer(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold font-serif-title">新增演练</h2>
              <button onClick={() => setDrawer(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">演练名称</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">参与人数</label>
                  <input type="number" value={form.participants} onChange={(e) => setForm({ ...form, participants: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">评价</label>
                  <select value={form.evaluation} onChange={(e) => setForm({ ...form, evaluation: e.target.value as DrillRecord['evaluation'] })}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    {evalOptions.map((e) => <option key={e} value={e}>{evaluationMap[e].label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联预案</label>
                <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">演练总结</label>
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
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
