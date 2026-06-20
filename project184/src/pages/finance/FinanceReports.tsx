import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Eye,
  Download,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import {
  formatDate,
  formatCurrency,
  generateId,
  getCategoryLabel,
} from "@/utils";
import type { FinanceReport } from "@/types";

const COLORS = [
  "#1e3a5f",
  "#2563eb",
  "#0891b2",
  "#0d9488",
  "#65a30d",
  "#ca8a04",
];

export default function FinanceReports() {
  const { financeReports, addFinanceReport, financeRecords } = useAppStore();

  const [selectedReport, setSelectedReport] = useState<FinanceReport | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");

  const categoryAnalysis = useMemo(() => {
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    financeRecords.forEach((record) => {
      if (record.type === "income") {
        incomeByCategory[record.categoryLabel] =
          (incomeByCategory[record.categoryLabel] || 0) + record.amount;
      } else {
        expenseByCategory[record.categoryLabel] =
          (expenseByCategory[record.categoryLabel] || 0) + record.amount;
      }
    });

    const incomeData = Object.entries(incomeByCategory).map(([name, value]) => ({
      name,
      value,
    }));
    const expenseData = Object.entries(expenseByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    return { incomeData, expenseData };
  }, [financeRecords]);

  const monthlyTrend = useMemo(() => {
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    financeRecords.forEach((record) => {
      const month = record.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (record.type === "income") {
        monthlyData[month].income += record.amount;
      } else {
        monthlyData[month].expense += record.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        收入: data.income,
        支出: data.expense,
      }));
  }, [financeRecords]);

  const comparisonData = useMemo(() => {
    const categories = new Set([
      ...categoryAnalysis.incomeData.map((d) => d.name),
      ...categoryAnalysis.expenseData.map((d) => d.name),
    ]);

    return Array.from(categories).map((category) => ({
      category,
      收入: categoryAnalysis.incomeData.find((d) => d.name === category)?.value || 0,
      支出: categoryAnalysis.expenseData.find((d) => d.name === category)?.value || 0,
    }));
  }, [categoryAnalysis]);

  const stats = useMemo(() => {
    const totalReports = financeReports.length;
    const latestReport = financeReports[0];
    const totalIncome = financeRecords
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = financeRecords
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
    const balance = totalIncome - totalExpense;
    return { totalReports, latestReport, totalIncome, totalExpense, balance };
  }, [financeReports, financeRecords]);

  const handleView = (report: FinanceReport) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleGenerate = () => {
    setReportTitle("");
    setReportPeriod("");
    setIsGenerateModalOpen(true);
  };

  const handleSubmitGenerate = () => {
    if (!reportTitle.trim() || !reportPeriod.trim()) return;

    const newReport: FinanceReport = {
      id: generateId("report"),
      title: reportTitle,
      period: reportPeriod,
      totalIncome: stats.totalIncome,
      totalExpense: stats.totalExpense,
      balance: stats.balance,
      details: `本报告根据系统内财务记录自动生成，收入合计${formatCurrency(stats.totalIncome)}，支出合计${formatCurrency(stats.totalExpense)}，结余${formatCurrency(stats.balance)}。`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    addFinanceReport(newReport);
    setIsGenerateModalOpen(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            财务报告
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            学期财务报表与收支分析
          </p>
        </div>
        <Button onClick={handleGenerate}>
          <Plus className="w-4 h-4 mr-2" />
          生成报告
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">报告总数</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalReports}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">总收入</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">总支出</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">结余</p>
              <p className={`text-xl font-bold ${stats.balance >= 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <Card.Title>月度收支趋势</Card.Title>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    stroke="#d1d5db"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    stroke="#d1d5db"
                    tickFormatter={(value) => `¥${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="收入"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="支出"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <Card.Title>收入分类占比</Card.Title>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="h-64 flex items-center justify-center">
              {categoryAnalysis.incomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryAnalysis.incomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryAnalysis.incomeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">暂无收入数据</p>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <Card.Title>支出分类占比</Card.Title>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="h-64 flex items-center justify-center">
              {categoryAnalysis.expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryAnalysis.expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryAnalysis.expenseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">暂无支出数据</p>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <Card.Title>分类收支对比</Card.Title>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    stroke="#d1d5db"
                    tickFormatter={(value) => `¥${value / 1000}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    stroke="#d1d5db"
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="收入" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="支出" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <Card.Title>财务报告列表</Card.Title>
          </div>
        </Card.Header>
        <Card.Body>
          {financeReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无财务报告</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {financeReports.map((report) => (
                <Card
                  key={report.id}
                  hover
                  className="overflow-hidden"
                >
                  <div className="h-2 bg-gradient-to-r from-primary-800 to-primary-500" />
                  <Card.Body className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {report.title}
                      </h3>
                      <Badge variant="default">报告</Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="truncate">{report.period}</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <ArrowUpCircle className="w-4 h-4" />
                        <span>收入: {formatCurrency(report.totalIncome)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <ArrowDownCircle className="w-4 h-4" />
                        <span>支出: {formatCurrency(report.totalExpense)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                        <Wallet className="w-4 h-4" />
                        <span>结余: {formatCurrency(report.balance)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                      {report.details}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-400">
                        {formatDate(report.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(report)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="财务报告详情"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedReport.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {selectedReport.period}
              </p>
              <Badge variant="default" className="mt-2">
                生成于 {formatDate(selectedReport.createdAt)}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                  总收入
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(selectedReport.totalIncome)}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                  总支出
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(selectedReport.totalExpense)}
                </p>
              </div>
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                  期末结余
                </p>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  {formatCurrency(selectedReport.balance)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                报告说明
              </p>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {selectedReport.details}
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
            关闭
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="生成财务报告"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              报告标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入报告标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              报告期别 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="如：2024-2025学年第一学期"
            />
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              报告数据预览
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">总收入</p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(stats.totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">总支出</p>
                <p className="font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(stats.totalExpense)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">结余</p>
                <p className="font-medium text-primary-600 dark:text-primary-400">
                  {formatCurrency(stats.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setIsGenerateModalOpen(false)}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmitGenerate}
            disabled={!reportTitle.trim() || !reportPeriod.trim()}
          >
            <FileText className="w-4 h-4 mr-2" />
            生成报告
          </Button>
        </div>
      </Modal>
    </div>
  );
}
