import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Clock, Smile } from "lucide-react";
import { format, subWeeks, subDays, parseISO, startOfWeek } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/store";
import type { DevLogEntry } from "@/types";
import DevLogForm from "./DevLogForm";

const moodEmojis = ["", "😰", "😟", "😐", "😊", "🤩"];

const tabs = ["日志列表", "时长追踪", "心态曲线"] as const;
type TabType = (typeof tabs)[number];

function getHeatColor(hours: number): string {
  if (hours === 0) return "bg-white/5";
  if (hours <= 3) return "bg-neon-green/20";
  if (hours <= 6) return "bg-neon-green/45";
  return "bg-neon-green/80";
}

export default function DevLog() {
  const navigate = useNavigate();
  const { devLogs } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>("日志列表");
  const [search, setSearch] = useState("");
  const [editingLog, setEditingLog] = useState<DevLogEntry | null>(null);

  const filteredLogs = useMemo(() => {
    if (!search) return devLogs;
    const q = search.toLowerCase();
    return devLogs.filter(
      (log) =>
        log.completedFeatures.some((f) => f.toLowerCase().includes(q)) ||
        log.technicalChallenges.some((c) => c.toLowerCase().includes(q)) ||
        log.moodNote.toLowerCase().includes(q)
    );
  }, [devLogs, search]);

  const heatmapData = useMemo(() => {
    const now = new Date();
    const map: Record<string, number> = {};
    devLogs.forEach((log) => {
      map[log.date] = (map[log.date] || 0) + log.hoursSpent;
    });
    const weeks: { date: string; hours: number }[][] = [];
    for (let w = 11; w >= 0; w--) {
      const weekStart = startOfWeek(subWeeks(now, w), { weekStartsOn: 1 });
      const week: { date: string; hours: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const day = subDays(weekStart, weekStart.getDay() - 1 - d > 0 ? 0 : 0);
        const actualDay = new Date(weekStart);
        actualDay.setDate(weekStart.getDate() + d);
        const dateStr = format(actualDay, "yyyy-MM-dd");
        week.push({ date: dateStr, hours: map[dateStr] || 0 });
      }
      weeks.push(week);
    }
    return weeks;
  }, [devLogs]);

  const totalHours = useMemo(
    () => devLogs.reduce((sum, log) => sum + log.hoursSpent, 0),
    [devLogs]
  );

  const moodChartData = useMemo(
    () =>
      [...devLogs]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((log) => ({
          date: log.date,
          mood: log.moodIndex,
          note: log.moodNote,
        })),
    [devLogs]
  );

  return (
    <div className="space-y-6">
      <h1 className="page-title">开发日志</h1>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索日志..."
            className="w-full pl-10 pr-4 py-2.5 bg-base-800/60 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-neon-green/50 focus:shadow-neon transition-all"
          />
        </div>
        <button
          onClick={() => navigate("/devlog/new")}
          className="neon-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增日志
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-base-800/60 rounded-lg border border-white/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-neon-green/15 text-neon-green shadow-neon"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "日志列表" && (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setEditingLog(log)}
              className="glass-card p-5 cursor-pointer hover:border-neon-green/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-neon-green text-sm">
                  {log.date}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neon-green/10 text-neon-green rounded-full text-xs font-mono">
                    <Clock className="w-3 h-3" />
                    {log.hoursSpent}h
                  </span>
                  <span className="text-xl" title={`心态: ${log.moodIndex}/5`}>
                    {moodEmojis[log.moodIndex]}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {log.completedFeatures.map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-neon-green/10 text-neon-green/90 rounded text-xs border border-neon-green/20"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {log.technicalChallenges.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-white/60">
                  <Smile className="w-4 h-4 mt-0.5 shrink-0 text-neon-orange/70" />
                  <span className="line-clamp-2">
                    {log.technicalChallenges.join("；")}
                  </span>
                </div>
              )}
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-center py-16 text-white/30">
              {search ? "没有找到匹配的日志" : "暂无开发日志"}
            </div>
          )}
        </div>
      )}

      {activeTab === "时长追踪" && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-white text-lg">开发时长热力图</h3>
            <span className="font-mono text-neon-green text-2xl font-bold">
              {totalHours.toFixed(1)}h
            </span>
          </div>

          <div className="flex gap-[3px]">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.hours.toFixed(1)}h`}
                    className={`w-3 h-3 rounded-sm ${getHeatColor(day.hours)} transition-colors`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>少</span>
            <div className="w-3 h-3 rounded-sm bg-white/5" />
            <div className="w-3 h-3 rounded-sm bg-neon-green/20" />
            <div className="w-3 h-3 rounded-sm bg-neon-green/45" />
            <div className="w-3 h-3 rounded-sm bg-neon-green/80" />
            <span>多</span>
          </div>
        </div>
      )}

      {activeTab === "心态曲线" && (
        <div className="glass-card p-6">
          <h3 className="font-mono text-white text-lg mb-4">心态变化曲线</h3>
          {moodChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodChartData}>
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A2332",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(_: number, __: string, props: { payload: { note: string; mood: number; date: string } }) => [
                    `${moodEmojis[props.payload.mood]} ${props.payload.mood}/5 — ${props.payload.note}`,
                    "心态",
                  ]}
                  labelFormatter={(label: string) => `📅 ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#00FF88"
                  strokeWidth={2}
                  dot={{ fill: "#00FF88", strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: "#00FF88", r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16 text-white/30">暂无数据</div>
          )}
        </div>
      )}

      {editingLog && (
        <DevLogForm
          editingLog={editingLog}
          onClose={() => setEditingLog(null)}
        />
      )}
    </div>
  );
}
