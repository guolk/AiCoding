import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Calendar, MapPin, Clock, Wallet, Users, Building2, CheckSquare,
  TrendingUp, CreditCard, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDate, getDaysRemaining, getBudgetProgress } from '@/utils/formatters';

export default function Dashboard() {
  const {
    getCurrentEvent, budgetCategories, expenses, guests,
    contracts, vendors, payments, todos, toggleTodo
  } = useAppStore();

  const event = getCurrentEvent();

  const stats = useMemo(() => {
    if (!event) return null;
    const totalBudget = event.totalBudget;
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const budgetProgress = getBudgetProgress(totalBudget, totalSpent);
    const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed').length;
    const totalGuests = guests.length;
    const confirmationRate = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;
    const signedVendors = contracts.filter(c => c.status === 'signed').length;
    const pendingTodos = todos.filter(t => !t.completed).length;
    return { totalBudget, totalSpent, budgetProgress, confirmedGuests, totalGuests, confirmationRate, signedVendors, pendingTodos };
  }, [event, expenses, guests, contracts, todos]);

  const budgetChartData = useMemo(() => 
    budgetCategories.map(cat => ({
      name: cat.name,
      预算: cat.budgeted,
      已支出: expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
    })), [budgetCategories, expenses]);

  const upcomingPayments = useMemo(() => 
    payments.filter(p => p.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5), [payments]);

  const pendingTodos = useMemo(() => 
    todos.filter(t => !t.completed).slice(0, 5), [todos]);

  const rsvpData = useMemo(() => {
    const counts: Record<string, number> = { confirmed: 0, pending: 0, declined: 0, maybe: 0 };
    guests.forEach(g => counts[g.rsvpStatus] = (counts[g.rsvpStatus] || 0) + 1);
    return [
      { name: '已确认', value: counts.confirmed, color: '#721F2C' },
      { name: '待确认', value: counts.pending, color: '#B8962E' },
      { name: '婉拒', value: counts.declined, color: '#A8644E' },
      { name: '可能出席', value: counts.maybe, color: '#D99B87' }
    ].filter(i => i.value > 0);
  }, [guests]);

  if (!event || !stats) return null;

  const daysRemaining = getDaysRemaining(event.date);

  const renderProgressRing = (progress: number, size = 80, sw = 8) => {
    const r = (size - sw) / 2;
    const c = r * 2 * Math.PI;
    const off = c - (progress / 100) * c;
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E6E1DB" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={progress > 100 ? '#C9727F' : '#D99B87'}
          strokeWidth={sw} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          className="transition-all duration-700" />
      </svg>
    );
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="bg-gradient-rose rounded-2xl p-6 mb-6 animate-slide-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-accent-400 mb-2">欢迎回来，{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-warmGray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur px-5 py-3 rounded-xl shadow-sm">
            <Clock className="w-6 h-6 text-accent-500 animate-bounce-soft" />
            <div>
              <div className="text-2xl font-bold text-accent-500">{daysRemaining}</div>
              <div className="text-sm text-warmGray-500">距离活动还有</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-warmGray-500 text-sm mb-1">
                <Wallet className="w-4 h-4" />
                <span>预算使用</span>
              </div>
              <div className="text-2xl font-bold text-warmGray-800">{formatCurrency(stats.totalSpent)}</div>
              <div className="text-sm text-warmGray-500">/ {formatCurrency(stats.totalBudget)}</div>
            </div>
            <div className="relative">
              {renderProgressRing(stats.budgetProgress)}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-accent-500">{stats.budgetProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <div className="text-sm text-warmGray-500 mb-1">宾客总数</div>
              <div className="text-2xl font-bold text-warmGray-800">{stats.totalGuests}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600">{stats.confirmationRate}% 已确认</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-champagne-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-champagne-500" />
            </div>
            <div>
              <div className="text-sm text-warmGray-500 mb-1">已签约供应商</div>
              <div className="text-2xl font-bold text-warmGray-800">{stats.signedVendors}</div>
              <div className="text-sm text-warmGray-500">共 {vendors.length} 家</div>
            </div>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <div className="text-sm text-warmGray-500 mb-1">待办事项</div>
              <div className="text-2xl font-bold text-warmGray-800">{stats.pendingTodos}</div>
              <div className="text-sm text-warmGray-500">共 {todos.length} 项</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-lg font-semibold text-accent-500 mb-4">预算使用概览</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E1DB" />
                <XAxis dataKey="name" tick={{ fill: '#7A6E60', fontSize: 12 }} />
                <YAxis tick={{ fill: '#7A6E60', fontSize: 12 }} tickFormatter={(v) => `¥${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="预算" fill="#D99B87" radius={[4, 4, 0, 0]} />
                <Bar dataKey="已支出" fill="#8B2635" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-lg font-semibold text-accent-500 mb-4">宾客RSVP统计</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rsvpData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={5} dataKey="value">
                  {rsvpData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 card animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-accent-500">即将到期的付款计划</h3>
            <div className="text-sm text-primary-500 flex items-center gap-1 cursor-pointer hover:text-primary-600">
              <span>查看全部</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">供应商</th>
                  <th className="table-header">里程碑</th>
                  <th className="table-header">金额</th>
                  <th className="table-header">到期日</th>
                  <th className="table-header">状态</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPayments.map(p => {
                  const v = vendors.find(v => v.id === p.vendorId);
                  return (
                    <tr key={p.id} className="border-t border-warmGray-100 hover:bg-warmGray-50">
                      <td className="table-cell font-medium">{v?.name || '-'}</td>
                      <td className="table-cell">{p.milestone}</td>
                      <td className="table-cell text-accent-500 font-semibold">{formatCurrency(p.amount)}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-champagne-500" />
                          {formatDate(p.dueDate)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge bg-yellow-100 text-yellow-700">待支付</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-accent-500">待办事项</h3>
            <div className="text-sm text-primary-500 flex items-center gap-1 cursor-pointer hover:text-primary-600">
              <span>全部</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-3">
            {pendingTodos.map(todo => (
              <div key={todo.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-warmGray-50 hover:bg-primary-50 transition-colors cursor-pointer group"
                onClick={() => toggleTodo(todo.id)}>
                <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-primary-300 flex items-center justify-center group-hover:border-primary-500 transition-colors">
                  <CheckSquare className="w-3 h-3 text-primary-500 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-warmGray-800 truncate">{todo.title}</div>
                  <div className="text-xs text-warmGray-500">{formatDate(todo.dueDate)}</div>
                </div>
                <span className="badge bg-primary-100 text-primary-600 text-xs">{todo.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
