export type StockStyle = 'value' | 'growth' | 'dividend' | 'cyclical' | 'defensive';

export interface Stock {
  code: string;
  name: string;
  industry: string;
  style: StockStyle;
  currentPrice: number;
  lastUpdated: string;
  priceChange?: number;
  priceChangePercent?: number;
}

export interface Holding {
  id: string;
  stockCode: string;
  quantity: number;
  avgCost: number;
  buyDate: string;
  notes?: string;
}

export interface Fundamental {
  id: string;
  stockCode: string;
  period: string;
  pe: number;
  pb: number;
  roe: number;
  grossMargin: number;
  netMargin: number;
  revenue: number;
  netProfit: number;
}

export interface DCFValuation {
  id: string;
  stockCode: string;
  fcf: number;
  growthRate: number;
  discountRate: number;
  terminalRate: number;
  intrinsicValue: number;
  marginOfSafety: number;
  createdAt: string;
  sharesOutstanding?: number;
}

export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  stockCode: string;
  type: TransactionType;
  date: string;
  price: number;
  quantity: number;
  fee: number;
  decisionReason?: string;
  review?: string;
  createdAt: string;
}

export interface Performance {
  id: string;
  date: string;
  totalValue: number;
  benchmarkValue: number;
  cash: number;
}

export interface HoldingMetrics {
  marketValue: number;
  costValue: number;
  profitLoss: number;
  profitLossRate: number;
  proportion: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossRate: number;
  dailyChange: number;
  dailyChangeRate: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface IndustryAllocation {
  industry: string;
  value: number;
  proportion: number;
}

export interface StyleAllocation {
  styleType: StockStyle;
  value: number;
  proportion: number;
}

export interface DCFResult {
  intrinsicValue: number;
  marginOfSafety: number;
  cashFlowProjections: number[];
  terminalValue: number;
}

export interface SensitivityData {
  growthRate: number;
  discountRate: number;
  intrinsicValue: number;
  marginOfSafety: number;
}

export interface RiskMetrics {
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
}

export const industryColors: Record<string, string> = {
  '白酒': '#F59E0B',
  '新能源': '#10B981',
  '半导体': '#3B82F6',
  '医药': '#EC4899',
  '银行': '#8B5CF6',
  '房地产': '#F97316',
  '互联网': '#06B6D4',
  '消费': '#84CC16',
  '汽车': '#6366F1',
  '金融': '#14B8A6',
  '制造': '#78716C',
  '能源': '#DC2626',
  '原材料': '#A855F7',
  '其他': '#6B7280',
};

export const styleColors: Record<StockStyle, string> = {
  value: '#3B82F6',
  growth: '#10B981',
  dividend: '#F59E0B',
  cyclical: '#F97316',
  defensive: '#8B5CF6',
};

export const styleLabels: Record<StockStyle, string> = {
  value: '价值',
  growth: '成长',
  dividend: '红利',
  cyclical: '周期',
  defensive: '防御',
};
