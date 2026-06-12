import { useMemo } from 'react';
import {
  MapPin,
  Building2,
  IdCard,
  Wallet,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Activity,
  ArrowRightLeft,
  Receipt,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useTravelStore } from '@/store/travelStore';
import { useVisaStore } from '@/store/visaStore';
import { useFinanceStore } from '@/store/financeStore';
import { useCityStore } from '@/store/cityStore';
import { getCityById } from '@/data/cities';
import { formatDate, daysUntil } from '@/utils/date';
import { convertToUSD } from '@/utils/currency';
import { cn } from '@/lib/utils';

// StatCard component for displaying key metrics
function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-2">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className={cn('p-3 rounded-xl', gradient)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Get data from stores
  const { records, efficiencies, migrations } = useTravelStore();
  const { visas, borders, getExpiringVisas } = useVisaStore();
  const { transactions, getByMonth } = useFinanceStore();
  const { cities } = useCityStore();

  // Get current date for display
  const todayStr = useMemo(() => formatDate(new Date().toISOString().split('T')[0], 'yyyy年MM月dd日 EEEE'), []);

  // Calculate current location and days stayed
  const currentLocation = useMemo(() => {
    const activeRecord = records.find(r => {
      const now = new Date();
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      return now >= start && now <= end;
    });
    if (!activeRecord) return { city: null, days: 0 };
    const city = getCityById(activeRecord.cityId);
    const days = Math.floor((Date.now() - new Date(activeRecord.startDate).getTime()) / (1000 * 60 * 60 * 24));
    return { city, days };
  }, [records]);

  // Calculate total cities visited
  const totalCities = useMemo(() => {
    const uniqueCities = new Set(records.map(r => r.cityId));
    return uniqueCities.size;
  }, [records]);

  // Calculate active and expiring visas
  const visaStats = useMemo(() => {
    const now = Date.now();
    const active = visas.filter(v => new Date(v.expiryDate).getTime() > now).length;
    const expiring = getExpiringVisas(60).length;
    return { active, expiring };
  }, [visas, getExpiringVisas]);

  // Calculate monthly income and expenses
  const monthlyFinance = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTxs = getByMonth(currentMonth);
    const income = monthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const expense = monthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    return { income, expense };
  }, [getByMonth]);

  // Get expiring visa for warning banner
  const expiringVisa = useMemo(() => {
    return visas.find(v => {
      const days = daysUntil(v.expiryDate);
      return days > 0 && days <= 60;
    });
  }, [visas]);

  // Prepare efficiency data for line chart (last 10 weeks)
  const efficiencyData = useMemo(() => {
    return efficiencies.slice(-10).map(e => ({
      name: e.weekLabel,
      focusHours: e.focusHours,
    }));
  }, [efficiencies]);

  // Prepare top 5 cities data for bar chart
  const topCitiesData = useMemo(() => {
    return [...cities]
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        score: c.overallScore,
        flag: c.flag,
      }))
      .reverse();
  }, [cities]);

  // Prepare recent activities (combined borders and transactions)
  const recentActivities = useMemo(() => {
    const borderActivities = borders.map(b => ({
      id: `border-${b.id}`,
      type: 'border' as const,
      date: b.date,
      data: b,
    }));
    const txActivities = transactions.map(t => ({
      id: `tx-${t.id}`,
      type: 'transaction' as const,
      date: t.date,
      data: t,
    }));
    return [...borderActivities, ...txActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [borders, transactions]);

  // Color palette for city ranking bars
  const BAR_COLORS = ['#0f766e', '#115e59', '#134e4a', '#0d9488', '#14b8a6'];

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            欢迎回来，游民探险家 🌍
          </h1>
          <p className="text-slate-500 mt-1">{todayStr}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MapPin}
          title="当前位置"
          value={currentLocation.city ? `${currentLocation.city.name}${currentLocation.city.flag}` : '暂无'}
          subtitle={currentLocation.city ? `已居住 ${currentLocation.days} 天` : '未记录'}
          gradient="bg-gradient-to-br from-teal-600 to-teal-800"
        />
        <StatCard
          icon={Building2}
          title="总旅居城市"
          value={`${totalCities} 个城市`}
          subtitle="全球探索足迹"
          gradient="bg-gradient-to-br from-amber-600 to-amber-800"
        />
        <StatCard
          icon={IdCard}
          title="活跃签证"
          value={`${visaStats.active} 个有效签证`}
          subtitle={`${visaStats.expiring} 个即将到期`}
          gradient="bg-gradient-to-br from-blue-600 to-blue-800"
        />
        <StatCard
          icon={Wallet}
          title="本月结余"
          value={`收入约 $${monthlyFinance.income.toFixed(0)}`}
          subtitle={`支出约 $${monthlyFinance.expense.toFixed(0)}`}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
        />
      </div>

      {/* Visa Expiry Warning */}
      {expiringVisa && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">签证即将到期提醒</p>
            <p className="text-sm text-amber-700 mt-1">
              {expiringVisa.country}签证将于 {formatDate(expiringVisa.expiryDate)} 到期（剩余 {daysUntil(expiringVisa.expiryDate)} 天），请及时续签或规划行程。
            </p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-teal-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">效率趋势</h2>
              <p className="text-sm text-slate-500">最近10周专注时长</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                  labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="focusHours"
                  name="专注小时"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ fill: '#0f766e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#0f766e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Ranking Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">城市排行榜 TOP 5</h2>
              <p className="text-sm text-slate-500">综合评分排名</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCitiesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickLine={false}
                  domain={[0, 100]}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13, fill: '#0f172a' }}
                  stroke="transparent"
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`${value} 分`, '综合评分']}
                />
                <Bar dataKey="score" name="综合评分" radius={[0, 8, 8, 0]} barSize={24}>
                  {topCitiesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-slate-100 rounded-xl">
            <Activity className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">最近活动</h2>
            <p className="text-sm text-slate-500">出入境记录与财务交易</p>
          </div>
        </div>
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div
                className={cn(
                  'p-2.5 rounded-lg flex-shrink-0',
                  activity.type === 'border'
                    ? 'bg-blue-100 text-blue-700'
                    : activity.data.type === 'income'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                )}
              >
                {activity.type === 'border' ? (
                  <ArrowRightLeft className="w-5 h-5" />
                ) : (
                  <Receipt className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {activity.type === 'border' ? (
                  <>
                    <p className="font-medium text-slate-900 truncate">
                      {activity.data.direction === 'entry' ? '入境' : '出境'} {activity.data.country}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {activity.data.notes || '无备注'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-900 truncate">
                      {activity.data.type === 'income' ? '收入' : '支出'}：{activity.data.category}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{activity.data.notes}</p>
                  </>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {activity.type === 'transaction' && (
                  <p
                    className={cn(
                      'font-semibold',
                      activity.data.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    {activity.data.type === 'income' ? '+' : '-'}
                    {activity.data.currency === 'USD' ? '$' : ''}
                    {activity.data.amount.toLocaleString()}
                    {activity.data.currency !== 'USD' ? ` ${activity.data.currency}` : ''}
                  </p>
                )}
                <p className="text-sm text-slate-400">{formatDate(activity.date, 'MM-dd')}</p>
              </div>
            </div>
          ))}
        </div>
        {migrations.length > 0 && recentActivities.length === 0 && (
          <p className="text-center text-slate-400 py-8">暂无活动记录</p>
        )}
      </div>
    </div>
  );
}
