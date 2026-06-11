import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useFireStore } from '@/store/useFireStore';
import type { MaintenanceRecord } from '@/types';

const emptyForm = { facilityId: '', facilityName: '', type: '', maintenanceDate: '', maintainer: '', parts: '', cost: 0, description: '' };

export default function MaintenanceList() {
  const { facilities, maintenanceRecords, addMaintenance, deleteMaintenance } = useFireStore();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [delId, setDelId] = useState<string | null>(null);

  const handleAdd = () => {
    const facility = facilities.find((f) => f.id === form.facilityId);
    addMaintenance({ id: Date.now().toString(), ...form, facilityName: facility?.name || '', cost: Number(form.cost) });
    setForm(emptyForm);
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-title text-2xl font-bold text-gray-900">维护记录</h1>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#C41E3A] text-white rounded-lg text-sm hover:bg-[#a01830] transition-colors">
          <Plus size={16} /> 新增记录
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="px-4 py-3 text-left font-medium">设施名称</th>
              <th className="px-4 py-3 text-left font-medium">维护类型</th>
              <th className="px-4 py-3 text-left font-medium">维护日期</th>
              <th className="px-4 py-3 text-left font-medium">维护人</th>
              <th className="px-4 py-3 text-left font-medium">更换部件</th>
              <th className="px-4 py-3 text-left font-medium">费用(元)</th>
              <th className="px-4 py-3 text-left font-medium">描述</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRecords.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{m.facilityName}</td>
                <td className="px-4 py-3 text-gray-600">{m.type}</td>
                <td className="px-4 py-3 text-gray-600">{m.maintenanceDate}</td>
                <td className="px-4 py-3 text-gray-600">{m.maintainer}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{m.parts || '-'}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">¥{m.cost}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{m.description || '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDelId(m.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {maintenanceRecords.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-white shadow-xl h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-title text-lg font-bold">新增维护记录</h2>
              <button onClick={() => setAddOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联设施</label>
                <select value={form.facilityId} onChange={(e) => setForm({ ...form, facilityId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]">
                  <option value="">请选择设施</option>
                  {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}（{f.code}）</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">维护类型</label>
                <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="如：定期保养、故障维修" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">维护日期</label>
                <input type="date" value={form.maintenanceDate} onChange={(e) => setForm({ ...form, maintenanceDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">维护人</label>
                <input value={form.maintainer} onChange={(e) => setForm({ ...form, maintainer: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">更换部件</label>
                <input value={form.parts} onChange={(e) => setForm({ ...form, parts: e.target.value })} placeholder="如：灭火器喷管" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">费用(元)</label>
                <input type="number" value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A] resize-none" />
              </div>
              <button onClick={handleAdd} className="w-full py-2.5 bg-[#C41E3A] text-white rounded-lg text-sm font-medium hover:bg-[#a01830] transition-colors">确认新增</button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDelId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-medium text-gray-900 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-5">确定要删除该维护记录吗？此操作不可撤销。</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelId(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">取消</button>
              <button onClick={() => { deleteMaintenance(delId); setDelId(null); }} className="px-4 py-2 text-sm rounded-lg bg-[#C41E3A] text-white hover:bg-[#a01830]">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
