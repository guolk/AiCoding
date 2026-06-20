import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  Calendar,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
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
import type { FinanceRecord, FinanceType } from "@/types";

const typeFilters: { value: FinanceType | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "income", label: "收入" },
  { value: "expense", label: "支出" },
];

const incomeCategories = [
  { value: "membership_fee", label: "会费收入" },
  { value: "school_grant", label: "学校拨款" },
  { value: "sponsorship", label: "企业赞助" },
];

const expenseCategories = [
  { value: "activity", label: "活动支出" },
  { value: "office", label: "办公采购" },
  { value: "other", label: "其他" },
];

const initialFormData: Omit<FinanceRecord, "id" | "createdAt" | "categoryLabel"> = {
  type: "income",
  category: "membership_fee",
  amount: 0,
  date: "",
  description: "",
};

export default function FinanceRecords() {
  const { financeRecords, addFinanceRecord, updateFinanceRecord, deleteFinanceRecord } =
    useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<FinanceType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    financeRecords.forEach((r) => categories.add(r.category));
    return Array.from(categories);
  }, [financeRecords]);

  const currentCategories = formData.type === "income" ? incomeCategories : expenseCategories;

  const filteredRecords = useMemo(() => {
    return financeRecords.filter((record) => {
      const matchesSearch =
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.relatedActivityName &&
          record.relatedActivityName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === "all" || record.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || record.category === categoryFilter;
      const matchesStartDate = !startDate || record.date >= startDate;
      const matchesEndDate = !endDate || record.date <= endDate;
      return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
    });
  }, [financeRecords, searchTerm, typeFilter, categoryFilter, startDate, endDate]);

  const stats = useMemo(() => {
    const totalIncome = financeRecords
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = financeRecords
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
    const balance = totalIncome - totalExpense;
    const count = financeRecords.length;
    return { totalIncome, totalExpense, balance, count };
  }, [financeRecords]);

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (record: FinanceRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      category: record.category,
      amount: record.amount,
      date: record.date,
      description: record.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteFinanceRecord(id);
    setShowDeleteConfirm(null);
  };

  const handleSubmit = () => {
    if (!formData.date || formData.amount <= 0 || !formData.description.trim()) return;

    const categoryLabel = getCategoryLabel(formData.category);

    if (editingRecord) {
      updateFinanceRecord(editingRecord.id, {
        ...formData,
        categoryLabel,
      });
    } else {
      const newRecord: FinanceRecord = {
        ...formData,
        id: generateId("fin"),
        categoryLabel,
        createdAt: new Date().toISOString().split("T")[0],
      };
      addFinanceRecord(newRecord);
    }
    setIsModalOpen(false);
  };

  const handleTypeChange = (type: FinanceType) => {
    setFormData({
      ...formData,
      type,
      category: type === "income" ? incomeCategories[0].value : expenseCategories[0].value,
    });
  };

  const getBadgeVariant = (type: FinanceType) => {
    return type === "income" ? "success" : "danger";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            收支记录
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理社团财务收支明细流水
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增记录
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">结余</p>
              <p className={`text-xl font-bold ${stats.balance >= 0 ? "text-primary-600 dark:text-primary-400" : "text-red-600 dark:text-red-400"}`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">记录数</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.count}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                筛选条件
              </span>
              {(searchTerm || typeFilter !== "all" || categoryFilter !== "all" || startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  清除筛选
                </Button>
              )}
            </div>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索描述、分类、活动..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTypeFilter(filter.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      typeFilter === filter.value
                        ? "bg-primary-800 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <span className="text-gray-400">至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:w-40"
              >
                <option value="all">全部分类</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无收支记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      日期
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      类型
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      分类
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      金额
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      描述
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      关联活动
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getBadgeVariant(record.type)}>
                          <div className="flex items-center gap-1">
                            {record.type === "income" ? (
                              <ArrowUpCircle className="w-3 h-3" />
                            ) : (
                              <ArrowDownCircle className="w-3 h-3" />
                            )}
                            {record.type === "income" ? "收入" : "支出"}
                          </div>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {record.categoryLabel}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            record.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {record.type === "income" ? "+" : "-"}
                          {formatCurrency(record.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {record.description}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {record.relatedActivityName || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setShowDeleteConfirm(record.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? "编辑记录" : "新增记录"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                收支类型 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTypeChange("income")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    formData.type === "income"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  收入
                </button>
                <button
                  onClick={() => handleTypeChange("expense")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    formData.type === "expense"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  支出
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                金额 (元) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入金额"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分类 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {currentCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="请输入收支描述"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.date || formData.amount <= 0 || !formData.description.trim()}
          >
            {editingRecord ? "保存修改" : "创建记录"}
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
          确定要删除这条收支记录吗？此操作不可撤销。
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
