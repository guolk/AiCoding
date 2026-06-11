import { useState } from 'react';
import { Plus, Trash2, ClipboardCheck, X, Info } from 'lucide-react';
import { useFireStore } from '@/store/useFireStore';
import type { Hazard } from '@/types';
import { hazardStatusMap } from '@/utils/constants';

const emptyForm = { description: '', discoveryDate: '', responsiblePerson: '', deadline: '', location: '' };

export default function HazardLevelB() {
  const { hazards, addHazard, updateHazard, deleteHazard } = useFireStore();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<Hazard | null>(null);
  const [rectify, setRectify] = useState({ rectificationResult: '', completionDate: '' });

  const list = hazards.filter((h) => h.level === 'B');
  const pendingCount = list.filter((h) => h.status === 'pending' || h.status === 'overdue').length;
  const completedCount = list.filter((h) => h.status === 'completed').length;

  const handleAdd = () => {
    addHazard({ id: Date.now().toString(), ...form, level: 'B', status: 'pending', rectificationResult: '', completionDate: '' });
    setForm(emptyForm);
    setAddOpen(false);
  };

  const openRectify = (h: Hazard) => {
    setSelected(h);
    setRectify({ rectificationResult: h.rectificationResult, completionDate: h.completionDate });
  };

  const handleRectify = () => {
    if (!selected) return;
    updateHazard(selected.id, { ...rectify, status: 'completed' });
    setSelected(null);
  };

  return (
    <div>
      <div className="rounded-xl shadow-sm bg-gradient-to-r from-orange-500 to-[#FF6B35] p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Info size={28} />
          <h1 className="font-serif-title text-2xl font-bold">B类一般隐患</h1>
        </div>
        <div className="flex gap-8">
          <div><p className="text-orange-200 text-xs">总数</p><p className="text-3xl font-bold">{list.length}</p></div>
          <div><p className="text-orange-200 text-xs">待整改/超期</p><p className="text-3xl font-bold">{pendingCount}</p></div>
          <div><p className="text-orange-200 text-xs">已整改</p><p className="text-3xl font-bold">{completedCount}</p></div>
        </div>
      </div>

      <div className="flex items-center justify-end mb-4">
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm hover:bg-[#e55a2b] transition-colors">
          <Plus size={16} />新增B类隐患
        </button>
      </div>

      <div className="rounded-xl shadow-sm bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-left">
              <th className="px-4 py-3 font-medium">隐患描述</th>
              <th className="px-4 py-3 font-medium">发现日期</th>
              <th className="px-4 py-3 font-medium">等级</th>
              <th className="px-4 py-3 font-medium">责任人</th>
              <th className="px-4 py-3 font-medium">截止日期</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((h) => (
              <tr key={h.id} className={`border-t border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${h.status === 'overdue' ? 'border-l-4 border-l-orange-500 bg-orange-50/50' : ''}`} onClick={() => openRectify(h)}>
                <td className="px-4 py-3 max-w-[200px] truncate">{h.description}</td>
                <td className="px-4 py-3 text-gray-500">{h.discoveryDate}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">B类</span></td>
                <td className="px-4 py-3">{h.responsiblePerson}</td>
                <td className="px-4 py-3 text-gray-500">{h.deadline}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${hazardStatusMap[h.status].color}`}>{hazardStatusMap[h.status].label}</span></td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openRectify(h)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="整改反馈"><ClipboardCheck size={16} /></button>
                  <button onClick={() => deleteHazard(h.id)} className="p-1 text-orange-500 hover:bg-orange-50 rounded ml-1" title="删除"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">暂无B类隐患</td></tr>}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-title text-lg font-bold">新增B类隐患</h2>
              <button onClick={() => setAddOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="px-3 py-2 bg-orange-50 text-orange-700 text-sm rounded-lg">隐患等级：<span className="font-medium">B类 · 一般隐患</span></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">隐患描述</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">发现日期</label><input type="date" value={form.discoveryDate} onChange={(e) => setForm({ ...form, discoveryDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">责任人</label><input value={form.responsiblePerson} onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">位置</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none" /></div>
            </div>
            <button onClick={handleAdd} className="w-full mt-6 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#e55a2b] transition-colors">确认添加</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-title text-lg font-bold">整改反馈</h2>
              <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <p><span className="text-gray-500">隐患描述：</span>{selected.description}</p>
              <p><span className="text-gray-500">等级：</span>B类一般隐患</p>
              <p><span className="text-gray-500">责任人：</span>{selected.responsiblePerson}</p>
              <p><span className="text-gray-500">当前状态：</span><span className={hazardStatusMap[selected.status].color + ' px-1.5 py-0.5 rounded text-xs'}>{hazardStatusMap[selected.status].label}</span></p>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">整改结果</label><textarea value={rectify.rectificationResult} onChange={(e) => setRectify({ ...rectify, rectificationResult: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none" rows={3} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">完成日期</label><input type="date" value={rectify.completionDate} onChange={(e) => setRectify({ ...rectify, completionDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none" /></div>
            </div>
            <button onClick={handleRectify} className="w-full mt-6 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#e55a2b] transition-colors">确认整改</button>
          </div>
        </div>
      )}
    </div>
  );
}
