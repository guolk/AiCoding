import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Flag, CheckCircle, XCircle, Ban, Target, TrendingUp, AlertTriangle, MapPin } from "lucide-react";
import { useEventStore } from "@/store";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  green: "#00d26a",
  greenDark: "#00a855",
  greenLight: "#33db88",
  orange: "#ff6b35",
  blue: "#3b82f6",
  gray: "#64748b",
  purple: "#a855f7",
  pink: "#ec4899",
};

const DNF_REASON_COLORS = [
  CHART_COLORS.orange,
  CHART_COLORS.blue,
  CHART_COLORS.pink,
  CHART_COLORS.gray,
];

const DROP_LOCATION_COLORS = [
  CHART_COLORS.purple,
  CHART_COLORS.orange,
  CHART_COLORS.blue,
  CHART_COLORS.greenDark,
];

export default function AnalysisFinishPage() {
  const { results, participants, categories } = useEventStore();

  const stats = useMemo(() => {
    const total = participants.length;
    const dnsCount = results.filter((r) => r.status === "dns").length;
    const dnfCount = results.filter((r) => r.status === "dnf").length;
    const finishedCount = results.filter((r) => r.status === "finished").length;
    const startedCount = total - dnsCount;
    const finishRate = startedCount > 0 ? (finishedCount / startedCount) * 100 : 0;

    return {
      total,
      started: startedCount,
      finished: finishedCount,
      dnf: dnfCount,
      dns: dnsCount,
      finishRate: Number(finishRate.toFixed(1)),
    };
  }, [results, participants]);

  const categoryFinishRates = useMemo(() => {
    return categories.map((cat) => {
      const catParticipants = participants.filter((p) => p.category_id === cat.id);
      const catResults = results.filter((r) => r.category_id === cat.id);
      const started = catParticipants.length - catResults.filter((r) => r.status === "dns").length;
      const finished = catResults.filter((r) => r.status === "finished").length;
      const dnf = catResults.filter((r) => r.status === "dnf").length;
      const finishRate = started > 0 ? Number(((finished / started) * 100).toFixed(1)) : 0;
      const dnfRate = started > 0 ? Number(((dnf / started) * 100).toFixed(1)) : 0;

      return {
        name: cat.name.replace("男子", "").replace("组", "").replace("体验", "体验"),
        group: cat.name,
        finishRate,
        dnfRate,
        started,
        finished,
        dnf,
      };
    });
  }, [categories, participants, results]);

  const dnfReasonData = [
    { name: "体力不支", value: 45 },
    { name: "机械故障", value: 25 },
    { name: "受伤", value: 20 },
    { name: "其他", value: 10 },
  ];

  const dropLocationData = [
    { name: "起点-25km", count: 15 },
    { name: "25-55km", count: 30 },
    { name: "55-90km", count: 35 },
    { name: "90km-终点", count: 20 },
  ];

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            <TrendingUp className="text-racing-green" size={26} />
            完赛率统计
          </h1>
          <p className="text-gray-500 mt-1">
            分析赛事完赛情况、退赛原因与退赛位置分布
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<Flag size={22} />}
            label="出发人数"
            value={stats.started}
            color="blue"
            total={stats.total}
          />
          <StatCard
            icon={<CheckCircle size={22} />}
            label="完赛人数"
            value={stats.finished}
            color="green"
            total={stats.total}
          />
          <StatCard
            icon={<XCircle size={22} />}
            label="未完赛(DNF)"
            value={stats.dnf}
            color="orange"
            total={stats.total}
          />
          <StatCard
            icon={<Ban size={22} />}
            label="未出发(DNS)"
            value={stats.dns}
            color="gray"
            total={stats.total}
          />
          <div className="col-span-2 lg:col-span-1 border border-dark-700 bg-dark-900 p-5 flex flex-col items-center justify-center">
            <div className="relative">
              <svg className="w-28 h-28" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#262626"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={CHART_COLORS.green}
                  strokeWidth="10"
                  strokeDasharray={`${(stats.finishRate / 100) * 326.7} 326.7`}
                  strokeLinecap="butt"
                  transform="rotate(-90 60 60)"
                  style={{
                    filter: `drop-shadow(0 0 8px ${CHART_COLORS.green}80)`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono text-racing-green">
                  {stats.finishRate}%
                </span>
                <span className="text-xs text-gray-500">完赛率</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <Target size={20} className="text-racing-green" />
              <h2 className="text-lg font-semibold text-white font-display">
                各组别完赛率对比
              </h2>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryFinishRates}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#333333" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#333333" }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #333333",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name === "finishRate" ? "完赛率" : "DNF率",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(v) =>
                      v === "finishRate" ? (
                        <span className="text-gray-300">完赛率</span>
                      ) : (
                        <span className="text-gray-300">DNF率</span>
                      )
                    }
                  />
                  <Bar
                    dataKey="finishRate"
                    fill={CHART_COLORS.green}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="dnfRate"
                    fill={CHART_COLORS.orange}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <AlertTriangle size={20} className="text-racing-orange" />
              <h2 className="text-lg font-semibold text-white font-display">
                退赛原因分布
              </h2>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dnfReasonData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {dnfReasonData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DNF_REASON_COLORS[index % DNF_REASON_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #333333",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`${value}%`, "占比"]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(v) => (
                      <span className="text-gray-300">{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="col-span-1 lg:col-span-2 border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <MapPin size={20} className={CHART_COLORS.purple} />
              <h2 className="text-lg font-semibold text-white font-display">
                退赛位置分布
              </h2>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dropLocationData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#333333" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#333333" }}
                    label={{
                      value: "人数",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #333333",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    formatter={(value: number) => [value, "退赛人数"]}
                  />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    barSize={60}
                  >
                    {dropLocationData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          DROP_LOCATION_COLORS[
                            index % DROP_LOCATION_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "orange" | "gray";
  total: number;
}) {
  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

  const colorMap = {
    blue: {
      text: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      bar: "bg-blue-500",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    },
    green: {
      text: "text-racing-green",
      border: "border-racing-green/30",
      bg: "bg-racing-green/5",
      bar: "bg-racing-green",
      glow: "shadow-glow-sm",
    },
    orange: {
      text: "text-racing-orange",
      border: "border-racing-orange/30",
      bg: "bg-racing-orange/5",
      bar: "bg-racing-orange",
      glow: "shadow-[0_0_15px_rgba(255,107,53,0.2)]",
    },
    gray: {
      text: "text-gray-400",
      border: "border-gray-600/30",
      bg: "bg-gray-600/5",
      bar: "bg-gray-500",
      glow: "",
    },
  };

  const c = colorMap[color];

  return (
    <div className={cn("border border-dark-700 bg-dark-900 p-5", c.glow)}>
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 border flex items-center justify-center",
            c.border,
            c.bg,
            c.text
          )}
        >
          {icon}
        </div>
        <span className={cn("text-xs font-mono", c.text)}>{percent}%</span>
      </div>
      <p className="text-3xl font-bold font-mono text-white mb-1">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500 mb-3">{label}</p>
      <div className="h-1 bg-dark-700 overflow-hidden">
        <div
          className={cn("h-full transition-all", c.bar)}
          style={{ width: `${Math.min(Number(percent) * 2, 100)}%` }}
        />
      </div>
    </div>
  );
}
