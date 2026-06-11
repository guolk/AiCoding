import { useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useFireStore } from '@/store/useFireStore';
import type { InspectionRecord } from '@/types';

const emptyForm = { facilityId: '', facilityName: '', inspectionDate: '', inspector: '', status: 'normal' as InspectionRecord['status'], issues: '' };

export default function InspectionList() {
  const { facilities, inspections, addInspection, deleteInspection } = useFireStore();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [inspectorSearch, setInspectorSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = inspections.filter((i) => {
    if (dateFrom && i.inspectionDate < dateFrom) return false;
    if (dateTo && i.inspectionDate > dateTo) return false;
    if (facilitySearch && !i.facilityName.includes(facilitySearch)) return false;
    if (inspectorSearch && !i.inspector.includes(inspectorSearch)) return false;
    return true;
  });

  const handleAdd = () => {
    const facility = facilities.find((f) => f.id === form.facilityId);
    addInspection({ id: Date.now().toString(), ...form, facilityName: facility?.name || '' });
    setForm(emptyForm);
    setAddOpen(false);
  };

  const statusBadge = (status: string) =>
    status === 'normal'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700';

  const statusLabel = (status: string) => (status === 'normal' ? '正常' : '异常');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-title text-2xl font-bold text-gray-900">检查记录</h1>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#C41E3A] text-white rounded-lg text-sm hover:bg-[#a01830] transition-colors">
          <Plus size={16} /> 新增记录
        </button>
      </div>

      <div className="flex flex-wrap gap-3 bg-white rounded-xl shadow-sm p-4">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
        <span className="self-center text-gray-400 text-sm">至</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
        <div className="relative flex-1 min-w-[160px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={facilitySearch} onChange={(e) => setFacilitySearch(e.target.value)} placeholder="设施名称" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={inspectorSearch} onChange={(e) => setInspectorSearch(e.target.value)} placeholder="检查人" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="px-4 py-3 text-left font-medium">设施名称</th>
              <th className="px-4 py-3 text-left font-medium">检查日期</th>
              <th className="px-4 py-3 text-left font-medium">检查人</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">问题</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{i.facilityName}</td>
                <td className="px-4 py-3 text-gray-600">{i.inspectionDate}</td>
                <td className="px-4 py-3 text-gray-600">{i.inspector}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(i.status)}`}>{statusLabel(i.status)}</span></td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{i.issues || '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDelId(i.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-white shadow-xl h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-title text-lg font-bold">新增检查记录</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">检查日期</label>
                <input type="date" value={form.inspectionDate} onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检查人</label>
                <input value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InspectionRecord['status'] })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]">
                  <option value="normal">正常</option>
                  <option value="abnormal">异常</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
                <textarea value={form.issues} onChange={(e) => setForm({ ...form, issues: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A] resize-none" />
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
            <p className="text-sm text-gray-500 mb-5">确定要删除该检查记录吗？此操作不可撤销。</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelId(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">取消</button>
              <button onClick={() => { deleteInspection(delId); setDelId(null); }} className="px-4 py-2 text-sm rounded-lg bg-[#C41E3A] text-white hover:bg-[#a01830]">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
