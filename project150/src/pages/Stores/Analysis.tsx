import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Star, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatCurrency, formatNumber, formatPercent, platformNames, platformColors } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import type { Platform, SalesData } from '@/../shared/types';

type FilterType = Platform | 'all';

export function Analysis() {
  const { salesData, platformComparison } = useAppStore();
  const [filterPlatform, setFilterPlatform] = useState<FilterType>('all');

  const filteredSalesData = useMemo(() => {
    if (filterPlatform === 'all') return salesData;
    return salesData.filter((s) => s.platform === filterPlatform);
  }, [salesData, filterPlatform]);

  const summaryStats = useMemo(() => {
    const totalSales = filteredSalesData.reduce((sum, s) => sum + s.salesAmount, 0);
    const totalOrders = filteredSalesData.reduce((sum, s) => sum + s.orderCount, 0);
    const avgRefundRate = filteredSalesData.length > 0
      ? filteredSalesData.reduce((sum, s) => sum + s.refundRate, 0) / filteredSalesData.length
      : 0;
    const avgReviewScore = filteredSalesData.length > 0
      ? filteredSalesData.reduce((sum, s) => sum + (s.reviewScore || 0), 0) / filteredSalesData.length
      : 0;

    return { totalSales, totalOrders, avgRefundRate, avgReviewScore };
  }, [filteredSalesData]);

  const salesTrendByPlatform = useMemo(() => {
    const dateMap = new Map<string, Record<string, number | string>>();

    filteredSalesData.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date });
      }
      const entry = dateMap.get(item.date)!;
      const platformKey = `${item.platform}Sales`;
      entry[platformKey] = (entry[platformKey] as number || 0) + item.salesAmount;
    });

    return Array.from(dateMap.values()).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  }, [filteredSalesData]);

  const roiData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number | string>>();

    filteredSalesData.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date, adSpend: 0, sales: 0 });
      }
      const entry = dateMap.get(item.date)!;
      entry.adSpend = (entry.adSpend as number) + item.adSpend;
      entry.sales = (entry.sales as number) + item.salesAmount;
    });

    return Array.from(dateMap.values())
      .sort((a, b) => (a.date as string).localeCompare(b.date as string))
      .map((item) => ({
        ...item,
        roi: +(((item.sales as number) - (item.adSpend as number)) / (item.adSpend as number)).toFixed(2),
      }));
  }, [filteredSalesData]);

  const platformDistribution = useMemo(() => {
    const platformMap = new Map<Platform, number>();

    filteredSalesData.forEach((item) => {
      platformMap.set(item.platform, (platformMap.get(item.platform) || 0) + item.salesAmount);
    });

    return Array.from(platformMap.entries()).map(([platform, value]) => ({
      name: platformNames[platform],
      value,
      platform,
    }));
  }, [filteredSalesData]);

  const recentRecords = useMemo(() => {
    return [...filteredSalesData]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [filteredSalesData]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
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

  const ROITooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
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

  const platformsToShow = useMemo(() => {
    if (filterPlatform === 'all') {
      return ['amazon', 'ebay', 'shopify'] as Platform[];
    }
    return [filterPlatform];
  }, [filterPlatform]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">平台筛选：</span>
          <div className="relative">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value as FilterType)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总销售额"
          value={formatCurrency(summaryStats.totalSales)}
          change={12.5}
          icon={DollarSign}
          color="blue"
          delay={0}
        />
        <StatCard
          title="总订单数"
          value={formatNumber(summaryStats.totalOrders)}
          change={8.3}
          icon={ShoppingCart}
          color="green"
          delay={100}
        />
        <StatCard
          title="平均退款率"
          value={formatPercent(summaryStats.avgRefundRate)}
          change={-0.5}
          icon={TrendingUp}
          color="yellow"
          delay={200}
        />
        <StatCard
          title="平均评分"
          value={summaryStats.avgReviewScore.toFixed(1)}
          change={0.2}
          icon={Star}
          color="green"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">各平台销售趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendByPlatform}>
                <defs>
                  {platformsToShow.map((platform) => (
                    <linearGradient
                      key={platform}
                      id={`color${platform}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={platformColors[platform]}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={platformColors[platform]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
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
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
                />
                {platformsToShow.map((platform) => (
                  <Area
                    key={platform}
                    type="monotone"
                    dataKey={`${platform}Sales`}
                    name={platformNames[platform]}
                    stroke={platformColors[platform]}
                    fill={`url(#color${platform})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">广告投入与 ROI 对比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData}>
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
                <Tooltip content={<ROITooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
                />
                <Bar
                  dataKey="sales"
                  name="销售额"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="adSpend"
                  name="广告支出"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">平台销售占比</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={platformColors[entry.platform]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {platformDistribution.map((item) => (
              <div key={item.platform} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: platformColors[item.platform] }}
                />
                <span className="text-xs text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">平台 ROI 对比</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformComparison.filter(
                  (p) => filterPlatform === 'all' || p.platform === filterPlatform
                )}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(value) => `${value}x`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'ROI' ? [`${value}x`, 'ROI'] : [formatCurrency(value), name]
                  }
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="roi"
                  name="ROI"
                  radius={[0, 4, 4, 0]}
                >
                  {platformComparison
                    .filter((p) => filterPlatform === 'all' || p.platform === filterPlatform)
                    .map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={platformColors[entry.platform]}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">最近销售记录</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>平台</th>
                <th>店铺</th>
                <th className="text-right">销售额</th>
                <th className="text-right">订单数</th>
                <th className="text-right">退款率</th>
                <th className="text-right">评分</th>
                <th className="text-right">广告支出</th>
                <th className="text-right">利润</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record: SalesData) => (
                <tr key={record.id}>
                  <td className="text-gray-300">{record.date}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: platformColors[record.platform] }}
                      />
                      <span className="text-gray-300">{platformNames[record.platform]}</span>
                    </div>
                  </td>
                  <td className="text-gray-300">{record.storeName}</td>
                  <td className="text-right text-white font-medium">
                    {formatCurrency(record.salesAmount)}
                  </td>
                  <td className="text-right text-gray-300">
                    {formatNumber(record.orderCount)}
                  </td>
                  <td className="text-right">
                    <span className={record.refundRate > 3 ? 'text-danger-500' : 'text-success-500'}>
                      {formatPercent(record.refundRate)}
                    </span>
                  </td>
                  <td className="text-right text-gray-300">
                    {record.reviewScore?.toFixed(1) || '-'}
                  </td>
                  <td className="text-right text-gray-300">
                    {formatCurrency(record.adSpend)}
                  </td>
                  <td className="text-right">
                    <span className={record.profit > 0 ? 'text-success-500' : 'text-danger-500'}>
                      {formatCurrency(record.profit)}
                    </span>
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
