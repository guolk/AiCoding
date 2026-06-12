import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Receipt,
  DollarSign,
  Edit3,
  Trash2,
  GraduationCap,
  Download,
  PieChart as PieIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import { EXPENSE_CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";

const categoryFilters = [
  { value: "all", label: "全部类型" },
  { value: "application_fee", label: "申请费" },
  { value: "visa_fee", label: "签证费" },
  { value: "material_fee", label: "材料费" },
  { value: "test_fee", label: "考试费" },
  { value: "travel_fee", label: "交通费" },
  { value: "other", label: "其他费用" },
];

const categoryIcons: Record<string, string> = {
  application_fee: "🎓",
  visa_fee: "🛂",
  material_fee: "📄",
  test_fee: "📝",
  travel_fee: "✈️",
  other: "💳",
};

const COLORS = ["#1e3a8a", "#d97706", "#059669", "#e11d48", "#64748b", "#8b5cf6"];

const convert = (amount: number, currency: string) => {
  switch (currency) {
    case "USD": return amount * 7.2;
    case "GBP": return amount * 9.2;
    case "SGD": return amount * 5.3;
    default: return amount;
  }
};

export default function ExpenseList() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useFinanceStore();
  const { universities } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // 新增表单状态
  const [formData, setFormData] = useState({
    category: "application_fee" as any,
    amount: "",
    currency: "CNY",
    date: new Date().toISOString().split("T")[0],
    description: "",
    universityId: "",
  });

  const getUniversityName = (id?: string) => {
    if (!id) return "通用支出";
    return universities.find((u) => u.id === id)?.name || "未知院校";
  };
  const getUniversityLogo = (id?: string) => {
    if (!id) return null;
    return universities.find((u) => u.id === id)?.logoUrl;
  };

  const filtered = expenses
    .filter((e) => {
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          e.description.toLowerCase().includes(q) ||
          EXPENSE_CATEGORY_LABELS[e.category].toLowerCase().includes(q) ||
          getUniversityName(e.universityId).toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 统计
  const totalCNY = filtered.reduce((sum, e) => sum + convert(e.amount, e.currency), 0);
  const allTotalCNY = expenses.reduce((sum, e) => sum + convert(e.amount, e.currency), 0);

  // 饼图
  const expenseByCategory = Object.entries(
    filtered.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + convert(e.amount, e.currency);
      return acc;
    }, {} as Record<string, number>)
  ).map(([k, v]) => ({
    name: EXPENSE_CATEGORY_LABELS[k as keyof typeof EXPENSE_CATEGORY_LABELS],
    value: Math.round(v),
  }));

  // 月度汇总（最近6个月）
  const now = new Date();
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`);
  }
  const monthlyData = monthLabels.map((m) => {
    const monthTotal = filtered
      .filter((e) => e.date.startsWith(m))
      .reduce((sum, e) => sum + convert(e.amount, e.currency), 0);
    return {
      month: m.substring(5) + "月",
      支出: Math.round(monthTotal),
    };
  });

  const handleSubmit = () => {
    if (!formData.amount) {
      alert("请输入金额");
      return;
    }
    addExpense({
      category: formData.category,
      amount: Number(formData.amount),
      currency: formData.currency,
      date: formData.date,
      description: formData.description || EXPENSE_CATEGORY_LABELS[formData.category],
      universityId: formData.universityId || undefined,
    });
    setFormData({
      category: "application_fee",
      amount: "",
      currency: "CNY",
      date: new Date().toISOString().split("T")[0],
      description: "",
      universityId: "",
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 返回 */}
      <Link
        to="/finance"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回财务总览
      </Link>

      {/* 顶部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <Receipt className="w-7 h-7 text-primary-700" />
            费用支出记录
          </h1>
          <p className="mt-1 text-slate-500">申请费、签证费、考试费等各类支出记录</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4" /> 导出记录
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> 新增支出
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-500 mb-1">支出笔数</div>
          <div className="text-3xl font-bold text-slate-900">{filtered.length} <span className="text-base text-slate-500 font-normal">笔</span></div>
          <div className="text-xs text-slate-400 mt-1">共 {expenses.length} 笔记录</div>
        </div>
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4">
            <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-500 mb-1">筛选结果总金额</div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalCNY, "CNY")}</div>
          <div className="text-xs text-slate-400 mt-1">全部: {formatCurrency(allTotalCNY, "CNY")}</div>
        </div>
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <PieIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-500 mb-1">平均每笔支出</div>
          <div className="text-3xl font-bold text-slate-900">
            {filtered.length > 0 ? formatCurrency(Math.round(totalCNY / filtered.length), "CNY") : "-"}
          </div>
          <div className="text-xs text-slate-400 mt-1">共 {expenseByCategory.length} 个类别</div>
        </div>
      </div>

      {/* 筛选 + 图表  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 筛选 */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索描述、院校..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select min-w-[160px]"
              >
                {categoryFilters.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 分类饼图  */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm">分类占比</h3>
          <div className="h-40">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v, "CNY")}
                    contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">暂无数据</div>
            )}
          </div>
          <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={8} />
        </div>
      </div>

      {/* 月度趋势  */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-700 mb-4">月度支出趋势 (元)</h3>
        <div className="flex items-end gap-4 h-32 px-2">
          {monthlyData.map((m, i) => {
            const maxVal = Math.max(...monthlyData.map((d) => d["支出"]), 1);
            const height = (m["支出"] / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative flex items-end justify-center h-full">
                  <div
                    className="w-full max-w-16 rounded-t-lg bg-gradient-to-t from-primary-700 to-primary-500 transition-all duration-500 group-hover:from-primary-800 group-hover:to-primary-600 relative"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatCurrency(m["支出"], "CNY")}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 支出列表  */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">日期</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">类别</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">描述</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">关联院校</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">金额</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">人民币 (≈)</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 w-20">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((exp, idx) => (
                <tr key={exp.id} style={{ animationDelay: `${idx * 30}ms` }} className="hover:bg-slate-50/60 transition-colors animate-fade-in">
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 tabular-nums">{formatDate(exp.date)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm">
                      {categoryIcons[exp.category] || "💰"} {EXPENSE_CATEGORY_LABELS[exp.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                    {exp.description}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {exp.universityId && getUniversityLogo(exp.universityId) && (
                        <img src={getUniversityLogo(exp.universityId)} alt="" className="w-5 h-5 object-contain bg-slate-50 rounded p-0.5" />
                      )}
                      <span className="text-sm text-slate-600">{getUniversityName(exp.universityId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-800 tabular-nums">
                    {formatCurrency(exp.amount, exp.currency)}
                  </td>
                  <td className="px-6 py-4 text-right text-primary-700 font-medium tabular-nums bg-primary-50/20">
                    {formatCurrency(convert(exp.amount, exp.currency), "CNY")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("确定删除该支出记录？")) deleteExpense(exp.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-16 text-center">
            <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 mb-5">暂无支出记录</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> 添加第一笔支出
            </button>
          </div>
        )}
      </div>

      {/* 新增弹窗  */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-5">新增支出记录</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">支出类别</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="select w-full"
                >
                  {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{categoryIcons[k]} {v}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">金额</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">币种</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="select w-full"
                  >
                    <option value="CNY">CNY 人民币</option>
                    <option value="USD">USD 美元</option>
                    <option value="GBP">GBP 英镑</option>
                    <option value="SGD">SGD 新币</option>
                    <option value="CHF">CHF 瑞郎</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">日期</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">关联院校（可选）</label>
                <select
                  value={formData.universityId}
                  onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                  className="select w-full"
                >
                  <option value="">不关联（通用支出）</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">备注说明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="支出详情描述..."
                  className="input resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                <Plus className="w-4 h-4" /> 添加记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
