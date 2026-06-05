import type { Holding, Stock, HoldingMetrics, PortfolioMetrics, IndustryAllocation, StyleAllocation } from '../types';

export function calculateHoldingMetrics(
  holding: Holding,
  stock: Stock | undefined,
  totalMarketValue: number
): HoldingMetrics {
  const currentPrice = stock?.currentPrice || holding.avgCost;
  const marketValue = currentPrice * holding.quantity;
  const costValue = holding.avgCost * holding.quantity;
  const profitLoss = marketValue - costValue;
  const profitLossRate = costValue > 0 ? (profitLoss / costValue) * 100 : 0;
  const proportion = totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0;

  return {
    marketValue,
    costValue,
    profitLoss,
    profitLossRate,
    proportion,
  };
}

export function calculateTotalMarketValue(
  holdings: Holding[],
  stocks: Map<string, Stock>
): number {
  return holdings.reduce((total, holding) => {
    const stock = stocks.get(holding.stockCode);
    const price = stock?.currentPrice || holding.avgCost;
    return total + price * holding.quantity;
  }, 0);
}

export function calculateTotalCost(holdings: Holding[]): number {
  return holdings.reduce((total, holding) => {
    return total + holding.avgCost * holding.quantity;
  }, 0);
}

export function calculatePortfolioMetrics(
  holdings: Holding[],
  stocks: Map<string, Stock>,
  previousTotalValue: number,
  performances: { date: string; totalValue: number }[],
  riskFreeRate: number = 0.03
): PortfolioMetrics {
  const totalValue = calculateTotalMarketValue(holdings, stocks);
  const totalCost = calculateTotalCost(holdings);
  const totalProfitLoss = totalValue - totalCost;
  const totalProfitLossRate = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
  
  const dailyChange = totalValue - previousTotalValue;
  const dailyChangeRate = previousTotalValue > 0 ? (dailyChange / previousTotalValue) * 100 : 0;

  const { annualizedReturn, maxDrawdown, sharpeRatio } = calculateRiskMetrics(performances, riskFreeRate);

  return {
    totalValue,
    totalCost,
    totalProfitLoss,
    totalProfitLossRate,
    dailyChange,
    dailyChangeRate,
    annualizedReturn,
    maxDrawdown,
    sharpeRatio,
  };
}

export function calculateIndustryAllocation(
  holdings: Holding[],
  stocks: Map<string, Stock>
): IndustryAllocation[] {
  const industryMap = new Map<string, number>();
  const totalValue = calculateTotalMarketValue(holdings, stocks);

  holdings.forEach((holding) => {
    const stock = stocks.get(holding.stockCode);
    if (stock) {
      const marketValue = stock.currentPrice * holding.quantity;
      const current = industryMap.get(stock.industry) || 0;
      industryMap.set(stock.industry, current + marketValue);
    }
  });

  return Array.from(industryMap.entries())
    .map(([industry, value]) => ({
      industry,
      value,
      proportion: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateStyleAllocation(
  holdings: Holding[],
  stocks: Map<string, Stock>
): StyleAllocation[] {
  const styleMap = new Map<string, number>();
  const totalValue = calculateTotalMarketValue(holdings, stocks);

  holdings.forEach((holding) => {
    const stock = stocks.get(holding.stockCode);
    if (stock) {
      const marketValue = stock.currentPrice * holding.quantity;
      const current = styleMap.get(stock.style) || 0;
      styleMap.set(stock.style, current + marketValue);
    }
  });

  return Array.from(styleMap.entries())
    .map(([style, value]) => ({
      styleType: style as any,
      value,
      proportion: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateRiskMetrics(
  performances: { date: string; totalValue: number }[],
  riskFreeRate: number = 0.03
) {
  if (performances.length < 2) {
    return {
      annualizedReturn: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      volatility: 0,
    };
  }

  const sortedPerformances = [...performances].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const returns: number[] = [];
  for (let i = 1; i < sortedPerformances.length; i++) {
    const ret = (sortedPerformances[i].totalValue - sortedPerformances[i - 1].totalValue) / 
                sortedPerformances[i - 1].totalValue;
    returns.push(ret);
  }

  const firstValue = sortedPerformances[0].totalValue;
  const lastValue = sortedPerformances[sortedPerformances.length - 1].totalValue;
  const days = (new Date(sortedPerformances[sortedPerformances.length - 1].date).getTime() - 
                new Date(sortedPerformances[0].date).getTime()) / (1000 * 60 * 60 * 24);
  
  const annualizedReturn = days > 0 ? (Math.pow(lastValue / firstValue, 365 / days) - 1) * 100 : 0;

  let maxDD = 0;
  let peak = sortedPerformances[0].totalValue;
  for (const perf of sortedPerformances) {
    if (perf.totalValue > peak) peak = perf.totalValue;
    const dd = (peak - perf.totalValue) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  const maxDrawdown = maxDD * 100;

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const annualizedStd = stdDev * Math.sqrt(252);
  const annualizedReturnDecimal = annualizedReturn / 100;
  const sharpeRatio = annualizedStd > 0 ? (annualizedReturnDecimal - riskFreeRate) / annualizedStd : 0;

  return {
    annualizedReturn,
    maxDrawdown,
    sharpeRatio,
    volatility: annualizedStd * 100,
  };
}

export function formatCurrency(value: number, decimals: number = 2): string {
  if (Math.abs(value) >= 100000000) {
    return `${(value / 100000000).toFixed(decimals)}亿`;
  } else if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(decimals)}万`;
  }
  return value.toFixed(decimals);
}

export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function getColorClass(value: number): string {
  if (value > 0) return 'text-up';
  if (value < 0) return 'text-down';
  return 'text-text-secondary';
}
