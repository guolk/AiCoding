import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Scholarship, Expense } from "@/types";
import { mockScholarships, mockExpenses } from "@/data/mockData";
import { generateId } from "@/utils/storage";

interface FinanceState {
  scholarships: Scholarship[];
  expenses: Expense[];
  addScholarship: (scholarship: Omit<Scholarship, "id">) => void;
  updateScholarship: (id: string, updates: Partial<Scholarship>) => void;
  deleteScholarship: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      scholarships: mockScholarships,
      expenses: mockExpenses,

      addScholarship: (scholarship) =>
        set((state) => ({
          scholarships: [
            ...state.scholarships,
            { ...scholarship, id: generateId() },
          ],
        })),

      updateScholarship: (id, updates) =>
        set((state) => ({
          scholarships: state.scholarships.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteScholarship: (id) =>
        set((state) => ({
          scholarships: state.scholarships.filter((s) => s.id !== id),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: generateId() }],
        })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
    }),
    {
      name: "study-app-finance",
    }
  )
);
