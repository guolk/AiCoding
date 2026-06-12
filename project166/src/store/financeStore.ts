import { create } from 'zustand';
import type { FinanceTx } from '@/types';
import { INITIAL_TXS } from '@/data/currencies';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';
import { convertToUSD } from '@/utils/currency';

interface FinanceState {
  transactions: FinanceTx[];
  addTransaction: (tx: Omit<FinanceTx, 'id'>) => void;
  removeTransaction: (id: string) => void;
  getTotalIncomeUSD: () => number;
  getTotalExpenseUSD: () => number;
  getBalanceUSD: () => number;
  getByMonth: (yearMonth: string) => FinanceTx[];
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: loadFromStorage('finance-txs', INITIAL_TXS),
  addTransaction: (tx) => {
    const newTx = { ...tx, id: generateId() };
    const newList = [...get().transactions, newTx].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    set({ transactions: newList });
    saveToStorage('finance-txs', newList);
  },
  removeTransaction: (id) => {
    const newList = get().transactions.filter(t => t.id !== id);
    set({ transactions: newList });
    saveToStorage('finance-txs', newList);
  },
  getTotalIncomeUSD: () => {
    return get()
      .transactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
  },
  getTotalExpenseUSD: () => {
    return get()
      .transactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
  },
  getBalanceUSD: () => get().getTotalIncomeUSD() - get().getTotalExpenseUSD(),
  getByMonth: (yearMonth) => {
    return get().transactions.filter(t => t.date.startsWith(yearMonth));
  },
}));
