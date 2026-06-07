import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  formatDate,
} from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { TrendingUp, DollarSign, Target, ChevronDown } from 'lucide-react';
import type { Platform, ROIChartData } from '@/../shared/types';

export function ROI() {
  const { roiChartData, salesData, fetchDashboard } = useAppStore();
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');

  useEffect(() => {
    if (roiChartData.length === 0) {
      fetchDashboard();
    }
  }, [roiChartData.length, fetchDashboard]);

  const filteredRoiData = useMemo(() => {
    if (filterPlatform === 'all') {
      return roiChartData;
    }
    const filteredSales = salesData.filter((s) => s.platform === filterPlatform);
    const dateMap = new Map<string, { adSpend: number; sales: number }>();

    filteredSales.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { adSpend: 0, sales: 0 });
      }
      const entry = dateMap.get(item.date)!;
      entry.adSpend += item.adSpend;
      entry.sales += item.salesAmount;
    });

    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        adSpend: data.adSpend,
        sales: data.sales,
        roi: +((data.sales - data.adSpend) / data.adSpend).toFixed(2),
      }));
  }, [filterPlatform, roiChartData, salesData]);

  const summaryStats = useMemo(() => {
    const totalAdSpend = filteredRoiData.reduce((sum, d) => sum + d.adSpend, 0);
    const totalSales = filteredRoiData.reduce((sum, d) => sum + d.sales, 0);
    const avgROI =
      filteredRoiData.length > 0
        ? filteredRoiData.reduce((sum, d) => sum + d.roi, 0) / filteredRoiData.length
        : 0;

    return { totalAdSpend, totalSales, avgROI };
  }, [filteredRoiData]);

  const SpendSalesTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ROITooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'ROI' ? `${entry.value}x` : formatCurrency(entry.value)}
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
          <h2 className="text-xl font-semibold text-white">ROI 趋势分析</h2>
          <p className="text-sm text-gray-400 mt-1">
            广告投入与产出的综合分析
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">平台筛选：</span>
          <div className="relative">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
              className="input-field appearance-none pr-10 min-w-40"
            >
              <option value="all">全部平台</option>
              <option value="amazon">Amazon</option>
              <option value="ebay">eBay</option>
              <option value="shopify">Shopify</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="总广告支出"
          value={formatCurrency(summaryStats.totalAdSpend)}
          change={8.2}
          icon={DollarSign}
          color="blue"
          delay={0}
        />
        <StatCard
          title="总销售额"
          value={formatCurrency(summaryStats.totalSales)}
          change={12.5}
          icon={Target}
          color="green"
          delay={100}
        />
        <StatCard
          title="平均 ROI"
          value={`${summaryStats.avgROI.toFixed(2)}x`}
          change={0.3}
          changeLabel="较上期"
          icon={TrendingUp}
          color="yellow"
          delay={200}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">广告支出 vs 销售额</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredRoiData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAdSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<SpendSalesTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
                />
                <Bar
                  dataKey="sales"
                  name="销售额"
                  fill="url(#colorSales)"
                  stroke="#10B981"
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="adSpend"
                  name="广告支出"
                  fill="url(#colorAdSpend)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">ROI 趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredRoiData}>
                <defs>
                  <linearGradient id="colorROI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(value) => `${value}x`}
                />
                <Tooltip content={<ROITooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="roi"
                  name="ROI"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">每日 ROI 明细</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th className="text-right">广告支出</th>
                <th className="text-right">销售额</th>
                <th className="text-right">利润</th>
                <th className="text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredRoiData]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 15)
                .map((item: ROIChartData, index) => {
                  const profit = item.sales - item.adSpend;
                  return (
                    <tr
                      key={item.date}
                      style={{
                        animationDelay: `${index * 30}ms`,
                        opacity: 0,
                        animation: `fadeInUp 0.4s ease-out ${index * 30}ms forwards`,
                      }}
                    >
                      <td className="text-gray-300">{formatDate(item.date)}</td>
                      <td className="text-right text-gray-300">
                        {formatCurrency(item.adSpend)}
                      </td>
                      <td className="text-right text-white font-medium">
                        {formatCurrency(item.sales)}
                      </td>
                      <td className="text-right">
                        <span className={profit > 0 ? 'text-success-500' : 'text-danger-500'}>
                          {formatCurrency(profit)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className={`font-medium ${
                            item.roi >= 3
                              ? 'text-success-500'
                              : item.roi >= 2
                              ? 'text-primary-400'
                              : 'text-warning-500'
                          }`}
                        >
                          {item.roi.toFixed(2)}x
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {filteredRoiData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">暂无 ROI 数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
