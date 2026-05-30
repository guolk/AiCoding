import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SavingMeasure, HabitCheck, SavingGoal, Budget, HabitType } from '../types';
import { generateMockSavingMeasures, generateMockHabitChecks, generateMockGoals, generateMockBudget } from '../utils/mockData';
import { generateId } from '../utils/formatter';

interface SavingStore {
  measures: SavingMeasure[];
  habitChecks: HabitCheck[];
  goals: SavingGoal[];
  budget: Budget | null;
  initialized: boolean;
  initData: () => void;
  addMeasure: (measure: Omit<SavingMeasure, 'id'>) => void;
  updateMeasure: (id: string, measure: Partial<SavingMeasure>) => void;
  deleteMeasure: (id: string) => void;
  toggleHabit: (habitType: HabitType, date: string) => void;
  isHabitCompleted: (habitType: HabitType, date: string) => boolean;
  getStreak: (habitType: HabitType) => number;
  addGoal: (goal: Omit<SavingGoal, 'id'>) => void;
  updateGoalProgress: (id: string, value: number) => void;
  deleteGoal: (id: string) => void;
  updateBudget: (budget: Partial<Budget>) => void;
}

export const useSavingStore = create<SavingStore>()(
  persist(
    (set, get) => ({
      measures: [],
      habitChecks: [],
      goals: [],
      budget: null,
      initialized: false,
      
      initData: () => {
        if (!get().initialized) {
          set({
            measures: generateMockSavingMeasures(),
            habitChecks: generateMockHabitChecks(),
            goals: generateMockGoals(),
            budget: generateMockBudget(),
            initialized: true,
          });
        }
      },
      
      addMeasure: (measureData) => {
        set(state => ({
          measures: [...state.measures, { ...measureData, id: generateId() }],
        }));
      },
      
      updateMeasure: (id, measureData) => {
        set(state => ({
          measures: state.measures.map(m =>
            m.id === id ? { ...m, ...measureData } : m
          ),
        }));
      },
      
      deleteMeasure: (id) => {
        set(state => ({
          measures: state.measures.filter(m => m.id !== id),
        }));
      },
      
      toggleHabit: (habitType, date) => {
        const existing = get().habitChecks.find(
          h => h.habitType === habitType && h.date === date
        );
        
        if (existing) {
          set(state => ({
            habitChecks: state.habitChecks.filter(
              h => !(h.habitType === habitType && h.date === date)
            ),
          }));
        } else {
          set(state => ({
            habitChecks: [
              ...state.habitChecks,
              { id: generateId(), habitType, date, completed: true },
            ],
          }));
        }
      },
      
      isHabitCompleted: (habitType, date) => {
        return get().habitChecks.some(
          h => h.habitType === habitType && h.date === date && h.completed
        );
      },
      
      getStreak: (habitType) => {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          if (get().isHabitCompleted(habitType, dateStr)) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        
        return streak;
      },
      
      addGoal: (goalData) => {
        set(state => ({
          goals: [...state.goals, { ...goalData, id: generateId() }],
        }));
      },
      
      updateGoalProgress: (id, value) => {
        set(state => ({
          goals: state.goals.map(g =>
            g.id === id ? { ...g, currentValue: value } : g
          ),
        }));
      },
      
      deleteGoal: (id) => {
        set(state => ({
          goals: state.goals.filter(g => g.id !== id),
        }));
      },
      
      updateBudget: (budgetData) => {
        set(state => ({
          budget: state.budget ? { ...state.budget, ...budgetData } : generateMockBudget(),
        }));
      },
    }),
    {
      name: 'energy-saving-storage',
    }
  )
);
