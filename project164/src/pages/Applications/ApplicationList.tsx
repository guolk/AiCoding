import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Globe,
  Calendar,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  MapPin,
  Scale,
  FileCheck,
} from "lucide-react";
import { useApplicationStore } from "@/store/useApplicationStore";
import {
  UNIVERSITY_STATUS_LABELS,
  UNIVERSITY_STATUS_COLORS,
  University,
} from "@/types";
import { formatDate, isUrgent, isOverdue } from "@/utils/date";
import { formatCurrency, formatPercent } from "@/utils/format";

const statusFilters = [
  { value: "all", label: "全部院校" },
  { value: "researching", label: "研究中" },
  { value: "preparing", label: "准备中" },
  { value: "submitted", label: "已提交" },
  { value: "accepted", label: "已录取" },
  { value: "enrolled", label: "已入学" },
];

const countryFilters = [
  { value: "all", label: "全部国家" },
  { value: "美国", label: "美国" },
  { value: "英国", label: "英国" },
  { value: "新加坡", label: "新加坡" },
  { value: "瑞士", label: "瑞士" },
  { value: "中国", label: "中国" },
];

function calcOverallProgress(uni: University): number {
  const stages = uni.stages;
  if (stages.length === 0) return 0;
  const total = stages.reduce((sum, s) => sum + s.progress, 0);
  return Math.round(total / stages.length);
}

export default function ApplicationList() {
  const navigate = useNavigate();
  const { universities } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");

  const filteredUniversities = universities
    .filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (countryFilter !== "all" && u.country !== countryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.major.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "progress") {
        return calcOverallProgress(b) - calcOverallProgress(a);
      }
      if (sortBy === "tuition") {
        return a.tuition.tuitionPerYear - b.tuition.tuitionPerYear;
      }
      return 0;
    });

  const stats = {
    total: universities.length,
    preparing: universities.filter((u) => u.status === "researching" || u.status === "preparing").length,
    submitted: universities.filter((u) => u.status === "submitted").length,
    accepted: universities.filter((u) => u.status === "accepted" || u.status === "enrolled").length,
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">申请项目管理</h1>
          <p className="mt-1 text-slate-500">管理你的目标院校、追踪申请进度、对比录取要求</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/applications/compare" className="btn-secondary">
            <Scale className="w-4 h-4" /> 对比院校
          </Link>
          <button className="btn-primary">
            <Plus className="w-4 h-4" /> 添加目标院校
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "目标院校总数", value: stats.total, icon: GraduationCap, color: "bg-primary-50 text-primary-700", bar: "gradient-primary" },
          { label: "准备中院校", value: stats.preparing, icon: FileCheck, color: "bg-accent-50 text-accent-700", bar: "gradient-accent" },
          { label: "已提交申请", value: stats.submitted, icon: ArrowRight, color: "bg-slate-50 text-slate-700", bar: "bg-gradient-to-r from-slate-500 to-slate-400" },
          { label: "已录取/入学", value: stats.accepted, icon: TrendingUp, color: "bg-success-50 text-success-600", bar: "gradient-success" },
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
              placeholder="搜索院校名称、专业或国家..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select min-w-[120px]"
              >
                {statusFilters.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="select min-w-[120px]"
            >
              {countryFilters.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select min-w-[140px]"
            >
              <option value="deadline">按截止日期排序</option>
              <option value="progress">按申请进度排序</option>
              <option value="tuition">按学费排序</option>
            </select>
          </div>
        </div>
      </div>

      {/* 院校列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredUniversities.map((uni, idx) => {
          const progress = calcOverallProgress(uni);
          const urgent = isUrgent(uni.deadline) && !isOverdue(uni.deadline);
          const overdue = isOverdue(uni.deadline) && uni.status !== "accepted" && uni.status !== "enrolled";
          return (
            <div
              key={uni.id}
              onClick={() => navigate(`/applications/${uni.id}`)}
              style={{ animationDelay: `${idx * 50}ms` }}
              className="card-hover group cursor-pointer animate-slide-up relative overflow-hidden"
            >
              {urgent && (
                <div className="absolute top-0 right-0">
                  <div className="bg-danger-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    即将截止
                  </div>
                </div>
              )}
              {overdue && (
                <div className="absolute top-0 right-0">
                  <div className="bg-slate-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                    已截止
                  </div>
                </div>
              )}

              <div className="p-5">
                {/* 院校头部信息 */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      src={uni.logoUrl}
                      alt={uni.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-semibold text-lg text-slate-900 group-hover:text-primary-700 transition-colors">
                        {uni.name}
                      </h3>
                      <span className={`badge ${UNIVERSITY_STATUS_COLORS[uni.status]} flex-shrink-0`}>
                        {UNIVERSITY_STATUS_LABELS[uni.status]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 truncate">{uni.major}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {uni.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {formatCurrency(uni.tuition.tuitionPerYear, uni.tuition.currency)}/年
                      </span>
                    </div>
                  </div>
                </div>

                {/* 录取要求 */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">GPA</div>
                    <div className="font-semibold text-slate-700">{uni.requirements.gpaMin.toFixed(1)}+</div>
                  </div>
                  <div className="border-x border-slate-200">
                    <div className="text-xs text-slate-400 mb-1">TOEFL</div>
                    <div className="font-semibold text-slate-700">{uni.requirements.toeflMin}+</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">推荐信</div>
                    <div className="font-semibold text-slate-700">{uni.requirements.recommendationCount}封</div>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      截止: {formatDate(uni.deadline, "short")}
                    </span>
                    <span className="text-xs font-medium text-primary-700">
                      {formatPercent(progress)}
                    </span>
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

                {/* 阶段小标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {uni.stages.slice(0, 4).map((stage) => (
                    <span
                      key={stage.id}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        stage.isCompleted
                          ? "bg-success-50 text-success-600"
                          : stage.progress > 0
                            ? "bg-primary-50 text-primary-700"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {stage.isCompleted ? "✓ " : ""}{stage.stageName}
                    </span>
                  ))}
                </div>
              </div>

              {/* 悬浮指示 */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUniversities.length === 0 && (
        <div className="card p-16 text-center">
          <GraduationCap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-medium text-slate-700 mb-2">暂无匹配的院校</h3>
          <p className="text-slate-500 mb-6">尝试调整筛选条件或添加新的目标院校</p>
          <button className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> 添加目标院校
          </button>
        </div>
      )}
    </div>
  );
}
