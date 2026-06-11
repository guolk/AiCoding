import { useState } from 'react';
import { useFireStore } from '@/store/useFireStore';
import type { TrainingRecord } from '@/types';
import { Plus, LayoutGrid, List, Trash2, X, Users, Calendar, User } from 'lucide-react';

const emptyForm = { title: '', date: '', content: '', trainer: '', participants: '', passRate: 0, status: 'scheduled' as 'completed' | 'scheduled' };

export default function TrainingList() {
  const { trainingRecords, addTraining, deleteTraining } = useFireStore();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = () => {
    if (!form.title || !form.date) return;
    const record: TrainingRecord = {
      id: Date.now().toString(),
      title: form.title,
      date: form.date,
      content: form.content,
      trainer: form.trainer,
      participants: form.participants.split(',').map(s => s.trim()).filter(Boolean),
      passRate: form.passRate,
      status: form.status,
    };
    addTraining(record);
    setForm(emptyForm);
    setDrawerOpen(false);
  };

  const passRateColor = (r: number) => r >= 90 ? 'bg-green-500' : r >= 70 ? 'bg-blue-500' : 'bg-orange-500';
  const passRateTextColor = (r: number) => r >= 90 ? 'text-green-600' : r >= 70 ? 'text-blue-600' : 'text-orange-600';
  const statusBadge = (s: string) => s === 'completed'
    ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif-title font-bold text-gray-900">培训记录</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView('card')} className={`p-2 rounded-md ${view === 'card' ? 'bg-white shadow-sm' : ''}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setView('table')} className={`p-2 rounded-md ${view === 'table' ? 'bg-white shadow-sm' : ''}`}><List size={16} /></button>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#C41E3A' }}>
            <Plus size={16} />新增
          </button>
        </div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trainingRecords.map(r => (
            <div key={r.id} className="rounded-xl shadow-sm bg-white p-5 space-y-3 border border-gray-100">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{r.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(r.status)}`}>{r.status === 'completed' ? '已完成' : '待进行'}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={14} />{r.date}</span>
                <span className="flex items-center gap-1"><User size={14} />{r.trainer}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{r.content}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users size={14} /><span>{r.participants.join('、')}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">通过率</span>
                  <span className={`font-medium ${passRateTextColor(r.passRate)}`}>{r.passRate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${passRateColor(r.passRate)}`} style={{ width: `${r.passRate}%` }} />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => deleteTraining(r.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl shadow-sm bg-white border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">培训名称</th>
                <th className="text-left px-4 py-3 font-medium">日期</th>
                <th className="text-left px-4 py-3 font-medium">培训师</th>
                <th className="text-left px-4 py-3 font-medium">参与人</th>
                <th className="text-left px-4 py-3 font-medium">通过率</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trainingRecords.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                  <td className="px-4 py-3 text-gray-500">{r.date}</td>
                  <td className="px-4 py-3 text-gray-500">{r.trainer}</td>
                  <td className="px-4 py-3 text-gray-500">{r.participants.join('、')}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${passRateTextColor(r.passRate)}`}>{r.passRate}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(r.status)}`}>{r.status === 'completed' ? '已完成' : '待进行'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteTraining(r.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-serif-title font-bold">新增培训记录</h2>
              <button onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">培训名称</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">日期</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">内容</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">培训师</label><input value={form.trainer} onChange={e => setForm({ ...form, trainer: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">参与人（逗号分隔）</label><input value={form.participants} onChange={e => setForm({ ...form, participants: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">通过率</label><input type="number" min={0} max={100} value={form.passRate} onChange={e => setForm({ ...form, passRate: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'completed' | 'scheduled' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="scheduled">待进行</option><option value="completed">已完成</option></select></div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm">取消</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#C41E3A' }}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
