import type { Stock, Holding, Transaction, Fundamental, DCFValuation, Performance } from '../types';

export const mockStocks: Stock[] = [
  { code: '600519', name: '贵州茅台', industry: '白酒', style: 'value', currentPrice: 1688.50, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 25.30, priceChangePercent: 1.52 },
  { code: '300750', name: '宁德时代', industry: '新能源', style: 'growth', currentPrice: 186.80, lastUpdated: '2024-01-15T10:30:00Z', priceChange: -3.20, priceChangePercent: -1.68 },
  { code: '002594', name: '比亚迪', industry: '汽车', style: 'growth', currentPrice: 265.30, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 8.50, priceChangePercent: 3.31 },
  { code: '601318', name: '中国平安', industry: '金融', style: 'value', currentPrice: 48.65, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 0.85, priceChangePercent: 1.78 },
  { code: '000858', name: '五粮液', industry: '白酒', style: 'value', currentPrice: 162.40, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 2.10, priceChangePercent: 1.31 },
  { code: '600036', name: '招商银行', industry: '银行', style: 'dividend', currentPrice: 35.20, lastUpdated: '2024-01-15T10:30:00Z', priceChange: -0.40, priceChangePercent: -1.12 },
  { code: '002415', name: '海康威视', industry: '制造', style: 'value', currentPrice: 38.90, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 0.60, priceChangePercent: 1.56 },
  { code: '600900', name: '长江电力', industry: '能源', style: 'dividend', currentPrice: 28.75, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 0.25, priceChangePercent: 0.88 },
  { code: '300059', name: '东方财富', industry: '金融', style: 'growth', currentPrice: 21.45, lastUpdated: '2024-01-15T10:30:00Z', priceChange: -0.55, priceChangePercent: -2.50 },
  { code: '601899', name: '紫金矿业', industry: '原材料', style: 'cyclical', currentPrice: 15.80, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 0.30, priceChangePercent: 1.94 },
  { code: '000001', name: '平安银行', industry: '银行', style: 'dividend', currentPrice: 12.35, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 0.15, priceChangePercent: 1.23 },
  { code: '600276', name: '恒瑞医药', industry: '医药', style: 'defensive', currentPrice: 45.60, lastUpdated: '2024-01-15T10:30:00Z', priceChange: -1.20, priceChangePercent: -2.56 },
  { code: '000333', name: '美的集团', industry: '消费', style: 'value', currentPrice: 58.90, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 0.80, priceChangePercent: 1.38 },
  { code: '002304', name: '洋河股份', industry: '白酒', style: 'value', currentPrice: 128.50, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 1.80, priceChangePercent: 1.42 },
  { code: '300760', name: '迈瑞医疗', industry: '医药', style: 'growth', currentPrice: 325.80, lastUpdated: '2024-01-15T10:30:00Z', priceChange: 5.20, priceChangePercent: 1.62 },
];

