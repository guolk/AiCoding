import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays, subDays, isAfter } from "date-fns";
import {
  Clock,
  FileText,
  CheckCircle,
  Heart,
  PlusCircle,
  GitBranch,
  Bug,
  Megaphone,
} from "lucide-react";
import { useStore } from "@/store";
import type { DevLogEntry, GameVersion, BugReport } from "@/types";

type ActivityItem = {
  date: string;
  type: "log" | "version" | "bug";
  description: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const { devLogs, versions, bugs, projectSettings } = useStore();

  const now = new Date();

  const weeklyHours = useMemo(() => {
    const weekAgo = subDays(now, 7);
    return devLogs
      .filter((l) => isAfter(new Date(l.date), weekAgo))
      .reduce((sum, l) => sum + l.hoursSpent, 0);
  }, [devLogs]);

  const monthlyLogCount = useMemo(() => {
    const monthAgo = subDays(now, 30);
    return devLogs.filter((l) => isAfter(new Date(l.date), monthAgo)).length;
  }, [devLogs]);

  const bugFixRate = useMemo(() => {
    if (bugs.length === 0) return 0;
    const resolved = bugs.filter((b) => b.status === "resolved").length;
    return Math.round((resolved / bugs.length) * 100);
  }, [bugs]);

  const avgMood = useMemo(() => {
    if (devLogs.length === 0) return 0;
    const recent = devLogs.slice(0, 10);
    return (recent.reduce((s, l) => s + l.moodIndex, 0) / recent.length).toFixed(1);
  }, [devLogs]);

  const devDays = useMemo(() => {
    if (devLogs.length === 0) return 0;
    const earliest = devLogs.reduce((min, l) => {
      const d = new Date(l.date);
      return d < min ? d : min;
    }, new Date(devLogs[0].date));
    return differenceInDays(now, earliest) + 1;
  }, [devLogs]);

  const latestVersion = versions[0];

  const checklistProgress = useMemo(() => {
    if (!latestVersion?.releaseChecklist?.length) return 0;
    const done = latestVersion.releaseChecklist.filter((c) => c.completed).length;
    return Math.round((done / latestVersion.releaseChecklist.length) * 100);
  }, [latestVersion]);

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];
    devLogs.slice(0, 5).forEach((l: DevLogEntry) => {
      items.push({
        date: l.date,
        type: "log",
        description: `开发日志：${l.completedFeatures[0] || "日常记录"} (${l.hoursSpent}h)`,
      });
    });
    versions.slice(0, 3).forEach((v: GameVersion) => {
      items.push({
        date: v.releaseDate,
        type: "version",
        description: `版本 ${v.versionNumber}${v.milestoneLabel ? ` - ${v.milestoneLabel}` : ""}`,
      });
    });
    bugs.slice(0, 3).forEach((b: BugReport) => {
      items.push({
        date: b.createdAt.split("T")[0],
        type: "bug",
        description: `Bug: ${b.title}`,
      });
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [devLogs, versions, bugs]);

  const stats = [
    { label: "本周开发时长", value: `${weeklyHours}h`, icon: Clock, accent: "neon-green" },
    { label: "本月日志条数", value: monthlyLogCount, icon: FileText, accent: "neon-blue" },
    { label: "Bug修复率", value: `${bugFixRate}%`, icon: CheckCircle, accent: "neon-orange" },
    { label: "平均心态指数", value: avgMood, icon: Heart, accent: "neon-purple" },
  ];

  const dotColor: Record<string, string> = {
    log: "bg-neon-green",
    version: "bg-neon-blue",
    bug: "bg-neon-red",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">仪表盘</h1>
        <p className="text-gray-400 mt-1">{projectSettings.projectName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card-hover p-5">
            <s.icon className={`w-5 h-5 text-${s.accent} mb-3`} />
            <div className={`text-2xl font-bold font-mono text-${s.accent}`}>
              {s.value}
            </div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="section-title">项目概览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">项目名称</span>
              <span className="text-gray-100">{projectSettings.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">引擎</span>
              <span className="text-gray-100">{projectSettings.engine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">目标平台</span>
              <span className="text-gray-100">{projectSettings.targetPlatforms.join("、")}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">当前版本</span>
              <span className="text-neon-green font-mono">{latestVersion?.versionNumber ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">开发天数</span>
              <span className="text-gray-100 font-mono">{devDays} 天</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">项目描述</span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">{projectSettings.description}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">发布清单进度</span>
            <span className="text-neon-green font-mono">{checklistProgress}%</span>
          </div>
          <div className="w-full h-2 bg-base-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-neon-green/60 rounded-full transition-all duration-500"
              style={{ width: `${checklistProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="section-title mb-4">最近动态</h2>
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-white/10" />
          {activities.map((item, i) => (
            <div key={i} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-4 top-1.5 w-2 h-2 rounded-full ${dotColor[item.type]}`}
              />
              <span className="text-gray-500 text-xs font-mono shrink-0 w-20">
                {format(new Date(item.date), "MM/dd")}
              </span>
              <span className="text-gray-300 text-sm truncate">{item.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="neon-btn flex items-center gap-2" onClick={() => navigate("/devlog/new")}>
          <PlusCircle className="w-4 h-4" />
          新增日志
        </button>
        <button className="neon-btn flex items-center gap-2" onClick={() => navigate("/versions/new")}>
          <GitBranch className="w-4 h-4" />
          创建版本
        </button>
        <button className="neon-btn flex items-center gap-2" onClick={() => navigate("/testing")}>
          <Bug className="w-4 h-4" />
          提交Bug
        </button>
        <button className="neon-btn flex items-center gap-2" onClick={() => navigate("/business")}>
          <Megaphone className="w-4 h-4" />
          添加营销活动
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
