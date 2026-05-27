import { create } from 'zustand';
import type { TrainingRecord, DailyGoal, TrainingType } from '../types';
import { getItem, setItem, generateId } from '../utils/storage';
import { format, isToday, differenceInDays } from 'date-fns';

interface TrainingStore {
  trainingRecords: TrainingRecord[];
  dailyGoals: DailyGoal[];
  addTrainingRecord: (record: Omit<TrainingRecord, 'id' | 'createdAt'>) => void;
  getRecordsByType: (type: TrainingType) => TrainingRecord[];
  getTodayProgress: () => { completed: number; target: number };
  getStreakDays: () => number;
  setDailyGoal: (goal: Omit<DailyGoal, 'id'>) => void;
  getDailyGoal: (date: string) => DailyGoal | undefined;
  updateDailyProgress: (date: string, completedCount: number, actualCoverage: string[]) => void;
  loadTrainingData: () => void;
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  trainingRecords: [],
  dailyGoals: [],

  loadTrainingData: () => {
    const records = getItem<TrainingRecord[]>('trainingRecords');
    const goals = getItem<DailyGoal[]>('dailyGoals');
    if (records) set({ trainingRecords: records });
    if (goals) set({ dailyGoals: goals });
  },

  addTrainingRecord: (record) => {
    const newRecord: TrainingRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const records = [...get().trainingRecords, newRecord];
    set({ trainingRecords: records });
    setItem('trainingRecords', records);
  },

  getRecordsByType: (type) => get().trainingRecords.filter((r) => r.type === type),

  getTodayProgress: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const goal = get().dailyGoals.find((g) => g.date === today);
    return {
      completed: goal?.completedCount || 0,
      target: goal?.targetCount || 5,
    };
  },

  getStreakDays: () => {
    const records = get().trainingRecords;
    if (records.length === 0) return 0;

    const dates = [...new Set(records.map((r) => format(new Date(r.createdAt), 'yyyy-MM-dd')))].sort().reverse();

    if (dates.length === 0) return 0;

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const current = new Date(dates[i - 1]);
      const prev = new Date(dates[i]);
      if (differenceInDays(current, prev) === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  setDailyGoal: (goal) => {
    const existing = get().dailyGoals.findIndex((g) => g.date === goal.date);
    const newGoal: DailyGoal = {
      ...goal,
      id: existing >= 0 ? get().dailyGoals[existing].id : generateId(),
    };
    const goals = existing >= 0
      ? get().dailyGoals.map((g, i) => (i === existing ? newGoal : g))
      : [...get().dailyGoals, newGoal];
    set({ dailyGoals: goals });
    setItem('dailyGoals', goals);
  },

  getDailyGoal: (date) => get().dailyGoals.find((g) => g.date === date),

  updateDailyProgress: (date, completedCount, actualCoverage) => {
    const goals = get().dailyGoals.map((g) => {
      if (g.date === date) {
        return { ...g, completedCount, actualCoverage };
      }
      return g;
    });
    set({ dailyGoals: goals });
    setItem('dailyGoals', goals);
  },
}));
