import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  History,
  Clock,
  Star,
  CheckCircle2,
  Circle,
  Plus,
  Edit3,
  Trash2,
  Target,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Award,
  Lightbulb,
} from "lucide-react";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_COLORS,
  VERSION_STATUS_LABELS,
  VERSION_STATUS_COLORS,
} from "@/types";
import { formatDate, formatRelative, isUrgent } from "@/utils/date";
import { truncateText } from "@/utils/format";

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    documents,
    deleteDocument,
    toggleKeyPoint,
    updateTimeline,
    addKeyPoint,
  } = useDocumentStore();
  const { universities } = useApplicationStore();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showExpanded, setShowExpanded] = useState(false);
  const [newKeyPoint, setNewKeyPoint] = useState("");
  const [newKeyCategory, setNewKeyCategory] = useState<"experience" | "ability" | "goal">("experience");

  const document = documents.find((d) => d.id === id);

  if (!document) {
    return (
      <div className="card p-16 text-center">
        <AlertTriangle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
        <h3 className="text-lg font-serif font-medium text-slate-700 mb-2">未找到该文书</h3>
        <Link to="/documents" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`确定要删除「${document.title}」吗？`)) {
      deleteDocument(document.id);
      window.location.href = "/documents";
    }
  };

  const getUniversityName = (uid?: string) => {
    if (!uid) return "通用版本";
    return universities.find((u) => u.id === uid)?.name || "通用版本";
  };

  const sortedVersions = [...document.versions].sort(
    (a, b) => b.versionNumber - a.versionNumber
  );
  const latestVersion = sortedVersions[0];
  const displayVersion =
    selectedVersionId
      ? sortedVersions.find((v) => v.id === selectedVersionId) || latestVersion
      : latestVersion;

  const completedPhases = document.timeline.filter((t) => t.isCompleted).length;
  const progress =
    document.timeline.length > 0
      ? (completedPhases / document.timeline.length) * 100
      : 0;

  const toggleTimelinePhase = (timelineId: string, isCompleted: boolean) => {
    updateTimeline(document.id, timelineId, {
      isCompleted: !isCompleted,
      completedDate: !isCompleted ? new Date().toISOString().split("T")[0] : undefined,
    });
  };

  const handleAddKeyPoint = () => {
    if (!newKeyPoint.trim()) return;
    addKeyPoint(document.id, {
      content: newKeyPoint.trim(),
      category: newKeyCategory,
      importance: 3,
      isChecked: false,
    });
    setNewKeyPoint("");
  };

  const checkedPoints = document.keyPoints.filter((k) => k.isChecked).length;

  const categoryLabels: Record<string, string> = {
    experience: "经历经验",
    ability: "能力技能",
    goal: "目标愿景",
  };

  const categoryColors: Record<string, string> = {
    experience: "bg-primary-50 text-primary-700 border-primary-200",
    ability: "bg-accent-50 text-accent-700 border-accent-200",
    goal: "bg-success-50 text-success-700 border-success-200",
  };

  return (
    <div className="space-y-6">
      {/* 返回 */}
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回文书列表
      </Link>

      {/* 头部卡片 */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_55%)]" />
        <div className="absolute -right-20 -bottom-32 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-5">
              <div className={`w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20`}>
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`badge ${DOCUMENT_TYPE_COLORS[document.type].replace("bg-", "bg-white/15 text-white border border-white/25")}`}>
                    {DOCUMENT_TYPE_LABELS[document.type]}
                  </span>
                  {latestVersion && (
                    <span className={`badge ${VERSION_STATUS_COLORS[latestVersion.status].replace("bg-", "bg-white/15 text-white border border-white/25")}`}>
                      {VERSION_STATUS_LABELS[latestVersion.status]} · v{latestVersion.versionNumber}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-serif font-bold">{document.title}</h1>
                <p className="text-white/70 mt-1">
                  创建于 {formatDate(document.createdAt)} · 共 {sortedVersions.length} 个版本 · 目标: {getUniversityName(latestVersion?.universityId)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20 flex items-center gap-2 text-sm">
                <Edit3 className="w-4 h-4" /> 编辑文书
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-white/15 hover:bg-red-500/40 transition-colors border border-white/20 flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" /> 删除
              </button>
            </div>
          </div>

          {/* 统计指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Clock className="w-4 h-4" /> 撰写进度
              </div>
              <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              <div className="text-xs text-white/60 mt-1">{completedPhases}/{document.timeline.length} 阶段完成</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Target className="w-4 h-4" /> 要点覆盖
              </div>
              <div className="text-2xl font-bold">{checkedPoints}/{document.keyPoints.length}</div>
              <div className="text-xs text-white/60 mt-1">
                {document.keyPoints.length > 0 ? `${Math.round((checkedPoints / document.keyPoints.length) * 100)}% 已覆盖` : "请添加关键要点"}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <History className="w-4 h-4" /> 版本迭代
              </div>
              <div className="text-2xl font-bold">{sortedVersions.length}</div>
              <div className="text-xs text-white/60 mt-1">当前 v{latestVersion?.versionNumber || 1}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Award className="w-4 h-4" /> 距离终稿
              </div>
              <div className="text-2xl font-bold">
                {document.timeline.filter((t) => !t.isCompleted).length} 步
              </div>
              <div className="text-xs text-white/60 mt-1">
                {document.timeline.find((t) => !t.isCompleted)?.phase || "已完成！"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 文书内容预览 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-700" />
                文书内容预览
              </h2>
              <div className="flex items-center gap-3">
                {latestVersion?.universityId && (
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                    🎯 {getUniversityName(latestVersion?.universityId)} 定制版
                  </span>
                )}
                <button
                  onClick={() => setShowExpanded(!showExpanded)}
                  className="text-sm text-primary-700 hover:text-primary-800 flex items-center gap-1"
                >
                  {showExpanded ? (
                    <><ChevronUp className="w-4 h-4" /> 收起</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> 展开全部</>
                  )}
                </button>
              </div>
            </div>

            {displayVersion ? (
              <div>
                <div className={`prose prose-slate max-w-none text-sm leading-7 text-slate-700 whitespace-pre-line ${showExpanded ? "" : "line-clamp-8"}`}>
                  {displayVersion.content}
                </div>
                {!showExpanded && displayVersion.content.length > 400 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      共 {displayVersion.content.length} 字符 · 约 {Math.ceil(displayVersion.content.length / 500)} 分钟阅读
                    </span>
                    <span className={`badge ${VERSION_STATUS_COLORS[displayVersion.status]}`}>
                      {VERSION_STATUS_LABELS[displayVersion.status]}
                    </span>
                  </div>
                )}
                {displayVersion.feedback && (
                  <div className="mt-5 bg-gradient-to-br from-accent-50 to-orange-50 rounded-xl p-5 border border-accent-100">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-accent-800 mb-1">导师 / 反馈意见</div>
                        <p className="text-sm text-accent-700 leading-relaxed">
                          {displayVersion.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无内容</p>
              </div>
            )}
          </div>

          {/* 版本管理 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif font-semibold text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-primary-700" />
                版本历史管理
              </h2>
              <button className="btn-secondary text-sm">
                <Plus className="w-4 h-4" /> 新建版本
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-100 to-slate-100" />
              <div className="space-y-4">
                {sortedVersions.map((version, idx) => {
                  const isSelected = selectedVersionId === version.id || (idx === 0 && !selectedVersionId);
                  return (
                    <div key={version.id} className="relative pl-12">
                      <div
                        className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 z-10 ${
                          version.status === "final"
                            ? "bg-success-500 border-success-300"
                            : version.status === "reviewing"
                              ? "bg-accent-500 border-accent-300"
                              : version.status === "revising"
                                ? "bg-primary-600 border-primary-300"
                                : "bg-slate-400 border-slate-200"
                        }`}
                      />
                      <div
                        onClick={() => setSelectedVersionId(version.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary-500 bg-primary-50/50 shadow-md"
                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">v{version.versionNumber}</span>
                            <span className={`badge ${VERSION_STATUS_COLORS[version.status]}`}>
                              {VERSION_STATUS_LABELS[version.status]}
                            </span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              🎯 {getUniversityName(version.universityId)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDate(version.createdAt)} · {formatRelative(version.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {truncateText(version.content, 180)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧辅助内容 */}
        <div className="space-y-6">
          {/* 写作时间线 */}
          <div className="card p-6">
            <h2 className="text-xl font-serif font-semibold text-slate-800 flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-primary-700" />
              写作时间线规划
            </h2>

            <div className="space-y-3">
              {document.timeline.map((phase) => {
                const urgent = !phase.isCompleted && isUrgent(phase.dueDate);
                return (
                  <button
                    key={phase.id}
                    onClick={() => toggleTimelinePhase(phase.id, phase.isCompleted)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      phase.isCompleted
                        ? "border-success-200 bg-success-50 hover:bg-success-100/70"
                        : urgent
                          ? "border-danger-200 bg-danger-50 hover:bg-danger-100/70"
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {phase.isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success-500 to-success-400 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          urgent ? "border-danger-400" : "border-slate-300"
                        }`}>
                          <Circle className={`w-3.5 h-3.5 ${urgent ? "text-danger-400" : "text-slate-300"}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold ${
                          phase.isCompleted ? "text-success-700 line-through" : urgent ? "text-danger-700" : "text-slate-800"
                        }`}>
                          {phase.phase}
                        </span>
                        {urgent && !phase.isCompleted && (
                          <span className="text-xs text-danger-600 font-medium flex items-center gap-1">
                            ⚠️ 临近
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        phase.isCompleted ? "text-success-600" : "text-slate-500"
                      }`}>
                        {phase.isCompleted
                          ? `已完成: ${formatDate(phase.completedDate || phase.dueDate)}`
                          : `截止: ${formatDate(phase.dueDate)} (${formatRelative(phase.dueDate)})`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 进度 */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">整体进度</span>
                <span className="text-sm font-bold text-primary-700">{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar h-2.5">
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

          {/* 关键要点提炼 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif font-semibold text-slate-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary-700" />
                关键要点提炼
              </h2>
              <span className={`text-sm font-medium ${
                document.keyPoints.length > 0 && checkedPoints === document.keyPoints.length
                  ? "text-success-600"
                  : "text-slate-500"
              }`}>
                {checkedPoints}/{document.keyPoints.length}
              </span>
            </div>

            {/* 按分类分组展示 */}
            <div className="space-y-4">
              {["experience", "ability", "goal"].map((cat) => {
                const points = document.keyPoints.filter((k) => k.category === cat);
                if (points.length === 0 && cat !== "experience") return null;
                return (
                  <div key={cat}>
                    <div className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold mb-2 ${categoryColors[cat]} border`}>
                      {cat === "experience" ? "💼 " : cat === "ability" ? "🛠️ " : "🎯 "}
                      {categoryLabels[cat]}
                    </div>
                    <div className="space-y-2">
                      {points.length === 0 ? (
                        <p className="text-xs text-slate-400 pl-1">暂无要点</p>
                      ) : (
                        points.map((point) => (
                          <label
                            key={point.id}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                              point.isChecked
                                ? "bg-success-50 border border-success-100"
                                : "bg-slate-50 hover:bg-slate-100 border border-transparent"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={point.isChecked}
                              onChange={() => toggleKeyPoint(document.id, point.id)}
                              className="mt-0.5 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                            />
                            <span className={`text-sm leading-relaxed ${
                              point.isChecked ? "text-success-700 line-through opacity-75" : "text-slate-700"
                            }`}>
                              {point.content}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 添加要点 */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex gap-2 mb-2">
                {(["experience", "ability", "goal"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewKeyCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      newKeyCategory === cat
                        ? categoryColors[cat] + " border-2"
                        : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100"
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyPoint()}
                  placeholder="添加关键要点..."
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={handleAddKeyPoint}
                  disabled={!newKeyPoint.trim()}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
