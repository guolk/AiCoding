import { create } from 'zustand';
import type { Achievement, TeamChallenge, AchievementCategory } from '../types';
import { mockAchievements, mockTeamChallenge } from '../data/mockData';

interface AchievementStore {
  allAchievements: Achievement[];
  teamChallenge: TeamChallenge | null;
  filterCategory: AchievementCategory | 'all';
  setFilterCategory: (category: AchievementCategory | 'all') => void;
  unlockAchievement: (achievementId: string) => void;
  getFilteredAchievements: () => Achievement[];
  getUnlockedCount: () => number;
  getTotalCount: () => number;
  updateTeamProgress: (coins: number) => void;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  allAchievements: mockAchievements,
  teamChallenge: mockTeamChallenge,
  filterCategory: 'all',
  setFilterCategory: (category) => set({ filterCategory: category }),
  unlockAchievement: (achievementId: string) =>
    set((state) => ({
      allAchievements: state.allAchievements.map((a) =>
        a.id === achievementId
          ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() }
          : a
      ),
    })),
  getFilteredAchievements: () => {
    const { allAchievements, filterCategory } = get();
    if (filterCategory === 'all') return allAchievements;
    return allAchievements.filter((a) => a.category === filterCategory);
  },
  getUnlockedCount: () => {
    return get().allAchievements.filter((a) => a.isUnlocked).length;
  },
  getTotalCount: () => {
    return get().allAchievements.length;
  },
  updateTeamProgress: (coins: number) =>
    set((state) => {
      if (!state.teamChallenge) return state;
      return {
        teamChallenge: {
          ...state.teamChallenge,
          currentCoins: state.teamChallenge.currentCoins + coins,
        },
      };
    }),
}));
