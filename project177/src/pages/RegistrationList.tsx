import { useState, useMemo } from "react";
import {
  Search, Plus, Edit2, Trash2, X, User, Users, Phone,
  Mail, Calendar, Shield, UserCheck, AlertTriangle
} from "lucide-react";
import { useEventStore } from "@/store";
import { calculateAge, formatDateTime } from "@/utils";
import type { Participant, Category } from "@/types";

interface FormState {
  name: string;
  gender: "male" | "female";
  category_id: string;
  birth_date: string;
  phone: string;
  email: string;
  id_card: string;
  team: string;
  emergency_contact: string;
  emergency_phone: string;
  health_declaration: boolean;
}

const emptyForm: FormState = {
  name: "",
  gender: "male",
  category_id: "",
  birth_date: "",
  phone: "",
  email: "",
  id_card: "",
  team: "",
  emergency_contact: "",
  emergency_phone: "",
  health_declaration: false,
};

export default function RegistrationList() {
  const {
    participants, categories, bibNumbers,
    addParticipant, updateParticipant, deleteParticipant
  } = useEventStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");

  const categoryMap = useMemo(() => {
    const m: Record<string, Category> = {};
    categories.forEach((c) => (m[c.id] = c));
    return m;
  }, [categories]);

  const bibMap = useMemo(() => {
    const m: Record<string, { prefix: string; number: number }> = {};
    bibNumbers.forEach((b) => {
      m[b.participant_id] = { prefix: b.prefix, number: b.number };
    });
    return m;
  }, [bibNumbers]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: participants.length };
    participants.forEach((p) => {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });
    return counts;
  }, [participants]);

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const bib = bibMap[p.id];
        const bibStr = bib ? `${bib.prefix}${bib.number}` : "";
        return (
          p.name.toLowerCase().includes(s) ||
          p.phone.includes(s) ||
          bibStr.toLowerCase().includes(s) ||
          (p.team || "").toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [participants, categoryFilter, search, bibMap]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id || "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (p: Participant) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      gender: p.gender,
      category_id: p.category_id,
      birth_date: p.birth_date,
      phone: p.phone,
      email: p.email || "",
      id_card: p.id_card || "",
      team: p.team || "",
      emergency_contact: p.emergency_contact,
      emergency_phone: p.emergency_phone,
      health_declaration: p.health_declaration,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    setError("");
    if (!form.name.trim()) return setError("请输入姓名");
    if (!form.phone.trim()) return setError("请输入手机号");
    if (!form.emergency_contact.trim()) return setError("请输入紧急联系人姓名");
    if (!form.emergency_phone.trim()) return setError("请输入紧急联系人电话");
    if (!form.birth_date) return setError("请输入出生日期");
    if (!form.category_id) return setError("请选择组别");
    if (!form.health_declaration) return setError("请勾选健康声明");

    if (editingId) {
      updateParticipant(editingId, form);
    } else {
      addParticipant(form);
    }
    setShowModal(false);
  };

  const detailParticipant = detailId ? participants.find((p) => p.id === detailId) : null;
  const detailBib = detailParticipant ? bibMap[detailParticipant.id] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Users className="w-7 h-7 text-green-400" />
            参赛者列表
          </h1>
          <p className="text-gray-400 text-sm">管理赛事所有报名参赛人员信息</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">总人数</div>
            <div className="text-2xl font-bold text-white">{categoryCounts.all}</div>
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4"
            >
              <div className="text-xs text-gray-400 mb-1">{cat.name}</div>
              <div className="text-2xl font-bold text-green-400">
                {categoryCounts[cat.id] || 0}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索姓名 / 号码布 / 手机号 / 车队..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500"
          >
            <option value="all">全部组别</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={openAdd}
            className="bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加参赛者
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50 text-gray-300 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">号码布</th>
                  <th className="px-4 py-3 text-left">姓名</th>
                  <th className="px-4 py-3 text-left">性别</th>
                  <th className="px-4 py-3 text-left">组别</th>
                  <th className="px-4 py-3 text-left">年龄</th>
                  <th className="px-4 py-3 text-left">手机</th>
                  <th className="px-4 py-3 text-left">紧急联系人</th>
                  <th className="px-4 py-3 text-left">车队</th>
                  <th className="px-4 py-3 text-left">报名时间</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <div>暂无参赛者数据</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const bib = bibMap[p.id];
                    const cat = categoryMap[p.category_id];
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setDetailId(p.id)}
                        className="hover:bg-gray-800/40 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          {bib ? (
                            <span className="inline-block bg-black border-2 border-green-500 text-green-400 font-mono font-bold px-2 py-1 rounded text-lg">
                              {bib.prefix}{bib.number}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                        <td className="px-4 py-3">
                          <span className={p.gender === "male" ? "text-blue-400" : "text-pink-400"}>
                            {p.gender === "male" ? "男" : "女"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300">{cat?.name || "-"}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{calculateAge(p.birth_date)}</td>
                        <td className="px-4 py-3 text-gray-300 font-mono">{p.phone}</td>
                        <td className="px-4 py-3 text-gray-300">
                          <div>{p.emergency_contact}</div>
                          <div className="text-xs text-gray-500 font-mono">{p.emergency_phone}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{p.team || "-"}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(p.registered_at)}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`确定要删除 ${p.name} 吗？`)) {
                                  deleteParticipant(p.id);
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? "编辑参赛者" : "添加参赛者"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-green-400" /> 姓名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500"
                    placeholder="请输入姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">性别 <span className="text-red-400">*</span></label>
                  <div className="flex gap-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.gender === "male"}
                        onChange={() => setForm({ ...form, gender: "male" })}
                        className="accent-green-500"
                      />
                      <span className="text-sm text-blue-400">男</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.gender === "female"}
                        onChange={() => setForm({ ...form, gender: "female" })}
                        className="accent-green-500"
                      />
                      <span className="text-sm text-pink-400">女</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">组别 <span className="text-red-400">*</span></label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500"
                  >
                    <option value="">请选择组别</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.bib_prefix})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-green-400" /> 出生日期 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-green-400" /> 手机号 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500 font-mono"
                    placeholder="138xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-green-400" /> 邮箱
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">身份证号</label>
                  <input
                    type="text"
                    value={form.id_card}
                    onChange={(e) => setForm({ ...form, id_card: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500 font-mono"
                    placeholder="选填"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">所属车队</label>
                  <input
                    type="text"
                    value={form.team}
                    onChange={(e) => setForm({ ...form, team: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500"
                    placeholder="选填"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-green-400" /> 紧急联系人姓名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.emergency_contact}
                    onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-green-400" /> 紧急联系人电话 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.emergency_phone}
                    onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-green-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.health_declaration}
                    onChange={(e) => setForm({ ...form, health_declaration: e.target.checked })}
                    className="mt-0.5 accent-green-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-400" />
                    健康声明：本人身体健康，无心脏病、高血压等不适宜剧烈运动的疾病，自愿承担赛事风险
                    <span className="text-red-400">*</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-800 sticky bottom-0 bg-gray-900">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg text-sm transition-colors"
              >
                {editingId ? "保存修改" : "提交报名"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailParticipant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailId(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900">
              <h2 className="text-lg font-semibold text-white">参赛者详情</h2>
              <button onClick={() => setDetailId(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                {detailBib && (
                  <div className="bg-black border-2 border-green-500 text-green-400 font-mono font-bold px-4 py-3 rounded text-3xl">
                    {detailBib.prefix}{detailBib.number}
                  </div>
                )}
                <div>
                  <div className="text-xl font-bold text-white">{detailParticipant.name}</div>
                  <div className="text-gray-400 text-sm mt-1">
                    <span className={detailParticipant.gender === "male" ? "text-blue-400" : "text-pink-400"}>
                      {detailParticipant.gender === "male" ? "男" : "女"}
                    </span>
                    <span className="mx-2">·</span>
                    {calculateAge(detailParticipant.birth_date)}岁
                    <span className="mx-2">·</span>
                    {categoryMap[detailParticipant.category_id]?.name}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">手机号</div>
                  <div className="text-gray-200 font-mono">{detailParticipant.phone}</div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">邮箱</div>
                  <div className="text-gray-200">{detailParticipant.email || "-"}</div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">车队</div>
                  <div className="text-gray-200">{detailParticipant.team || "-"}</div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="text-gray-500 text-xs mb-1">出生日期</div>
                  <div className="text-gray-200">{detailParticipant.birth_date}</div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg col-span-2">
                  <div className="text-gray-500 text-xs mb-1">紧急联系人</div>
                  <div className="text-gray-200">
                    {detailParticipant.emergency_contact} <span className="text-gray-500 mx-2">·</span>
                    <span className="font-mono">{detailParticipant.emergency_phone}</span>
                  </div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg col-span-2">
                  <div className="text-gray-500 text-xs mb-1">报名时间</div>
                  <div className="text-gray-200">{formatDateTime(detailParticipant.registered_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
