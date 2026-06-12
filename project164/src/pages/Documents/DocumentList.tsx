import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  FileText,
  FileCheck,
  Clock,
  ArrowRight,
  Star,
  History,
  Target,
} from "lucide-react";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_COLORS,
  VERSION_STATUS_LABELS,
  VERSION_STATUS_COLORS,
} from "@/types";
import { formatDate, isUrgent } from "@/utils/date";
import { truncateText } from "@/utils/format";

const typeFilters = [
  { value: "all", label: "全部类型" },
  { value: "personal_statement", label: "个人陈述" },
  { value: "motivation_letter", label: "动机信" },
  { value: "research_proposal", label: "研究计划" },
  { value: "cv", label: "简历" },
  { value: "other", label: "其他" },
];

const statusFilters = [
  { value: "all", label: "全部状态" },
  { value: "draft", label: "草稿" },
  { value: "reviewing", label: "审核中" },
  { value: "revising", label: "修改中" },
  { value: "final", label: "已完成" },
];

export default function DocumentList() {
  const navigate = useNavigate();
  const { documents, toggleKeyPoint } = useDocumentStore();
  const { universities } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getUniversityName = (id?: string) => {
    if (!id) return null;
    return universities.find((u) => u.id === id)?.name;
  };

  const filteredDocuments = documents.filter((d) => {
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (statusFilter !== "all") {
      const hasStatus = d.versions.some((v) => v.status === statusFilter);
      if (!hasStatus) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        DOCUMENT_TYPE_LABELS[d.type].toLowerCase().includes(q) ||
        d.versions.some((v) => v.content.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // 统计
  const stats = {
    total: documents.length,
    inProgress: documents.filter((d) => !d.versions.some((v) => v.status === "final")).length,
    completed: documents.filter((d) => d.versions.some((v) => v.status === "final")).length,
    versions: documents.reduce((sum, d) => sum + d.versions.length, 0),
  };

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">文书管理</h1>
          <p className="mt-1 text-slate-500">管理个人陈述、动机信、研究计划等各类申请文书</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> 新建文书
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "文书总数", value: stats.total, icon: FileText, color: "bg-primary-50 text-primary-700", bar: "gradient-primary" },
          { label: "撰写中", value: stats.inProgress, icon: Clock, color: "bg-accent-50 text-accent-700", bar: "gradient-accent" },
          { label: "已完成终稿", value: stats.completed, icon: FileCheck, color: "bg-success-50 text-success-600", bar: "gradient-success" },
          { label: "版本迭代次数", value: stats.versions, icon: History, color: "bg-purple-50 text-purple-700", bar: "bg-gradient-to-r from-purple-600 to-indigo-500" },
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
              placeholder="搜索文书标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="select min-w-[140px]"
              >
                {typeFilters.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
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

      {/* 文书列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredDocuments.map((doc, idx) => {
          const currentVersion = doc.versions[doc.versions.length - 1];
          const completedPhases = doc.timeline.filter((t) => t.isCompleted).length;
          const progress = doc.timeline.length > 0 ? (completedPhases / doc.timeline.length) * 100 : 0;
          const checkedPoints = doc.keyPoints.filter((k) => k.isChecked).length;
          const nextDeadline = doc.timeline.find((t) => !t.isCompleted);
          const urgent = nextDeadline && isUrgent(nextDeadline.dueDate);

          return (
            <div
              key={doc.id}
              onClick={() => navigate(`/documents/${doc.id}`)}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="card-hover group cursor-pointer animate-slide-up"
            >
              <div className="p-6">
                {/* 头部 */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${DOCUMENT_TYPE_COLORS[doc.type]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-lg text-slate-900 group-hover:text-primary-700 transition-colors">
                        {doc.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`badge ${DOCUMENT_TYPE_COLORS[doc.type]}`}>
                          {DOCUMENT_TYPE_LABELS[doc.type]}
                        </span>
                        {currentVersion && (
                          <span className={`badge ${VERSION_STATUS_COLORS[currentVersion.status]}`}>
                            {VERSION_STATUS_LABELS[currentVersion.status]} v{currentVersion.versionNumber}
                          </span>
                        )}
                        {currentVersion?.universityId && (
                          <span className="badge bg-slate-100 text-slate-600">
                            目标: {getUniversityName(currentVersion.universityId) || "通用"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {urgent && (
                    <span className="badge bg-danger-100 text-danger-600 flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger-500 animate-pulse" />
                      截止临近
                    </span>
                  )}
                </div>

                {/* 内容预览 */}
                {currentVersion && (
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {truncateText(currentVersion.content, 160)}
                  </p>
                )}

                {/* 关键指标 */}
                <div className="flex items-center gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Target className="w-4 h-4" />
                    <span>要点完成 {checkedPoints}/{doc.keyPoints.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Star className="w-4 h-4" />
                    <span>{doc.versions.length} 个版本</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>创建 {formatDate(doc.createdAt, "short")}</span>
                  </div>
                </div>

                {/* 进度条 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">撰写进度</span>
                    <span className="text-xs font-semibold text-primary-700">{Math.round(progress)}%</span>
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
                  {nextDeadline && (
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-500">下一阶段: {nextDeadline.phase}</span>
                      <span className={`${urgent ? "text-danger-600 font-medium" : "text-slate-500"}`}>
                        截止: {formatDate(nextDeadline.dueDate, "short")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 悬浮箭头 */}
              <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-4.5 h-4.5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="card p-16 text-center">
          <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-medium text-slate-700 mb-2">暂无匹配的文书</h3>
          <p className="text-slate-500 mb-6">尝试调整筛选条件或新建一份文书</p>
          <button className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> 新建文书
          </button>
        </div>
      )}
    </div>
  );
}
