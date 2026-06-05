import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Stock, Holding, Transaction, Fundamental, DCFValuation, Performance } from '../types';
import { mockStocks, mockHoldings, mockTransactions, mockFundamentals, mockDCFValuations, mockPerformances, stockMap } from '../data/mockData';
import { initializeAPI, getAPI, type QuoteData } from '../utils/api';

interface PortfolioState {
  stocks: Stock[];
  holdings: Holding[];
  transactions: Transaction[];
  fundamentals: Fundamental[];
  dcfValuations: DCFValuation[];
  performances: Performance[];
  apiKey: string | null;
  isLoading: boolean;
  lastUpdateTime: string | null;
  
  setApiKey: (key: string | null) => void;
  initializeWithMockData: () => void;
  refreshPrices: () => Promise<void>;
  refreshSinglePrice: (stockCode: string) => Promise<void>;
  
  addHolding: (holding: Omit<Holding, 'id'>) => void;
  updateHolding: (id: string, holding: Partial<Holding>) => void;
  deleteHolding: (id: string) => void;
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  addFundamental: (fundamental: Omit<Fundamental, 'id'>) => void;
  updateFundamental: (id: string, fundamental: Partial<Fundamental>) => void;
  deleteFundamental: (id: string) => void;
  
  addDCFValuation: (valuation: Omit<DCFValuation, 'id' | 'createdAt'>) => void;
  deleteDCFValuation: (id: string) => void;
  
  addPerformance: (performance: Omit<Performance, 'id'>) => void;
  
  getStock: (code: string) => Stock | undefined;
  getStockMap: () => Map<string, Stock>;
  getHoldingsWithMetrics: () => (Holding & { stock?: Stock; metrics: import('../types').HoldingMetrics })[];
  getTransactionsByStock: (stockCode: string) => Transaction[];
  getFundamentalsByStock: (stockCode: string) => Fundamental[];
  getDCFValuationsByStock: (stockCode: string) => DCFValuation[];
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      stocks: [],
      holdings: [],
      transactions: [],
      fundamentals: [],
      dcfValuations: [],
      performances: [],
      apiKey: null,
      isLoading: false,
      lastUpdateTime: null,

      setApiKey: (key) => {
        set({ apiKey: key });
        if (key) {
          initializeAPI(key);
        } else {
          initializeAPI(undefined, get().stocks);
        }
      },

      initializeWithMockData: () => {
        set({
          stocks: mockStocks,
          holdings: mockHoldings,
          transactions: mockTransactions,
          fundamentals: mockFundamentals,
          dcfValuations: mockDCFValuations,
          performances: mockPerformances,
          lastUpdateTime: new Date().toISOString(),
        });
        initializeAPI(undefined, mockStocks);
      },

