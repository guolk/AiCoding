import { Link } from "react-router-dom";
import {
  Wallet,
  Award,
  TrendingUp,
  Receipt,
  GraduationCap,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  Plus,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import {
  SCHOLARSHIP_STATUS_LABELS,
  SCHOLARSHIP_STATUS_COLORS,
  EXPENSE_CATEGORY_LABELS,
} from "@/types";
import { formatCurrency } from "@/utils/format";

const COLORS = ["#1e3a8a", "#d97706", "#059669", "#e11d48", "#64748b", "#8b5cf6"];

const convertToCNY = (amount: number, currency: string) => {
  switch (currency) {
    case "USD": return amount * 7.2;
    case "GBP": return amount * 9.2;
    case "SGD": return amount * 5.3;
    case "CHF": return amount * 8.3;
    case "EUR": return amount * 7.8;
    default: return amount;
  }
};

export default function FinanceOverview() {
  const { scholarships, expenses } = useFinanceStore();
  const { universities } = useApplicationStore();

  const getUniversityName = (id: string) => {
    return universities.find((u) => u.id === id)?.name || "未知院校";
  };

  // 奖学金统计
  const totalScholarshipsCNY = scholarships.reduce(
    (sum, s) => sum + convertToCNY(s.amount, s.currency), 0
  );
  const awardedCNY = scholarships
    .filter((s) => s.status === "awarded")
    .reduce((sum, s) => sum + convertToCNY(s.amount, s.currency), 0);
  const appliedScholarships = scholarships.filter(
    (s) => s.status === "applied" || s.status === "interview"
  ).length;

  // 支出统计
  const totalExpensesCNY = expenses.reduce(
    (sum, e) => sum + convertToCNY(e.amount, e.currency), 0
  );

  // 学费预算总和
  const totalTuitionBudget = universities.reduce(
    (sum, u) => sum + convertToCNY(u.tuition.tuitionPerYear * 2, u.tuition.currency), 0
  );
  const totalLivingBudget = universities.reduce(
    (sum, u) => sum + convertToCNY(u.tuition.livingCost * 2, u.tuition.currency), 0
  );
  const totalBudget = totalTuitionBudget + totalLivingBudget;

  // 学费对比图数据
  const tuitionCompareData = universities.slice(0, 6).map((u) => ({
    name: u.name.length > 4 ? u.name.substring(0, 4) + "..." : u.name,
    学费: Math.round(convertToCNY(u.tuition.tuitionPerYear, u.tuition.currency) / 10000),
    生活费: Math.round(convertToCNY(u.tuition.livingCost, u.tuition.currency) / 10000),
  }));

  // 支出分类饼图
  const expenseByCategory = Object.entries(
    expenses.reduce((acc, e) => {
      const amount = convertToCNY(e.amount, e.currency);
      acc[e.category] = (acc[e.category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([key, value]) => ({
    name: EXPENSE_CATEGORY_LABELS[key as keyof typeof EXPENSE_CATEGORY_LABELS] || key,
    value: Math.round(value),
  }));

  // 奖学金状态分布
  const scholarshipByStatus = Object.entries(
    scholarships.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([key, value]) => ({
    name: SCHOLARSHIP_STATUS_LABELS[key as keyof typeof SCHOLARSHIP_STATUS_LABELS] || key,
    value,
  }));

  // 预算 vs 实际
  const netValue = awardedCNY + totalBudget - totalExpensesCNY;

  // 各院校预算详情
  const universityBudgets = universities.map((u) => {
    const tuition = convertToCNY(u.tuition.tuitionPerYear * 2, u.tuition.currency);
    const living = convertToCNY(u.tuition.livingCost * 2, u.tuition.currency);
    const scholarshipsForUni = scholarships
      .filter((s) => s.universityId === u.id)
      .reduce((sum, s) => sum + convertToCNY(s.amount, s.currency), 0);
    const expensesForUni = expenses
      .filter((e) => e.universityId === u.id)
      .reduce((sum, e) => sum + convertToCNY(e.amount, e.currency), 0);
    return {
      id: u.id,
      name: u.name,
      logo: u.logoUrl,
      tuition,
      living,
      total: tuition + living,
      scholarships: scholarshipsForUni,
      expenses: expensesForUni,
      net: tuition + living - scholarshipsForUni + expensesForUni,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">财务规划</h1>
          <p className="mt-1 text-slate-500">预算估算、奖学金追踪、费用支出，一站式财务管理</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/finance/scholarships" className="btn-secondary">
            <Award className="w-4 h-4" /> 奖学金管理
          </Link>
          <Link to="/finance/expenses" className="btn-primary">
            <Plus className="w-4 h-4" /> 记录支出
          </Link>
        </div>
      </div>

      {/* 主要统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 总预算 */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary text-white p-6">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-6 bottom-6 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <PiggyBank className="w-4 h-4" /> 留学总预算
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(totalBudget, "CNY")}</div>
            <div className="text-xs text-white/70">
              学费 {formatCurrency(totalTuitionBudget, "CNY")} + 生活费 {formatCurrency(totalLivingBudget, "CNY")}
            </div>
            <div className="text-xs text-white/60 mt-1">
              按 {universities.length} 所院校、学制2年估算
            </div>
          </div>
        </div>

        {/* 已获/待评奖学金 */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4">
            <div className="w-12 h-12 rounded-2xl bg-success-50 flex items-center justify-center">
              <Award className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="text-sm text-slate-500 mb-1">已获得奖学金</div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {formatCurrency(awardedCNY, "CNY")}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500">申请中</span>
              <span className="text-sm font-semibold text-accent-600 ml-2">{appliedScholarships} 项</span>
            </div>
            <Link to="/finance/scholarships" className="text-xs text-primary-700 hover:underline flex items-center">
              详情 <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* 已支出 */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4">
            <div className="w-12 h-12 rounded-2xl bg-danger-50 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-danger-600" />
            </div>
          </div>
          <div className="text-sm text-slate-500 mb-1">累计已支出</div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {formatCurrency(totalExpensesCNY, "CNY")}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500">共</span>
              <span className="text-sm font-semibold text-slate-700 ml-2">{expenses.length} 笔</span>
            </div>
            <Link to="/finance/expenses" className="text-xs text-primary-700 hover:underline flex items-center">
              查看 <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* 预计净投入 */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-sm text-slate-500 mb-1">预计净投入</div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {formatCurrency(netValue, "CNY")}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              预算总额 - 奖学金 + 已支出
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 各院校年度费用对比 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif font-semibold text-lg text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-700" />
              各院校年度费用对比 (万元/年)
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tuitionCompareData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} 万元`, ""]}
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                />
                <Legend />
                <Bar dataKey="学费" stackId="a" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="生活费" stackId="a" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* 支出分类饼图 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-lg text-slate-800 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-primary-700" />
                支出分类占比
              </h3>
            </div>
            <div className="h-48">
              {expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
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
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  暂无支出记录
                </div>
              )}
            </div>
          </div>

          {/* 奖学金状态分布 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-lg text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-700" />
                奖学金申请状态
              </h3>
            </div>
            <div className="h-48">
              {scholarshipByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scholarshipByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {scholarshipByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  暂无奖学金记录
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 各院校预算详情表 */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-serif font-semibold text-lg text-slate-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-700" />
            各院校预算明细（2年制）
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">院校</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">学费</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">生活费</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">总预算</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">奖学金</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">已支出</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">预计净投入</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {universityBudgets.map((ub, idx) => (
                <tr key={ub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={ub.logo} alt="" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="font-medium text-slate-800">{ub.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 tabular-nums">
                    {formatCurrency(ub.tuition, "CNY")}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 tabular-nums">
                    {formatCurrency(ub.living, "CNY")}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(ub.total, "CNY")}
                  </td>
                  <td className="px-6 py-4 text-right text-success-600 font-medium tabular-nums">
                    {ub.scholarships > 0 ? `-${formatCurrency(ub.scholarships, "CNY")}` : "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-danger-600 tabular-nums">
                    {ub.expenses > 0 ? `+${formatCurrency(ub.expenses, "CNY")}` : "-"}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-primary-700 tabular-nums bg-primary-50/30">
                    {formatCurrency(ub.net, "CNY")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
