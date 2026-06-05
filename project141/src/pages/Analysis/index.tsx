import { useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { AlertTriangle, TrendingUp, Award, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { calculateIndustryAllocation, calculateStyleAllocation, calculateRiskMetrics, formatCurrency, formatPercent, getColorClass } from '../../utils/calculations';
import { industryColors, styleColors, styleLabels } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';

export default function Analysis() {
  const { holdings, performances, stocks, getStockMap, getHoldingsWithMetrics, initializeWithMockData } = usePortfolioStore();

  useEffect(() => {
    if (holdings.length === 0) {
      initializeWithMockData();
    }
  }, [holdings.length, initializeWithMockData]);

  const stockMap = useMemo(() => getStockMap(), [stocks, getStockMap]);
  const holdingsWithMetrics = useMemo(() => getHoldingsWithMetrics(), [holdings, stocks, getHoldingsWithMetrics]);

  const industryAllocation = useMemo(
    () => calculateIndustryAllocation(holdings, stockMap),
    [holdings, stockMap]
  );

  const styleAllocation = useMemo(
    () => calculateStyleAllocation(holdings, stockMap),
    [holdings, stockMap]
  );

  const riskMetrics = useMemo(
    () => calculateRiskMetrics(performances),
    [performances]
  );

  const concentrationData = useMemo(() => {
    return holdingsWithMetrics.slice(0, 10).map((h, index) => ({
      name: h.stock?.name || h.stockCode,
      proportion: h.metrics.proportion,
      risk: h.metrics.proportion > 15 ? 'high' : h.metrics.proportion > 10 ? 'medium' : 'low',
    }));
  }, [holdingsWithMetrics]);

  const performanceComparison = useMemo(() => {
    if (performances.length === 0) return [];
    
    const startValue = performances[0].totalValue;
    const startBenchmark = performances[0].benchmarkValue;
    
    return performances.slice(-90).map((p, index) => {
      const portfolioReturn = ((p.totalValue - startValue) / startValue) * 100;
      const benchmarkReturn = ((p.benchmarkValue - startBenchmark) / startBenchmark) * 100;
      const excessReturn = portfolioReturn - benchmarkReturn;
      
      return {
        date: p.date.slice(5),
        组合收益: Number(portfolioReturn.toFixed(2)),
        沪深300: Number(benchmarkReturn.toFixed(2)),
        超额收益: Number(excessReturn.toFixed(2)),
      };
    });
  }, [performances]);

  const rollingReturns = useMemo(() => {
    if (performances.length < 30) return [];
    
    const data = [];
    for (let i = 30; i < performances.length; i++) {
      const startValue = performances[i - 30].totalValue;
      const endValue = performances[i].totalValue;
      const ret = ((endValue - startValue) / startValue) * 100;
      
      data.push({
        date: performances[i].date.slice(5),
        '30日滚动': Number(ret.toFixed(2)),
      });
    }
    return data;
  }, [performances]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-down';
      case 'medium': return 'bg-accent';
      default: return 'bg-up';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return '偏高';
      case 'medium': return '适中';
      default: return '分散';
    }
  };

  const herfindahlIndex = useMemo(() => {
    const proportions = holdingsWithMetrics.map(h => h.metrics.proportion / 100);
    return proportions.reduce((sum, p) => sum + p * p, 0);
  }, [holdingsWithMetrics]);

  const top3Concentration = useMemo(() => {
    return holdingsWithMetrics
      .slice(0, 3)
      .reduce((sum, h) => sum + h.metrics.proportion, 0);
  }, [holdingsWithMetrics]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="组合分析"
        description="深入分析您的投资组合集中度、风险收益特征"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="赫芬达尔指数"
          value={herfindahlIndex.toFixed(4)}
          icon={AlertTriangle}
          gradient="bg-gradient-to-br from-rose-500 to-rose-700"
        />
        <StatCard
          title="前3大重仓占比"
          value={formatPercent(top3Concentration)}
          icon={PieChartIcon}
          gradient="bg-gradient-to-br from-orange-500 to-orange-700"
        />
        <StatCard
          title="年化收益率"
          value={formatPercent(riskMetrics.annualizedReturn)}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
        <StatCard
          title="夏普比率"
          value={riskMetrics.sharpeRatio.toFixed(2)}
          icon={Award}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-surface-hover">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">个股集中度分析</h3>
              <p className="text-sm text-text-muted">前10大重仓股占比分布</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {concentrationData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <span className="w-6 text-center text-text-muted text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary text-sm font-medium truncate">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getRiskColor(item.risk)}`}>
                        {getRiskLabel(item.risk)}
                      </span>
                      <span className="font-mono text-sm text-text-primary">
                        {item.proportion.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-hover rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full progress-animate ${
                        item.risk === 'high' 
                          ? 'bg-gradient-to-r from-down to-red-400'
                          : item.risk === 'medium'
                          ? 'bg-gradient-to-r from-accent to-amber-400'
                          : 'bg-gradient-to-r from-up to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(item.proportion, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-surface-hover rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span className="text-text-secondary">
                {herfindahlIndex > 0.15 
                  ? '组合集中度较高，建议适当分散投资' 
                  : herfindahlIndex > 0.1
                  ? '组合集中度适中，注意控制单一标的风险'
                  : '组合分散度良好，风险控制较为合理'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-surface-hover">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">风险指标</h3>
              <p className="text-sm text-text-muted">组合风险收益特征</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-hover rounded-lg p-4">
                <p className="text-text-muted text-sm mb-1">年化收益率</p>
                <p className={`text-2xl font-bold font-mono ${getColorClass(riskMetrics.annualizedReturn)}`}>
                  {formatPercent(riskMetrics.annualizedReturn)}
                </p>
              </div>
              <div className="bg-surface-hover rounded-lg p-4">
                <p className="text-text-muted text-sm mb-1">年化波动率</p>
                <p className="text-2xl font-bold font-mono text-text-primary">
                  {riskMetrics.volatility.toFixed(2)}%
                </p>
              </div>
              <div className="bg-surface-hover rounded-lg p-4">
                <p className="text-text-muted text-sm mb-1">最大回撤</p>
                <p className="text-2xl font-bold font-mono text-down">
                  -{riskMetrics.maxDrawdown.toFixed(2)}%
                </p>
              </div>
              <div className="bg-surface-hover rounded-lg p-4">
                <p className="text-text-muted text-sm mb-1">夏普比率</p>
                <p className={`text-2xl font-bold font-mono ${
                  riskMetrics.sharpeRatio > 1 ? 'text-up' : 
                  riskMetrics.sharpeRatio > 0 ? 'text-accent' : 'text-down'
                }`}>
                  {riskMetrics.sharpeRatio.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-surface-hover rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">夏普比率评价</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  riskMetrics.sharpeRatio > 1.5 
                    ? 'bg-up/20 text-up'
                    : riskMetrics.sharpeRatio > 1
                    ? 'bg-accent/20 text-accent'
                    : riskMetrics.sharpeRatio > 0.5
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-down/20 text-down'
                }`}>
                  {riskMetrics.sharpeRatio > 1.5 
                    ? '优秀'
                    : riskMetrics.sharpeRatio > 1
                    ? '良好'
                    : riskMetrics.sharpeRatio > 0.5
                    ? '一般'
                    : '较差'}
                </span>
              </div>
              <p className="text-text-muted text-xs">
                夏普比率 &gt; 1 表示每承担1单位风险可获得超过1单位的超额收益
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-hover">
                <PieChartIcon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">行业分布</h3>
                <p className="text-sm text-text-muted">按市值权重</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
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
            
            <div className="space-y-2 overflow-y-auto max-h-56">
              {industryAllocation.map((item) => (
                <div key={item.industry} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: industryColors[item.industry] || '#6B7280' }}
                    />
                    <span className="text-text-secondary truncate">{item.industry}</span>
                  </div>
                  <span className="font-mono text-text-primary flex-shrink-0">
                    {item.proportion.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-hover">
                <PieChartIcon className="w-5 h-5 text-up" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">风格分布</h3>
                <p className="text-sm text-text-muted">按投资风格分类</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={styleAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {styleAllocation.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={styleColors[entry.styleType]}
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
            
            <div className="space-y-2 overflow-y-auto max-h-56">
              {styleAllocation.map((item) => (
                <div key={item.styleType} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: styleColors[item.styleType] }}
                    />
                    <span className="text-text-secondary">{styleLabels[item.styleType]}</span>
                  </div>
                  <span className="font-mono text-text-primary">
                    {item.proportion.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface-hover">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">收益对比</h3>
              <p className="text-sm text-text-muted">组合收益与沪深300指数对比（近90日）</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-text-secondary">组合收益</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-text-secondary">沪深300</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-up" />
              <span className="text-text-secondary">超额收益</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748B" 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
                interval={7}
              />
              <YAxis 
                stroke="#64748B" 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="组合收益"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="沪深300"
                stroke="#F59E0B"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="超额收益"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                opacity={0.8}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 card-hover">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-surface-hover">
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">30日滚动收益率</h3>
            <p className="text-sm text-text-muted">观察短期收益波动情况</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rollingReturns}>
              <defs>
                <linearGradient id="colorRolling" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748B" 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                interval={5}
              />
              <YAxis 
                stroke="#64748B" 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '30日滚动收益']}
              />
              <Area
                type="monotone"
                dataKey="30日滚动"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#colorRolling)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
