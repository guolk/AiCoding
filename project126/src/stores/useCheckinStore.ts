import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Checkin, CheckinFormData } from '@/types/checkin';
import type { MemberCard } from '@/types/card';
import { generateMockCheckins, generateIdForNew } from '@/utils/mock';
import { getToday, getDaysBetween, addDays, getHourFromTime, getMonthAndYear } from '@/utils/date';

interface CheckinState {
  checkins: Checkin[];
  initialized: boolean;
  initMockData: (memberCards: MemberCard[]) => void;
  addCheckin: (data: CheckinFormData) => Checkin;
  getCheckinsByMemberId: (memberId: string) => Checkin[];
  getCheckinsByCardId: (cardId: string) => Checkin[];
  getTodayCheckins: () => Checkin[];
  getCheckinStatistics: () => {
    totalToday: number;
    totalThisWeek: number;
    totalThisMonth: number;
  };
  getActiveMembers: () => string[];
  getChurnMembers: () => string[];
  getWarningMembers: () => { memberId: string; memberCardId: string; warningType: 'expiring' | 'expired'; daysLeft: number }[];
  getHourlyDistribution: () => { hour: number; count: number }[];
  getMonthlyCheckinTrend: () => { month: string; count: number }[];
  getMemberActivityRank: (limit?: number) => { memberId: string; checkinCount: number }[];
}

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set, get) => ({
      checkins: [],
      initialized: false,
      
      initMockData: (memberCards: MemberCard[]) => {
        if (get().initialized) return;
        const members = memberCards.map((mc) => ({ id: mc.memberId, joinDate: mc.startDate }));
        const checkins = generateMockCheckins(members as any, memberCards);
        set({ checkins, initialized: true });
      },
      
      addCheckin: (data: CheckinFormData) => {
        const newCheckin: Checkin = {
          id: generateIdForNew(),
          ...data,
          checkinTime: new Date().toISOString(),
          consumedCount: 1,
        };
        set((state) => ({
          checkins: [newCheckin, ...state.checkins],
        }));
        return newCheckin;
      },
      
      getCheckinsByMemberId: (memberId: string) => {
        return get().checkins.filter((c) => c.memberId === memberId);
      },
      
      getCheckinsByCardId: (cardId: string) => {
        return get().checkins.filter((c) => c.memberCardId === cardId);
      },
      
      getTodayCheckins: () => {
        const today = getToday();
        return get().checkins.filter((c) => {
          const checkinDate = c.checkinTime.split('T')[0];
          return checkinDate === today;
        });
      },
      
      getCheckinStatistics: () => {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        let totalToday = 0;
        let totalThisWeek = 0;
        let totalThisMonth = 0;
        
        const todayStr = getToday();
        
        get().checkins.forEach((c) => {
          const checkinDate = new Date(c.checkinTime);
          const checkinStr = c.checkinTime.split('T')[0];
          
          if (checkinStr === todayStr) totalToday++;
          if (checkinDate >= weekStart) totalThisWeek++;
          if (checkinDate >= monthStart) totalThisMonth++;
        });
        
        return { totalToday, totalThisWeek, totalThisMonth };
      },
      
      getActiveMembers: () => {
        const thirtyDaysAgo = addDays(getToday(), -30);
        const activeMemberIds = new Set<string>();
        
        get().checkins.forEach((c) => {
          const checkinDate = c.checkinTime.split('T')[0];
          if (checkinDate >= thirtyDaysAgo) {
            activeMemberIds.add(c.memberId);
          }
        });
        
        return Array.from(activeMemberIds);
      },
      
      getChurnMembers: () => {
        const churnMemberIds = new Set<string>();
        const memberLastCheckin = new Map<string, string>();
        
        get().checkins.forEach((c) => {
          const current = memberLastCheckin.get(c.memberId);
          if (!current || c.checkinTime > current) {
            memberLastCheckin.set(c.memberId, c.checkinTime);
          }
        });
        
        const sixtyDaysAgo = addDays(getToday(), -60);
        
        memberLastCheckin.forEach((lastCheckin, memberId) => {
          const lastCheckinDate = lastCheckin.split('T')[0];
          if (lastCheckinDate < sixtyDaysAgo) {
            churnMemberIds.add(memberId);
          }
        });
        
        return Array.from(churnMemberIds);
      },
      
      getWarningMembers: () => {
        const warnings: { memberId: string; memberCardId: string; warningType: 'expiring' | 'expired'; daysLeft: number }[] = [];
        
        const { memberCards } = (window as any).__cardStoreState?.() || { memberCards: [] };
        
        if (!memberCards || memberCards.length === 0) return warnings;
        
        memberCards.forEach((card: MemberCard) => {
          if (card.status === 'refunded') return;
          
          const daysLeft = getDaysBetween(getToday(), card.endDate);
          
          if (daysLeft < 0) {
            warnings.push({
              memberId: card.memberId,
              memberCardId: card.id,
              warningType: 'expired',
              daysLeft,
            });
          } else if (daysLeft <= 7) {
            warnings.push({
              memberId: card.memberId,
              memberCardId: card.id,
              warningType: 'expiring',
              daysLeft,
            });
          }
        });
        
        return warnings;
      },
      
      getHourlyDistribution: () => {
        const distribution = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
        
        get().checkins.forEach((c) => {
          const hour = getHourFromTime(c.checkinTime);
          distribution[hour].count++;
        });
        
        return distribution;
      },
      
      getMonthlyCheckinTrend: () => {
        const monthMap = new Map<string, number>();
        
        get().checkins.forEach((c) => {
          const month = getMonthAndYear(new Date(c.checkinTime));
          monthMap.set(month, (monthMap.get(month) || 0) + 1);
        });
        
        return Array.from(monthMap.entries())
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month));
      },
      
      getMemberActivityRank: (limit = 10) => {
        const memberCheckinCount = new Map<string, number>();
        
        get().checkins.forEach((c) => {
          memberCheckinCount.set(c.memberId, (memberCheckinCount.get(c.memberId) || 0) + 1);
        });
        
        return Array.from(memberCheckinCount.entries())
          .map(([memberId, checkinCount]) => ({ memberId, checkinCount }))
          .sort((a, b) => b.checkinCount - a.checkinCount)
          .slice(0, limit);
      },
    }),
    {
      name: 'checkin-store',
    }
  )
);
