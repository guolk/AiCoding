import { useState, useMemo } from "react";
import {
  Wallet,
  Plus,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  FileText,
  X,
  Check,
  AlertTriangle,
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
} from "recharts";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAppStore } from "@/store/useAppStore";
import {
  formatCurrency,
  generateId,
  getCategoryLabel,
} from "@/utils";
import type { BudgetItem } from "@/types";

const budgetCategories = [
  { value: "activity", label: "活动支出" },
  { value: "office", label: "办公采购" },
  { value: "training", label: "培训经费" },
  { value: "other", label: "其他支出" },
];

const initialFormData: Omit<BudgetItem, "id"> = {
  category: "activity",
  categoryLabel: "活动支出",
  plannedAmount: 0,
  actualAmount: 0,
  description: "",
  semester: "2024-2025学年第二学期",
};

export default function FinanceBudget() {
  const { budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem } =
    useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState(
    "2024-2025学年第一学期"
  );

  const semesters = useMemo(() => {
    const sems = new Set<string>();
    budgetItems.forEach((b) => sems.add(b.semester));
    return Array.from(sems);
  }, [budgetItems]);

  const filteredBudgetItems = useMemo(() => {
    return budgetItems.filter((b) => b.semester === selectedSemester);
  }, [budgetItems, selectedSemester]);

  const stats = useMemo(() => {
    const totalPlanned = filteredBudgetItems.reduce(
      (sum, item) => sum + item.plannedAmount,
      0
    );
    const totalActual = filteredBudgetItems.reduce(
      (sum, item) => sum + item.actualAmount,
      0
    );
    const remaining = totalPlanned - totalActual;
    const executionRate =
      totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
    return { totalPlanned, totalActual, remaining, executionRate };
  }, [filteredBudgetItems]);

  const chartData = useMemo(() => {
    return filteredBudgetItems.map((item) => ({
      name: item.categoryLabel,
      计划预算: item.plannedAmount,
      实际支出: item.actualAmount,
    }));
  }, [filteredBudgetItems]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ ...initialFormData, semester: selectedSemester });
    setIsModalOpen(true);
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      categoryLabel: item.categoryLabel,
      plannedAmount: item.plannedAmount,
      actualAmount: item.actualAmount,
      description: item.description,
      semester: item.semester,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBudgetItem(id);
    setShowDeleteConfirm(null);
  };

  const handleSubmit = () => {
    if (formData.plannedAmount <= 0 || !formData.description.trim()) return;

    const categoryLabel = getCategoryLabel(formData.category);

    if (editingItem) {
      updateBudgetItem(editingItem.id, {
        ...formData,
        categoryLabel,
      });
    } else {
      const newItem: BudgetItem = {
        ...formData,
        id: generateId("budget"),
        categoryLabel,
      };
      addBudgetItem(newItem);
    }
    setIsModalOpen(false);
  };

  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      category,
      categoryLabel: getCategoryLabel(category),
    });
  };

  const getExecutionStatus = (planned: number, actual: number) => {
    const rate = planned > 0 ? (actual / planned) * 100 : 0;
    if (rate >= 100) return { variant: "danger" as const, label: "超支" };
    if (rate >= 80) return { variant: "warning" as const, label: "接近预算" };
    if (rate >= 50) return { variant: "info" as const, label: "正常执行" };
    return { variant: "success" as const, label: "执行中" };
  };

  const getProgressColor = (planned: number, actual: number) => {
    const rate = planned > 0 ? (actual / planned) * 100 : 0;
    if (rate >= 100) return "bg-red-500";
    if (rate >= 80) return "bg-amber-500";
    return "bg-primary-600";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
            预算规划
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            下学期预算编制与执行对比
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增预算项
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">计划预算</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalPlanned)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">实际支出</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(stats.totalActual)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">剩余预算</p>
              <p className={`text-xl font-bold ${stats.remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {formatCurrency(stats.remaining)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">执行率</p>
              <p className={`text-xl font-bold ${stats.executionRate >= 100 ? "text-red-600 dark:text-red-400" : stats.executionRate >= 80 ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}>
                {stats.executionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">学期：</span>
        <div className="flex flex-wrap gap-2">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedSemester === sem
                  ? "bg-primary-800 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {sem}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <Card.Title>预算执行对比</Card.Title>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
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
                    <Bar dataKey="计划预算" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="实际支出" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">暂无预算数据</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <Card.Title>总体执行进度</Card.Title>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    总预算执行率
                  </span>
                  <Badge
                    variant={
                      getExecutionStatus(
                        stats.totalPlanned,
                        stats.totalActual
                      ).variant
                    }
                  >
                    {getExecutionStatus(stats.totalPlanned, stats.totalActual).label}
                  </Badge>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                      stats.totalPlanned,
                      stats.totalActual
                    )}`}
                    style={{
                      width: `${Math.min(stats.executionRate, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatCurrency(stats.totalActual)}</span>
                  <span>{formatCurrency(stats.totalPlanned)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {filteredBudgetItems.map((item) => {
                  const rate =
                    item.plannedAmount > 0
                      ? (item.actualAmount / item.plannedAmount) * 100
                      : 0;
                  return (
                    <div key={item.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item.categoryLabel}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                            item.plannedAmount,
                            item.actualAmount
                          )}`}
                          style={{
                            width: `${Math.min(rate, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {stats.remaining < 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    警告：当前预算已超支 {formatCurrency(Math.abs(stats.remaining))}，请注意控制支出。
                  </p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <Card.Title>预算项目明细</Card.Title>
          </div>
        </Card.Header>
        <Card.Body>
          {filteredBudgetItems.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无预算项目</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBudgetItems.map((item) => {
                const status = getExecutionStatus(
                  item.plannedAmount,
                  item.actualAmount
                );
                const progress =
                  item.plannedAmount > 0
                    ? (item.actualAmount / item.plannedAmount) * 100
                    : 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.categoryLabel}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          计划预算
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.plannedAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          实际支出
                        </p>
                        <p className="font-medium text-amber-600 dark:text-amber-400">
                          {formatCurrency(item.actualAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          剩余
                        </p>
                        <p
                          className={`font-medium ${
                            item.plannedAmount - item.actualAmount >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(item.plannedAmount - item.actualAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>执行进度</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                            item.plannedAmount,
                            item.actualAmount
                          )}`}
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowDeleteConfirm(item.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "编辑预算项" : "新增预算项"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                预算分类 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {budgetCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                学期
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：2024-2025学年第二学期"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                计划预算 (元) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.plannedAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plannedAmount: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入计划预算金额"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                实际支出 (元)
              </label>
              <input
                type="number"
                value={formData.actualAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    actualAmount: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入实际支出金额"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              预算说明 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="请输入预算项目说明"
            />
          </div>

          {formData.plannedAmount > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                预算预览
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  执行进度
                </span>
                <span
                  className={
                    formData.actualAmount / formData.plannedAmount >= 1
                      ? "text-red-600 dark:text-red-400"
                      : "text-primary-600 dark:text-primary-400"
                  }
                >
                  {(
                    (formData.actualAmount / formData.plannedAmount) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    formData.actualAmount / formData.plannedAmount >= 1
                      ? "bg-red-500"
                      : "bg-primary-600"
                  }`}
                  style={{
                    width: `${Math.min(
                      (formData.actualAmount / formData.plannedAmount) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={formData.plannedAmount <= 0 || !formData.description.trim()}
          >
            {editingItem ? "保存修改" : "创建预算项"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-300">
          确定要删除这个预算项目吗？此操作不可撤销。
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(null)}
          >
            取消
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              showDeleteConfirm && handleDelete(showDeleteConfirm)
            }
          >
            确认删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}
