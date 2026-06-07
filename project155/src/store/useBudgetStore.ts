import { create } from 'zustand';
import type { BudgetCategory, Expense } from '../types';
import { mockData } from '../data/mockData';

interface BudgetStore {
  budgetCategories: BudgetCategory[];
  expenses: Expense[];
  addBudgetCategory: (category: Omit<BudgetCategory, 'id'>) => void;
  updateBudgetCategory: (id: string, updates: Partial<BudgetCategory>) => void;
  deleteBudgetCategory: (id: string) => void;
  getBudgetCategoryById: (id: string) => BudgetCategory | undefined;
  getBudgetCategoriesByProjectId: (projectId: string) => BudgetCategory[];
  setBudgetCategories: (categories: BudgetCategory[]) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpenseById: (id: string) => Expense | undefined;
  getExpensesByProjectId: (projectId: string) => Expense[];
  getExpensesByCategoryId: (categoryId: string) => Expense[];
  setExpenses: (expenses: Expense[]) => void;
  getTotalBudgetByProjectId: (projectId: string) => number;
  getTotalSpentByProjectId: (projectId: string) => number;
}

const initialBudgetCategories: BudgetCategory[] = mockData.budgetCategories.map(
  (bc) =>
    ({
      id: bc.id,
      projectId: bc.projectId,
      name: bc.name as BudgetCategory['name'],
      allocatedAmount: bc.budgetAmount,
      spentAmount: bc.spentAmount,
    }) as BudgetCategory
);

const initialExpenses: Expense[] = mockData.expenseRecords.map(
  (er) =>
    ({
      id: er.id,
      projectId: er.projectId,
      categoryId: er.categoryId,
      description: er.name,
      amount: er.amount,
      date: er.date,
      supplier: er.payee,
      receiptUrl: undefined,
      notes: er.remarks,
    }) as Expense
);

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgetCategories: initialBudgetCategories,
  expenses: initialExpenses,

  addBudgetCategory: (category) => {
    const newCategory: BudgetCategory = {
      ...category,
      id: `bc-${Date.now()}`,
    };
    set((state) => ({
      budgetCategories: [...state.budgetCategories, newCategory],
    }));
  },

  updateBudgetCategory: (id, updates) => {
    set((state) => ({
      budgetCategories: state.budgetCategories.map((category) =>
        category.id === id ? { ...category, ...updates } : category
      ),
    }));
  },

  deleteBudgetCategory: (id) => {
    set((state) => ({
      budgetCategories: state.budgetCategories.filter((category) => category.id !== id),
      expenses: state.expenses.filter((expense) => expense.categoryId !== id),
    }));
  },

  getBudgetCategoryById: (id) => {
    return get().budgetCategories.find((category) => category.id === id);
  },

  getBudgetCategoriesByProjectId: (projectId) => {
    return get().budgetCategories.filter((category) => category.projectId === projectId);
  },

  setBudgetCategories: (budgetCategories) => {
    set({ budgetCategories });
  },

  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    set((state) => {
      const updatedCategories = state.budgetCategories.map((category) =>
        category.id === newExpense.categoryId
          ? { ...category, spentAmount: category.spentAmount + newExpense.amount }
          : category
      );
      return {
        expenses: [...state.expenses, newExpense],
        budgetCategories: updatedCategories,
      };
    });
  },

  updateExpense: (id, updates) => {
    set((state) => {
      const oldExpense = state.expenses.find((e) => e.id === id);
      if (!oldExpense) return { expenses: state.expenses };

      const updatedExpenses = state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      );

      const amountDiff = (updates.amount || 0) - oldExpense.amount;
      const updatedCategories = state.budgetCategories.map((category) =>
        category.id === oldExpense.categoryId
          ? { ...category, spentAmount: category.spentAmount + amountDiff }
          : category
      );

      return {
        expenses: updatedExpenses,
        budgetCategories: updatedCategories,
      };
    });
  },

  deleteExpense: (id) => {
    set((state) => {
      const expense = state.expenses.find((e) => e.id === id);
      if (!expense) return { expenses: state.expenses };

      const updatedCategories = state.budgetCategories.map((category) =>
        category.id === expense.categoryId
          ? { ...category, spentAmount: category.spentAmount - expense.amount }
          : category
      );

      return {
        expenses: state.expenses.filter((e) => e.id !== id),
        budgetCategories: updatedCategories,
      };
    });
  },

  getExpenseById: (id) => {
    return get().expenses.find((expense) => expense.id === id);
  },

  getExpensesByProjectId: (projectId) => {
    return get().expenses.filter((expense) => expense.projectId === projectId);
  },

  getExpensesByCategoryId: (categoryId) => {
    return get().expenses.filter((expense) => expense.categoryId === categoryId);
  },

  setExpenses: (expenses) => {
    set({ expenses });
  },

  getTotalBudgetByProjectId: (projectId) => {
    return get()
      .budgetCategories.filter((category) => category.projectId === projectId)
      .reduce((sum, category) => sum + category.allocatedAmount, 0);
  },

  getTotalSpentByProjectId: (projectId) => {
    return get()
      .budgetCategories.filter((category) => category.projectId === projectId)
      .reduce((sum, category) => sum + category.spentAmount, 0);
  },
}));

export default useBudgetStore;
