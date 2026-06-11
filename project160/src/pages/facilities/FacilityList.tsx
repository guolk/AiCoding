import { useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useFireStore } from '@/store/useFireStore';
import type { Facility } from '@/types';
import { facilityTypeMap, facilityStatusMap } from '@/utils/constants';

const emptyForm = { type: 'extinguisher' as Facility['type'], name: '', location: '', code: '', manufactureDate: '', expiryDate: '', status: 'normal' as Facility['status'] };

export default function FacilityList() {
  const { facilities, inspections, maintenanceRecords, addFacility, deleteFacility } = useFireStore();
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Facility | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = facilities.filter((f) => {
    if (typeFilter && f.type !== typeFilter) return false;
    if (statusFilter && f.status !== statusFilter) return false;
    if (search && !f.name.includes(search) && !f.code.includes(search) && !f.location.includes(search)) return false;
    return true;
  });

  const handleAdd = () => {
    addFacility({ id: Date.now().toString(), ...form, lastInspectionDate: '' });
    setForm(emptyForm);
    setAddOpen(false);
  };

  const relatedInspections = detail ? inspections.filter((i) => i.facilityId === detail.id) : [];
  const relatedMaintenance = detail ? maintenanceRecords.filter((m) => m.facilityId === detail.id) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-title text-2xl font-bold text-gray-900">设施台账</h1>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#C41E3A] text-white rounded-lg text-sm hover:bg-[#a01830] transition-colors">
          <Plus size={16} /> 新增设施
        </button>
      </div>

      <div className="flex flex-wrap gap-3 bg-white rounded-xl shadow-sm p-4">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]">
          <option value="">全部类型</option>
          {Object.entries(facilityTypeMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]">
          <option value="">全部状态</option>
          {Object.entries(facilityStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索名称/编号/位置" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="px-4 py-3 text-left font-medium">编号</th>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">类型</th>
              <th className="px-4 py-3 text-left font-medium">位置</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">过期日期</th>
              <th className="px-4 py-3 text-left font-medium">上次检查</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} onClick={() => setDetail(f)} className="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{f.code}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                <td className="px-4 py-3">{facilityTypeMap[f.type]}</td>
                <td className="px-4 py-3 text-gray-600">{f.location}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${facilityStatusMap[f.status]?.color}`}>{facilityStatusMap[f.status]?.label}</span></td>
                <td className="px-4 py-3 text-gray-600">{f.expiryDate}</td>
                <td className="px-4 py-3 text-gray-600">{f.lastInspectionDate || '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={(e) => { e.stopPropagation(); setDelId(f.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetail(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-xl h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-title text-lg font-bold">设施详情</h2>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['编号', detail.code], ['名称', detail.name], ['类型', facilityTypeMap[detail.type]],
                ['位置', detail.location], ['生产日期', detail.manufactureDate], ['过期日期', detail.expiryDate],
              ].map(([l, v]) => (
                <div key={l} className="flex"><span className="w-24 text-gray-500 shrink-0">{l}</span><span className="text-gray-900">{v}</span></div>
              ))}
              <div className="flex"><span className="w-24 text-gray-500 shrink-0">状态</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${facilityStatusMap[detail.status]?.color}`}>{facilityStatusMap[detail.status]?.label}</span></div>
            </div>
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-3">检查记录 ({relatedInspections.length})</h3>
              {relatedInspections.length === 0 && <p className="text-gray-400 text-sm">暂无</p>}
              {relatedInspections.map((i) => (
                <div key={i.id} className="border border-gray-100 rounded-lg p-3 mb-2 text-sm">
                  <div className="flex justify-between"><span>{i.inspectionDate}</span><span className={i.status === 'normal' ? 'text-emerald-600' : 'text-red-600'}>{i.status === 'normal' ? '正常' : '异常'}</span></div>
                  <p className="text-gray-500 mt-1">{i.issues || '无问题'}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">维护记录 ({relatedMaintenance.length})</h3>
              {relatedMaintenance.length === 0 && <p className="text-gray-400 text-sm">暂无</p>}
              {relatedMaintenance.map((m) => (
                <div key={m.id} className="border border-gray-100 rounded-lg p-3 mb-2 text-sm">
                  <div className="flex justify-between"><span>{m.maintenanceDate}</span><span className="text-gray-600">¥{m.cost}</span></div>
                  <p className="text-gray-500 mt-1">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-white shadow-xl h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-title text-lg font-bold">新增设施</h2>
              <button onClick={() => setAddOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: '类型', key: 'type' as const, type: 'select' },
                { label: '名称', key: 'name' as const, type: 'text' },
                { label: '位置', key: 'location' as const, type: 'text' },
                { label: '编号', key: 'code' as const, type: 'text' },
                { label: '生产日期', key: 'manufactureDate' as const, type: 'date' },
                { label: '过期日期', key: 'expiryDate' as const, type: 'date' },
                { label: '状态', key: 'status' as const, type: 'select' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]">
                      {f.key === 'type'
                        ? Object.entries(facilityTypeMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)
                        : Object.entries(facilityStatusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E3A]" />
                  )}
                </div>
              ))}
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
            <p className="text-sm text-gray-500 mb-5">确定要删除该设施吗？此操作不可撤销。</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelId(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">取消</button>
              <button onClick={() => { deleteFacility(delId); setDelId(null); }} className="px-4 py-2 text-sm rounded-lg bg-[#C41E3A] text-white hover:bg-[#a01830]">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
