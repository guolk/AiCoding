import { create } from 'zustand';
import {
  InvestmentNote,
  BookNote,
  MasterResearch,
  Strategy,
  BacktestRecord,
  TradeRecord,
  PositionTrack,
  ReviewRecord,
  EmotionRecord,
  BiasRecognition,
  InvestmentPhilosophy,
  DashboardStats,
} from '../types';

interface AppState {
  investmentNotes: InvestmentNote[];
  bookNotes: BookNote[];
  masterResearch: MasterResearch[];
  strategies: Strategy[];
  backtestRecords: BacktestRecord[];
  tradeRecords: TradeRecord[];
  positionTracks: PositionTrack[];
  reviewRecords: ReviewRecord[];
  emotionRecords: EmotionRecord[];
  biasRecognitions: BiasRecognition[];
  investmentPhilosophy: InvestmentPhilosophy[];
  dashboardStats: DashboardStats;
  currentUser: { id: string; email: string } | null;
  setCurrentUser: (user: { id: string; email: string } | null) => void;
  addInvestmentNote: (note: Omit<InvestmentNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateInvestmentNote: (id: string, note: Partial<InvestmentNote>) => void;
  deleteInvestmentNote: (id: string) => void;
  addBookNote: (note: Omit<BookNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateBookNote: (id: string, note: Partial<BookNote>) => void;
  deleteBookNote: (id: string) => void;
  addMasterResearch: (research: Omit<MasterResearch, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateMasterResearch: (id: string, research: Partial<MasterResearch>) => void;
  deleteMasterResearch: (id: string) => void;
  addStrategy: (strategy: Omit<Strategy, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateStrategy: (id: string, strategy: Partial<Strategy>) => void;
  deleteStrategy: (id: string) => void;
  addBacktestRecord: (record: Omit<BacktestRecord, 'id' | 'user_id' | 'created_at'>) => void;
  updateBacktestRecord: (id: string, record: Partial<BacktestRecord>) => void;
  deleteBacktestRecord: (id: string) => void;
  addTradeRecord: (record: Omit<TradeRecord, 'id' | 'user_id' | 'created_at'>) => void;
  updateTradeRecord: (id: string, record: Partial<TradeRecord>) => void;
  deleteTradeRecord: (id: string) => void;
  addPositionTrack: (track: Omit<PositionTrack, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updatePositionTrack: (id: string, track: Partial<PositionTrack>) => void;
  deletePositionTrack: (id: string) => void;
  addReviewRecord: (record: Omit<ReviewRecord, 'id' | 'user_id' | 'created_at'>) => void;
  updateReviewRecord: (id: string, record: Partial<ReviewRecord>) => void;
  deleteReviewRecord: (id: string) => void;
  addEmotionRecord: (record: Omit<EmotionRecord, 'id' | 'user_id' | 'created_at'>) => void;
  updateEmotionRecord: (id: string, record: Partial<EmotionRecord>) => void;
  deleteEmotionRecord: (id: string) => void;
  addBiasRecognition: (recognition: Omit<BiasRecognition, 'id' | 'user_id' | 'created_at'>) => void;
  updateBiasRecognition: (id: string, recognition: Partial<BiasRecognition>) => void;
  deleteBiasRecognition: (id: string) => void;
  addInvestmentPhilosophy: (philosophy: Omit<InvestmentPhilosophy, 'id' | 'user_id' | 'created_at'>) => void;
  updateInvestmentPhilosophy: (id: string, philosophy: Partial<InvestmentPhilosophy>) => void;
  deleteInvestmentPhilosophy: (id: string) => void;
  refreshStats: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const mockInvestmentNotes: InvestmentNote[] = [
  {
    id: generateId(),
    user_id: '1',
    title: '价值投资核心原则',
    content: '价值投资的核心是寻找市场价格低于内在价值的股票。本杰明·格雷厄姆提出的安全边际概念是价值投资的基石。',
    category: 'value',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: generateId(),
    user_id: '1',
    title: '成长投资的关键指标',
    content: '成长投资关注公司的未来增长潜力，重点关注营收增长率、净利润增长率和市场份额扩张。',
    category: 'growth',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
];

const mockBookNotes: BookNote[] = [
  {
    id: generateId(),
    user_id: '1',
    book_title: '聪明的投资者',
    notes: '本书是价值投资的经典之作，格雷厄姆提出了安全边际、市场先生等重要概念。',
    quotes: '"市场先生是一个慢性子的疯子，他每天都会给你一个报价。"',
    status: 'completed',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-15T16:00:00Z',
  },
];

const mockMasterResearch: MasterResearch[] = [
  {
    id: generateId(),
    user_id: '1',
    master_name: '沃伦·巴菲特',
    analysis: '巴菲特的投资哲学集中在长期持有、护城河理论和合理价格买入优秀企业。',
    strategies: '1. 寻找有护城河的企业\n2. 在合理价格买入\n3. 长期持有',
    created_at: '2024-02-20T11:00:00Z',
    updated_at: '2024-02-20T11:00:00Z',
  },
];

const mockStrategies: Strategy[] = [
  {
    id: generateId(),
    user_id: '1',
    name: '低PE价值策略',
    logic: '选择市盈率低于行业平均水平且基本面稳健的股票',
    stock_selection: 'PE < 15, ROE > 15%, 负债率 < 50%',
    timing: '在PE低于10时买入，PE高于20时卖出',
    position_management: '单只股票不超过总仓位的10%',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
  },
];

const mockBacktestRecords: BacktestRecord[] = [
  {
    id: generateId(),
    user_id: '1',
    strategy_id: mockStrategies[0].id,
    strategy_name: '低PE价值策略',
    start_date: '2020-01-01',
    end_date: '2023-12-31',
    return_rate: 45.6,
    max_drawdown: 18.2,
    notes: '策略在熊市表现较好，但在牛市跑输大盘',
    created_at: '2024-03-10T14:00:00Z',
  },
];

const mockTradeRecords: TradeRecord[] = [
  {
    id: generateId(),
    user_id: '1',
    stock_code: '600519',
    stock_name: '贵州茅台',
    action: 'buy',
    price: 1600,
    quantity: 100,
    reason: '业绩稳定增长，品牌护城河深厚',
    logic: '价值投资策略，PE处于合理区间',
    trade_time: '2024-03-15T09:30:00Z',
    created_at: '2024-03-15T09:30:00Z',
  },
];

const mockPositionTracks: PositionTrack[] = [
  {
    id: generateId(),
    user_id: '1',
    stock_code: '600519',
    stock_name: '贵州茅台',
    current_price: 1650,
    valuation: 28.5,
    notes: '业绩符合预期，继续持有',
    created_at: '2024-03-15T09:30:00Z',
    updated_at: '2024-03-20T10:00:00Z',
  },
];

const mockReviewRecords: ReviewRecord[] = [
  {
    id: generateId(),
    user_id: '1',
    stock_code: '000858',
    stock_name: '五粮液',
    success: true,
    analysis: '买入逻辑正确，公司业绩增长符合预期',
    lessons_learned: '坚持价值投资原则，耐心持有',
    created_at: '2024-03-18T15:00:00Z',
  },
];

const mockEmotionRecords: EmotionRecord[] = [
  {
    id: generateId(),
    user_id: '1',
    emotion: 'greed',
    context: '市场大涨，想追高买入热门股',
    impact: '成功克制，避免了追高风险',
    created_at: '2024-03-19T11:00:00Z',
  },
];

const mockBiasRecognitions: BiasRecognition[] = [
  {
    id: generateId(),
    user_id: '1',
    bias_type: 'confirmation',
    description: '只关注支持自己观点的信息',
    awareness: '意识到这个问题，开始主动寻找反面证据',
    created_at: '2024-03-20T09:00:00Z',
  },
];

const mockInvestmentPhilosophy: InvestmentPhilosophy[] = [
  {
    id: generateId(),
    user_id: '1',
    content: '1. 安全边际是投资的基石\n2. 投资优秀企业而非投机\n3. 保持耐心，长期持有\n4. 独立思考，不随波逐流',
    quarter: '2024-Q1',
    created_at: '2024-03-21T10:00:00Z',
  },
];

export const useStore = create<AppState>((set, get) => ({
  investmentNotes: mockInvestmentNotes,
  bookNotes: mockBookNotes,
  masterResearch: mockMasterResearch,
  strategies: mockStrategies,
  backtestRecords: mockBacktestRecords,
  tradeRecords: mockTradeRecords,
  positionTracks: mockPositionTracks,
  reviewRecords: mockReviewRecords,
  emotionRecords: mockEmotionRecords,
  biasRecognitions: mockBiasRecognitions,
  investmentPhilosophy: mockInvestmentPhilosophy,
  dashboardStats: {
    totalNotes: mockInvestmentNotes.length + mockBookNotes.length,
    totalStrategies: mockStrategies.length,
    totalTrades: mockTradeRecords.length,
    totalEmotions: mockEmotionRecords.length,
  },
  currentUser: { id: '1', email: 'investor@example.com' },

  setCurrentUser: (user) => set({ currentUser: user }),

  addInvestmentNote: (note) => {
    const newNote: InvestmentNote = {
      ...note,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ investmentNotes: [...state.investmentNotes, newNote] }));
    get().refreshStats();
  },

  updateInvestmentNote: (id, note) => {
    set((state) => ({
      investmentNotes: state.investmentNotes.map((n) =>
        n.id === id ? { ...n, ...note, updated_at: new Date().toISOString() } : n
      ),
    }));
  },

  deleteInvestmentNote: (id) => {
    set((state) => ({ investmentNotes: state.investmentNotes.filter((n) => n.id !== id) }));
    get().refreshStats();
  },

  addBookNote: (note) => {
    const newNote: BookNote = {
      ...note,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ bookNotes: [...state.bookNotes, newNote] }));
    get().refreshStats();
  },

  updateBookNote: (id, note) => {
    set((state) => ({
      bookNotes: state.bookNotes.map((n) =>
        n.id === id ? { ...n, ...note, updated_at: new Date().toISOString() } : n
      ),
    }));
  },

  deleteBookNote: (id) => {
    set((state) => ({ bookNotes: state.bookNotes.filter((n) => n.id !== id) }));
    get().refreshStats();
  },

  addMasterResearch: (research) => {
    const newResearch: MasterResearch = {
      ...research,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ masterResearch: [...state.masterResearch, newResearch] }));
  },

  updateMasterResearch: (id, research) => {
    set((state) => ({
      masterResearch: state.masterResearch.map((r) =>
        r.id === id ? { ...r, ...research, updated_at: new Date().toISOString() } : r
      ),
    }));
  },

  deleteMasterResearch: (id) => {
    set((state) => ({ masterResearch: state.masterResearch.filter((r) => r.id !== id) }));
  },

  addStrategy: (strategy) => {
    const newStrategy: Strategy = {
      ...strategy,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ strategies: [...state.strategies, newStrategy] }));
    get().refreshStats();
  },

  updateStrategy: (id, strategy) => {
    set((state) => ({
      strategies: state.strategies.map((s) =>
        s.id === id ? { ...s, ...strategy, updated_at: new Date().toISOString() } : s
      ),
    }));
  },

  deleteStrategy: (id) => {
    set((state) => ({ strategies: state.strategies.filter((s) => s.id !== id) }));
    get().refreshStats();
  },

  addBacktestRecord: (record) => {
    const strategy = get().strategies.find((s) => s.id === record.strategy_id);
    const newRecord: BacktestRecord = {
      ...record,
      id: generateId(),
      user_id: '1',
      strategy_name: strategy?.name,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ backtestRecords: [...state.backtestRecords, newRecord] }));
  },

  updateBacktestRecord: (id, record) => {
    set((state) => ({
      backtestRecords: state.backtestRecords.map((r) =>
        r.id === id ? { ...r, ...record } : r
      ),
    }));
  },

  deleteBacktestRecord: (id) => {
    set((state) => ({ backtestRecords: state.backtestRecords.filter((r) => r.id !== id) }));
  },

  addTradeRecord: (record) => {
    const newRecord: TradeRecord = {
      ...record,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
    };
    set((state) => ({ tradeRecords: [...state.tradeRecords, newRecord] }));
    get().refreshStats();
  },

  updateTradeRecord: (id, record) => {
    set((state) => ({
      tradeRecords: state.tradeRecords.map((r) =>
        r.id === id ? { ...r, ...record } : r
      ),
    }));
  },

  deleteTradeRecord: (id) => {
    set((state) => ({ tradeRecords: state.tradeRecords.filter((r) => r.id !== id) }));
    get().refreshStats();
  },

  addPositionTrack: (track) => {
    const newTrack: PositionTrack = {
      ...track,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ positionTracks: [...state.positionTracks, newTrack] }));
  },

  updatePositionTrack: (id, track) => {
    set((state) => ({
      positionTracks: state.positionTracks.map((t) =>
        t.id === id ? { ...t, ...track, updated_at: new Date().toISOString() } : t
      ),
    }));
  },

  deletePositionTrack: (id) => {
    set((state) => ({ positionTracks: state.positionTracks.filter((t) => t.id !== id) }));
  },

  addReviewRecord: (record) => {
    const newRecord: ReviewRecord = {
      ...record,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
    };
    set((state) => ({ reviewRecords: [...state.reviewRecords, newRecord] }));
  },

  updateReviewRecord: (id, record) => {
    set((state) => ({
      reviewRecords: state.reviewRecords.map((r) =>
        r.id === id ? { ...r, ...record } : r
      ),
    }));
  },

  deleteReviewRecord: (id) => {
    set((state) => ({ reviewRecords: state.reviewRecords.filter((r) => r.id !== id) }));
  },

  addEmotionRecord: (record) => {
    const newRecord: EmotionRecord = {
      ...record,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
    };
    set((state) => ({ emotionRecords: [...state.emotionRecords, newRecord] }));
    get().refreshStats();
  },

  updateEmotionRecord: (id, record) => {
    set((state) => ({
      emotionRecords: state.emotionRecords.map((r) =>
        r.id === id ? { ...r, ...record } : r
      ),
    }));
  },

  deleteEmotionRecord: (id) => {
    set((state) => ({ emotionRecords: state.emotionRecords.filter((r) => r.id !== id) }));
    get().refreshStats();
  },

  addBiasRecognition: (recognition) => {
    const newRecognition: BiasRecognition = {
      ...recognition,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
    };
    set((state) => ({ biasRecognitions: [...state.biasRecognitions, newRecognition] }));
  },

  updateBiasRecognition: (id, recognition) => {
    set((state) => ({
      biasRecognitions: state.biasRecognitions.map((r) =>
        r.id === id ? { ...r, ...recognition } : r
      ),
    }));
  },

  deleteBiasRecognition: (id) => {
    set((state) => ({ biasRecognitions: state.biasRecognitions.filter((r) => r.id !== id) }));
  },

  addInvestmentPhilosophy: (philosophy) => {
    const newPhilosophy: InvestmentPhilosophy = {
      ...philosophy,
      id: generateId(),
      user_id: '1',
      created_at: new Date().toISOString(),
    };
    set((state) => ({ investmentPhilosophy: [...state.investmentPhilosophy, newPhilosophy] }));
  },

  updateInvestmentPhilosophy: (id, philosophy) => {
    set((state) => ({
      investmentPhilosophy: state.investmentPhilosophy.map((p) =>
        p.id === id ? { ...p, ...philosophy } : p
      ),
    }));
  },

  deleteInvestmentPhilosophy: (id) => {
    set((state) => ({ investmentPhilosophy: state.investmentPhilosophy.filter((p) => p.id !== id) }));
  },

  refreshStats: () => {
    const state = get();
    set({
      dashboardStats: {
        totalNotes: state.investmentNotes.length + state.bookNotes.length,
        totalStrategies: state.strategies.length,
        totalTrades: state.tradeRecords.length,
        totalEmotions: state.emotionRecords.length,
      },
    });
  },
}));
