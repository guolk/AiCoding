import { useState, useMemo } from "react";
import {
  BarChart3,
  Users,
  Star,
  Target,
  Search,
  Eye,
  Plus,
  Calendar,
  TrendingUp,
  FileText,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import { formatDate, generateId } from "@/utils";
import type { ActivityEvaluation } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const initialFormData: Omit<ActivityEvaluation, "id" | "createdAt"> = {
  activityId: "",
  activityName: "",
  participationRate: 0,
  satisfactionScore: 0,
  goalAchievement: 0,
  summary: "",
};

export default function ActivityEvaluation() {
  const { evaluations, activities, addEvaluation } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingEvaluation, setViewingEvaluation] =
    useState<ActivityEvaluation | null>(null);
  const [formData, setFormData] = useState<
    Omit<ActivityEvaluation, "id" | "createdAt">
  >(initialFormData);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evalItem) =>
      evalItem.activityName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [evaluations, searchTerm]);

  const chartData = useMemo(() => {
    return evaluations.map((evalItem) => ({
      name: evalItem.activityName.length > 6 
        ? evalItem.activityName.slice(0, 6) + "..."
        : evalItem.activityName,
      fullName: evalItem.activityName,
      参与率: evalItem.participationRate,
      满意度: Math.round(evalItem.satisfactionScore * 20),
      目标达成度: evalItem.goalAchievement,
    }));
  }, [evaluations]);

  const radarData = useMemo(() => {
    const avgParticipation =
      evaluations.reduce((sum, e) => sum + e.participationRate, 0) /
      (evaluations.length || 1);
    const avgSatisfaction =
      evaluations.reduce((sum, e) => sum + e.satisfactionScore * 20, 0) /
      (evaluations.length || 1);
    const avgGoal =
      evaluations.reduce((sum, e) => sum + e.goalAchievement, 0) /
      (evaluations.length || 1);

    return [
      { subject: "参与率", value: Math.round(avgParticipation), fullMark: 100 },
      { subject: "满意度", value: Math.round(avgSatisfaction), fullMark: 100 },
      { subject: "目标达成度", value: Math.round(avgGoal), fullMark: 100 },
    ];
  }, [evaluations]);

  const satisfactionData = useMemo(() => {
    const distribution = {
      "5分": 0,
      "4-5分": 0,
      "3-4分": 0,
      "3分以下": 0,
    };
    evaluations.forEach((e) => {
      if (e.satisfactionScore >= 4.5) distribution["5分"]++;
      else if (e.satisfactionScore >= 4) distribution["4-5分"]++;
      else if (e.satisfactionScore >= 3) distribution["3-4分"]++;
      else distribution["3分以下"]++;
    });
    return Object.entries(distribution)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [evaluations]);

  const COLORS = ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd"];

  const stats = useMemo(() => {
    const total = evaluations.length;
    const avgParticipation =
      evaluations.reduce((sum, e) => sum + e.participationRate, 0) /
      (total || 1);
    const avgSatisfaction =
      evaluations.reduce((sum, e) => sum + e.satisfactionScore, 0) /
      (total || 1);
    const avgGoal =
      evaluations.reduce((sum, e) => sum + e.goalAchievement, 0) /
      (total || 1);
    return {
      total,
      avgParticipation: Math.round(avgParticipation),
      avgSatisfaction: avgSatisfaction.toFixed(1),
      avgGoal: Math.round(avgGoal),
    };
  }, [evaluations]);

  const handleView = (evaluation: ActivityEvaluation) => {
    setViewingEvaluation(evaluation);
    setIsViewModalOpen(true);
  };

  const handleAdd = () => {
    const completedActivities = activities.filter(
      (a) => a.status === "completed"
    );
    const firstActivity = completedActivities[0];
    setFormData({
      ...initialFormData,
      activityId: firstActivity?.id || "",
      activityName: firstActivity?.name || "",
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.activityId || !formData.summary.trim()) return;

    const activity = activities.find((a) => a.id === formData.activityId);
    const activityName = activity?.name || formData.activityName;

    const newEvaluation: ActivityEvaluation = {
      ...formData,
      activityName,
      id: generateId("eval"),
      createdAt: new Date().toISOString().split("T")[0],
    };
    addEvaluation(newEvaluation);
    setIsAddModalOpen(false);
  };

  const getScoreColor = (score: number, type: "rate" | "star" | "goal") => {
    if (type === "star") {
      if (score >= 4.5) return "text-green-600";
      if (score >= 4) return "text-blue-600";
      if (score >= 3) return "text-amber-600";
      return "text-red-600";
    }
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number, type: "rate" | "star" | "goal") => {
    const value = type === "star" ? score * 20 : score;
    if (value >= 90) return "from-green-500 to-green-400";
    if (value >= 75) return "from-primary-800 to-primary-500";
    if (value >= 60) return "from-amber-500 to-amber-400";
    return "from-red-500 to-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            效果评估
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            活动效果评估与数据分析
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增评估
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                评估总数
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                平均参与率
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${getScoreColor(
                  stats.avgParticipation,
                  "rate"
                )}`}
              >
                {stats.avgParticipation}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>表现优秀</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                平均满意度
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${getScoreColor(
                  parseFloat(stats.avgSatisfaction),
                  "star"
                )}`}
              >
                {stats.avgSatisfaction}
                <span className="text-lg">/5</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-current" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(parseFloat(stats.avgSatisfaction))
                    ? "text-amber-400 fill-current"
                    : "text-gray-200 dark:text-gray-700"
                }`}
              />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                平均目标达成度
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${getScoreColor(
                  stats.avgGoal,
                  "goal"
                )}`}
              >
                {stats.avgGoal}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-800 to-primary-500 rounded-full"
              style={{ width: `${stats.avgGoal}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>各项指标对比</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                  <Legend />
                  <Bar
                    dataKey="参与率"
                    fill="#1e40af"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="满意度"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="目标达成度"
                    fill="#60a5fa"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>综合评估雷达图</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                  />
                  <Radar
                    name="平均值"
                    dataKey="value"
                    stroke="#1e40af"
                    fill="#1e40af"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>评估列表</Card.Title>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索活动名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-56 pl-10 pr-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {filteredEvaluations.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  暂无评估数据
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredEvaluations.map((evalItem) => (
                  <div
                    key={evalItem.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-800 to-primary-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {evalItem.activityName}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {formatDate(evalItem.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p
                            className={`text-lg font-bold ${getScoreColor(
                              evalItem.participationRate,
                              "rate"
                            )}`}
                          >
                            {evalItem.participationRate}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            参与率
                          </p>
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-lg font-bold ${getScoreColor(
                              evalItem.satisfactionScore,
                              "star"
                            )}`}
                          >
                            {evalItem.satisfactionScore.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            满意度
                          </p>
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-lg font-bold ${getScoreColor(
                              evalItem.goalAchievement,
                              "goal"
                            )}`}
                          >
                            {evalItem.goalAchievement}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            目标达成度
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(evalItem)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreBg(
                            evalItem.participationRate,
                            "rate"
                          )} rounded-full`}
                          style={{
                            width: `${evalItem.participationRate}%`,
                          }}
                        />
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreBg(
                            evalItem.satisfactionScore * 20,
                            "star"
                          )} rounded-full`}
                          style={{
                            width: `${Math.min(
                              evalItem.satisfactionScore * 20,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreBg(
                            evalItem.goalAchievement,
                            "goal"
                          )} rounded-full`}
                          style={{ width: `${evalItem.goalAchievement}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>满意度分布</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {satisfactionData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                  <Badge variant="info">{item.value} 个活动</Badge>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="评估详情"
        size="lg"
      >
        {viewingEvaluation && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {viewingEvaluation.activityName}
              </h2>
              <Badge variant="success">已评估</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl text-center">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p
                  className={`text-3xl font-bold ${getScoreColor(
                    viewingEvaluation.participationRate,
                    "rate"
                  )}`}
                >
                  {viewingEvaluation.participationRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  参与率
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl text-center">
                <Star className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2 fill-current" />
                <p
                  className={`text-3xl font-bold ${getScoreColor(
                    viewingEvaluation.satisfactionScore,
                    "star"
                  )}`}
                >
                  {viewingEvaluation.satisfactionScore.toFixed(1)}
                  <span className="text-lg">/5</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  满意度
                </p>
                <div className="flex justify-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <=
                        Math.round(viewingEvaluation.satisfactionScore)
                          ? "text-amber-400 fill-current"
                          : "text-gray-200 dark:text-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl text-center">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p
                  className={`text-3xl font-bold ${getScoreColor(
                    viewingEvaluation.goalAchievement,
                    "goal"
                  )}`}
                >
                  {viewingEvaluation.goalAchievement}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  目标达成度
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                评估总结
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {viewingEvaluation.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Calendar className="w-4 h-4" />
              <span>评估日期：{formatDate(viewingEvaluation.createdAt)}</span>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            关闭
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="新增活动评估"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              选择活动
            </label>
            <select
              value={formData.activityId}
              onChange={(e) => {
                const activity = activities.find(
                  (a) => a.id === e.target.value
                );
                setFormData({
                  ...formData,
                  activityId: e.target.value,
                  activityName: activity?.name || "",
                });
              }}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {activities
                .filter((a) => a.status === "completed")
                .map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                参与率 (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.participationRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    participationRate: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                满意度 (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.satisfactionScore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    satisfactionScore: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                目标达成度 (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.goalAchievement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goalAchievement: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              评估总结
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="请输入活动效果评估总结..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.activityId || !formData.summary.trim()}
          >
            创建评估
          </Button>
        </div>
      </Modal>
    </div>
  );
}