export const mockHoldings: Holding[] = [
  { id: 'h1', stockCode: '600519', quantity: 100, avgCost: 1620.00, buyDate: '2023-06-15', notes: '核心持仓，长期持有' },
  { id: 'h2', stockCode: '300750', quantity: 500, avgCost: 205.50, buyDate: '2023-08-20', notes: '新能源龙头' },
  { id: 'h3', stockCode: '002594', quantity: 300, avgCost: 248.00, buyDate: '2023-09-10' },
  { id: 'h4', stockCode: '601318', quantity: 2000, avgCost: 45.20, buyDate: '2023-04-05', notes: '低估金融股' },
  { id: 'h5', stockCode: '000858', quantity: 400, avgCost: 155.00, buyDate: '2023-07-12' },
  { id: 'h6', stockCode: '600036', quantity: 3000, avgCost: 32.80, buyDate: '2023-03-15', notes: '银行龙头' },
  { id: 'h7', stockCode: '002415', quantity: 1500, avgCost: 35.60, buyDate: '2023-10-08' },
  { id: 'h8', stockCode: '600900', quantity: 2000, avgCost: 26.50, buyDate: '2023-02-20', notes: '稳定现金流' },
  { id: 'h9', stockCode: '601899', quantity: 5000, avgCost: 14.20, buyDate: '2023-11-15' },
  { id: 'h10', stockCode: '000333', quantity: 800, avgCost: 54.30, buyDate: '2023-05-30' },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', stockCode: '600519', type: 'BUY', date: '2023-06-15', price: 1620.00, quantity: 100, fee: 5.00, decisionReason: '茅台估值合理，作为核心资产配置', createdAt: '2023-06-15T09:30:00Z', review: '买入后震荡整理，长期逻辑不变' },
  { id: 't2', stockCode: '300750', type: 'BUY', date: '2023-08-20', price: 205.50, quantity: 500, fee: 8.00, decisionReason: '新能源赛道回调，宁德时代龙头地位稳固', createdAt: '2023-08-20T10:15:00Z', review: '短期波动较大，需要耐心持有' },
  { id: 't3', stockCode: '002594', type: 'BUY', date: '2023-09-10', price: 248.00, quantity: 300, fee: 6.50, decisionReason: '比亚迪销量超预期，新能源汽车龙头', createdAt: '2023-09-10T14:20:00Z' },
  { id: 't4', stockCode: '601318', type: 'BUY', date: '2023-04-05', price: 45.20, quantity: 1000, fee: 3.20, decisionReason: '中国平安PEV低估，保险行业复苏预期', createdAt: '2023-04-05T11:00:00Z' },
  { id: 't5', stockCode: '601318', type: 'BUY', date: '2023-06-01', price: 42.50, quantity: 1000, fee: 3.00, decisionReason: '继续加仓，摊低成本', createdAt: '2023-06-01T10:30:00Z', review: '加仓时机较好，目前已有浮盈' },
  { id: 't6', stockCode: '000858', type: 'BUY', date: '2023-07-12', price: 155.00, quantity: 400, fee: 4.50, decisionReason: '白酒板块调整，五粮液估值有吸引力', createdAt: '2023-07-12T09:45:00Z' },
  { id: 't7', stockCode: '600036', type: 'BUY', date: '2023-03-15', price: 32.80, quantity: 3000, fee: 7.00, decisionReason: '招商银行是零售银行龙头，股息率高', createdAt: '2023-03-15T13:50:00Z', review: '持有期间分红两次，收益稳定' },
  { id: 't8', stockCode: '002415', type: 'BUY', date: '2023-10-08', price: 35.60, quantity: 1500, fee: 4.80, decisionReason: 'AI安防龙头，海康威视海外业务恢复', createdAt: '2023-10-08T10:20:00Z' },
  { id: 't9', stockCode: '600900', type: 'BUY', date: '2023-02-20', price: 26.50, quantity: 2000, fee: 3.80, decisionReason: '长江电力现金流稳定，防御性配置', createdAt: '2023-02-20T09:30:00Z', review: '防御性资产表现稳健' },
  { id: 't10', stockCode: '601899', type: 'BUY', date: '2023-11-15', price: 14.20, quantity: 5000, fee: 5.20, decisionReason: '铜价上涨预期，紫金矿业产能扩张', createdAt: '2023-11-15T11:40:00Z' },
  { id: 't11', stockCode: '000333', type: 'BUY', date: '2023-05-30', price: 54.30, quantity: 800, fee: 3.50, decisionReason: '美的集团家电龙头，估值合理', createdAt: '2023-05-30T14:10:00Z' },
  { id: 't12', stockCode: '000001', type: 'SELL', date: '2023-09-25', price: 13.20, quantity: 2000, fee: 2.50, decisionReason: '平安银行涨幅达到目标，止盈部分仓位', createdAt: '2023-09-25T10:50:00Z', review: '止盈正确，后续确实回调了' },
  { id: 't13', stockCode: '600276', type: 'SELL', date: '2023-12-10', price: 48.50, quantity: 500, fee: 2.00, decisionReason: '恒瑞医药反腐影响超预期，止损', createdAt: '2023-12-10T09:35:00Z', review: '止损及时，避免了更大损失' },
];

