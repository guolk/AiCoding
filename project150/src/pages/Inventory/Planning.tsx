import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Calendar,
  AlertTriangle,
  TrendingUp,
  Package,
  Clock,
  Gift,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  formatNumber,
  formatDate,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import type { TooltipProps } from 'recharts';
import type { Inventory as InventoryType, Product, Promotion } from '@/../shared/types';

interface InventoryWithProduct extends InventoryType {
  product?: Product;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-white/10">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatNumber(entry.value as number)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ForecastTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-white/10">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === '预测' ? `${formatNumber(entry.value as number)}` : formatNumber(entry.value as number)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const months = [
  { name: '1月', month: 0 },
  { name: '2月', month: 1 },
  { name: '3月', month: 2 },
  { name: '4月', month: 3 },
  { name: '5月', month: 4 },
  { name: '6月', month: 5 },
  { name: '7月', month: 6 },
  { name: '8月', month: 7 },
  { name: '9月', month: 8 },
  { name: '10月', month: 9 },
  { name: '11月', month: 10 },
  { name: '12月', month: 11 },
];

const seasonalFactors = [
  0.8, 0.75, 0.9, 1.0, 1.1, 1.2,
  1.3, 1.25, 1.1, 1.0, 1.15, 1.4,
];

export default function Planning() {
  const { inventory, products, promotions } = useAppStore();
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const inventoryWithProducts: InventoryWithProduct[] = useMemo(() => {
    return inventory.map((inv) => ({
      ...inv,
      product: products.find((p) => p.id === inv.productId),
    }));
  }, [inventory, products]);

  const historicalDemandData = useMemo(() => {
    const monthlyData = months.map((month, index) => {
      const baseDemand = 500 + Math.sin(index / 2) * 150 + Math.random() * 100;
      const seasonalDemand = baseDemand * seasonalFactors[index];
      return {
        month: month.name,
        实际需求: Math.round(seasonalDemand),
        安全库存: Math.round(seasonalDemand * 0.3),
      };
    });
    return monthlyData;
  }, []);

  const forecastData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('zh-CN', { month: 'short' });
      const monthIndex = (today.getMonth() + i) % 12;
      const baseValue = 450 + Math.sin((today.getMonth() + i) / 3) * 120;
      const seasonalValue = baseValue * seasonalFactors[monthIndex];
      const trendFactor = 1 + i * 0.02;

      data.push({
        month: monthName,
        历史销量: i < 3 ? Math.round(seasonalValue * trendFactor) : null,
        预测: i >= 2 ? Math.round(seasonalValue * trendFactor) : null,
        安全库存: Math.round(seasonalValue * trendFactor * 0.3),
      });
    }
    return data;
  }, []);

  const planningData = useMemo(() => {
    return inventoryWithProducts.map((inv) => {
      const product = inv.product;
      if (!product) return null;

      const availableStock = inv.currentStock - inv.reservedStock;
      const daysOfStock = inv.dailySalesRate > 0 ? availableStock / inv.dailySalesRate : 0;

      const safetyStock = Math.round(inv.dailySalesRate * inv.leadTimeDays * 1.5);
      const reorderPoint = safetyStock + Math.round(inv.dailySalesRate * inv.leadTimeDays);
      const recommendedOrder = Math.max(0, reorderPoint - availableStock + Math.round(inv.dailySalesRate * 30));

      const upcomingPromotions = promotions.filter((p) => {
        const promoStart = new Date(p.startDate);
        const now = new Date();
        return promoStart > now && p.platform === inv.platform;
      });

      return {
        ...inv,
        product,
        availableStock,
        daysOfStock,
        safetyStock,
        reorderPoint,
        recommendedOrder,
        upcomingPromotions,
        stockValue: product.cost * inv.currentStock,
      };
    }).filter(Boolean) as (InventoryWithProduct & {
      product: Product;
      availableStock: number;
      daysOfStock: number;
      safetyStock: number;
      reorderPoint: number;
      recommendedOrder: number;
      upcomingPromotions: Promotion[];
      stockValue: number;
    })[];
  }, [inventoryWithProducts, promotions]);

  const filteredPlanning = useMemo(() => {
    if (selectedProduct === 'all') return planningData;
    return planningData.filter((item) => item.productId === selectedProduct);
  }, [planningData, selectedProduct]);

  const summaryData = useMemo(() => {
    const totalSafetyStock = planningData.reduce((sum, item) => sum + item.safetyStock, 0);
    const totalReorderQty = planningData.reduce((sum, item) => sum + item.recommendedOrder, 0);
    const totalStockValue = planningData.reduce((sum, item) => sum + item.stockValue, 0);
    const lowStockCount = planningData.filter((item) => item.availableStock <= item.safetyStock).length;

    return {
      totalSafetyStock,
      totalReorderQty,
      totalStockValue,
      lowStockCount,
    };
  }, [planningData]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const events = [
      { name: '618年中大促', date: '2024-06-18', type: 'promo', platform: 'amazon' },
      { name: 'Prime Day', date: '2024-07-15', type: 'promo', platform: 'amazon' },
      { name: '夏季促销', date: '2024-07-01', type: 'promo', platform: 'all' },
      { name: '返校季', date: '2024-08-15', type: 'holiday', platform: 'all' },
      { name: '黑色星期五', date: '2024-11-29', type: 'promo', platform: 'all' },
      { name: '网络星期一', date: '2024-12-02', type: 'promo', platform: 'all' },
      { name: '圣诞节', date: '2024-12-25', type: 'holiday', platform: 'all' },
    ];

    return events
      .filter((e) => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="建议安全库存"
          value={formatNumber(summaryData.totalSafetyStock)}
          icon={Package}
          color="blue"
          delay={0}
        />
        <StatCard
          title="建议补货量"
          value={formatNumber(summaryData.totalReorderQty)}
          icon={TrendingUp}
          color="green"
          delay={100}
        />
        <StatCard
          title="库存总价值"
          value={formatCurrency(summaryData.totalStockValue)}
          change={2.8}
          icon={Package}
          color="blue"
          delay={200}
        />
        <StatCard
          title="需补货商品"
          value={formatNumber(summaryData.lowStockCount)}
          icon={AlertTriangle}
          color="yellow"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">历史需求分析</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalDemandData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="实际需求" name="实际需求" fill="url(#colorDemand)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="安全库存" name="安全库存" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">即将到来的活动</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => {
              const daysUntil = getDaysUntil(event.date);
              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-dark-700/50',
                    daysUntil <= 30 ? 'bg-warning-600/10 border border-warning-600/20' : 'bg-dark-700/30'
                  )}
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.4s ease-out ${index * 50}ms forwards`,
                  }}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    event.type === 'promo' ? 'bg-primary-600/20' : 'bg-success-600/20'
                  )}>
                    {event.type === 'promo' ? (
                      <Gift size={16} className="text-primary-400" />
                    ) : (
                      <Star size={16} className="text-success-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{event.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-sm font-mono',
                      daysUntil <= 7 ? 'text-danger-500' :
                      daysUntil <= 30 ? 'text-warning-500' : 'text-gray-400'
                    )}>
                      {daysUntil}天后
                    </p>
                    <p className="text-xs text-gray-600">{event.platform.toUpperCase()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">销售趋势与库存预测</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ForecastTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="历史销量"
                name="历史销量"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="预测"
                name="预测"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="安全库存"
                name="安全库存"
                stroke="#F59E0B"
                fill="url(#colorForecast)"
                fillOpacity={0.3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-white">季节性库存规划表</h3>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="input-field text-sm w-full sm:w-auto"
          >
            <option value="all">全部商品</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table">
            <thead>
              <tr>
              <th>商品</th>
              <th>SKU</th>
              <th>仓库</th>
              <th>当前库存</th>
              <th>日销量</th>
              <th>安全库存</th>
              <th>补货点</th>
              <th>建议补货量</th>
              <th>库存价值</th>
              <th>可售天数</th>
              <th>状态</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
              {filteredPlanning.map((item, index) => {
                const isLow = item.availableStock <= item.safetyStock;
                const isExpanded = expandedRow === item.id;

                return (
                  <>
                    <tr
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 0.4s ease-out ${index * 50}ms forwards`,
                      }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.product.name}</p>
                            <p className="text-xs text-gray-500">{item.platform}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-gray-300">{item.product.sku}</td>
                      <td>
                        <span className="badge badge-info">{item.warehouse}</span>
                      </td>
                      <td className="font-mono text-white">{formatNumber(item.currentStock)}</td>
                      <td className="font-mono text-gray-300">{formatNumber(item.dailySalesRate)}</td>
                      <td className="font-mono text-warning-500">{formatNumber(item.safetyStock)}</td>
                      <td className="font-mono text-primary-400">{formatNumber(item.reorderPoint)}</td>
                      <td className="font-mono">
                        <span className={item.recommendedOrder > 0 ? 'text-success-500' : 'text-gray-500'}>
                          {formatNumber(item.recommendedOrder)}
                        </span>
                      </td>
                      <td className="font-mono text-white">{formatCurrency(item.stockValue)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Clock size={12} className={cn(
                            item.daysOfStock <= 7 ? 'text-danger-500' :
                            item.daysOfStock <= 14 ? 'text-warning-500' : 'text-success-500'
                          )} />
                          <span className={cn(
                            'font-mono',
                            item.daysOfStock <= 7 ? 'text-danger-500' :
                            item.daysOfStock <= 14 ? 'text-warning-500' : 'text-white'
                          )}>
                            {item.daysOfStock.toFixed(0)}天
                          </span>
                        </div>
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-danger">库存不足</span>
                        ) : item.availableStock <= item.reorderPoint ? (
                          <span className="badge badge-warning">接近补货点</span>
                        ) : (
                          <span className="badge badge-success">库存充足</span>
                        )}
                      </td>
                      <td>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-dark-800/50">
                        <td colSpan={12} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-300">库存指标</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">当前可用库存</span>
                                  <span className="text-white font-mono">{formatNumber(item.availableStock)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">已预留库存</span>
                                  <span className="text-white font-mono">{formatNumber(item.reservedStock)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">补货周期</span>
                                  <span className="text-white font-mono">{item.leadTimeDays}天</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">预计断货日期</span>
                                  <span className={item.daysOfStock <= 14 ? 'text-danger-500' : 'text-white'}>
                                    {item.daysOfStock <= 365 ? formatDate(new Date(Date.now() + item.daysOfStock * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) : '—'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-300">补货建议</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">安全库存</span>
                                  <span className="text-warning-500 font-mono">{formatNumber(item.safetyStock)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">补货点</span>
                                  <span className="text-primary-400 font-mono">{formatNumber(item.reorderPoint)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">建议补货量</span>
                                  <span className="text-success-500 font-mono">{formatNumber(item.recommendedOrder)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">预计补货成本</span>
                                  <span className="text-white font-mono">{formatCurrency(item.recommendedOrder * item.product.cost)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-300">即将到来的活动影响</h4>
                              {item.upcomingPromotions.length > 0 ? (
                                <div className="space-y-2">
                                  {item.upcomingPromotions.map((promo) => (
                                    <div key={promo.id} className="flex items-center gap-2 p-2 bg-dark-700/50 rounded-lg">
                                      <Gift size={14} className="text-primary-400" />
                                      <div className="flex-1">
                                        <p className="text-sm text-white">{promo.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                                        </p>
                                      </div>
                                      <ArrowRight size={14} className="text-gray-500" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">暂无即将到来的活动</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
