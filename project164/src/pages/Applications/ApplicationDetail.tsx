import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  GraduationCap,
  DollarSign,
  Award,
  FileCheck,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Info,
  BookOpen,
  Scale,
} from "lucide-react";
import { useApplicationStore } from "@/store/useApplicationStore";
import {
  UNIVERSITY_STATUS_LABELS,
  UNIVERSITY_STATUS_COLORS,
} from "@/types";
import { formatDate, formatRelative, isUrgent, isOverdue } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { universities, deleteUniversity, updateStageProgress } = useApplicationStore();

  const university = universities.find((u) => u.id === id);

  if (!university) {
    return (
      <div className="card p-16 text-center">
        <AlertTriangle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
        <h3 className="text-lg font-serif font-medium text-slate-700 mb-2">未找到该院校</h3>
        <Link to="/applications" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`确定要删除「${university.name}」的申请档案吗？`)) {
      deleteUniversity(university.id);
      navigate("/applications");
    }
  };

  const toggleStage = (stageId: string, currentProgress: number, isCompleted: boolean) => {
    if (isCompleted) {
      updateStageProgress(university.id, stageId, 0, false);
    } else {
      updateStageProgress(university.id, stageId, 100, true);
    }
  };

  const overallProgress =
    university.stages.length > 0
      ? Math.round(
          university.stages.reduce((sum, s) => sum + s.progress, 0) /
            university.stages.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Link
        to="/applications"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回申请列表
      </Link>

      {/* 院校头部卡片 */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]" />
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white/95 flex items-center justify-center shadow-2xl">
                <img
                  src={university.logoUrl}
                  alt={university.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold">{university.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {university.country}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {university.major}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/15 border border-white/20`}>
                      {UNIVERSITY_STATUS_LABELS[university.status]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20 flex items-center gap-2 text-sm">
                    <Edit3 className="w-4 h-4" /> 编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-white/15 hover:bg-red-500/40 transition-colors border border-white/20 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> 删除
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                    <Calendar className="w-4 h-4" /> 申请截止
                  </div>
                  <div className="text-xl font-bold">{formatDate(university.deadline)}</div>
                  <div className={`text-xs mt-1 ${
                    isOverdue(university.deadline) ? "text-red-300" :
                    isUrgent(university.deadline) ? "text-amber-300" : "text-white/60"
                  }`}>
                    {isOverdue(university.deadline) ? (
                      <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 已截止</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelative(university.deadline)}</span>
                    )}
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                    <DollarSign className="w-4 h-4" /> 学费/年
                  </div>
                  <div className="text-xl font-bold">
                    {formatCurrency(university.tuition.tuitionPerYear, university.tuition.currency)}
                  </div>
                  <div className="text-xs mt-1 text-white/60">
                    生活费 {formatCurrency(university.tuition.livingCost, university.tuition.currency)}/年
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                    <Award className="w-4 h-4" /> 奖学金
                  </div>
                  <div className="text-xl font-bold truncate">
                    {university.scholarship || "暂无"}
                  </div>
                  <div className="text-xs mt-1 text-white/60">
                    {university.scholarship ? "已申请/计划申请" : "可考虑后续补充"}
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                    <GraduationCap className="w-4 h-4" /> 总体进度
                  </div>
                  <div className="text-xl font-bold">{overallProgress}%</div>
                  <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-300 transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 申请阶段进度追踪 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-semibold text-slate-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary-700" />
            申请阶段全流程追踪
          </h2>
          <span className="text-sm text-slate-500">点击阶段可标记完成</span>
        </div>

        {/* 横向时间轴 */}
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-1 bg-slate-100 rounded-full hidden md:block" />
          <div
            className="absolute top-6 left-0 h-1 bg-gradient-to-r from-primary-700 via-success-500 to-success-400 rounded-full hidden md:block transition-all duration-500"
            style={{
              width: `${(overallProgress / 100) * 100}%`,
            }}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {university.stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => toggleStage(stage.id, stage.progress, stage.isCompleted)}
                className={`group relative text-center p-4 rounded-xl transition-all duration-200 ${
                  stage.isCompleted
                    ? "bg-success-50 hover:bg-success-100/70 border-2 border-success-200"
                    : stage.progress > 0
                      ? "bg-primary-50 hover:bg-primary-100/70 border-2 border-primary-200"
                      : "bg-slate-50 hover:bg-slate-100 border-2 border-slate-100"
                }`}
              >
                <div className="relative z-10 flex justify-center mb-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      stage.isCompleted
                        ? "bg-gradient-to-br from-success-500 to-success-400 text-white shadow-lg shadow-success-200"
                        : stage.progress > 0
                          ? "bg-gradient-to-br from-primary-700 to-primary-500 text-white shadow-lg shadow-primary-200"
                          : "bg-white text-slate-400 border-2 border-slate-200"
                    }`}
                  >
                    {stage.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : stage.progress > 0 ? (
                      <span className="font-bold text-sm">{stage.progress}%</span>
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>
                </div>
                <div
                  className={`font-semibold text-sm mb-1 ${
                    stage.isCompleted
                      ? "text-success-700"
                      : stage.progress > 0
                        ? "text-primary-700"
                        : "text-slate-600"
                  }`}
                >
                  {stage.stageName}
                </div>
                <div className="text-xs text-slate-400">
                  {formatDate(stage.dueDate, "monthDay")}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 详细信息区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 录取要求 */}
        <div className="card p-6">
          <h2 className="text-xl font-serif font-semibold text-slate-800 flex items-center gap-2 mb-6">
            <FileCheck className="w-5 h-5 text-primary-700" />
            录取要求详情
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "最低 GPA 要求", value: university.requirements.gpaMin.toFixed(1), suffix: "+", icon: "📊" },
                { label: "TOEFL 分数", value: university.requirements.toeflMin.toString(), suffix: "+", icon: "🌐" },
                { label: "IELTS 分数", value: university.requirements.ieltsMin.toFixed(1), suffix: "+", icon: "📚" },
                { label: "GRE 分数", value: university.requirements.greScore?.toString() || "不强制", suffix: "", icon: "🎯" },
                { label: "推荐信数量", value: university.requirements.recommendationCount.toString(), suffix: " 封", icon: "✉️" },
                { label: "学制", value: "2 年", suffix: "", icon: "⏱️" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100/70 transition-colors">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
                  <div className="text-xl font-bold text-slate-800">
                    {item.value}
                    <span className="text-base font-normal text-slate-500 ml-0.5">{item.suffix}</span>
                  </div>
                </div>
              ))}
            </div>

            {university.requirements.otherRequirements && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-accent-800 mb-1">其他特别要求</div>
                    <div className="text-sm text-accent-700">
                      {university.requirements.otherRequirements}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 费用预算 */}
        <div className="card p-6">
          <h2 className="text-xl font-serif font-semibold text-slate-800 flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-primary-700" />
            费用预算估算
          </h2>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-slate-700">学费（学年）</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(university.tuition.tuitionPerYear, university.tuition.currency)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-primary-700 to-primary-500"
                  style={{ width: "70%" }}
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-slate-700">生活费估算（年）</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(university.tuition.livingCost, university.tuition.currency)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-accent-500 to-accent-400"
                  style={{ width: "45%" }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-700 to-primary-800 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 font-medium">年度总预算</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(
                    university.tuition.tuitionPerYear + university.tuition.livingCost,
                    university.tuition.currency
                  )}
                </span>
              </div>
              <div className="text-sm text-white/70">
                按学制2年计算，预计总花费 {formatCurrency(
                  (university.tuition.tuitionPerYear + university.tuition.livingCost) * 2,
                  university.tuition.currency
                )}
              </div>
            </div>

            {university.scholarship && (
              <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">奖学金机会</span>
                </div>
                <div className="text-xl font-bold">{university.scholarship}</div>
                <div className="text-sm text-white/80 mt-1">
                  记得在财务模块追踪申请进度
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
