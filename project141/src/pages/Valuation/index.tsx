import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, ShieldAlert, Save, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { calculateDCF, calculateSensitivityMatrix, getSafetyMarginColor, getSafetyMarginLabel } from '../../utils/dcf';
import { formatCurrency, formatPercent, formatNumber, getColorClass } from '../../utils/calculations';
import type { DCFResult, SensitivityData } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function Valuation() {
  const { stocks, getFundamentalsByStock, getDCFValuationsByStock, addDCFValuation } = usePortfolioStore();

  const [selectedStockCode, setSelectedStockCode] = useState<string>(stocks[0]?.code || '');
  const [fcf, setFcf] = useState<string>('60000000000');
  const [growthRate, setGrowthRate] = useState<string>('10');
  const [discountRate, setDiscountRate] = useState<string>('9');
  const [terminalRate, setTerminalRate] = useState<string>('2.5');
  const [notes, setNotes] = useState<string>('');
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  const selectedStock = useMemo(() => {
    return stocks.find(s => s.code === selectedStockCode);
  }, [stocks, selectedStockCode]);

  const fundamentals = useMemo(() => {
    return getFundamentalsByStock(selectedStockCode);
  }, [getFundamentalsByStock, selectedStockCode]);

  const historicalValuations = useMemo(() => {
    return getDCFValuationsByStock(selectedStockCode);
  }, [getDCFValuationsByStock, selectedStockCode]);

  const dcfResult: DCFResult = useMemo(() => {
    const fcfNum = parseFloat(fcf) || 0;
    const growthNum = parseFloat(growthRate) || 0;
    const discountNum = parseFloat(discountRate) || 0;
    const terminalNum = parseFloat(terminalRate) || 0;
    const currentPrice = selectedStock?.currentPrice || 0;

    return calculateDCF(fcfNum, growthNum, discountNum, terminalNum, currentPrice);
  }, [fcf, growthRate, discountRate, terminalRate, selectedStock]);

  const sensitivityMatrix: SensitivityData[][] = useMemo(() => {
    const fcfNum = parseFloat(fcf) || 0;
    const currentPrice = selectedStock?.currentPrice || 0;
    const terminalNum = parseFloat(terminalRate) || 2;

    return calculateSensitivityMatrix(fcfNum, currentPrice, terminalNum);
  }, [fcf, selectedStock, terminalRate]);

  const chartData = useMemo(() => {
    return [...fundamentals].reverse().map(f => ({
      period: f.period,
      PE: f.pe,
      PB: f.pb,
      ROE: f.roe,
      毛利率: f.grossMargin,
      净利率: f.netMargin,
    }));
  }, [fundamentals]);

  const growthRates = [-5, 0, 5, 10, 15, 20];
  const discountRates = [6, 8, 10, 12, 14, 16];

  const handleStockChange = (code: string) => {
    setSelectedStockCode(code);
    const valuations = getDCFValuationsByStock(code);
    if (valuations.length > 0) {
      const latest = valuations[0];
      setFcf(latest.fcf.toString());
      setGrowthRate(latest.growthRate.toString());
      setDiscountRate(latest.discountRate.toString());
      setTerminalRate(latest.terminalRate.toString());
    }
  };

  const handleSaveValuation = () => {
    if (!selectedStockCode) return;

    addDCFValuation({
      stockCode: selectedStockCode,
      fcf: parseFloat(fcf) || 0,
      growthRate: parseFloat(growthRate) || 0,
      discountRate: parseFloat(discountRate) || 0,
      terminalRate: parseFloat(terminalRate) || 0,
      intrinsicValue: dcfResult.intrinsicValue,
      marginOfSafety: dcfResult.marginOfSafety,
    });

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const getHeatmapColor = (margin: number): string => {
    if (margin >= 50) return 'bg-emerald-600';
    if (margin >= 30) return 'bg-emerald-500';
    if (margin >= 10) return 'bg-yellow-500';
    if (margin >= 0) return 'bg-orange-500';
    if (margin >= -20) return 'bg-red-500';
    return 'bg-red-700';
  };

  const getHeatmapTextColor = (margin: number): string => {
    return margin >= 10 ? 'text-white' : 'text-white';
  };

  const safetyMarginPercent = Math.max(0, Math.min(100, dcfResult.marginOfSafety));

  return (
    <div className="space-y-8">
      <PageHeader
        title="估值分析"
        description="通过基本面数据和DCF模型，深入分析股票的内在价值和安全边际"
        actions={
          <div className="w-64">
            <Select
              label="选择股票"
              value={selectedStockCode}
              onChange={(e) => handleStockChange(e.target.value)}
            >
              {stocks.map(stock => (
                <option key={stock.code} value={stock.code}>
                  {stock.name} ({stock.code})
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {selectedStock && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface rounded-xl border border-border p-4 card-hover">
            <p className="text-text-muted text-sm mb-1">当前价格</p>
            <p className="text-2xl font-bold font-mono text-text-primary">
              ¥{formatNumber(selectedStock.currentPrice)}
            </p>
            <p className={`text-sm font-mono ${getColorClass(selectedStock.priceChangePercent || 0)}`}>
              {formatPercent(selectedStock.priceChangePercent || 0)}
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 card-hover">
            <p className="text-text-muted text-sm mb-1">内在价值</p>
            <p className="text-2xl font-bold font-mono text-primary">
              ¥{formatNumber(dcfResult.intrinsicValue)}
            </p>
            <p className="text-sm text-text-muted">
              DCF模型计算
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 card-hover">
            <p className="text-text-muted text-sm mb-1">安全边际</p>
            <p className={`text-2xl font-bold font-mono ${dcfResult.marginOfSafety >= 0 ? 'text-up' : 'text-down'}`}>
              {formatPercent(dcfResult.marginOfSafety)}
            </p>
            <p className="text-sm text-text-muted">
              {getSafetyMarginLabel(dcfResult.marginOfSafety)}
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 card-hover">
            <p className="text-text-muted text-sm mb-1">建议操作</p>
            <p className={`text-2xl font-bold ${
              dcfResult.marginOfSafety >= 30 ? 'text-up' :
              dcfResult.marginOfSafety >= 10 ? 'text-yellow-500' :
              'text-down'
            }`}>
              {dcfResult.marginOfSafety >= 30 ? '买入' :
               dcfResult.marginOfSafety >= 10 ? '持有' :
               dcfResult.marginOfSafety >= 0 ? '观望' : '卖出'}
            </p>
            <p className="text-sm text-text-muted">
              基于安全边际
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">基本面指标趋势</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="period" 
                  stroke="#64748B" 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748B" 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC' }}
                />
                <Legend />
                <Line type="monotone" dataKey="PE" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="PB" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ROE" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="毛利率" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="净利率" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">历史基本面数据</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-zebra">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="pb-3 font-medium">报告期</th>
                  <th className="pb-3 font-medium">PE</th>
                  <th className="pb-3 font-medium">PB</th>
                  <th className="pb-3 font-medium">ROE</th>
                  <th className="pb-3 font-medium">毛利率</th>
                  <th className="pb-3 font-medium">净利率</th>
                </tr>
              </thead>
              <tbody>
                {fundamentals.map((f) => (
                  <tr key={f.id} className="border-b border-border/50">
                    <td className="py-3 font-mono text-text-primary">{f.period}</td>
                    <td className="py-3 font-mono text-text-primary">{f.pe.toFixed(2)}</td>
                    <td className="py-3 font-mono text-text-primary">{f.pb.toFixed(2)}</td>
                    <td className="py-3 font-mono">{formatPercent(f.roe)}</td>
                    <td className="py-3 font-mono">{formatPercent(f.grossMargin)}</td>
                    <td className="py-3 font-mono">{formatPercent(f.netMargin)}</td>
                  </tr>
                ))}
                {fundamentals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted">
                      暂无基本面数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-text-primary">DCF 估值模型</h3>
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={handleSaveValuation}
              icon={<Save className="w-4 h-4" />}
            >
              {showSaveSuccess ? '已保存 ✓' : '保存估值'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Input
              label="自由现金流 (FCF)"
              type="number"
              value={fcf}
              onChange={(e) => setFcf(e.target.value)}
              placeholder="60000000000"
            />
            <Input
              label="年增长率 (%)"
              type="number"
              step="0.1"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              placeholder="10"
            />
            <Input
              label="折现率 (%)"
              type="number"
              step="0.1"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              placeholder="9"
            />
            <Input
              label="永续增长率 (%)"
              type="number"
              step="0.1"
              value={terminalRate}
              onChange={(e) => setTerminalRate(e.target.value)}
              placeholder="2.5"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-hover rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">10年现金流现值</p>
              <p className="text-xl font-bold font-mono text-text-primary">
                {formatCurrency(dcfResult.cashFlowProjections.reduce((a, b) => a + b, 0))}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">终值现值</p>
              <p className="text-xl font-bold font-mono text-text-primary">
                {formatCurrency(dcfResult.terminalValue)}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">内在价值</p>
              <p className="text-xl font-bold font-mono text-primary">
                ¥{formatNumber(dcfResult.intrinsicValue)}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">安全边际</p>
              <p className={`text-xl font-bold font-mono ${dcfResult.marginOfSafety >= 0 ? 'text-up' : 'text-down'}`}>
                {formatPercent(dcfResult.marginOfSafety)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-text-primary">安全边际分析</h4>
            </div>
            <div className="relative">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">当前价格</span>
                <span className="text-text-muted">内在价值</span>
              </div>
              <div className="h-4 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full progress-animate ${getSafetyMarginColor(dcfResult.marginOfSafety)}`}
                  style={{ width: `${safetyMarginPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="font-mono text-down">¥{formatNumber(selectedStock?.currentPrice || 0)}</span>
                <span className={`font-mono ${getSafetyMarginColor(dcfResult.marginOfSafety).includes('text-white') ? 'text-white' : 'text-black'} px-2 py-0.5 rounded ${getSafetyMarginColor(dcfResult.marginOfSafety).split(' ')[0]}`}>
                  {getSafetyMarginLabel(dcfResult.marginOfSafety)}
                </span>
                <span className="font-mono text-up">¥{formatNumber(dcfResult.intrinsicValue)}</span>
              </div>
              <div className="mt-4 p-4 bg-surface-hover rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-text-muted mt-0.5" />
                  <div className="text-sm text-text-muted">
                    <p>安全边际 = (内在价值 - 当前价格) / 内在价值 × 100%</p>
                    <p className="mt-1">
                      {dcfResult.marginOfSafety >= 30 
                        ? '当前价格显著低于内在价值，具有较高的安全边际，适合买入。'
                        : dcfResult.marginOfSafety >= 10
                        ? '当前价格略低于内在价值，安全边际一般，可继续持有。'
                        : dcfResult.marginOfSafety >= 0
                        ? '当前价格接近内在价值，安全边际不足，建议观望。'
                        : '当前价格已高于内在价值，存在高估风险，建议卖出。'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <textarea
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              rows={3}
              placeholder="输入估值备注..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 card-hover">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">历史估值记录</h3>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {historicalValuations.map((val) => (
              <div key={val.id} className="p-4 bg-surface-hover rounded-lg border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-text-muted">
                    {new Date(val.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  <span className={`text-sm font-mono px-2 py-0.5 rounded ${getSafetyMarginColor(val.marginOfSafety)}`}>
                    {getSafetyMarginLabel(val.marginOfSafety)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-text-muted">内在价值</p>
                    <p className="font-mono text-text-primary">¥{formatNumber(val.intrinsicValue)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">安全边际</p>
                    <p className={`font-mono ${val.marginOfSafety >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatPercent(val.marginOfSafety)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">增长率</p>
                    <p className="font-mono text-text-primary">{val.growthRate}%</p>
                  </div>
                  <div>
                    <p className="text-text-muted">折现率</p>
                    <p className="font-mono text-text-primary">{val.discountRate}%</p>
                  </div>
                </div>
              </div>
            ))}
            {historicalValuations.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                暂无历史估值记录
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 card-hover">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">敏感性分析 - 安全边际矩阵 (%)</h3>
        </div>
        <p className="text-text-muted text-sm mb-6">
          不同增长率和折现率组合下的安全边际，颜色越绿表示安全边际越高，越红表示安全边际越低
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left text-text-muted font-medium bg-surface-hover rounded-tl-lg">
                  增长率 \ 折现率
                </th>
                {discountRates.map((dr) => (
                  <th key={dr} className="p-3 text-center text-text-muted font-medium bg-surface-hover">
                    {dr}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {growthRates.map((gr, rowIndex) => (
                <tr key={gr}>
                  <td className="p-3 text-text-muted font-medium bg-surface-hover">
                    {gr}%
                  </td>
                  {sensitivityMatrix[rowIndex]?.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-3 text-center font-mono font-medium transition-all duration-200 hover:scale-105 cursor-default ${getHeatmapColor(cell.marginOfSafety)} ${getHeatmapTextColor(cell.marginOfSafety)}`}
                      title={`增长率: ${gr}%, 折现率: ${discountRates[colIndex]}%\n内在价值: ¥${formatNumber(cell.intrinsicValue)}\n安全边际: ${formatPercent(cell.marginOfSafety)}`}
                    >
                      {cell.marginOfSafety >= 0 ? '+' : ''}{cell.marginOfSafety.toFixed(1)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-700" />
            <span className="text-sm text-text-muted">≤ -20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm text-text-muted">-20% ~ 0%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-sm text-text-muted">0% ~ 10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-sm text-text-muted">10% ~ 30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-sm text-text-muted">30% ~ 50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-600" />
            <span className="text-sm text-text-muted">≥ 50%</span>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 card-hover">
        <div className="flex items-center gap-2 mb-6">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">DCF 模型说明</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-text-muted">
          <div>
            <h4 className="font-semibold text-text-primary mb-2">计算公式</h4>
            <div className="space-y-2 font-mono bg-surface-hover p-4 rounded-lg">
              <p>内在价值 = Σ(FCFₙ / (1+r)ⁿ) + TV / (1+r)ⁿ</p>
              <p>TV = FCFₙ × (1+g) / (r - g)</p>
              <p className="text-xs mt-2">其中:</p>
              <p className="text-xs">FCFₙ = 第n年自由现金流</p>
              <p className="text-xs">r = 折现率</p>
              <p className="text-xs">g = 永续增长率</p>
              <p className="text-xs">TV = 终值</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-2">参数说明</h4>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-text-primary">自由现金流 (FCF)</p>
                <p className="text-xs">企业经营活动产生的现金流量，减去维持现有生产和扩大再生产所需的资本支出</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">年增长率</p>
                <p className="text-xs">预测期内（通常10年）自由现金流的年化增长率</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">折现率</p>
                <p className="text-xs">即加权平均资本成本(WACC)，反映投资的风险水平</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">永续增长率</p>
                <p className="text-xs">预测期后的长期稳定增长率，通常不超过GDP增长率</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