      refreshPrices: async () => {
        set({ isLoading: true });
        try {
          const api = getAPI();
          const { holdings, stocks } = get();
          const stockCodes = holdings.map(h => h.stockCode);
          const quotes = await api.getQuoteBatch(stockCodes);
          
          const updatedStocks = stocks.map(stock => {
            const quote = quotes.get(stock.code);
            if (quote) {
              return {
                ...stock,
                currentPrice: quote.price,
                priceChange: quote.change,
                priceChangePercent: quote.changePercent,
                lastUpdated: quote.lastUpdated,
              };
            }
            return stock;
          });
          
          set({ stocks: updatedStocks, lastUpdateTime: new Date().toISOString() });
        } catch (error) {
          console.error('Failed to refresh prices:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      refreshSinglePrice: async (stockCode: string) => {
        try {
          const api = getAPI();
          const quote: QuoteData = await api.getQuote(stockCode);
          
          set((state) => ({
            stocks: state.stocks.map(stock => 
              stock.code === stockCode 
                ? { ...stock, currentPrice: quote.price, priceChange: quote.change, priceChangePercent: quote.changePercent, lastUpdated: quote.lastUpdated }
                : stock
            ),
          }));
        } catch (error) {
          console.error(`Failed to refresh price for ${stockCode}:`, error);
        }
      },

      addHolding: (holding) => {
        const newHolding: Holding = {
          ...holding,
          id: `h${Date.now()}`,
        };
        set((state) => ({ holdings: [...state.holdings, newHolding] }));
      },

      updateHolding: (id, holding) => {
        set((state) => ({
          holdings: state.holdings.map(h => h.id === id ? { ...h, ...holding } : h),
        }));
      },

      deleteHolding: (id) => {
        set((state) => ({
          holdings: state.holdings.filter(h => h.id !== id),
        }));
      },

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `t${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ transactions: [...state.transactions, newTransaction] }));
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map(t => t.id === id ? { ...t, ...transaction } : t),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter(t => t.id !== id),
        }));
      },

      addFundamental: (fundamental) => {
        const newFundamental: Fundamental = {
          ...fundamental,
          id: `f${Date.now()}`,
        };
        set((state) => ({ fundamentals: [...state.fundamentals, newFundamental] }));
      },

      updateFundamental: (id, fundamental) => {
        set((state) => ({
          fundamentals: state.fundamentals.map(f => f.id === id ? { ...f, ...fundamental } : f),
        }));
      },

      deleteFundamental: (id) => {
        set((state) => ({
          fundamentals: state.fundamentals.filter(f => f.id !== id),
        }));
      },

      addDCFValuation: (valuation) => {
        const newValuation: DCFValuation = {
          ...valuation,
          id: `d${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ dcfValuations: [...state.dcfValuations, newValuation] }));
      },

      deleteDCFValuation: (id) => {
        set((state) => ({
          dcfValuations: state.dcfValuations.filter(d => d.id !== id),
        }));
      },

      addPerformance: (performance) => {
        const newPerformance: Performance = {
          ...performance,
          id: `p${Date.now()}`,
        };
        set((state) => ({ performances: [...state.performances, newPerformance] }));
      },

      getStock: (code) => {
        return get().stocks.find(s => s.code === code) || stockMap.get(code);
      },

      getStockMap: () => {
        return new Map(get().stocks.map(s => [s.code, s]));
      },

      getHoldingsWithMetrics: () => {
        const { holdings, stocks } = get();
        const stockMap = get().getStockMap();
        const totalMarketValue = holdings.reduce((total, holding) => {
          const stock = stockMap.get(holding.stockCode);
          const price = stock?.currentPrice || holding.avgCost;
          return total + price * holding.quantity;
        }, 0);

        return holdings.map(holding => {
          const stock = stockMap.get(holding.stockCode);
          const currentPrice = stock?.currentPrice || holding.avgCost;
          const marketValue = currentPrice * holding.quantity;
          const costValue = holding.avgCost * holding.quantity;
          const profitLoss = marketValue - costValue;
          const profitLossRate = costValue > 0 ? (profitLoss / costValue) * 100 : 0;
          const proportion = totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0;

          return {
            ...holding,
            stock,
            metrics: {
              marketValue,
              costValue,
              profitLoss,
              profitLossRate,
              proportion,
            },
          };
        }).sort((a, b) => b.metrics.marketValue - a.metrics.marketValue);
      },

      getTransactionsByStock: (stockCode) => {
        return get().transactions
          .filter(t => t.stockCode === stockCode)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getFundamentalsByStock: (stockCode) => {
        return get().fundamentals
          .filter(f => f.stockCode === stockCode)
          .sort((a, b) => b.period.localeCompare(a.period));
      },

      getDCFValuationsByStock: (stockCode) => {
        return get().dcfValuations
          .filter(d => d.stockCode === stockCode)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({
        stocks: state.stocks,
        holdings: state.holdings,
        transactions: state.transactions,
        fundamentals: state.fundamentals,
        dcfValuations: state.dcfValuations,
        performances: state.performances,
        apiKey: state.apiKey,
        lastUpdateTime: state.lastUpdateTime,
      }),
    }
  )
);
