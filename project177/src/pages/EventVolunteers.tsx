import { useState, useMemo } from "react";
import { useEventStore } from "@/store";
import type { Volunteer } from "@/types";
import {
  HeartHandshake, Users, UserCheck, MapPin, Plus,
  Edit2, Trash2, X, Save, Search, Phone, Mail,
  User, Shield, ToggleLeft, ToggleRight
} from "lucide-react";

const STATUS_CONFIG: Record<Volunteer["status"], { label: string; class: string }> = {
  pending: { label: "待确认", class: "badge-gray" },
  confirmed: { label: "已确认", class: "bg-blue-500/15 text-blue-400 border border-blue-500/30 badge" },
  arrived: { label: "已到岗", class: "badge-green" },
  completed: { label: "已完成", class: "bg-purple-500/15 text-purple-400 border border-purple-500/30 badge" },
};

const STATUS_FLOW: Volunteer["status"][] = ["pending", "confirmed", "arrived", "completed"];

const emptyVolunteer: Omit<Volunteer, "id" | "event_id"> = {
  name: "", phone: "", email: "", role: "起终点管理", area: "", status: "pending",
};

export default function EventVolunteers() {
  const { volunteers, addVolunteer, updateVolunteer, deleteVolunteer } = useEventStore();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVol, setEditingVol] = useState<Volunteer | null>(null);
  const [form, setForm] = useState(emptyVolunteer);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stats = useMemo(() => ({
    total: volunteers.length,
    confirmed: volunteers.filter(v => v.status === "confirmed" || v.status === "arrived" || v.status === "completed").length,
    arrived: volunteers.filter(v => v.status === "arrived").length,
  }), [volunteers]);

  const filteredVolunteers = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return volunteers;
    return volunteers.filter(v =>
      v.name.toLowerCase().includes(s) ||
      v.phone.includes(s) ||
      (v.email && v.email.toLowerCase().includes(s)) ||
      v.role.toLowerCase().includes(s) ||
      v.area.toLowerCase().includes(s)
    );
  }, [volunteers, search]);

  const openModal = (vol?: Volunteer) => {
    if (vol) {
      setEditingVol(vol);
      setForm({
        name: vol.name, phone: vol.phone, email: vol.email || "",
        role: vol.role, area: vol.area, status: vol.status,
      });
    } else {
      setEditingVol(null);
      setForm(emptyVolunteer);
    }
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "请输入姓名";
    if (!form.phone.trim()) e.phone = "请输入联系电话";
    else if (!/^1[3-9]\d{9}$/.test(form.phone)) e.phone = "请输入正确的手机号";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "请输入正确的邮箱";
    if (!form.role.trim()) e.role = "请选择角色";
    if (!form.area.trim()) e.area = "请输入分工区域";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingVol) {
      updateVolunteer(editingVol.id, form);
    } else {
      addVolunteer(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定删除该志愿者吗？")) deleteVolunteer(id);
  };

  const toggleStatus = (vol: Volunteer) => {
    const idx = STATUS_FLOW.indexOf(vol.status);
    const next = STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
    updateVolunteer(vol.id, { status: next });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">志愿者管理</h1>
          <p className="text-sm text-gray-400">管理赛事志愿者团队信息和到岗状态</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-glow flex items-center gap-4">
          <div className="p-3 rounded-sm bg-racing-green">
            <Users className="w-6 h-6 text-dark-950" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">总志愿者</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="card-glow flex items-center gap-4">
          <div className="p-3 rounded-sm bg-blue-500">
            <UserCheck className="w-6 h-6 text-dark-950" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">已确认</p>
            <p className="stat-value">{stats.confirmed}</p>
          </div>
        </div>
        <div className="card-glow flex items-center gap-4">
          <div className="p-3 rounded-sm bg-amber-500">
            <MapPin className="w-6 h-6 text-dark-950" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">已到岗</p>
            <p className="stat-value">{stats.arrived}</p>
          </div>
        </div>
      </div>

      <div className="card-glow">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="section-title mb-0">
            <HeartHandshake className="w-5 h-5 text-racing-green" />志愿者列表
            <span className="text-sm text-gray-500 ml-2">({filteredVolunteers.length}人)</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className="input pl-9 w-64"
                placeholder="搜索姓名/电话/角色..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button onClick={() => openModal()} className="btn-primary whitespace-nowrap">
              <Plus className="w-4 h-4" />添加志愿者
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">姓名</th>
                <th className="table-header">联系电话</th>
                <th className="table-header">邮箱</th>
                <th className="table-header">角色</th>
                <th className="table-header">分工区域</th>
                <th className="table-header">状态</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center text-gray-500 py-12">
                    {search ? "未找到匹配的志愿者" : "暂无志愿者数据，点击\"添加志愿者\"创建"}
                  </td>
                </tr>
              ) : (
                filteredVolunteers.map(v => (
                  <tr key={v.id} className="hover:bg-dark-750/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="font-medium text-white">{v.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5 text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        {v.phone}
                      </span>
                    </td>
                    <td className="table-cell text-gray-400">
                      {v.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                          <span className="truncate max-w-[180px]">{v.email}</span>
                        </span>
                      ) : "-"}
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5 text-gray-300">
                        <Shield className="w-3.5 h-3.5 text-racing-green" />
                        {v.role}
                      </span>
                    </td>
                    <td className="table-cell text-gray-300">{v.area}</td>
                    <td className="table-cell">
                      <span className={STATUS_CONFIG[v.status].class}>
                        {STATUS_CONFIG[v.status].label}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleStatus(v)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-sm transition-colors"
                          title="切换状态"
                        >
                          {v.status === "completed" ? (
                            <ToggleLeft className="w-4 h-4" />
                          ) : (
                            <ToggleRight className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openModal(v)}
                          className="p-1.5 text-gray-400 hover:text-racing-green hover:bg-racing-green/10 rounded-sm transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 text-gray-400 hover:text-racing-orange hover:bg-racing-orange/10 rounded-sm transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-sm w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
              <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-racing-green" />
                {editingVol ? "编辑志愿者" : "添加志愿者"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">姓名 *</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="请输入姓名"
                  />
                  {errors.name && <p className="text-xs text-racing-orange mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="label">联系电话 *</label>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="请输入手机号"
                  />
                  {errors.phone && <p className="text-xs text-racing-orange mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="label">邮箱</label>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="请输入邮箱（选填）"
                />
                {errors.email && <p className="text-xs text-racing-orange mt-1">{errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">角色 *</label>
                  <select
                    className="input"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="起终点管理">起终点管理</option>
                    <option value="补给站">补给站</option>
                    <option value="医疗">医疗</option>
                    <option value="计时">计时</option>
                    <option value="引导">引导</option>
                    <option value="安全保障">安全保障</option>
                    <option value="后勤">后勤</option>
                    <option value="摄影">摄影</option>
                  </select>
                  {errors.role && <p className="text-xs text-racing-orange mt-1">{errors.role}</p>}
                </div>
                <div>
                  <label className="label">分工区域 *</label>
                  <input
                    className="input"
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                    placeholder="如：起点/终点"
                  />
                  {errors.area && <p className="text-xs text-racing-orange mt-1">{errors.area}</p>}
                </div>
              </div>
              <div>
                <label className="label">状态</label>
                <select
                  className="input"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as Volunteer["status"] })}
                >
                  <option value="pending">待确认</option>
                  <option value="confirmed">已确认</option>
                  <option value="arrived">已到岗</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-600">
              <button onClick={() => setShowModal(false)} className="btn-secondary">取消</button>
              <button onClick={handleSave} className="btn-primary">
                <Save className="w-4 h-4" />{editingVol ? "保存修改" : "添加志愿者"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
