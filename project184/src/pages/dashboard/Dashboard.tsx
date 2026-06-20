import { Users, Calendar, Wallet, Award, TrendingUp, TrendingDown, Clock, FileText } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency, getStatusLabel, getStatusColor } from "@/utils";
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
  LineChart,
  Line,
} from "recharts";
import { Link } from "react-router-dom";

const memberGrowthData = [
  { month: "9月", 成员数: 45 },
  { month: "10月", 成员数: 78 },
  { month: "11月", 成员数: 112 },
  { month: "12月", 成员数: 145 },
];

const activityData = [
  { name: "已完成", value: 5, color: "#22c55e" },
  { name: "进行中", value: 0, color: "#3b82f6" },
  { name: "筹备中", value: 2, color: "#f59e0b" },
];

const financeData = [
  { month: "9月", 收入: 18000, 支出: 800 },
  { month: "10月", 收入: 5000, 支出: 1100 },
  { month: "11月", 收入: 0, 支出: 3000 },
  { month: "12月", 收入: 0, 支出: 6500 },
];

export default function Dashboard() {
  const { members, activities, financeRecords, memberRecords, pointRecords } =
    useAppStore();

  const totalMembers = members.filter((m) => m.status === "active").length;
  const totalActivities = activities.length;
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);

  const totalIncome = financeRecords
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = financeRecords
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const pendingApprovals = memberRecords.filter(
    (r) => r.status === "pending"
  ).length;

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const topMembers = [...members]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const recentPointRecords = [...pointRecords].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">社团成员</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalMembers}
              </p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>本月增长 12%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">活动总数</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalActivities}
              </p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>本月新增 2 个</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">经费结余</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(balance)}
              </p>
              <div className="flex items-center mt-2 text-amber-600 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span>本月支出 6500</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">待审批事项</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {pendingApprovals}
              </p>
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>需要及时处理</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>收支趋势</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="收入" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="支出" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>活动状态分布</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {activityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* 下部区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近活动 */}
        <Card className="lg:col-span-2">
          <Card.Header className="flex items-center justify-between">
            <Card.Title>最近活动</Card.Title>
            <Link
              to="/activities/list"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              查看全部 →
            </Link>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.date} · {activity.location}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      getStatusColor(activity.status) as
                        | "success"
                        | "warning"
                        | "info"
                        | "gray"
                    }
                  >
                    {getStatusLabel(activity.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* 积分排行榜 */}
        <Card>
          <Card.Header className="flex items-center justify-between">
            <Card.Title>积分排行榜</Card.Title>
            <Link
              to="/members/points"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              查看全部 →
            </Link>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {topMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        : index === 1
                        ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        : index === 2
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                        : "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.position}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600 dark:text-primary-400">
                      {member.points}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      积分
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* 成员增长趋势 */}
      <Card>
        <Card.Header>
          <Card.Title>成员增长趋势</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="成员数"
                  stroke="#1e40af"
                  strokeWidth={2}
                  dot={{ fill: "#1e40af", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
