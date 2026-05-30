import { create } from 'zustand';
import type { User, Family } from '../types';
import { mockUsers, mockFamily, calculateLevel } from '../data/mockData';

interface UserStore {
  currentUser: User;
  family: Family;
  familyMembers: User[];
  updateCoins: (amount: number) => void;
  updateExp: (amount: number) => void;
  setCurrentUser: (user: User) => void;
  getUserById: (userId: string) => User | undefined;
}

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: mockUsers[0],
  family: mockFamily,
  familyMembers: mockUsers,
  updateCoins: (amount: number) =>
    set((state) => ({
      currentUser: {
        ...state.currentUser,
        coins: state.currentUser.coins + amount,
      },
    })),
  updateExp: (amount: number) =>
    set((state) => {
      const newTotalExp = state.currentUser.expPoints + amount;
      const { level } = calculateLevel(newTotalExp);
      return {
        currentUser: {
          ...state.currentUser,
          expPoints: newTotalExp,
          level,
        },
      };
    }),
  setCurrentUser: (user: User) => set({ currentUser: user }),
  getUserById: (userId: string) => {
    return get().familyMembers.find((u) => u.id === userId);
  },
}));
