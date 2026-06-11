import { useState } from 'react';
import { Plus, Trash2, ClipboardCheck, X } from 'lucide-react';
import { useFireStore } from '@/store/useFireStore';
import type { Hazard } from '@/types';
import { hazardStatusMap } from '@/utils/constants';

const emptyForm = { description: '', discoveryDate: '', level: 'A' as 'A' | 'B', responsiblePerson: '', deadline: '', location: '' };

export default function HazardList() {
  const { hazards, addHazard, updateHazard, deleteHazard } = useFireStore();
  const [tab, setTab] = useState<'all' | 'A' | 'B'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<Hazard | null>(null);
  const [rectify, setRectify] = useState({ rectificationResult: '', completionDate: '' });

  const filtered = tab === 'all' ? hazards : hazards.filter((h) => h.level === tab);

  const handleAdd = () => {
    addHazard({ id: Date.now().toString(), ...form, status: 'pending', rectificationResult: '', completionDate: '' });
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

  const levelBadge = (level: 'A' | 'B') => (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${level === 'A' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
      {level}类
    </span>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif-title text-2xl font-bold text-gray-900">隐患记录</h1>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#C41E3A] text-white rounded-lg text-sm hover:bg-[#a8182f] transition-colors">
          <Plus size={16} />新增隐患
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'A', 'B'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-[#C41E3A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {t === 'all' ? '全部' : `${t}类`}
          </button>
        ))}
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
            {filtered.map((h) => (
              <tr key={h.id} className={`border-t border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${h.status === 'overdue' ? 'border-l-4 border-l-red-500 bg-red-50/50' : ''}`} onClick={() => openRectify(h)}>
                <td className="px-4 py-3 max-w-[200px] truncate">{h.description}</td>
                <td className="px-4 py-3 text-gray-500">{h.discoveryDate}</td>
                <td className="px-4 py-3">{levelBadge(h.level)}</td>
                <td className="px-4 py-3">{h.responsiblePerson}</td>
                <td className="px-4 py-3 text-gray-500">{h.deadline}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${hazardStatusMap[h.status].color}`}>{hazardStatusMap[h.status].label}</span>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openRectify(h)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="整改反馈"><ClipboardCheck size={16} /></button>
                  <button onClick={() => deleteHazard(h.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1" title="删除"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-title text-lg font-bold">新增隐患</h2>
              <button onClick={() => setAddOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">隐患描述</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">发现日期</label><input type="date" value={form.discoveryDate} onChange={(e) => setForm({ ...form, discoveryDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">隐患等级</label><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as 'A' | 'B' })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none"><option value="A">A类</option><option value="B">B类</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">责任人</label><input value={form.responsiblePerson} onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">位置</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none" /></div>
            </div>
            <button onClick={handleAdd} className="w-full mt-6 py-2 bg-[#C41E3A] text-white rounded-lg text-sm font-medium hover:bg-[#a8182f] transition-colors">确认添加</button>
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
              <p><span className="text-gray-500">等级：</span>{selected.level}类</p>
              <p><span className="text-gray-500">责任人：</span>{selected.responsiblePerson}</p>
              <p><span className="text-gray-500">当前状态：</span><span className={hazardStatusMap[selected.status].color + ' px-1.5 py-0.5 rounded text-xs'}>{hazardStatusMap[selected.status].label}</span></p>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">整改结果</label><textarea value={rectify.rectificationResult} onChange={(e) => setRectify({ ...rectify, rectificationResult: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none" rows={3} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">完成日期</label><input type="date" value={rectify.completionDate} onChange={(e) => setRectify({ ...rectify, completionDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none" /></div>
            </div>
            <button onClick={handleRectify} className="w-full mt-6 py-2 bg-[#C41E3A] text-white rounded-lg text-sm font-medium hover:bg-[#a8182f] transition-colors">确认整改</button>
          </div>
        </div>
      )}
    </div>
  );
}
