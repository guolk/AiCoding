import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Marketing, MarketingType } from '@/types/marketing';
import type { Member } from '@/types/member';
import { generateMockMarketing, generateIdForNew } from '@/utils/mock';
import { getToday } from '@/utils/date';

interface MarketingState {
  marketings: Marketing[];
  initialized: boolean;
  initMockData: (members: Member[]) => void;
  addMarketing: (data: Omit<Marketing, 'id' | 'createdAt'>) => Marketing;
  sendMarketing: (id: string) => void;
  cancelMarketing: (id: string) => void;
  getMarketingsByType: (type: MarketingType) => Marketing[];
  getPendingMarketings: () => Marketing[];
  getTodayBirthdays: (members: Member[]) => { member: Member; scheduledDate: string }[];
  getExpiringMembers: (memberCards: any[], days: number) => { memberId: string; memberCardId: string; daysLeft: number }[];
}

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set, get) => ({
      marketings: [],
      initialized: false,
      
      initMockData: (members: Member[]) => {
        if (get().initialized) return;
        const marketings = generateMockMarketing(members);
        set({ marketings, initialized: true });
      },
      
      addMarketing: (data: Omit<Marketing, 'id' | 'createdAt'>) => {
        const newMarketing: Marketing = {
          id: generateIdForNew(),
          ...data,
        };
        set((state) => ({
          marketings: [...state.marketings, newMarketing],
        }));
        return newMarketing;
      },
      
      sendMarketing: (id: string) => {
        set((state) => ({
          marketings: state.marketings.map((m) =>
            m.id === id ? { ...m, status: 'sent', sentDate: getToday() } : m
          ),
        }));
      },
      
      cancelMarketing: (id: string) => {
        set((state) => ({
          marketings: state.marketings.map((m) =>
            m.id === id ? { ...m, status: 'cancelled' } : m
          ),
        }));
      },
      
      getMarketingsByType: (type: MarketingType) => {
        return get().marketings.filter((m) => m.type === type);
      },
      
      getPendingMarketings: () => {
        return get().marketings.filter((m) => m.status === 'pending');
      },
      
      getTodayBirthdays: (members: Member[]) => {
        const today = getToday();
        const todayMonthDay = today.slice(5);
        
        return members
          .filter((m) => {
            if (!m.birthday) return false;
            return m.birthday.slice(5) === todayMonthDay;
          })
          .map((member) => ({
            member,
            scheduledDate: today,
          }));
      },
      
      getExpiringMembers: (memberCards: any[], days: number) => {
        const today = getToday();
        const expiring: { memberId: string; memberCardId: string; daysLeft: number }[] = [];
        
        memberCards.forEach((card) => {
          if (card.status === 'refunded' || card.status === 'expired') return;
          
          const endDate = new Date(card.endDate);
          const todayDate = new Date(today);
          const daysLeft = Math.ceil((endDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft >= 0 && daysLeft <= days) {
            expiring.push({
              memberId: card.memberId,
              memberCardId: card.id,
              daysLeft,
            });
          }
        });
        
        return expiring;
      },
    }),
    {
      name: 'marketing-store',
    }
  )
);
