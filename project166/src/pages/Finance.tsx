import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { CURRENCIES } from '@/data/currencies';
import { getCityById, CITIES } from '@/data/cities';
import type { FinanceTx, Currency, TxType } from '@/types';
import { formatDate, todayISO } from '@/utils/date';
import { formatCurrency, formatUSD, convertToUSD } from '@/utils/currency';
import {
  Wallet,
  BarChart3,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Trash2,
  DollarSign,
  TrendingDown,
  Minus,
  PieChart,
  Receipt,
  Globe,
  PiggyBank,
  X,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const TABS = [
  { id: 'transactions', label: '交易流水', icon: Receipt },
  { id: 'exchange', label: '汇率看板', icon: Globe },
  { id: 'analysis', label: '月度分析', icon: BarChart3 },
] as const;

type TabId = typeof TABS[number]['id'];

const RATE_CHANGES: Record<string, { change: number; direction: 'up' | 'down' | 'flat' }> = {
  EUR: { change: 0.02, direction: 'up' },
  GBP: { change: 0.01, direction: 'up' },
  CNY: { change: 0.001, direction: 'down' },
  JPY: { change: 0.0001, direction: 'down' },
  THB: { change: 0.0005, direction: 'up' },
  IDR: { change: 0.000001, direction: 'flat' },
  VND: { change: 0.0000005, direction: 'down' },
  MYR: { change: 0.002, direction: 'up' },
  SGD: { change: 0.005, direction: 'up' },
  KRW: { change: 0.00002, direction: 'down' },
  TWD: { change: 0.0003, direction: 'flat' },
  MXN: { change: 0.001, direction: 'up' },
  BRL: { change: 0.003, direction: 'down' },
  ARS: { change: 0.00005, direction: 'down' },
  COP: { change: 0.00001, direction: 'up' },
  ZAR: { change: 0.001, direction: 'down' },
  TRY: { change: 0.0008, direction: 'down' },
  AED: { change: 0, direction: 'flat' },
  GEL: { change: 0.002, direction: 'up' },
};

const PIE_COLORS = [
  '#0d9488', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#84cc16', '#6366f1', '#14b8a6', '#f97316',
];

const EXPENSE_CATEGORIES = ['住宿', '餐饮', '交通', '工作空间', '娱乐', '订阅', '购物', '医疗', '其他'];
const INCOME_CATEGORIES = ['薪资', '自由职业', '投资', '其他'];

export default function Finance() {
  const [activeTab, setActiveTab] = useState<TabId>('transactions');
  const [showTxModal, setShowTxModal] = useState(false);
  const {
    transactions,
    getTotalIncomeUSD,
    getTotalExpenseUSD,
    getBalanceUSD,
    addTransaction,
    removeTransaction,
  } = useFinanceStore();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">财务管理</h1>
          <p className="mt-2 text-slate-500">追踪全球收入支出、汇率和预算分析</p>
        </div>

        <div className="mb-6 flex gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[600px]">
          {activeTab === 'transactions' && (
            <TransactionsTab
              transactions={transactions}
              totalIncome={getTotalIncomeUSD()}
              totalExpense={getTotalExpenseUSD()}
              balance={getBalanceUSD()}
              onAdd={() => setShowTxModal(true)}
              onRemove={removeTransaction}
            />
          )}
          {activeTab === 'exchange' && <ExchangeRateTab />}
          {activeTab === 'analysis' && <AnalysisTab transactions={transactions} />}
        </div>

        {showTxModal && (
          <AddTxModal
            onClose={() => setShowTxModal(false)}
            onSubmit={(tx) => {
              addTransaction(tx);
              setShowTxModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function TransactionsTab({
  transactions,
  totalIncome,
  totalExpense,
  balance,
  onAdd,
  onRemove,
}: {
  transactions: FinanceTx[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={ArrowUpCircle}
          label="总收入"
          value={formatUSD(totalIncome)}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          valueColor="text-green-700"
        />
        <SummaryCard
          icon={ArrowDownCircle}
          label="总支出"
          value={formatUSD(totalExpense)}
          iconColor="text-red-600"
          bgColor="bg-red-50"
          valueColor="text-red-700"
        />
        <SummaryCard
          icon={Wallet}
          label="净结余"
          value={formatUSD(balance)}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          valueColor="text-blue-700"
        />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          交易记录 <span className="ml-2 text-sm font-normal text-slate-400">({transactions.length})</span>
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <Plus size={16} />
          添加交易
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-slate-200">
          <Receipt size={48} className="mb-4 text-slate-300" />
          <p className="text-slate-500">暂无交易记录</p>
          <p className="mt-1 text-sm text-slate-400">点击右上角添加你的第一笔交易</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} onRemove={() => onRemove(tx.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconColor,
  bgColor,
  valueColor,
}: {
  icon: typeof ArrowUpCircle;
  label: string;
  value: string;
  iconColor: string;
  bgColor: string;
  valueColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className={`mt-0.5 text-xl font-bold ${valueColor}`}>{value}</div>
        <div className="text-xs text-slate-400">美元 USD</div>
      </div>
    </div>
  );
}

function TransactionItem({
  tx,
  onRemove,
}: {
  tx: FinanceTx;
  onRemove: () => void;
}) {
  const isIncome = tx.type === 'income';
  const city = tx.cityId ? getCityById(tx.cityId) : undefined;
  const currency = CURRENCIES.find((c) => c.code === tx.currency);

  return (
    <div className="group flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
          isIncome ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        {isIncome ? (
          <TrendingUp size={20} className="text-green-600" />
        ) : (
          <TrendingDown size={20} className="text-red-600" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
              isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {isIncome ? '↑ 收入' : '↓ 支出'}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {tx.category}
          </span>
          {city && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <span>{city.flag}</span>
              <span>{city.name}</span>
            </span>
          )}
        </div>
        {tx.notes && (
          <p className="mt-1 truncate text-sm text-slate-500">{tx.notes}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <div
          className={`text-base font-bold ${
            isIncome ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(tx.amount, tx.currency)}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          {currency?.flag} {currency?.code}
        </div>
      </div>

      <div className="hidden w-24 flex-shrink-0 text-right text-sm text-slate-500 sm:block">
        {formatDate(tx.date)}
      </div>

      <button
        onClick={onRemove}
        className="rounded-md p-2 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function ExchangeRateTab() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">汇率看板</h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <DollarSign size={16} />
          <span>基准货币：美元 USD</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {CURRENCIES.filter((c) => c.code !== 'USD').map((currency) => (
          <ExchangeRateCard key={currency.code} currency={currency} />
        ))}
      </div>
    </div>
  );
}

function ExchangeRateCard({ currency }: { currency: Currency }) {
  const rateInfo = RATE_CHANGES[currency.code] || {
    change: 0,
    direction: 'flat' as const,
  };

  return (
    <div className="group overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl leading-none">{currency.flag}</div>
          <div>
            <div className="font-bold text-slate-900">{currency.name}</div>
            <div className="text-xs text-slate-500">{currency.code}</div>
          </div>
        </div>
        <RateIndicator direction={rateInfo.direction} change={rateInfo.change} />
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-slate-400">1 USD =</span>
        </div>
        <div className="mt-0.5 text-2xl font-bold text-slate-900">
          {currency.usdRate >= 1
            ? currency.usdRate.toFixed(2)
            : currency.usdRate.toFixed(4)}
          <span className="ml-1.5 text-sm font-normal text-slate-500">
            {currency.symbol}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>符号 {currency.symbol}</span>
        <span>
          1 {currency.code} ={' '}
          {formatUSD(1 / currency.usdRate)}
        </span>
      </div>
    </div>
  );
}

function RateIndicator({
  direction,
  change,
}: {
  direction: 'up' | 'down' | 'flat';
  change: number;
}) {
  if (direction === 'up') {
    return (
      <div className="flex items-center gap-0.5 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
        <TrendingUp size={12} />
        +{change < 0.01 ? change.toFixed(4) : change.toFixed(2)}
      </div>
    );
  }
  if (direction === 'down') {
    return (
      <div className="flex items-center gap-0.5 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
        <TrendingDown size={12} />
        -{change < 0.01 ? change.toFixed(4) : change.toFixed(2)}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
      <Minus size={12} />
      持平
    </div>
  );
}

function AnalysisTab({ transactions }: { transactions: FinanceTx[] }) {
  const pieData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const usdAmount = convertToUSD(t.amount, t.currency);
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + usdAmount);
      });
    return Array.from(categoryMap.entries())
      .map(([name, value], idx) => ({
        name,
        value: Number(value.toFixed(2)),
        fill: PIE_COLORS[idx % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const barData = useMemo(() => {
    const months: { month: string; label: string; income: number; expense: number }[] = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(today, i);
      const yearMonth = format(date, 'yyyy-MM');
      const label = format(date, 'MM月', { locale: zhCN });

      const monthTxs = transactions.filter((t) => t.date.startsWith(yearMonth));
      const income = monthTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
      const expense = monthTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);

      months.push({
        month: yearMonth,
        label,
        income: Number(income.toFixed(2)),
        expense: Number(expense.toFixed(2)),
      });
    }
    return months;
  }, [transactions]);

  const totalPieValue = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart size={20} className="text-teal-600" />
            <h3 className="text-lg font-semibold text-slate-800">支出分类占比</h3>
          </div>
          <div className="text-sm text-slate-500">
            总支出:{' '}
            <span className="font-semibold text-red-600">{formatUSD(totalPieValue)}</span>
          </div>
        </div>

        {pieData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PiggyBank size={48} className="mb-3 text-slate-300" />
            <p className="text-slate-500">暂无支出数据</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
            <div className="h-72 w-full lg:h-80 lg:w-80 lg:flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatUSD(value)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full flex-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                {pieData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm text-slate-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatUSD(item.value)}
                      </span>
                      <span className="w-12 text-right text-xs text-slate-400">
                        {((item.value / totalPieValue) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-800">近6个月收支对比</h3>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value: number) => formatUSD(value)}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar
                dataKey="income"
                name="收入"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expense"
                name="支出"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AddTxModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (tx: Omit<FinanceTx, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    type: 'expense' as TxType,
    amount: '',
    currency: 'USD',
    category: EXPENSE_CATEGORIES[0],
    date: todayISO(),
    cityId: '',
    notes: '',
  });

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    onSubmit({
      type: form.type,
      amount,
      currency: form.currency,
      category: form.category,
      date: form.date,
      cityId: form.cityId || undefined,
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">添加交易</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">交易类型</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'income', category: INCOME_CATEGORIES[0] })}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  form.type === 'income'
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp size={16} />
                收入
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'expense', category: EXPENSE_CATEGORIES[0] })}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  form.type === 'expense'
                    ? 'bg-red-100 text-red-700 ring-2 ring-red-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingDown size={16} />
                支出
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">金额</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">货币</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">分类</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">关联城市 (可选)</label>
            <select
              value={form.cityId}
              onChange={(e) => setForm({ ...form, cityId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="">不关联</option>
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">备注</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="添加备注..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              添加交易
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
