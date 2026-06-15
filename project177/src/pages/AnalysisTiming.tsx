import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Clock, Gauge, Zap, Timer, TrendingUp } from "lucide-react";
import { useEventStore } from "@/store";
import { cn } from "@/lib/utils";
import { formatDuration, formatPace } from "@/utils";

const CHART_COLORS = {
  green: "#00d26a",
  greenDark: "#00a855",
  greenLight: "#33db88",
  orange: "#ff6b35",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  purple: "#a855f7",
};

export default function AnalysisTimingPage() {
  const { results, participants, categories } = useEventStore();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");

  const categoryStats = useMemo(() => {
    const catResults = results.filter(
      (r) => r.category_id === activeCategory && r.status === "finished"
    );
    const times = catResults.map((r) => r.net_time_seconds).sort((a, b) => a - b);

    if (times.length === 0) {
      return {
        fastest: 0,
        slowest: 0,
        average: 0,
        avgPace: 0,
        avgSpeed: 0,
        q1: 0,
        median: 0,
        q3: 0,
        count: 0,
      };
    }

    const sum = times.reduce((a, b) => a + b, 0);
    const avg = sum / times.length;

    const percentile = (arr: number[], p: number) => {
      const idx = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.max(0, Math.min(idx, arr.length - 1))];
    };

    const cat = categories.find((c) => c.id === activeCategory);
    const avgPace =
      avg > 0 && cat ? (avg / 60) / cat.distance_km : 0;
    const avgSpeed =
      avg > 0 && cat
        ? Math.round((cat.distance_km / (avg / 3600)) * 100) / 100
        : 0;

    return {
      fastest: times[0],
      slowest: times[times.length - 1],
      average: Math.round(avg),
      avgPace,
      avgSpeed,
      q1: percentile(times, 25),
      median: percentile(times, 50),
      q3: percentile(times, 75),
      count: times.length,
    };
  }, [results, activeCategory, categories]);

  const histogramData = useMemo(() => {
    const catResults = results.filter(
      (r) => r.category_id === activeCategory && r.status === "finished"
    );
    const times = catResults.map((r) => r.net_time_seconds);
    const hours = times.map((t) => t / 3600);

    const buckets = [
      { label: "<3h", min: 0, max: 3 },
      { label: "3-3.5h", min: 3, max: 3.5 },
      { label: "3.5-4h", min: 3.5, max: 4 },
      { label: "4-4.5h", min: 4, max: 4.5 },
      { label: ">4.5h", min: 4.5, max: 100 },
    ];

    return buckets.map((b) => ({
      range: b.label,
      count: hours.filter((h) => h >= b.min && h < b.max).length,
    }));
  }, [results, activeCategory]);

  const boxPlotData = useMemo(() => {
    return categories.map((cat) => {
      const catResults = results.filter(
        (r) => r.category_id === cat.id && r.status === "finished"
      );
      const times = catResults
        .map((r) => r.net_time_seconds)
        .sort((a, b) => a - b);

      const percentile = (arr: number[], p: number) => {
        if (arr.length === 0) return 0;
        const idx = Math.ceil((p / 100) * arr.length) - 1;
        return arr[Math.max(0, Math.min(idx, arr.length - 1))];
      };

      return {
        name: cat.name.replace("男子", "").replace("组", ""),
        min: times[0] || 0,
        q1: percentile(times, 25),
        median: percentile(times, 50),
        q3: percentile(times, 75),
        max: times[times.length - 1] || 0,
      };
    });
  }, [results, categories]);

  const paceScatterData = useMemo(() => {
    const catResults = results.filter(
      (r) => r.category_id === activeCategory && r.status === "finished"
    );
    return catResults
      .slice(0, 50)
      .map((r) => ({
        pace: r.pace_min_per_km,
        speed: r.avg_speed,
        rank: r.category_rank || r.overall_rank,
        name: participants.find((p) => p.id === r.participant_id)?.name || "",
      }))
      .filter((d) => d.pace > 0 && d.speed > 0);
  }, [results, activeCategory, participants]);

  const splitPaceData = [
    { segment: "0-25km", elite: 2.1, open: 2.8, female: 3.0, exp: 3.8 },
    { segment: "25-55km", elite: 2.2, open: 3.0, female: 3.2, exp: 4.1 },
    { segment: "55-90km", elite: 2.4, open: 3.3, female: 3.5, exp: 4.5 },
    { segment: "90-120km", elite: 2.6, open: 3.6, female: 3.8, exp: 5.0 },
  ];

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            <Clock className="text-racing-green" size={26} />
            完赛时间分布
          </h1>
          <p className="text-gray-500 mt-1">
            分析各组别完赛时间、配速与速度分布
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all border",
                activeCategory === cat.id
                  ? "border-racing-green bg-racing-green/10 text-racing-green shadow-glow-sm"
                  : "border-dark-700 bg-dark-900 text-gray-400 hover:text-white hover:border-dark-600"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            icon={<Zap size={20} />}
            label="最快完赛"
            value={formatDuration(categoryStats.fastest)}
            color="green"
          />
          <MetricCard
            icon={<Timer size={20} />}
            label="最慢完赛"
            value={formatDuration(categoryStats.slowest)}
            color="orange"
          />
          <MetricCard
            icon={<TrendingUp size={20} />}
            label="平均时间"
            value={formatDuration(categoryStats.average)}
            color="blue"
          />
          <MetricCard
            icon={<Gauge size={20} />}
            label="平均配速"
            value={formatPace(categoryStats.avgPace)}
            color="cyan"
            suffix="/km"
          />
          <MetricCard
            icon={<Zap size={20} />}
            label="平均速度"
            value={categoryStats.avgSpeed.toFixed(1)}
            color="purple"
            suffix="km/h"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <TrendingUp size={20} className="text-racing-green" />
              <h2 className="text-lg font-semibold text-white font-display">
                完赛时间直方图
              </h2>
              <span className="ml-auto text-xs text-gray-500">
                共 {categoryStats.count} 人完赛
              </span>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={histogramData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="range"
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
                    formatter={(v: number) => [v, "人数"]}
                  />
                  <Bar
                    dataKey="count"
                    fill={CHART_COLORS.green}
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <Clock size={20} className="text-racing-orange" />
              <h2 className="text-lg font-semibold text-white font-display">
                组别时间箱线图对比
              </h2>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={boxPlotData}
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
                    tickFormatter={(v) => formatDuration(v).slice(0, 5)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #333333",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    formatter={(v: number, name: string) => [
                      formatDuration(v),
                      {
                        min: "最快",
                        q1: "Q1(25%)",
                        median: "中位数",
                        q3: "Q3(75%)",
                        max: "最慢",
                      }[name] || name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(v) => (
                      <span className="text-gray-300">
                        {
                          {
                            min: "最快",
                            q1: "Q1(25%)",
                            median: "中位数",
                            q3: "Q3(75%)",
                            max: "最慢",
                          }[v] || v
                        }
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="min"
                    stackId="a"
                    fill={CHART_COLORS.greenLight}
                  />
                  <Bar dataKey="q1" stackId="a" fill={CHART_COLORS.green} />
                  <Bar
                    dataKey="median"
                    stackId="a"
                    fill={CHART_COLORS.orange}
                  />
                  <Bar dataKey="q3" stackId="a" fill={CHART_COLORS.greenDark} />
                  <Bar dataKey="max" stackId="a" fill={CHART_COLORS.blue} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="col-span-1 lg:col-span-2 border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <Gauge size={20} className={CHART_COLORS.purple} />
              <h2 className="text-lg font-semibold text-white font-display">
                分段配速模拟（各组别平均）
              </h2>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={splitPaceData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="segment"
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
                      value: "平均配速(min/km)",
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
                    formatter={(v: number) => [`${v.toFixed(1)} min/km`, ""]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(v) => (
                      <span className="text-gray-300">
                        {
                          {
                            elite: "精英组",
                            open: "公开组",
                            female: "女子组",
                            exp: "体验组",
                          }[v] || v
                        }
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="elite"
                    stroke={CHART_COLORS.green}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.green, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="open"
                    stroke={CHART_COLORS.blue}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.blue, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="female"
                    stroke={CHART_COLORS.orange}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.orange, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="exp"
                    stroke={CHART_COLORS.purple}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.purple, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "green" | "orange" | "blue" | "cyan" | "purple";
  suffix?: string;
}) {
  const colorMap = {
    green: {
      text: "text-racing-green",
      border: "border-racing-green/30",
      bg: "bg-racing-green/5",
    },
    orange: {
      text: "text-racing-orange",
      border: "border-racing-orange/30",
      bg: "bg-racing-orange/5",
    },
    blue: {
      text: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
    },
    cyan: {
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/5",
    },
    purple: {
      text: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-500/5",
    },
  };

  const c = colorMap[color];

  return (
    <div className="border border-dark-700 bg-dark-900 p-5 hover:border-dark-600 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-9 h-9 border flex items-center justify-center",
            c.border,
            c.bg,
            c.text
          )}
        >
          {icon}
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold font-mono", c.text)}>
        {value}
        {suffix && (
          <span className="text-sm font-normal ml-1 text-gray-500">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
