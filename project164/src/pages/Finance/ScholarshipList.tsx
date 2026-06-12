import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Edit3,
  Trash2,
  DollarSign,
  GraduationCap,
  Users,
} from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import {
  SCHOLARSHIP_STATUS_LABELS,
  SCHOLARSHIP_STATUS_COLORS,
} from "@/types";
import { formatCurrency, formatPercent } from "@/utils/format";
import { formatDate, formatRelative, isUrgent } from "@/utils/date";

const statusFilters = [
  { value: "all", label: "全部状态" },
  { value: "planning", label: "计划中" },
  { value: "applied", label: "已申请" },
  { value: "interview", label: "面试中" },
  { value: "awarded", label: "已获得" },
  { value: "rejected", label: "未获得" },
];

export default function ScholarshipList() {
  const { scholarships, updateScholarship, deleteScholarship } = useFinanceStore();
  const { universities } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getUniversityName = (id: string) => {
    return universities.find((u) => u.id === id)?.name || "通用";
  };
  const getUniversityLogo = (id: string) => {
    return universities.find((u) => u.id === id)?.logoUrl;
  };

  const filtered = scholarships.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        getUniversityName(s.universityId).toLowerCase().includes(q)
      );
    }
    return true;
  });

  // 统计
  const totalAwardedCNY = scholarships
    .filter((s) => s.status === "awarded")
    .reduce((sum, s) => sum + convert(s.amount, s.currency), 0);
  const totalAppliedCNY = scholarships
    .filter((s) => s.status !== "planning" && s.status !== "rejected")
    .reduce((sum, s) => sum + convert(s.amount, s.currency), 0);
  const awardedCount = scholarships.filter((s) => s.status === "awarded").length;
  const successRate = scholarships.filter((s) => s.status === "awarded" || s.status === "rejected").length > 0
    ? (awardedCount / scholarships.filter((s) => s.status === "awarded" || s.status === "rejected").length) * 100
    : 0;

  function convert(a: number, c: string) {
    switch (c) {
      case "USD": return a * 7.2;
      case "GBP": return a * 9.2;
      case "SGD": return a * 5.3;
      case "CHF": return a * 8.3;
      default: return a;
    }
  }

  const statusIcons = {
    planning: Clock,
    applied: Clock,
    interview: Users,
    awarded: Award,
    rejected: Trash2,
  };

  return (
    <div className="space-y-6">
      {/* 返回 */}
      <Link
        to="/finance"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回财务总览
      </Link>

      {/* 顶部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <Award className="w-7 h-7 text-primary-700" />
            奖学金申请追踪
          </h1>
          <p className="mt-1 text-slate-500">记录奖学金申请进度，追踪结果状态</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> 添加奖学金
        </button>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "已获得金额", value: formatCurrency(totalAwardedCNY, "CNY"), icon: Award, color: "gradient-success text-white", bar: "gradient-success" },
          { label: "申请中金额", value: formatCurrency(totalAppliedCNY, "CNY"), icon: TrendingUp, color: "gradient-primary text-white", bar: "gradient-primary" },
          { label: "已获得数量", value: `${awardedCount} 项`, icon: CheckCircle2, color: "bg-gradient-to-br from-purple-500 to-indigo-500 text-white", bar: "bg-gradient-to-r from-purple-500 to-indigo-500" },
          { label: "成功率", value: formatPercent(successRate), icon: DollarSign, color: "gradient-accent text-white", bar: "gradient-accent" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="relative overflow-hidden rounded-2xl">
              <div className={`absolute inset-0 ${item.color.split(" ")[0]}`} />
              <div className="relative p-5 text-white">
                <div className={`w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-sm text-white/70 mt-1">{item.label}</div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${item.bar}`} />
            </div>
          );
        })}
      </div>

      {/* 筛选 */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索奖学金名称、院校..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select min-w-[140px]"
            >
              {statusFilters.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 奖学金卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((sch, idx) => {
          const StatusIcon = statusIcons[sch.status];
          const urgent = sch.resultDate && isUrgent(sch.resultDate) && sch.status !== "awarded" && sch.status !== "rejected";
          return (
            <div
              key={sch.id}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="card-hover group animate-slide-up"
            >
              <div className="p-6">
                {/* 顶部 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      sch.status === "awarded" ? "bg-gradient-to-br from-success-500 to-success-400 text-white shadow-lg shadow-success-200" :
                      sch.status === "rejected" ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white" :
                      sch.status === "planning" ? "bg-slate-100 text-slate-500" :
                      sch.status === "interview" ? "bg-gradient-to-br from-accent-500 to-accent-400 text-white shadow-lg shadow-accent-200" :
                      "bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200"
                    }`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-lg text-slate-900 leading-snug">
                        {sch.name}
                      </h3>
                      <span className={`badge ${SCHOLARSHIP_STATUS_COLORS[sch.status]} mt-1.5 inline-flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {SCHOLARSHIP_STATUS_LABELS[sch.status]}
                      </span>
                    </div>
                  </div>

                  {urgent && (
                    <span className="badge bg-danger-50 text-danger-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger-500 animate-pulse" />
                      临近出结果
                    </span>
                  )}
                </div>

                {/* 金额 */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-4 mb-4">
                  <div className="text-xs text-primary-700 mb-1">奖学金金额</div>
                  <div className="text-2xl font-bold text-primary-800">
                    {formatCurrency(sch.amount, sch.currency)}
                  </div>
                  <div className="text-xs text-primary-600/70 mt-1">
                    ≈ {formatCurrency(convert(sch.amount, sch.currency), "CNY")}
                  </div>
                </div>

                {/* 信息 */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex items-center gap-2">
                      <img src={getUniversityLogo(sch.universityId)} alt="" className="w-5 h-5 object-contain bg-slate-50 rounded p-0.5" />
                      <span>目标院校: {getUniversityName(sch.universityId)}</span>
                    </div>
                  </div>
                  {sch.applyDate && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>申请日期: {formatDate(sch.applyDate)} ({formatRelative(sch.applyDate)})</span>
                    </div>
                  )}
                  {sch.resultDate && (
                    <div className={`flex items-center gap-2.5 text-sm ${urgent ? "text-danger-700" : "text-slate-600"}`}>
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {sch.status === "awarded" || sch.status === "rejected"
                          ? `结果公布: ${formatDate(sch.resultDate)}`
                          : `预计结果: ${formatDate(sch.resultDate)} (${formatRelative(sch.resultDate)})`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {sch.status !== "awarded" && sch.status !== "rejected" && (
                      <>
                        {sch.status === "planning" && (
                          <button
                            onClick={() => updateScholarship(sch.id, { status: "applied", applyDate: new Date().toISOString().split("T")[0] })}
                            className="btn-primary text-xs h-8 px-3"
                          >
                            标记已申请
                          </button>
                        )}
                        {sch.status === "applied" && (
                          <button
                            onClick={() => updateScholarship(sch.id, { status: "interview" })}
                            className="btn-accent text-xs h-8 px-3"
                          >
                            进入面试
                          </button>
                        )}
                        {(sch.status === "applied" || sch.status === "interview" || sch.status === "planning") && (
                          <button
                            onClick={() => {
                              if (confirm("确定标记为已获得？")) {
                                updateScholarship(sch.id, {
                                  status: "awarded",
                                  resultDate: new Date().toISOString().split("T")[0],
                                });
                              }
                            }}
                            className="btn-success text-xs h-8 px-3"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> 已获得
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定删除「${sch.name}」？`)) {
                          deleteScholarship(sch.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-16 text-center">
          <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-medium text-slate-700 mb-2">暂无匹配的奖学金</h3>
          <p className="text-slate-500 mb-6">尝试调整筛选条件或添加新的奖学金记录</p>
          <button className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> 添加奖学金
          </button>
        </div>
      )}
    </div>
  );
}
