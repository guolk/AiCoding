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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { MessageSquare, Star, ThumbsUp, Users, ClipboardList, MessageCircle, BarChart3 } from "lucide-react";
import { useEventStore } from "@/store";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils";

const CHART_COLORS = {
  green: "#00d26a",
  greenDark: "#00a855",
  greenLight: "#33db88",
  orange: "#ff6b35",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

const RATING_NAMES = [
  { key: "overall_rating", label: "整体评分" },
  { key: "route_rating", label: "路线设计" },
  { key: "organization_rating", label: "组织服务" },
  { key: "aid_stations_rating", label: "补给站点" },
  { key: "swag_rating", label: "物资包" },
];

export default function AnalysisSurveyPage() {
  const { surveyResponses, participants } = useEventStore();

  const stats = useMemo(() => {
    const total = surveyResponses.length;
    const avgOverall =
      total > 0
        ? surveyResponses.reduce((sum, r) => sum + r.overall_rating, 0) / total
        : 0;
    const recommendYes = surveyResponses.filter((r) => r.would_recommend).length;
    const recommendRate = total > 0 ? (recommendYes / total) * 100 : 0;

    return {
      total,
      avgOverall: Number(avgOverall.toFixed(1)),
      recommendRate: Number(recommendRate.toFixed(1)),
    };
  }, [surveyResponses]);

  const ratingDistribution = useMemo(() => {
    const dist = [1, 2, 3, 4, 5].map((star) => ({
      star: `${star}星`,
      count: surveyResponses.filter((r) => r.overall_rating === star).length,
    }));
    return dist;
  }, [surveyResponses]);

  const radarData = useMemo(() => {
    return RATING_NAMES.map((r) => {
      const key = r.key as keyof (typeof surveyResponses)[0];
      const avg =
        surveyResponses.length > 0
          ? surveyResponses.reduce(
              (sum, resp) => sum + (resp[key] as number),
              0
            ) / surveyResponses.length
          : 0;
      return {
        subject: r.label,
        score: Number(avg.toFixed(2)),
        fullMark: 5,
      };
    });
  }, [surveyResponses]);

  const recommendData = useMemo(() => {
    const yes = surveyResponses.filter((r) => r.would_recommend).length;
    const no = surveyResponses.filter((r) => !r.would_recommend).length;
    return [
      { name: "会推荐", value: yes, color: CHART_COLORS.green },
      { name: "不会推荐", value: no, color: CHART_COLORS.orange },
    ];
  }, [surveyResponses]);

  const comments = useMemo(() => {
    return surveyResponses
      .filter((r) => r.comments && r.comments.trim())
      .sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      )
      .map((r) => {
        const p = participants.find((x) => x.id === r.participant_id);
        return {
          ...r,
          participantName: p?.name || "匿名用户",
        };
      });
  }, [surveyResponses, participants]);

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              "transition-colors",
              i <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-dark-600"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            <ClipboardList className="text-racing-green" size={26} />
            满意度调查
          </h1>
          <p className="text-gray-500 mt-1">
            参赛选手赛后调查反馈与评价分析
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="border border-dark-700 bg-dark-900 p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <Users size={16} />
              <span>总回复数</span>
            </div>
            <p className="text-4xl font-bold font-mono text-white mb-2">
              {stats.total}
            </p>
            <p className="text-xs text-gray-500">份有效问卷</p>
          </div>

          <div className="border border-dark-700 bg-dark-900 p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <Star size={16} />
              <span>平均总分</span>
            </div>
            <div className="flex items-baseline gap-3 mb-3">
              <p className="text-4xl font-bold font-mono text-yellow-400">
                {stats.avgOverall}
              </p>
              <span className="text-gray-500 text-sm">/ 5.0</span>
            </div>
            {renderStars(stats.avgOverall, 20)}
          </div>

          <div className="border border-dark-700 bg-dark-900 p-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <ThumbsUp size={16} />
              <span>推荐率</span>
            </div>
            <div className="flex items-baseline gap-3 mb-3">
              <p
                className="text-4xl font-bold font-mono"
                style={{
                  color:
                    stats.recommendRate >= 80
                      ? CHART_COLORS.green
                      : stats.recommendRate >= 60
                      ? CHART_COLORS.orange
                      : "#ef4444",
                }}
              >
                {stats.recommendRate}%
              </p>
            </div>
            <div className="h-2 bg-dark-700 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${stats.recommendRate}%`,
                  backgroundColor:
                    stats.recommendRate >= 80
                      ? CHART_COLORS.green
                      : stats.recommendRate >= 60
                      ? CHART_COLORS.orange
                      : "#ef4444",
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <Star size={20} className="text-yellow-400" />
              <h2 className="text-lg font-semibold text-white font-display">
                五项评分雷达图
              </h2>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#333333" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    name="评分"
                    dataKey="score"
                    stroke={CHART_COLORS.green}
                    fill={CHART_COLORS.green}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #333333",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [value.toFixed(2), "平均分"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <BarChart3 size={20} className="text-racing-orange" />
              <h2 className="text-lg font-semibold text-white font-display">
                评分分布
              </h2>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ratingDistribution}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="star"
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
                    allowDecimals={false}
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
                    formatter={(v: number) => [v, "人数"]}
                  />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                  >
                    {ratingDistribution.map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={
                          [
                            "#ef4444",
                            "#f97316",
                            "#eab308",
                            CHART_COLORS.greenLight,
                            CHART_COLORS.green,
                          ][idx]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="col-span-1 lg:col-span-1 border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <ThumbsUp size={20} className="text-racing-green" />
              <h2 className="text-lg font-semibold text-white font-display">
                推荐率
              </h2>
            </div>
            <div className="p-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recommendData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {recommendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #333333",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    formatter={(value: number, _name, props) => [
                      `${value}人 (${
                        stats.total > 0
                          ? ((value / stats.total) * 100).toFixed(1)
                          : 0
                      }%)`,
                      props.payload.name,
                    ]}
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

          <section className="col-span-1 lg:col-span-1 border border-dark-700 bg-dark-900">
            <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
              <MessageSquare size={20} className={CHART_COLORS.purple} />
              <h2 className="text-lg font-semibold text-white font-display">
                各维度平均分
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {radarData.map((item, idx) => {
                const colors = [
                  CHART_COLORS.green,
                  CHART_COLORS.orange,
                  CHART_COLORS.blue,
                  CHART_COLORS.purple,
                  CHART_COLORS.cyan,
                ];
                return (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-400">
                        {item.subject}
                      </span>
                      <span
                        className="text-sm font-mono font-semibold"
                        style={{ color: colors[idx] }}
                      >
                        {item.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-dark-700 overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(item.score / 5) * 100}%`,
                          backgroundColor: colors[idx],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="border border-dark-700 bg-dark-900">
          <div className="px-5 py-4 border-b border-dark-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-racing-green" />
              <h2 className="text-lg font-semibold text-white font-display">
                选手评论
              </h2>
            </div>
            <span className="text-xs text-gray-500">
              共 {comments.length} 条评论
            </span>
          </div>
          <div className="p-5 space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {comments.length === 0 ? (
              <p className="text-gray-600 text-sm py-8 text-center">
                暂无评论
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="border border-dark-700 bg-dark-850 p-4 hover:border-dark-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 border border-dark-600 bg-dark-800 flex items-center justify-center">
                        <Users size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {c.participantName}
                        </p>
                        <p className="text-gray-600 text-xs font-mono mt-0.5">
                          {formatDate(c.submitted_at)}
                        </p>
                      </div>
                    </div>
                    {renderStars(c.overall_rating, 14)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    {RATING_NAMES.slice(1).map((r) => {
                      const val = c[r.key as keyof typeof c] as number;
                      return (
                        <div
                          key={r.key}
                          className="flex items-center justify-between px-2 py-1 bg-dark-800"
                        >
                          <span className="text-gray-500">{r.label}</span>
                          <span className="text-white font-mono">{val}.0</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-3 border-t border-dark-700">
                    <div className="flex items-start gap-2">
                      <MessageCircle
                        size={14}
                        className="text-gray-500 mt-0.5 shrink-0"
                      />
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {c.comments}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
