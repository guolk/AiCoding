import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  platformNames,
} from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Plus,
  Edit,
  ChevronDown,
} from 'lucide-react';
import type { PriceAdjustment, Product } from '@/../shared/types';

export function Pricing() {
  const { priceAdjustments, products, addPriceAdjustment } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [reason, setReason] = useState('');

  const calculatePriceChange = (oldPrice: number, newPrice: number) => {
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };

  const calculateROI = (adjustment: PriceAdjustment) => {
    if (!adjustment.salesBefore || !adjustment.salesAfter) return null;
    const revenueChange =
      adjustment.salesAfter * adjustment.newPrice -
      adjustment.salesBefore * adjustment.oldPrice;
    const costChange =
      (adjustment.salesAfter - adjustment.salesBefore) *
      (products.find((p) => p.id === adjustment.productId)?.cost || 0);
    const profitChange = revenueChange - costChange;
    const investment = adjustment.salesBefore * adjustment.oldPrice * 0.1;
    return investment > 0 ? profitChange / investment : 0;
  };

  const summaryStats = useMemo(() => {
    const totalAdjustments = priceAdjustments.length;
    const avgPriceChange =
      priceAdjustments.reduce((sum, pa) => {
        return sum + calculatePriceChange(pa.oldPrice, pa.newPrice);
      }, 0) / (totalAdjustments || 1);
    const totalSalesIncrease = priceAdjustments.reduce((sum, pa) => {
      if (pa.salesAfter && pa.salesBefore) {
        return sum + (pa.salesAfter - pa.salesBefore);
      }
      return sum;
    }, 0);
    const avgROI =
      priceAdjustments.reduce((sum, pa) => {
        const roi = calculateROI(pa);
        return sum + (roi || 0);
      }, 0) / (totalAdjustments || 1);

    return { totalAdjustments, avgPriceChange, totalSalesIncrease, avgROI };
  }, [priceAdjustments, products]);

  const handleAddAdjustment = () => {
    if (!selectedProductId || !newPrice) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newAdjustment: PriceAdjustment = {
      id: `pa${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      oldPrice: product.price,
      newPrice: parseFloat(newPrice),
      date: new Date().toISOString().split('T')[0],
      reason,
      effectDays: 7,
      createdAt: new Date().toISOString().split('T')[0],
    };

    addPriceAdjustment(newAdjustment);
    setShowAddForm(false);
    setSelectedProductId('');
    setNewPrice('');
    setReason('');
  };

  const getChartData = (adjustment: PriceAdjustment) => {
    return [
      { name: '调整前', 销量: adjustment.salesBefore || 0, 销售额: (adjustment.salesBefore || 0) * adjustment.oldPrice },
      { name: '调整后', 销量: adjustment.salesAfter || 0, 销售额: (adjustment.salesAfter || 0) * adjustment.newPrice },
    ];
  };

  const ChartTooltip = ({
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
              {entry.name}: {entry.name.includes('额') ? formatCurrency(entry.value) : formatNumber(entry.value)}
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
          <h2 className="text-xl font-semibold text-white">价格调整历史</h2>
          <p className="text-sm text-gray-400 mt-1">
            监控价格变动对销售的影响，优化定价策略
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          添加价格调整
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Edit size={20} className="text-primary-400" />
            新建价格调整
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">选择商品</label>
              <div className="relative">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="input-field appearance-none pr-10 w-full"
                >
                  <option value="">请选择商品</option>
                  {products.map((product: Product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku}) - {platformNames[product.platform]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">新价格 (USD)</label>
              <input
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="输入新价格"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">调整原因</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="例如：竞品降价、清库存等"
                className="input-field w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleAddAdjustment}
              className="btn-primary"
              disabled={!selectedProductId || !newPrice}
            >
              确认调整
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="总调整次数"
          value={formatNumber(summaryStats.totalAdjustments)}
          icon={FileText}
          color="blue"
          delay={0}
        />
        <StatCard
          title="平均价格变动"
          value={formatPercent(summaryStats.avgPriceChange)}
          change={summaryStats.avgPriceChange}
          icon={DollarSign}
          color={summaryStats.avgPriceChange >= 0 ? 'yellow' : 'green'}
          delay={100}
        />
        <StatCard
          title="销量总增长"
          value={formatNumber(summaryStats.totalSalesIncrease)}
          change={summaryStats.totalSalesIncrease > 0 ? 15 : -5}
          icon={summaryStats.totalSalesIncrease >= 0 ? TrendingUp : TrendingDown}
          color="green"
          delay={200}
        />
        <StatCard
          title="平均 ROI"
          value={`${summaryStats.avgROI.toFixed(2)}x`}
          change={0.5}
          icon={TrendingUp}
          color="yellow"
          delay={300}
        />
      </div>

      <div className="space-y-4">
        {[...priceAdjustments].sort((a, b) => b.date.localeCompare(a.date)).map((adjustment, index) => {
          const priceChange = calculatePriceChange(adjustment.oldPrice, adjustment.newPrice);
          const roi = calculateROI(adjustment);
          const chartData = getChartData(adjustment);
          const product = products.find((p) => p.id === adjustment.productId);

          return (
            <div
              key={adjustment.id}
              className="glass-card p-6"
              style={{
                animationDelay: `${index * 100}ms`,
                opacity: 0,
                animation: `fadeInUp 0.5s ease-out ${index * 100}ms forwards`,
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {adjustment.productName}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        SKU: {adjustment.sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} />
                      {formatDate(adjustment.date)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">原价:</span>
                      <span className="text-xl font-medium text-gray-300 line-through">
                        {formatCurrency(adjustment.oldPrice)}
                      </span>
                      <span className="text-2xl">→</span>
                      <span className="text-xl font-semibold text-white">
                        {formatCurrency(adjustment.newPrice)}
                      </span>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium ${
                          priceChange >= 0
                            ? 'bg-danger-600/20 text-danger-400'
                            : 'bg-success-600/20 text-success-400'
                        }`}
                      >
                        {priceChange >= 0 ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {formatPercent(priceChange)}
                      </span>
                    </div>
                  </div>

                  {adjustment.reason && (
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-sm text-gray-500">调整原因：</span>
                        <span className="text-sm text-gray-300">{adjustment.reason}</span>
                      </div>
                    </div>
                  )}

                  {adjustment.salesBefore !== undefined && adjustment.salesAfter !== undefined && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">调整前7天销量</p>
                        <p className="text-lg font-semibold text-gray-300">
                          {formatNumber(adjustment.salesBefore)}
                        </p>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">调整后7天销量</p>
                        <p className="text-lg font-semibold text-white">
                          {formatNumber(adjustment.salesAfter)}
                        </p>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">销量变化</p>
                        <p
                          className={`text-lg font-semibold ${
                            adjustment.salesAfter - adjustment.salesBefore >= 0
                              ? 'text-success-400'
                              : 'text-danger-400'
                          }`}
                        >
                          {adjustment.salesAfter - adjustment.salesBefore >= 0 ? '+' : ''}
                          {formatNumber(adjustment.salesAfter - adjustment.salesBefore)}
                        </p>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">ROI</p>
                        <p
                          className={`text-lg font-semibold ${
                            roi && roi >= 2
                              ? 'text-success-400'
                              : roi && roi >= 0
                              ? 'text-primary-400'
                              : 'text-danger-400'
                          }`}
                        >
                          {roi !== null ? `${roi.toFixed(2)}x` : '-'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {adjustment.salesBefore !== undefined && adjustment.salesAfter !== undefined && (
                  <div className="w-full lg:w-80 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="name"
                          stroke="#6B7280"
                          tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#6B7280"
                          tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend
                          wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                          formatter={(value) => (
                            <span className="text-gray-400">{value}</span>
                          )}
                        />
                        <Bar
                          dataKey="销量"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="销售额"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {priceAdjustments.length === 0 && (
        <div className="glass-card p-12 text-center">
          <DollarSign size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">暂无价格调整记录</p>
        </div>
      )}
    </div>
  );
}
