import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  FileCheck,
  Send,
  Calendar,
  Edit3,
  Trash2,
  Users,
  GraduationCap,
} from "lucide-react";
import { useMaterialStore } from "@/store/useMaterialStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_COLORS,
  MATERIAL_CATEGORY_LABELS,
} from "@/types";
import { formatDate } from "@/utils/date";

const categoryFilters = [
  { value: "all", label: "全部类型", icon: "📋" },
  { value: "transcript", label: "成绩单", icon: "📊" },
  { value: "language_score", label: "语言成绩", icon: "🌐" },
  { value: "recommendation", label: "推荐信", icon: "✉️" },
  { value: "resume", label: "个人简历", icon: "📄" },
  { value: "portfolio", label: "作品集", icon: "🎨" },
  { value: "other", label: "其他材料", icon: "📁" },
];

const statusFilters = [
  { value: "all", label: "全部状态" },
  { value: "not_started", label: "未开始" },
  { value: "preparing", label: "准备中" },
  { value: "completed", label: "已完成" },
  { value: "submitted", label: "已提交" },
];

export default function MaterialList() {
  const { materials, recommenders, updateMaterial, markMaterialSubmitted, deleteMaterial } = useMaterialStore();
  const { universities } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");

  const getUniversityName = (id: string) => {
    return universities.find((u) => u.id === id)?.name || "未知院校";
  };

  const getUniversityLogo = (id: string) => {
    return universities.find((u) => u.id === id)?.logoUrl;
  };

  const filteredMaterials = materials.filter((m) => {
    if (categoryFilter !== "all" && m.category !== categoryFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (universityFilter !== "all" && m.universityId !== universityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.note.toLowerCase().includes(q) ||
        getUniversityName(m.universityId).toLowerCase().includes(q)
      );
    }
    return true;
  });

  // 按院校分组
  const groupedByUniversity = filteredMaterials.reduce((acc, m) => {
    if (!acc[m.universityId]) {
      acc[m.universityId] = [];
    }
    acc[m.universityId].push(m);
    return acc;
  }, {} as Record<string, typeof filteredMaterials>);

  // 统计
  const stats = {
    total: materials.length,
    notStarted: materials.filter((m) => m.status === "not_started").length,
    preparing: materials.filter((m) => m.status === "preparing").length,
    completed: materials.filter((m) => m.status === "completed" || m.status === "submitted").length,
    pendingRequests: recommenders.reduce(
      (sum, r) => sum + r.requests.filter((req) => req.status !== "submitted").length,
      0
    ),
  };

  const statusIcons = {
    not_started: Circle,
    preparing: Clock,
    completed: FileCheck,
    submitted: Send,
  };

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">材料准备</h1>
          <p className="mt-1 text-slate-500">管理成绩单、语言成绩、推荐信等所有申请材料</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/materials/recommenders" className="btn-secondary">
            <Users className="w-4 h-4" /> 推荐人管理
          </Link>
          <button className="btn-primary">
            <Plus className="w-4 h-4" /> 添加材料
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "材料总数", value: stats.total, icon: FolderOpen, color: "bg-primary-50 text-primary-700", bar: "gradient-primary" },
          { label: "未开始", value: stats.notStarted, icon: Circle, color: "bg-slate-50 text-slate-600", bar: "bg-slate-400" },
          { label: "准备中", value: stats.preparing, icon: Clock, color: "bg-accent-50 text-accent-700", bar: "gradient-accent" },
          { label: "已完成/提交", value: stats.completed, icon: CheckCircle2, color: "bg-success-50 text-success-600", bar: "gradient-success" },
          { label: "待推荐信", value: stats.pendingRequests, icon: Users, color: "bg-purple-50 text-purple-700", bar: "bg-gradient-to-r from-purple-600 to-indigo-500" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card p-5 relative overflow-hidden">
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{item.value}</div>
              <div className="text-sm text-slate-500 mt-1">{item.label}</div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${item.bar}`} />
            </div>
          );
        })}
      </div>

      {/* 筛选栏 */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索材料名称、备注..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select min-w-[140px]"
              >
                {categoryFilters.map((f) => (
                  <option key={f.value} value={f.value}>{f.icon} {f.label}</option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select min-w-[130px]"
            >
              {statusFilters.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="select min-w-[160px]"
            >
              <option value="all">全部院校</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 材料清单 - 按院校分组 */}
      <div className="space-y-6">
        {Object.entries(groupedByUniversity).map(([uniId, items]) => {
          const completedCount = items.filter(
            (m) => m.status === "completed" || m.status === "submitted"
          ).length;
          const progress = (completedCount / items.length) * 100;

          return (
            <div key={uniId} className="card overflow-hidden">
              {/* 院校分组头部 */}
              <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getUniversityLogo(uniId)}
                        alt=""
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-lg text-slate-800 flex items-center gap-2">
                        {getUniversityName(uniId)}
                        <span className="badge bg-slate-100 text-slate-600 text-xs font-normal">
                          {items.length} 项材料
                        </span>
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          已完成 {completedCount}/{items.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-48">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">完整度</span>
                      <span className="font-bold text-primary-700">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${
                          progress === 100
                            ? "bg-gradient-to-r from-success-500 to-success-400"
                            : "bg-gradient-to-r from-primary-700 to-primary-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 材料项列表 */}
              <div className="divide-y divide-slate-100">
                {items.map((material, idx) => {
                  const StatusIcon = statusIcons[material.status];
                  return (
                    <div
                      key={material.id}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className="p-4 hover:bg-slate-50/70 transition-colors animate-fade-in group"
                    >
                      <div className="flex items-center gap-4">
                        {/* 状态图标 */}
                        <button
                          onClick={() => {
                            if (material.status !== "submitted") {
                              const cycle: Record<string, string> = {
                                not_started: "preparing",
                                preparing: "completed",
                                completed: "submitted",
                              };
                              updateMaterial(material.id, {
                                status: cycle[material.status] as any,
                                submittedAt:
                                  cycle[material.status] === "submitted"
                                    ? new Date().toISOString().split("T")[0]
                                    : undefined,
                              });
                            }
                          }}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            material.status === "submitted"
                              ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md shadow-primary-200"
                              : material.status === "completed"
                                ? "bg-gradient-to-br from-success-500 to-success-400 text-white shadow-md shadow-success-200"
                                : material.status === "preparing"
                                  ? "bg-gradient-to-br from-accent-500 to-accent-400 text-white shadow-md shadow-accent-200"
                                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          <StatusIcon className="w-5 h-5" />
                        </button>

                        {/* 主内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-800">
                              {material.name}
                            </span>
                            <span className="badge bg-slate-100 text-slate-600">
                              {categoryFilters.find((c) => c.value === material.category)?.icon}{" "}
                              {MATERIAL_CATEGORY_LABELS[material.category]}
                            </span>
                            <span className={`badge ${MATERIAL_STATUS_COLORS[material.status]}`}>
                              {MATERIAL_STATUS_LABELS[material.status]}
                            </span>
                            {material.status === "preparing" && (
                              <span className="badge bg-danger-50 text-danger-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-danger-500 animate-pulse" />
                                进行中
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-1.5 text-sm flex-wrap">
                            {material.submittedAt && (
                              <span className="text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                提交日期: {formatDate(material.submittedAt)}
                              </span>
                            )}
                            {material.note && (
                              <span className="text-slate-500 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {material.note}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("确定删除该材料？")) deleteMaterial(material.id);
                            }}
                            className="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="card p-16 text-center">
          <FolderOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-medium text-slate-700 mb-2">暂无匹配的材料</h3>
          <p className="text-slate-500 mb-6">尝试调整筛选条件或添加新材料</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/materials/recommenders" className="btn-secondary">
              <Users className="w-4 h-4" /> 管理推荐人
            </Link>
            <button className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> 添加材料
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
