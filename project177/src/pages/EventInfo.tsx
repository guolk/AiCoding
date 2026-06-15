import { useState, useEffect } from "react";
import { useEventStore } from "@/store";
import {
  Info, Layers, Plus, Edit2, Trash2, X, Save,
  Calendar, MapPin, Flag, Mountain, Users, FileText
} from "lucide-react";
import type { Category, Event } from "@/types";

type TabType = "info" | "categories";

const emptyCategory: Omit<Category, "id" | "event_id"> = {
  name: "", gender: "male", age_min: 18, age_max: 60,
  fee: 0, bib_prefix: "EX", bib_start: 100, distance_km: 0,
};

export default function EventInfo() {
  const {
    currentEvent, updateEvent,
    categories, addCategory, updateCategory, deleteCategory,
  } = useEventStore();

  const [activeTab, setActiveTab] = useState<TabType>("info");

  const [form, setForm] = useState<{
    name: string; date: string; location: string; distance_km: number; elevation: number;
    max_participants: number; status: Event["status"]; description: string;
  }>({
    name: "", date: "", location: "", distance_km: 0, elevation: 0,
    max_participants: 0, status: "draft", description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState(emptyCategory);
  const [catErrors, setCatErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentEvent) {
      setForm({
        name: currentEvent.name || "",
        date: currentEvent.date || "",
        location: currentEvent.location || "",
        distance_km: currentEvent.distance_km || 0,
        elevation: currentEvent.elevation || 0,
        max_participants: currentEvent.max_participants || 0,
        status: currentEvent.status || "draft",
        description: currentEvent.description || "",
      });
    }
  }, [currentEvent]);

  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        name: cat.name, gender: cat.gender, age_min: cat.age_min, age_max: cat.age_max,
        fee: cat.fee, bib_prefix: cat.bib_prefix, bib_start: cat.bib_start, distance_km: cat.distance_km,
      });
    } else {
      setEditingCat(null);
      setCatForm(emptyCategory);
    }
    setCatErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "请输入赛事名称";
    if (!form.date) e.date = "请选择赛事日期";
    if (!form.location.trim()) e.location = "请输入赛事地点";
    if (form.distance_km <= 0) e.distance_km = "总距离必须大于0";
    if (form.max_participants <= 0) e.max_participants = "最大参赛人数必须大于0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateCatForm = () => {
    const e: Record<string, string> = {};
    if (!catForm.name.trim()) e.name = "请输入组别名称";
    if (!catForm.bib_prefix.trim()) e.bib_prefix = "请输入号码前缀";
    if (catForm.bib_start < 1) e.bib_start = "起始号必须大于0";
    if (catForm.distance_km <= 0) e.distance_km = "距离必须大于0";
    if (catForm.age_min < 0) e.age_min = "最小年龄不能小于0";
    if (catForm.age_max <= catForm.age_min) e.age_max = "最大年龄需大于最小年龄";
    if (catForm.fee < 0) e.fee = "费用不能小于0";
    setCatErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    updateEvent(form);
    setErrors({});
  };

  const handleSaveCategory = () => {
    if (!validateCatForm()) return;
    if (editingCat) {
      updateCategory(editingCat.id, catForm);
    } else {
      addCategory(catForm);
    }
    setShowModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("确定删除该组别吗？")) deleteCategory(id);
  };

  const genderText = (g: string) =>
    g === "male" ? "男子" : g === "female" ? "女子" : "混合";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 border-b border-dark-600">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all ${
            activeTab === "info"
              ? "border-racing-green text-racing-green"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Info className="w-4 h-4" />赛事基本信息
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all ${
            activeTab === "categories"
              ? "border-racing-green text-racing-green"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />组别管理
        </button>
      </div>

      {activeTab === "info" && (
        <div className="card-glow max-w-4xl">
          <h2 className="section-title">
            <Flag className="w-5 h-5 text-racing-green" />赛事基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label">
                <Flag className="w-3.5 h-3.5 inline mr-1" />赛事名称 *
              </label>
              <input
                className="input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="请输入赛事名称"
              />
              {errors.name && <p className="text-xs text-racing-orange mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="label">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />赛事日期 *
              </label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
              {errors.date && <p className="text-xs text-racing-orange mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="label">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />赛事地点 *
              </label>
              <input
                className="input"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="请输入赛事地点"
              />
              {errors.location && <p className="text-xs text-racing-orange mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="label">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />总距离(km) *
              </label>
              <input
                type="number"
                className="input"
                value={form.distance_km}
                onChange={e => setForm({ ...form, distance_km: Number(e.target.value) })}
                min={0}
              />
              {errors.distance_km && <p className="text-xs text-racing-orange mt-1">{errors.distance_km}</p>}
            </div>
            <div>
              <label className="label">
                <Mountain className="w-3.5 h-3.5 inline mr-1" />累计海拔(m)
              </label>
              <input
                type="number"
                className="input"
                value={form.elevation}
                onChange={e => setForm({ ...form, elevation: Number(e.target.value) })}
                min={0}
              />
            </div>
            <div>
              <label className="label">
                <Users className="w-3.5 h-3.5 inline mr-1" />最大参赛人数 *
              </label>
              <input
                type="number"
                className="input"
                value={form.max_participants}
                onChange={e => setForm({ ...form, max_participants: Number(e.target.value) })}
                min={1}
              />
              {errors.max_participants && <p className="text-xs text-racing-orange mt-1">{errors.max_participants}</p>}
            </div>
            <div>
              <label className="label">赛事状态</label>
              <select
                className="input"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
              >
                <option value="draft">草稿</option>
                <option value="registration">报名中</option>
                <option value="ongoing">进行中</option>
                <option value="finished">已结束</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">
                <FileText className="w-3.5 h-3.5 inline mr-1" />赛事描述
              </label>
              <textarea
                className="input min-h-[120px] resize-y"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="请输入赛事描述"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="btn-primary">
              <Save className="w-4 h-4" />保存修改
            </button>
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">
              <Layers className="w-5 h-5 text-racing-green" />组别管理
              <span className="text-sm text-gray-500 ml-2">({categories.length}个组别)</span>
            </h2>
            <button onClick={() => openCategoryModal()} className="btn-primary">
              <Plus className="w-4 h-4" />添加组别
            </button>
          </div>

          <div className="card-glow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">组别名称</th>
                    <th className="table-header">性别</th>
                    <th className="table-header">年龄范围</th>
                    <th className="table-header">距离(km)</th>
                    <th className="table-header">费用(元)</th>
                    <th className="table-header">号码前缀</th>
                    <th className="table-header">起始号</th>
                    <th className="table-header text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-cell text-center text-gray-500 py-8">
                        暂无组别数据，点击"添加组别"创建
                      </td>
                    </tr>
                  ) : (
                    categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-dark-750/50 transition-colors">
                        <td className="table-cell font-medium text-white">{cat.name}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            cat.gender === "male" ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : cat.gender === "female" ? "bg-pink-500/15 text-pink-400 border-pink-500/30"
                                : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                          }`}>
                            {genderText(cat.gender)}
                          </span>
                        </td>
                        <td className="table-cell">{cat.age_min} - {cat.age_max}岁</td>
                        <td className="table-cell font-mono">{cat.distance_km}</td>
                        <td className="table-cell font-mono">¥{cat.fee}</td>
                        <td className="table-cell font-mono text-racing-green">{cat.bib_prefix}</td>
                        <td className="table-cell font-mono">{cat.bib_start}</td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openCategoryModal(cat)}
                              className="p-1.5 text-gray-400 hover:text-racing-green hover:bg-racing-green/10 rounded-sm transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 text-gray-400 hover:text-racing-orange hover:bg-racing-orange/10 rounded-sm transition-colors"
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
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-sm w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
              <h3 className="font-display text-lg font-semibold text-white">
                {editingCat ? "编辑组别" : "添加组别"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="label">组别名称 *</label>
                <input
                  className="input"
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="如：男子精英组"
                />
                {catErrors.name && <p className="text-xs text-racing-orange mt-1">{catErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">性别</label>
                  <select
                    className="input"
                    value={catForm.gender}
                    onChange={e => setCatForm({ ...catForm, gender: e.target.value as any })}
                  >
                    <option value="male">男子</option>
                    <option value="female">女子</option>
                    <option value="mixed">混合</option>
                  </select>
                </div>
                <div>
                  <label className="label">距离(km) *</label>
                  <input
                    type="number"
                    className="input"
                    value={catForm.distance_km}
                    onChange={e => setCatForm({ ...catForm, distance_km: Number(e.target.value) })}
                    min={0.1}
                    step={0.1}
                  />
                  {catErrors.distance_km && <p className="text-xs text-racing-orange mt-1">{catErrors.distance_km}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">最小年龄</label>
                  <input
                    type="number"
                    className="input"
                    value={catForm.age_min}
                    onChange={e => setCatForm({ ...catForm, age_min: Number(e.target.value) })}
                    min={0}
                  />
                  {catErrors.age_min && <p className="text-xs text-racing-orange mt-1">{catErrors.age_min}</p>}
                </div>
                <div>
                  <label className="label">最大年龄</label>
                  <input
                    type="number"
                    className="input"
                    value={catForm.age_max}
                    onChange={e => setCatForm({ ...catForm, age_max: Number(e.target.value) })}
                    min={0}
                  />
                  {catErrors.age_max && <p className="text-xs text-racing-orange mt-1">{catErrors.age_max}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">费用(元)</label>
                  <input
                    type="number"
                    className="input"
                    value={catForm.fee}
                    onChange={e => setCatForm({ ...catForm, fee: Number(e.target.value) })}
                    min={0}
                  />
                  {catErrors.fee && <p className="text-xs text-racing-orange mt-1">{catErrors.fee}</p>}
                </div>
                <div>
                  <label className="label">号码前缀 *</label>
                  <input
                    className="input uppercase"
                    value={catForm.bib_prefix}
                    onChange={e => setCatForm({ ...catForm, bib_prefix: e.target.value.toUpperCase() })}
                    placeholder="如：ME"
                    maxLength={4}
                  />
                  {catErrors.bib_prefix && <p className="text-xs text-racing-orange mt-1">{catErrors.bib_prefix}</p>}
                </div>
              </div>
              <div>
                <label className="label">起始号码 *</label>
                <input
                  type="number"
                  className="input"
                  value={catForm.bib_start}
                  onChange={e => setCatForm({ ...catForm, bib_start: Number(e.target.value) })}
                  min={1}
                />
                {catErrors.bib_start && <p className="text-xs text-racing-orange mt-1">{catErrors.bib_start}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-600">
              <button onClick={() => setShowModal(false)} className="btn-secondary">取消</button>
              <button onClick={handleSaveCategory} className="btn-primary">
                <Save className="w-4 h-4" />{editingCat ? "保存修改" : "添加组别"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
