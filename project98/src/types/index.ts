export interface InvestmentNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: 'value' | 'growth' | 'quant';
  created_at: string;
  updated_at: string;
}

export interface BookNote {
  id: string;
  user_id: string;
  book_title: string;
  notes: string;
  quotes: string;
  status: 'reading' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface MasterResearch {
  id: string;
  user_id: string;
  master_name: string;
  analysis: string;
  strategies: string;
  created_at: string;
  updated_at: string;
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  logic: string;
  stock_selection: string;
  timing: string;
  position_management: string;
  created_at: string;
  updated_at: string;
}

export interface BacktestRecord {
  id: string;
  user_id: string;
  strategy_id: string;
  strategy_name?: string;
  start_date: string;
  end_date: string;
  return_rate: number;
  max_drawdown: number;
  notes: string;
  created_at: string;
}

export interface TradeRecord {
  id: string;
  user_id: string;
  stock_code: string;
  stock_name: string;
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  reason: string;
  logic: string;
  trade_time: string;
  created_at: string;
}

export interface PositionTrack {
  id: string;
  user_id: string;
  stock_code: string;
  stock_name: string;
  current_price: number;
  valuation: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewRecord {
  id: string;
  user_id: string;
  stock_code: string;
  stock_name: string;
  success: boolean;
  analysis: string;
  lessons_learned: string;
  created_at: string;
}

export interface EmotionRecord {
  id: string;
  user_id: string;
  emotion: 'fear' | 'greed' | 'calm';
  context: string;
  impact: string;
  created_at: string;
}

export interface BiasRecognition {
  id: string;
  user_id: string;
  bias_type: 'confirmation' | 'anchoring' | 'overconfidence' | 'loss_aversion' | 'herding';
  description: string;
  awareness: string;
  created_at: string;
}

export interface InvestmentPhilosophy {
  id: string;
  user_id: string;
  content: string;
  quarter: string;
  created_at: string;
}

export interface DashboardStats {
  totalNotes: number;
  totalStrategies: number;
  totalTrades: number;
  totalEmotions: number;
}
