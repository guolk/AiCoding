import { useState } from 'react';
import { useFireStore } from '@/store/useFireStore';
import type { OnboardingTraining } from '@/types';
import { Plus, Check, X, XCircle, TrendingUp, Users, Award, BarChart3 } from 'lucide-react';

const emptyForm = { employeeName: '', department: '', joinDate: '' };

export default function OnboardingList() {
  const { onboardingRecords, addOnboarding, updateOnboarding } = useFireStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');

  const total = onboardingRecords.length;
  const completed = onboardingRecords.filter(r => r.trainingCompleted).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const avgScore = total ? Math.round(onboardingRecords.reduce((s, r) => s + r.score, 0) / total) : 0;

  const handleAdd = () => {
    if (!form.employeeName || !form.department || !form.joinDate) return;
    const record: OnboardingTraining = {
      id: Date.now().toString(),
      employeeName: form.employeeName,
      department: form.department,
      joinDate: form.joinDate,
      trainingCompleted: false,
      completionDate: '',
      score: 0,
    };
    addOnboarding(record);
    setForm(emptyForm);
    setDrawerOpen(false);
  };

  const handleComplete = (id: string) => {
    const score = Number(scoreInput);
    if (isNaN(score) || score < 0 || score > 100) return;
    const rec = onboardingRecords.find(r => r.id === id);
    if (!rec) return;
    updateOnboarding(id, { trainingCompleted: true, completionDate: new Date().toISOString().slice(0, 10), score });
    setCompleteId(null);
    setScoreInput('');
  };

  const scoreColor = (s: number, done: boolean) => {
    if (!done || s === 0) return 'text-gray-400';
    if (s >= 90) return 'text-green-600';
    if (s >= 70) return 'text-blue-600';
    if (s < 60) return 'text-red-600';
    return 'text-gray-600';
  };

  const stats = [
    { label: '新员工总数', value: total, icon: Users, color: '#C41E3A' },
    { label: '已完成培训', value: completed, icon: Check, color: '#16a34a' },
    { label: '完成率', value: `${rate}%`, icon: TrendingUp, color: '#2563eb' },
    { label: '平均分数', value: avgScore, icon: Award, color: '#d97706' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-serif-title font-bold text-gray-900">入职培训追踪</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl shadow-sm bg-white p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl shadow-sm bg-white p-4 border border-gray-100 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">整体培训进度</span>
          <span className="font-medium" style={{ color: '#C41E3A' }}>{rate}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: '#C41E3A' }} />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#C41E3A' }}>
          <Plus size={16} />新增
        </button>
      </div>

      <div className="rounded-xl shadow-sm bg-white border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">员工姓名</th>
              <th className="text-left px-4 py-3 font-medium">部门</th>
              <th className="text-left px-4 py-3 font-medium">入职日期</th>
              <th className="text-left px-4 py-3 font-medium">培训状态</th>
              <th className="text-left px-4 py-3 font-medium">完成日期</th>
              <th className="text-left px-4 py-3 font-medium">分数</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {onboardingRecords.map(r => (
              <tr key={r.id} className={`hover:bg-gray-50 ${!r.trainingCompleted ? 'border-l-4 border-l-orange-400' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{r.employeeName}</td>
                <td className="px-4 py-3 text-gray-500">{r.department}</td>
                <td className="px-4 py-3 text-gray-500">{r.joinDate}</td>
                <td className="px-4 py-3">
                  {r.trainingCompleted
                    ? <Check size={16} className="text-green-500" />
                    : <X size={16} className="text-red-400" />}
                </td>
                <td className="px-4 py-3 text-gray-500">{r.completionDate || '-'}</td>
                <td className={`px-4 py-3 font-medium ${scoreColor(r.score, r.trainingCompleted)}`}>{r.trainingCompleted ? r.score : '-'}</td>
                <td className="px-4 py-3 text-right">
                  {!r.trainingCompleted && (
                    completeId === r.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <input type="number" min={0} max={100} value={scoreInput} onChange={e => setScoreInput(e.target.value)} placeholder="分数" className="w-16 border border-gray-300 rounded px-2 py-1 text-sm" />
                        <button onClick={() => handleComplete(r.id)} className="px-2 py-1 text-xs text-white rounded" style={{ backgroundColor: '#C41E3A' }}>确认</button>
                        <button onClick={() => { setCompleteId(null); setScoreInput(''); }} className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setCompleteId(r.id)} className="text-xs px-3 py-1 border rounded-lg" style={{ borderColor: '#C41E3A', color: '#C41E3A' }}>标记完成</button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-serif-title font-bold">新增入职培训</h2>
              <button onClick={() => setDrawerOpen(false)}><XCircle size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">员工姓名</label><input value={form.employeeName} onChange={e => setForm({ ...form, employeeName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">部门</label><input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">入职日期</label><input type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm">取消</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#C41E3A' }}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
