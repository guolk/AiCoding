import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  DollarSign, Percent, Home, Wallet, Building2, Settings2,
  Edit2, Check, X, TrendingUp, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { PLATFORM_LABELS, BookingPlatform } from '@/types';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

const PLATFORM_COLORS: Record<BookingPlatform, string> = {
  airbnb: '#F59E0B',
  tujia: '#065F46',
  meituan: '#FBBF24',
  ctrip: '#047857',
  booking: '#FCD34D',
  direct: '#059669',
};

const MONTH_LABELS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ title, value, icon, trend, iconBg, iconColor }: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
              )}
              <span className={cn('font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">vs 上月</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconBg)}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default function FinanceOverview() {
  const navigate = useNavigate();
  const {
    getFinanceSummary,
    getMonthlyRevenue,
    getPropertyRevenue,
    getPlatformRevenue,
    platformCommissions,
    updatePlatformCommission,
  } = useAppStore();

  const [editingPlatform, setEditingPlatform] = useState<BookingPlatform | null>(null);
  const [editingRate, setEditingRate] = useState<number>(0);

  const { currentYear, currentMonth } = useMemo(() => {
    const now = new Date();
    return {
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth(),
    };
  }, []);

  const thisMonthSummary = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0);
    return getFinanceSummary(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  }, [currentYear, currentMonth, getFinanceSummary]);

  const lastMonthSummary = useMemo(() => {
    const start = new Date(currentYear, currentMonth - 1, 1);
    const end = new Date(currentYear, currentMonth, 0);
    return getFinanceSummary(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  }, [currentYear, currentMonth, getFinanceSummary]);

  const monthlyData = useMemo(() => {
    const data = getMonthlyRevenue(currentYear);
    return data.map((d, index) => ({
      ...d,
      month: MONTH_LABELS[index],
    }));
  }, [currentYear, getMonthlyRevenue]);

  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

  const propertyRevenue = useMemo(
    () => getPropertyRevenue(monthStart, monthEnd),
    [monthStart, monthEnd, getPropertyRevenue]
  );

  const platformRevenue = useMemo(
    () => getPlatformRevenue(monthStart, monthEnd),
    [monthStart, monthEnd, getPlatformRevenue]
  );

  const platformPieData = useMemo(() => {
    return platformRevenue.map((item) => ({
      name: PLATFORM_LABELS[item.platform],
      value: item.revenue,
      platform: item.platform,
    }));
  }, [platformRevenue]);

  const revenueTrend = lastMonthSummary.totalRevenue > 0
    ? ((thisMonthSummary.totalRevenue - lastMonthSummary.totalRevenue) / lastMonthSummary.totalRevenue) * 100
    : 0;

  const avgPriceTrend = lastMonthSummary.avgDailyRate > 0
    ? ((thisMonthSummary.avgDailyRate - lastMonthSummary.avgDailyRate) / lastMonthSummary.avgDailyRate) * 100
    : 0;

  const startEdit = (platform: BookingPlatform, rate: number) => {
    setEditingPlatform(platform);
    setEditingRate(rate);
  };

  const cancelEdit = () => {
    setEditingPlatform(null);
    setEditingRate(0);
  };

  const saveEdit = () => {
    if (editingPlatform) {
      updatePlatformCommission(editingPlatform, editingRate);
      setEditingPlatform(null);
    }
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">财务概览</h1>
          <p className="text-gray-500 mt-1">查看本月财务数据和收入趋势</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {currentYear}年{currentMonth + 1}月
          </div>
          <button
            onClick={() => navigate('/finance/report')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            年度报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本月总收入"
          value={formatCurrency(thisMonthSummary.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={revenueTrend}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="本月入住率"
          value={formatPercent(thisMonthSummary.occupancyRate)}
          icon={<Percent className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <StatCard
          title="平均客单价"
          value={formatCurrency(thisMonthSummary.avgDailyRate)}
          icon={<Home className="w-5 h-5" />}
          trend={avgPriceTrend}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="本月净收入"
          value={formatCurrency(thisMonthSummary.netRevenue)}
          icon={<Wallet className="w-5 h-5" />}
          iconBg="bg-green-50"
          iconColor="text-green-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">月度收入趋势</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => value >= 1000 ? `¥${(value / 1000).toFixed(0)}k` : `¥${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [formatCurrency(value), '收入']}
                  cursor={{ fill: '#fef3c7' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  name="收入"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-semibold text-gray-900">平台佣金设置</h2>
          </div>
          <div className="space-y-3">
            {platformCommissions.map((commission) => (
              <div
                key={commission.platform}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PLATFORM_COLORS[commission.platform] }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {PLATFORM_LABELS[commission.platform]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {editingPlatform === commission.platform ? (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={editingRate}
                        onChange={(e) => setEditingRate(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={saveEdit}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {(commission.rate * 100).toFixed(0)}%
                      </span>
                      <button
                        onClick={() => startEdit(commission.platform, commission.rate)}
                        className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">各房源收入对比</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    房源名称
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    预订数
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    入住晚数
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    收入
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {propertyRevenue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                      本月暂无收入数据
                    </td>
                  </tr>
                ) : (
                  propertyRevenue
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((item, index) => (
                      <tr key={item.propertyId} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                              index === 0 ? 'bg-amber-100 text-amber-700' :
                              index === 1 ? 'bg-gray-200 text-gray-600' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-500'
                            )}>
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {item.propertyName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {item.bookings}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {item.nights}晚
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-amber-600">
                            {formatCurrency(item.revenue)}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-semibold text-gray-900">各平台收入分布</h2>
          </div>
          {platformPieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Home className="w-10 h-10 mb-2" />
              <p className="text-sm">暂无平台收入数据</p>
            </div>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PLATFORM_COLORS[entry.platform as BookingPlatform] || '#9CA3AF'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [formatCurrency(value), '收入']}
                    />
                    <Legend
                      formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {platformPieData.map((item) => (
                  <div key={item.platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PLATFORM_COLORS[item.platform as BookingPlatform] }}
                      />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
