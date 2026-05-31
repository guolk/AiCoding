import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Goal, Partner, Trip, PartnerProgress, PartnerMotivation } from '@/types';
import { mockGoals, mockPartners, mockTrips } from '@/utils/mockData';
import { generateId } from '@/utils/storage';

interface CommunityState {
  goals: Goal[];
  partners: Partner[];
  trips: Trip[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  addPartner: (partner: Omit<Partner, 'id' | 'progressHistory' | 'motivations' | 'progressComparison' | 'sharedGoals' | 'lastActivity' | 'streak'>) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  addPartnerProgress: (partnerId: string, progress: Omit<PartnerProgress, 'id'>) => void;
  sendMotivation: (partnerId: string, message: string) => void;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  getUpcomingTrips: () => Trip[];
  getCompletedTrips: () => Trip[];
  toggleGoalMilestone: (goalId: string, milestoneId: string, completed: boolean) => void;
  toggleTripItemPacked: (tripId: string, itemId: string, packed: boolean) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      goals: mockGoals,
      partners: mockPartners,
      trips: mockTrips,
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          goals: [newGoal, ...state.goals],
        }));
      },
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },
      updateGoalProgress: (id, progress) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, progressPercent: Math.min(100, Math.max(0, progress)) } : g
          ),
        }));
      },
      addPartner: (partner) => {
        const newPartner: Partner = {
          ...partner,
          id: generateId(),
          progressHistory: [],
          motivations: [],
          progressComparison: 0,
          sharedGoals: [],
          lastActivity: new Date().toISOString(),
          streak: 0,
        };
        set((state) => ({
          partners: [...state.partners, newPartner],
        }));
      },
      updatePartner: (id, updates) => {
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },
      deletePartner: (id) => {
        set((state) => ({
          partners: state.partners.filter((p) => p.id !== id),
        }));
      },
      addPartnerProgress: (partnerId, progress) => {
        const newProgress: PartnerProgress = {
          ...progress,
          id: generateId(),
        };
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId
              ? {
                  ...p,
                  progressHistory: [...p.progressHistory, newProgress],
                  lastActivity: new Date().toISOString(),
                }
              : p
          ),
        }));
      },
      sendMotivation: (partnerId, message) => {
        const newMotivation: PartnerMotivation = {
          id: generateId(),
          message,
          sentAt: new Date().toISOString(),
        };
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId
              ? {
                  ...p,
                  motivations: [...p.motivations, newMotivation],
                }
              : p
          ),
        }));
      },
      addTrip: (trip) => {
        const newTrip: Trip = {
          ...trip,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          trips: [newTrip, ...state.trips],
        }));
      },
      updateTrip: (id, updates) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      deleteTrip: (id) => {
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== id),
        }));
      },
      getActiveGoals: () => {
        return get().goals.filter((g) => g.status === 'active');
      },
      getCompletedGoals: () => {
        return get().goals.filter((g) => g.status === 'completed');
      },
      getUpcomingTrips: () => {
        return get().trips.filter(
          (t) => t.status === 'planned' || t.status === 'in-progress'
        );
      },
      getCompletedTrips: () => {
        return get().trips.filter((t) => t.status === 'completed');
      },
      toggleGoalMilestone: (goalId, milestoneId, completed) => {
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== goalId) return g;
            const updatedMilestones = g.milestones.map((m) =>
              m.id === milestoneId
                ? {
                    ...m,
                    completed,
                    completedDate: completed
                      ? new Date().toISOString()
                      : undefined,
                  }
                : m
            );
            const completedCount = updatedMilestones.filter((m) => m.completed).length;
            const newProgress =
              updatedMilestones.length > 0
                ? Math.round((completedCount / updatedMilestones.length) * 100)
                : g.progressPercent;
            return {
              ...g,
              milestones: updatedMilestones,
              progressPercent: newProgress,
              status: newProgress === 100 ? 'completed' : g.status,
            };
          }),
        }));
      },
      toggleTripItemPacked: (tripId, itemId, packed) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              packingList: t.packingList.map((i) =>
                i.id === itemId ? { ...i, checked: packed } : i
              ),
            };
          }),
        }));
      },
    }),
    {
      name: 'community-storage',
    }
  )
);
