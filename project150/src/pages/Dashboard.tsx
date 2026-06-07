import { useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { DollarSign, ShoppingCart, RefreshCw, Star } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { AlertList } from '@/components/AlertList';
import { useAppStore } from '@/store/appStore';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/api';
import type { TooltipProps } from 'recharts';

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-white/10">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value as number)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-white/10">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'ROI' ? `${entry.value}x` : formatCurrency(entry.value as number)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const {
    dashboardSummary,
    salesTrend,
    platformComparison,
    alerts,
    loading,
    fetchDashboard,
  } = useAppStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statData = [
    {
      title: '总销售额',
      value: formatCurrency(3055000),
      change: 12.5,
      icon: DollarSign,
      color: 'blue' as const,
      delay: 0,
    },
    {
      title: '总订单数',
      value: formatNumber(10650),
      change: 8.3,
      icon: ShoppingCart,
      color: 'green' as const,
      delay: 100,
    },
    {
      title: '平均退款率',
      value: formatPercent(1.62),
      change: -0.15,
      icon: RefreshCw,
      color: 'yellow' as const,
      delay: 200,
    },
    {
      title: '平均评分',
      value: '4.4',
      change: 0.1,
      icon: Star,
      color: 'blue' as const,
      delay: 300,
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <Header title="运营总览" subtitle="实时业务数据概览" />
      
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statData.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              delay={stat.delay}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">销售趋势</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="销售额"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">平台对比</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformComparison} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Legend />
                  <Bar dataKey="sales" name="销售额" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="利润" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="roi" name="ROI" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">最近告警</h3>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <AlertList alerts={alerts} />
          )}
        </div>
      </main>
    </div>
  );
}
