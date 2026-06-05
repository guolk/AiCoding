import { useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { calculatePortfolioMetrics, calculateIndustryAllocation, formatCurrency, formatPercent, getColorClass } from '../../utils/calculations';
import { industryColors } from '../../types';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

export default function Dashboard() {
  const { stocks, holdings, performances, getHoldingsWithMetrics, refreshPrices, isLoading, lastUpdateTime, initializeWithMockData } = usePortfolioStore();

  useEffect(() => {
    if (holdings.length === 0) {
      initializeWithMockData();
    }
  }, [holdings.length, initializeWithMockData]);

  const holdingsWithMetrics = getHoldingsWithMetrics();
  const stockMap = usePortfolioStore.getState().getStockMap();

  const previousPerformance = performances.length >= 2 
    ? performances[performances.length - 2]?.totalValue || 0
    : 0;

  const metrics = calculatePortfolioMetrics(
    holdings,
    stockMap,
    previousPerformance,
    performances
  );

  const industryAllocation = calculateIndustryAllocation(holdings, stockMap);

  const chartData = performances.slice(-30).map(p => ({
    date: p.date.slice(5),
    组合净值: p.totalValue / 10000,
    沪深300: (p.benchmarkValue / 3500) * 500,
  }));

  const topHoldings = holdingsWithMetrics.slice(0, 5).map(h => ({
    name: h.stock?.name || h.stockCode,
    value: h.metrics.marketValue,
    proportion: h.metrics.proportion,
  }));

  const formatCurrencyTooltip = (value: number) => [`${value.toFixed(2)}万`, ''];

  return (
    <div className="space-y-8">
      <PageHeader
        title="投资仪表盘"
        description="实时追踪您的投资组合表现和资产配置"
        actions={
          <Button
            variant="secondary"
            onClick={() => refreshPrices()}
            loading={isLoading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            {lastUpdateTime ? `更新于 ${new Date(lastUpdateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '刷新行情'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总资产"
          value={formatCurrency(metrics.totalValue)}
          change={metrics.dailyChangeRate}
          icon={Wallet}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <StatCard
          title="总收益"
          value={formatCurrency(metrics.totalProfitLoss)}
          change={metrics.totalProfitLossRate}
          changeLabel="总收益率"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
        <StatCard
          title="今日盈亏"
          value={formatCurrency(metrics.dailyChange)}
          change={metrics.dailyChangeRate}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        <StatCard
          title="持仓市值"
          value={formatCurrency(metrics.totalValue)}
          change={metrics.annualizedReturn}
          changeLabel="年化收益"
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">收益走势</h3>
              <p className="text-sm text-text-muted">近30个交易日</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-text-secondary">组合净值</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-text-secondary">沪深300</span>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}万`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC' }}
                  formatter={formatCurrencyTooltip}
                />
                <Area
                  type="monotone"
                  dataKey="组合净值"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#colorPortfolio)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#3B82F6' }}
                />
                <Line
                  type="monotone"
                  dataKey="沪深300"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary">行业分布</h3>
            <p className="text-sm text-text-muted">按市值权重</p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {industryAllocation.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={industryColors[entry.industry] || '#6B7280'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '市值']}
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {industryAllocation.slice(0, 5).map((item) => (
              <div key={item.industry} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: industryColors[item.industry] || '#6B7280' }}
                  />
                  <span className="text-text-secondary">{item.industry}</span>
                </div>
                <span className="font-mono text-text-primary">{item.proportion.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary">十大重仓股</h3>
            <p className="text-sm text-text-muted">按市值排序</p>
          </div>
          
          <div className="space-y-4">
            {topHoldings.map((holding, index) => (
              <div key={holding.name} className="flex items-center gap-4">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-hover text-text-muted text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary font-medium truncate">{holding.name}</span>
                    <span className="font-mono text-sm text-text-primary">{formatCurrency(holding.value)}</span>
                  </div>
                  <div className="w-full bg-surface-hover rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-blue-400 progress-animate"
                      style={{ width: `${Math.min(holding.proportion, 100)}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-mono font-medium ${getColorClass(holding.proportion)}`}>
                  {holding.proportion.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary">风险指标</h3>
            <p className="text-sm text-text-muted">组合风险收益特征</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-hover rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">年化收益率</p>
              <p className={`text-2xl font-bold font-mono ${getColorClass(metrics.annualizedReturn)}`}>
                {formatPercent(metrics.annualizedReturn)}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">最大回撤</p>
              <p className="text-2xl font-bold font-mono text-down">
                -{metrics.maxDrawdown.toFixed(2)}%
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">夏普比率</p>
              <p className="text-2xl font-bold font-mono text-text-primary">
                {metrics.sharpeRatio.toFixed(2)}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">持仓数量</p>
              <p className="text-2xl font-bold font-mono text-text-primary">
                {holdings.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
