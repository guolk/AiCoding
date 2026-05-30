import { create } from 'zustand';
import type { ShopItem, RewardHistory, ShopCategory } from '../types';
import { mockShopItems, mockRewardHistory } from '../data/mockData';

interface ShopStore {
  items: ShopItem[];
  history: RewardHistory[];
  filterCategory: ShopCategory | 'all';
  setFilterCategory: (category: ShopCategory | 'all') => void;
  redeemItem: (itemId: string) => Promise<boolean>;
  getFilteredItems: () => ShopItem[];
  getHistoryByUser: (userId: string) => RewardHistory[];
}

export const useShopStore = create<ShopStore>((set, get) => ({
  items: mockShopItems,
  history: mockRewardHistory,
  filterCategory: 'all',
  setFilterCategory: (category) => set({ filterCategory: category }),
  redeemItem: async (itemId: string) => {
    const { items } = get();
    const item = items.find((i) => i.id === itemId);
    
    if (!item) return false;
    
    const newHistory: RewardHistory = {
      id: `history-${Date.now()}`,
      userId: 'user-1',
      itemId: item.id,
      itemName: item.name,
      coinsSpent: item.priceCoins,
      status: 'pending',
      redeemedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      history: [newHistory, ...state.history],
    }));
    
    return true;
  },
  getFilteredItems: () => {
    const { items, filterCategory } = get();
    if (filterCategory === 'all') return items.filter((i) => i.isActive);
    return items.filter((i) => i.isActive && i.category === filterCategory);
  },
  getHistoryByUser: (userId: string) => {
    return get().history.filter((h) => h.userId === userId);
  },
}));
