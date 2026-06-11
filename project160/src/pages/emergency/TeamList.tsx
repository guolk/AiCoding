import { useState } from 'react';
import { useFireStore } from '@/store/useFireStore';
import type { TeamMember } from '@/types';
import { Plus, Phone, Trash2, X, Users } from 'lucide-react';

const groups = ['指挥组', '灭火行动组', '疏散引导组', '通讯联络组', '医疗救护组'];

const groupIcons: Record<string, string> = {
  '指挥组': '🎯', '灭火行动组': '🔥', '疏散引导组': '🚪', '通讯联络组': '📡', '医疗救护组': '🏥',
};

const emptyForm = (): TeamMember => ({
  id: Date.now().toString(),
  name: '',
  role: '',
  responsibility: '',
  phone: '',
  group: groups[0],
});

export default function TeamList() {
  const { teamMembers, addTeamMember, deleteTeamMember } = useFireStore();
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState<TeamMember>(emptyForm());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const grouped = groups.map((g) => ({
    name: g,
    icon: groupIcons[g],
    members: teamMembers.filter((m) => m.group === g),
  }));

  const handleAdd = () => {
    addTeamMember(form);
    setDrawer(false);
    setForm(emptyForm());
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif-title text-gray-900">应急小组</h1>
        <button onClick={() => { setForm(emptyForm()); setDrawer(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm"
          style={{ background: '#C41E3A' }}>
          <Plus size={16} /> 新增成员
        </button>
      </div>

      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.name} className="rounded-xl shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: '#FEF2F2' }}>
              <span className="text-lg">{group.icon}</span>
              <h2 className="text-base font-semibold font-serif-title text-gray-900">{group.name}</h2>
              <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                <Users size={12} /> {group.members.length} 人
              </span>
            </div>
            {group.members.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">暂无成员</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {group.members.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow relative group">
                    <button onClick={() => setConfirmId(member.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: '#C41E3A' }}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{member.name}</p>
                        <p className="text-xs font-semibold" style={{ color: '#C41E3A' }}>{member.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{member.responsibility}</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone size={13} />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg space-y-4">
            <p className="text-gray-900 font-medium">确认删除该成员？</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmId(null)} className="px-4 py-1.5 rounded-lg text-sm text-gray-600 border">取消</button>
              <button onClick={() => { deleteTeamMember(confirmId); setConfirmId(null); }}
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
              <h2 className="text-lg font-semibold font-serif-title">新增成员</h2>
              <button onClick={() => setDrawer(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">职务</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">职责</label>
                <input value={form.responsibility} onChange={(e) => setForm({ ...form, responsibility: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属小组</label>
                <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  {groups.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
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
