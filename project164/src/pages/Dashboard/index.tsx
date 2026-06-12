import { Link } from "react-router-dom";
import {
  GraduationCap,
  FileText,
  FolderOpen,
  Wallet,
  AlertCircle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useApplicationStore } from "@/store/useApplicationStore";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useMaterialStore } from "@/store/useMaterialStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { UNIVERSITY_STATUS_LABELS, UNIVERSITY_STATUS_COLORS } from "@/types";
import { formatRelative, isUrgent } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

const COLORS = ["#1e3a8a", "#d97706", "#059669", "#e11d48", "#64748b", "#8b5cf6"];

const quickActions = [
  { label: "添加院校", path: "/applications", icon: GraduationCap, color: "gradient-primary" },
  { label: "新增文书", path: "/documents", icon: FileText, color: "gradient-accent" },
  { label: "材料清单", path: "/materials", icon: FolderOpen, color: "gradient-success" },
  { label: "记录支出", path: "/finance/expenses", icon: Wallet, color: "bg-gradient-to-br from-purple-600 to-indigo-600" },
];

export default function Dashboard() {
  const { universities } = useApplicationStore();
  const { documents } = useDocumentStore();
  const { materials, recommenders } = useMaterialStore();
  const { scholarships, expenses } = useFinanceStore();

  // 统计数据
  const totalUniversities = universities.length;
  const submittedCount = universities.filter(
    (u) => u.status === "submitted" || u.status === "accepted" || u.status === "enrolled"
  ).length;
  const acceptedCount = universities.filter(
    (u) => u.status === "accepted" || u.status === "enrolled"
  ).length;
  const urgentDeadlines = universities.filter((u) => isUrgent(u.deadline));

  const pendingMaterials = materials.filter(
    (m) => m.status === "not_started" || m.status === "preparing"
  ).length;
  const completedDocuments = documents.filter((d) =>
    d.versions.some((v) => v.status === "final")
  ).length;

  // 申请状态饼图数据
  const statusData = Object.entries(
    universities.reduce((acc, u) => {
      acc[u.status] = (acc[u.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([key, value]) => ({
    name: UNIVERSITY_STATUS_LABELS[key as keyof typeof UNIVERSITY_STATUS_LABELS] || key,
    value,
  }));

  // 文书进度柱状图数据
  const documentProgressData = documents.map((d) => {
    const completedPhases = d.timeline.filter((t) => t.isCompleted).length;
    const progress = d.timeline.length > 0 ? (completedPhases / d.timeline.length) * 100 : 0;
    return {
      name: d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title,
      进度: Math.round(progress),
    };
  });

  // 近期截止提醒
  const upcomingDeadlines = [...universities]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // 活动时间线
  const recentActivities = [
    { type: "milestone", title: "新加坡国立大学 - 录取通知", date: "2天前", icon: CheckCircle2, color: "text-success-500 bg-success-50" },
    { type: "document", title: "个人陈述 v3 - 导师反馈已完成", date: "3天前", icon: FileText, color: "text-primary-600 bg-primary-50" },
    { type: "material", title: "TOEFL成绩已递送 - 牛津大学", date: "5天前", icon: FolderOpen, color: "text-accent-600 bg-accent-50" },
    { type: "finance", title: "CSC奖学金 - 面试邀请", date: "6天前", icon: Wallet, color: "text-purple-600 bg-purple-50" },
    { type: "application", title: "ETH Zurich 申请已提交", date: "15天前", icon: GraduationCap, color: "text-slate-600 bg-slate-50" },
  ];

  // 奖学金总额
  const totalScholarship = scholarships
    .filter((s) => s.status === "awarded")
    .reduce((sum, s) => {
      if (s.currency === "CNY") return sum + s.amount;
      if (s.currency === "USD") return sum + s.amount * 7.2;
      if (s.currency === "GBP") return sum + s.amount * 9.2;
      if (s.currency === "SGD") return sum + s.amount * 5.3;
      return sum;
    }, 0);

  // 总支出
  const totalExpenses = expenses.reduce((sum, e) => {
    if (e.currency === "CNY") return sum + e.amount;
    if (e.currency === "USD") return sum + e.amount * 7.2;
    if (e.currency === "GBP") return sum + e.amount * 9.2;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* 欢迎标题 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            你好，同学 👋
          </h1>
          <p className="mt-1 text-slate-500">
            2026 Fall 申请季，加油！今天也有 {urgentDeadlines.length} 项即将截止的任务。
          </p>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.path}
              className="group relative p-5 bg-white rounded-xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{action.label}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary-700 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            </Link>
          );
        })}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 gradient-primary rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <GraduationCap className="w-4 h-4" />
              申请院校
            </div>
            <div className="text-3xl font-bold mb-2">{totalUniversities}</div>
            <div className="flex items-center gap-1 text-xs text-white/70">
              <TrendingUp className="w-3 h-3" />
              已提交 {submittedCount} 所
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-8 bottom-8 w-16 h-16 rounded-full bg-white/10" />
        </div>

        <div className="p-5 gradient-accent rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <FileText className="w-4 h-4" />
              文书完成
            </div>
            <div className="text-3xl font-bold mb-2">{completedDocuments}/{documents.length}</div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <CheckCircle2 className="w-3 h-3" />
              共 {documents.length} 篇文书
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10" />
        </div>

        <div className="p-5 gradient-success rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <FolderOpen className="w-4 h-4" />
              待办材料
            </div>
            <div className="text-3xl font-bold mb-2">{pendingMaterials}</div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <AlertCircle className="w-3 h-3" />
              {materials.length - pendingMaterials} 项已完成
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10" />
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <Wallet className="w-4 h-4" />
              获得奖学金
            </div>
            <div className="text-3xl font-bold mb-2">{formatCurrency(totalScholarship, "CNY")}</div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <TrendingUp className="w-3 h-3" />
              支出 {formatCurrency(totalExpenses, "CNY")}
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10" />
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 申请状态分布 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-semibold text-lg text-slate-800">申请状态分布</h3>
            <Link to="/applications" className="text-sm text-primary-700 hover:underline flex items-center gap-1">
              查看详情 <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        {/* 文书进度 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-semibold text-lg text-slate-800">文书写作进度</h3>
            <Link to="/documents" className="text-sm text-primary-700 hover:underline flex items-center gap-1">
              查看详情 <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64">
            {documentProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={documentProgressData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "完成进度"]}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="进度" fill="#1e3a8a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                暂无文书记录
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 即将截止 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif font-semibold text-lg text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-700" />
              申请截止提醒
            </h3>
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.map((uni) => (
              <div key={uni.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <img
                  src={uni.logoUrl}
                  alt={uni.name}
                  className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{uni.name}</div>
                  <div className="text-xs text-slate-500">{uni.major}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium flex items-center gap-1 ${isUrgent(uni.deadline) ? "text-danger-600" : "text-slate-600"}`}>
                    {isUrgent(uni.deadline) && <AlertCircle className="w-3.5 h-3.5" />}
                    {formatRelative(uni.deadline)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/applications" className="btn-secondary w-full mt-5">
            <Plus className="w-4 h-4" /> 管理全部院校
          </Link>
        </div>

        {/* 活动时间线 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif font-semibold text-lg text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-700" />
              最近活动
            </h3>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100" />
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={idx} className="relative flex gap-3 pl-1">
                    <div className={`w-9 h-9 rounded-full ${activity.color} flex items-center justify-center z-10 flex-shrink-0`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="font-medium text-slate-800 text-sm">{activity.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{activity.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 申请进度总览 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif font-semibold text-lg text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary-700" />
              关键指标
            </h3>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">录取进度</span>
                <span className="text-sm font-semibold text-slate-800">
                  {acceptedCount}/{totalUniversities}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-success-500 to-success-400"
                  style={{ width: totalUniversities > 0 ? `${(acceptedCount / totalUniversities) * 100}%` : "0%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">材料完整度</span>
                <span className="text-sm font-semibold text-slate-800">
                  {materials.length > 0
                    ? `${Math.round(((materials.length - pendingMaterials) / materials.length) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-primary-700 to-primary-500"
                  style={{
                    width:
                      materials.length > 0
                        ? `${((materials.length - pendingMaterials) / materials.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">推荐人进度</span>
                <span className="text-sm font-semibold text-slate-800">
                  {recommenders.reduce(
                    (sum, r) =>
                      sum + r.requests.filter((req) => req.status === "submitted").length,
                    0
                  )}
                  /
                  {recommenders.reduce((sum, r) => sum + r.requests.length, 0)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-accent-500 to-accent-400"
                  style={{
                    width:
                      recommenders.reduce((s, r) => s + r.requests.length, 0) > 0
                        ? `${
                            (recommenders.reduce(
                              (s, r) =>
                                s + r.requests.filter((req) => req.status === "submitted").length,
                              0
                            ) /
                              recommenders.reduce((s, r) => s + r.requests.length, 0)) *
                            100
                          }%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">奖学金成功率</span>
                <span className="text-sm font-semibold text-slate-800">
                  {scholarships.filter((s) => s.status === "awarded").length}
                  /
                  {scholarships.length}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-purple-600 to-indigo-500"
                  style={{
                    width:
                      scholarships.length > 0
                        ? `${
                            (scholarships.filter((s) => s.status === "awarded").length /
                              scholarships.length) *
                            100
                          }%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
