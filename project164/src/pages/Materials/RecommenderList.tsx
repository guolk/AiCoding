import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Mail,
  Building,
  Send,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Bell,
  GraduationCap,
  Users,
  AlertCircle,
  Circle,
  Calendar,
} from "lucide-react";
import { useMaterialStore } from "@/store/useMaterialStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import { formatDate, formatRelative, isUrgent, isOverdue } from "@/utils/date";

export default function RecommenderList() {
  const {
    recommenders,
    addRecommender,
    deleteRecommender,
    updateRecommendationRequest,
    deleteRecommendationRequest,
  } = useMaterialStore();
  const { universities } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState("");

  const getUniversityName = (id: string) => {
    return universities.find((u) => u.id === id)?.name || "未知院校";
  };

  const getUniversityLogo = (id: string) => {
    return universities.find((u) => u.id === id)?.logoUrl;
  };

  const filteredRecommenders = recommenders.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.institution.toLowerCase().includes(q)
    );
  });

  // 统计
  const totalRequests = recommenders.reduce((sum, r) => sum + r.requests.length, 0);
  const submittedRequests = recommenders.reduce(
    (sum, r) => sum + r.requests.filter((req) => req.status === "submitted").length,
    0
  );
  const pendingRequests = totalRequests - submittedRequests;

  const statusConfig = {
    pending: {
      label: "待发起",
      color: "bg-slate-100 text-slate-600",
      icon: Circle,
    },
    requested: {
      label: "待推荐人提交",
      color: "bg-accent-100 text-accent-700",
      icon: Clock,
    },
    submitted: {
      label: "已提交",
      color: "bg-success-100 text-success-600",
      icon: CheckCircle2,
    },
  };

  return (
    <div className="space-y-6">
      {/* 返回 */}
      <Link
        to="/materials"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回材料清单
      </Link>

      {/* 顶部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-primary-700" />
            推荐人管理
          </h1>
          <p className="mt-1 text-slate-500">管理你的推荐人信息，追踪各院校推荐信提交进度</p>
        </div>
        <button
          onClick={() => {
            const name = prompt("请输入推荐人姓名：");
            if (name) {
              const title = prompt("请输入推荐人职称（如：教授、博士）：") || "教授";
              const email = prompt("请输入推荐人邮箱：") || "";
              const institution = prompt("请输入推荐人所在机构：") || "";
              addRecommender({ name, title, email, institution });
            }
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> 添加推荐人
        </button>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{recommenders.length}</div>
            <div className="text-sm text-slate-500">推荐人总数</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
            <Send className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalRequests}</div>
            <div className="text-sm text-slate-500">总请求数</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-400 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{pendingRequests}</div>
            <div className="text-sm text-slate-500">待完成</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {totalRequests > 0 ? Math.round((submittedRequests / totalRequests) * 100) : 0}%
            </div>
            <div className="text-sm text-slate-500">完成率</div>
          </div>
        </div>
      </div>

      {/* 搜索 */}
      {filteredRecommenders.length > 3 && (
        <div className="card p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索推荐人姓名、邮箱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      )}

      {/* 推荐人列表 */}
      <div className="space-y-5">
        {filteredRecommenders.map((rec, idx) => {
          const reqCompleted = rec.requests.filter((r) => r.status === "submitted").length;
          const progress =
            rec.requests.length > 0 ? (reqCompleted / rec.requests.length) * 100 : 0;

          return (
            <div
              key={rec.id}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="card overflow-hidden animate-slide-up"
            >
              {/* 推荐人头部信息 */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* 头像 */}
                    <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-100">
                      <span className="text-2xl font-bold text-white">
                        {rec.name.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-serif font-semibold text-slate-900">
                          {rec.name}
                        </h3>
                        <span className="badge bg-primary-50 text-primary-700">
                          {rec.title}
                        </span>
                        {rec.requests.length > 0 && (
                          <span className="badge bg-slate-100 text-slate-600">
                            {rec.requests.length} 份推荐信
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-4 h-4" />
                          {rec.institution || "未填写机构"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          <a
                            href={`mailto:${rec.email}`}
                            className="text-primary-700 hover:underline"
                          >
                            {rec.email || "未填写邮箱"}
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {progress > 0 && (
                      <div className="text-right mr-4">
                        <div className="text-xs text-slate-500 mb-1">完成进度</div>
                        <div className="text-lg font-bold text-slate-800">
                          {reqCompleted}/{rec.requests.length}
                        </div>
                      </div>
                    )}
                    <button className="p-2 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定删除推荐人「${rec.name}」？`)) {
                          deleteRecommender(rec.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 进度条 */}
                {rec.requests.length > 0 && (
                  <div className="mt-4">
                    <div className="progress-bar h-2">
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
                )}
              </div>

              {/* 推荐请求列表 */}
              {rec.requests.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {rec.requests.map((req) => {
                    const config = statusConfig[req.status];
                    const StatusIcon = config.icon;
                    const urgent = !isOverdue(req.deadline) && isUrgent(req.deadline) && req.status !== "submitted";
                    const overdue = isOverdue(req.deadline) && req.status !== "submitted";

                    return (
                      <div
                        key={req.id}
                        className="p-5 hover:bg-slate-50/70 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          {/* 院校 Logo */}
                          <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={getUniversityLogo(req.universityId)}
                              alt=""
                              className="w-7 h-7 object-contain"
                            />
                          </div>

                          {/* 主内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                                <GraduationCap className="w-4 h-4 text-slate-400" />
                                {getUniversityName(req.universityId)}
                              </span>
                              <span className={`badge ${config.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {config.label}
                              </span>
                              {urgent && (
                                <span className="badge bg-danger-50 text-danger-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  临近截止
                                </span>
                              )}
                              {overdue && (
                                <span className="badge bg-slate-100 text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  已逾期
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                截止: {formatDate(req.deadline)}
                              </span>
                              <span className={overdue ? "text-danger-600" : urgent ? "text-danger-600 font-medium" : ""}>
                                {overdue ? "已逾期" : formatRelative(req.deadline)}
                              </span>
                              {req.reminderSent && (
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Bell className="w-3.5 h-3.5" />
                                  已发送提醒
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center gap-2">
                            {req.status !== "submitted" && (
                              <>
                                <button
                                  onClick={() => {
                                    updateRecommendationRequest(rec.id, req.id, {
                                      reminderSent: true,
                                    });
                                    alert(`已向 ${rec.name} 发送催办提醒！`);
                                  }}
                                  className="btn-secondary text-sm h-9 px-3"
                                >
                                  <Bell className="w-4 h-4" /> 催办
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("标记为已提交？")) {
                                      updateRecommendationRequest(rec.id, req.id, {
                                        status: "submitted",
                                      });
                                    }
                                  }}
                                  className="btn-success text-sm h-9 px-3"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> 已提交
                                </button>
                              </>
                            )}
                            {req.status === "pending" && (
                              <button
                                onClick={() => {
                                  updateRecommendationRequest(rec.id, req.id, {
                                    status: "requested",
                                  });
                                }}
                                className="btn-primary text-sm h-9 px-3"
                              >
                                <Send className="w-4 h-4" /> 发起请求
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm("删除该推荐请求？")) {
                                  deleteRecommendationRequest(rec.id, req.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无推荐请求，点击下方按钮为推荐人分配院校</p>
                  <button className="btn-secondary mt-3 text-sm">
                    <Plus className="w-4 h-4" /> 添加推荐请求
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredRecommenders.length === 0 && (
        <div className="card p-16 text-center">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-medium text-slate-700 mb-2">暂无推荐人</h3>
          <p className="text-slate-500 mb-6">添加推荐人开始管理推荐信进度</p>
          <button
            onClick={() => {
              const name = prompt("请输入推荐人姓名：");
              if (name) {
                addRecommender({
                  name,
                  title: prompt("职称：") || "教授",
                  email: prompt("邮箱：") || "",
                  institution: prompt("所在机构：") || "",
                });
              }
            }}
            className="btn-primary inline-flex"
          >
            <Plus className="w-4 h-4" /> 添加第一位推荐人
          </button>
        </div>
      )}
    </div>
  );
}
