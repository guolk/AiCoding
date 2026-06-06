import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppUsage,
  Goal,
  HealthMetric,
  AlternativeActivity,
  ActivityLog,
  ScreenFreeLog,
  AppCategory,
  EmotionalTrigger,
  UsageQuality,
} from '../types';
import { generateId } from '../utils/storage';
import {
  initialAppUsage,
  initialGoals,
  initialHealthMetrics,
  initialAlternatives,
  initialActivityLogs,
  initialScreenFreeLogs,
} from '../data/mockData';

interface AppState {
  appUsage: AppUsage[];
  goals: Goal[];
  healthMetrics: HealthMetric[];
  alternatives: AlternativeActivity[];
  activityLogs: ActivityLog[];
  screenFreeLogs: ScreenFreeLog[];
  
  addAppUsage: (usage: Omit<AppUsage, 'id' | 'createdAt'>) => void;
  updateAppUsage: (id: string, updates: Partial<AppUsage>) => void;
  deleteAppUsage: (id: string) => void;
  
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  addHealthMetric: (metric: Omit<HealthMetric, 'id'>) => void;
  updateHealthMetric: (id: string, updates: Partial<HealthMetric>) => void;
  
  addAlternative: (activity: Omit<AlternativeActivity, 'id' | 'effectivenessScore' | 'usageCount'>) => void;
  updateAlternative: (id: string, updates: Partial<AlternativeActivity>) => void;
  deleteAlternative: (id: string) => void;
  
  addActivityLog: (log: Omit<ActivityLog, 'id'>) => void;
  
  addScreenFreeLog: (log: Omit<ScreenFreeLog, 'id'>) => void;
  updateScreenFreeLog: (id: string, updates: Partial<ScreenFreeLog>) => void;
  
  resetAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      appUsage: initialAppUsage,
      goals: initialGoals,
      healthMetrics: initialHealthMetrics,
      alternatives: initialAlternatives,
      activityLogs: initialActivityLogs,
      screenFreeLogs: initialScreenFreeLogs,

      addAppUsage: (usage) =>
        set((state) => ({
          appUsage: [
            ...state.appUsage,
            {
              ...usage,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateAppUsage: (id, updates) =>
        set((state) => ({
          appUsage: state.appUsage.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        })),

      deleteAppUsage: (id) =>
        set((state) => ({
          appUsage: state.appUsage.filter((u) => u.id !== id),
        })),

      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, { ...goal, id: generateId() }],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      addHealthMetric: (metric) =>
        set((state) => ({
          healthMetrics: [...state.healthMetrics, { ...metric, id: generateId() }],
        })),

      updateHealthMetric: (id, updates) =>
        set((state) => ({
          healthMetrics: state.healthMetrics.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),

      addAlternative: (activity) =>
        set((state) => ({
          alternatives: [
            ...state.alternatives,
            {
              ...activity,
              id: generateId(),
              effectivenessScore: 0,
              usageCount: 0,
            },
          ],
        })),

      updateAlternative: (id, updates) =>
        set((state) => ({
          alternatives: state.alternatives.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      deleteAlternative: (id) =>
        set((state) => ({
          alternatives: state.alternatives.filter((a) => a.id !== id),
        })),

      addActivityLog: (log) =>
        set((state) => {
          const newLog = { ...log, id: generateId() };
          const updatedAlternatives = state.alternatives.map((a) => {
            if (a.id === log.alternativeActivityId && log.completed) {
              const newCount = a.usageCount + 1;
              const allLogs = [...state.activityLogs, newLog].filter(
                (l) => l.alternativeActivityId === a.id && l.completed
              );
              const avgRating =
                allLogs.reduce((sum, l) => sum + l.effectivenessRating, 0) /
                allLogs.length;
              return {
                ...a,
                usageCount: newCount,
                effectivenessScore: Math.round(avgRating * 10) / 10,
              };
            }
            return a;
          });
          return {
            activityLogs: [...state.activityLogs, newLog],
            alternatives: updatedAlternatives,
          };
        }),

      addScreenFreeLog: (log) =>
        set((state) => ({
          screenFreeLogs: [...state.screenFreeLogs, { ...log, id: generateId() }],
        })),

      updateScreenFreeLog: (id, updates) =>
        set((state) => ({
          screenFreeLogs: state.screenFreeLogs.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      resetAllData: () =>
        set({
          appUsage: [],
          goals: [],
          healthMetrics: [],
          alternatives: [],
          activityLogs: [],
          screenFreeLogs: [],
        }),
    }),
    {
      name: 'digital-health-storage',
    }
  )
);

export const useTodayUsage = () => {
  const { appUsage } = useAppStore();
  const today = new Date().toISOString().split('T')[0];
  return appUsage.filter((u) => u.date === today);
};

export const useCategoryUsage = (category: AppCategory, date?: string) => {
  const { appUsage } = useAppStore();
  const targetDate = date || new Date().toISOString().split('T')[0];
  return appUsage
    .filter((u) => u.category === category && u.date === targetDate)
    .reduce((sum, u) => sum + u.durationMinutes, 0);
};

export const useGoalProgress = (goalId: string) => {
  const { goals, appUsage } = useAppStore();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return { current: 0, target: 0, progress: 0 };

  const today = new Date().toISOString().split('T')[0];
  let current = 0;

  if (goal.type === 'dailyLimit' && goal.category !== 'all') {
    current = appUsage
      .filter((u) => u.category === goal.category && u.date === today)
      .reduce((sum, u) => sum + u.durationMinutes, 0);
  } else if (goal.type === 'dailyLimit' && goal.category === 'all') {
    current = appUsage
      .filter((u) => u.date === today)
      .reduce((sum, u) => sum + u.durationMinutes, 0);
  }

  const progress = Math.min(100, Math.round((current / goal.targetValue) * 100));
  return { current, target: goal.targetValue, progress };
};

export const useEmotionalTriggerStats = (days: number = 7) => {
  const { appUsage } = useAppStore();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const filtered = appUsage.filter((u) => u.date >= cutoffStr);
  const stats: Record<EmotionalTrigger, number> = {
    boredom: 0,
    anxiety: 0,
    habit: 0,
    intentional: 0,
    stress: 0,
    loneliness: 0,
    other: 0,
  };

  filtered.forEach((u) => {
    stats[u.emotionalTrigger] = (stats[u.emotionalTrigger] || 0) + 1;
  });

  return stats;
};

export const useUsageQualityStats = (days: number = 7) => {
  const { appUsage } = useAppStore();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const filtered = appUsage.filter((u) => u.date >= cutoffStr);
  const stats: Record<UsageQuality, number> = {
    effective: 0,
    mixed: 0,
    ineffective: 0,
  };

  filtered.forEach((u) => {
    stats[u.usageQuality] += u.durationMinutes;
  });

  return stats;
};