export const mockFundamentals: Fundamental[] = [
  { id: 'f1', stockCode: '600519', period: '2023Q3', pe: 32.5, pb: 10.2, roe: 28.5, grossMargin: 91.8, netMargin: 53.2, revenue: 103200000000, netProfit: 55800000000 },
  { id: 'f2', stockCode: '600519', period: '2023Q2', pe: 31.8, pb: 9.8, roe: 27.8, grossMargin: 91.5, netMargin: 52.8, revenue: 96800000000, netProfit: 51800000000 },
  { id: 'f3', stockCode: '600519', period: '2023Q1', pe: 34.2, pb: 10.5, roe: 26.9, grossMargin: 91.2, netMargin: 52.5, revenue: 89200000000, netProfit: 47500000000 },
  { id: 'f4', stockCode: '600519', period: '2022Q4', pe: 30.5, pb: 9.2, roe: 29.2, grossMargin: 90.8, netMargin: 51.8, revenue: 124100000000, netProfit: 62700000000 },
  { id: 'f5', stockCode: '600519', period: '2022Q3', pe: 28.9, pb: 8.6, roe: 28.1, grossMargin: 90.5, netMargin: 51.2, revenue: 109500000000, netProfit: 56600000000 },
  { id: 'f6', stockCode: '300750', period: '2023Q3', pe: 25.8, pb: 4.8, roe: 18.2, grossMargin: 22.5, netMargin: 12.8, revenue: 294600000000, netProfit: 35800000000 },
  { id: 'f7', stockCode: '300750', period: '2023Q2', pe: 28.2, pb: 5.2, roe: 16.5, grossMargin: 21.8, netMargin: 11.5, revenue: 258200000000, netProfit: 28200000000 },
  { id: 'f8', stockCode: '300750', period: '2023Q1', pe: 32.5, pb: 5.8, roe: 14.8, grossMargin: 21.2, netMargin: 10.2, revenue: 214800000000, netProfit: 22100000000 },
  { id: 'f9', stockCode: '002594', period: '2023Q3', pe: 62.5, pb: 7.2, roe: 12.5, grossMargin: 18.2, netMargin: 4.8, revenue: 422300000000, netProfit: 20500000000 },
  { id: 'f10', stockCode: '002594', period: '2023Q2', pe: 75.8, pb: 8.5, roe: 10.8, grossMargin: 17.5, netMargin: 3.8, revenue: 352800000000, netProfit: 14500000000 },
  { id: 'f11', stockCode: '601318', period: '2023Q3', pe: 7.8, pb: 0.85, roe: 10.2, grossMargin: 35.2, netMargin: 12.5, revenue: 960200000000, netProfit: 86500000000 },
  { id: 'f12', stockCode: '601318', period: '2023Q2', pe: 8.2, pb: 0.88, roe: 9.8, grossMargin: 34.8, netMargin: 11.8, revenue: 923500000000, netProfit: 75200000000 },
];

export const mockDCFValuations: DCFValuation[] = [
  { id: 'd1', stockCode: '600519', fcf: 60000000000, growthRate: 10, discountRate: 9, terminalRate: 2.5, intrinsicValue: 2200, marginOfSafety: 23.25, createdAt: '2024-01-10T15:30:00Z', sharesOutstanding: 1256000000 },
  { id: 'd2', stockCode: '300750', fcf: 35000000000, growthRate: 15, discountRate: 11, terminalRate: 2, intrinsicValue: 258, marginOfSafety: 27.6, createdAt: '2024-01-08T14:20:00Z', sharesOutstanding: 2440000000 },
  { id: 'd3', stockCode: '002594', fcf: 18000000000, growthRate: 12, discountRate: 10, terminalRate: 2, intrinsicValue: 320, marginOfSafety: 17.1, createdAt: '2024-01-12T11:45:00Z', sharesOutstanding: 2911000000 },
  { id: 'd4', stockCode: '601318', fcf: 120000000000, growthRate: 5, discountRate: 8, terminalRate: 1.5, intrinsicValue: 72, marginOfSafety: 32.4, createdAt: '2024-01-05T09:30:00Z', sharesOutstanding: 18280000000 },
];

export function generateMockPerformances(): Performance[] {
  const performances: Performance[] = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  let totalValue = 5000000;
  let benchmarkValue = 3500;
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    
    const valueChange = (Math.random() - 0.48) * 0.02;
    const benchmarkChange = (Math.random() - 0.5) * 0.015;
    
    totalValue = totalValue * (1 + valueChange);
    benchmarkValue = benchmarkValue * (1 + benchmarkChange);
    
    performances.push({
      id: `p${d.getTime()}`,
      date: d.toISOString().split('T')[0],
      totalValue: Math.round(totalValue),
      benchmarkValue: Math.round(benchmarkValue * 100) / 100,
      cash: 250000,
    });
  }
  
  return performances;
}

export const mockPerformances = generateMockPerformances();

export const stockMap = new Map<string, Stock>(
  mockStocks.map(stock => [stock.code, stock])
);
