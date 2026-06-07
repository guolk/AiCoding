import { create } from 'zustand'
import type { Expense } from '@/types/expense'
import type { InvoiceImage } from '@/types/common'
import { mockApi } from '@/services/mock'
import { getStorage, setStorage } from '@/utils/storage'

interface BudgetComparison {
  budget: number
  actual: number
  difference: number
  percentage: number
}

interface ExpenseStore {
  expenses: Expense[]
  loading: boolean
  budgetComparison: BudgetComparison | null
  fetchExpenses: (itineraryId?: string) => Promise<void>
  createExpense: (data: Partial<Expense>) => Promise<Expense>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  uploadInvoice: (expenseId: string, image: File) => Promise<void>
  uploadInvoices: (expenseId: string, images: File[]) => Promise<void>
  removeInvoice: (expenseId: string, imageId: string) => void
  calculateBudgetComparison: (itineraryId: string) => Promise<void>
}

const STORAGE_KEY = 'expenseStore'

const getInitialState = () => {
  const stored = getStorage(STORAGE_KEY)
  if (stored) {
    return {
      expenses: stored.expenses || [],
      loading: false,
      budgetComparison: stored.budgetComparison || null
    }
  }
  return {
    expenses: [],
    loading: false,
    budgetComparison: null
  }
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  ...getInitialState(),

  fetchExpenses: async (itineraryId?: string) => {
    set({ loading: true })
    try {
      const expenses = await mockApi.getExpenses(itineraryId)
      set({ expenses })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  createExpense: async (data: Partial<Expense>): Promise<Expense> => {
    set({ loading: true })
    try {
      const newExpense = await mockApi.createExpense(data)
      set(state => ({
        expenses: [...state.expenses, newExpense]
      }))
      setStorage(STORAGE_KEY, get())
      return newExpense
    } finally {
      set({ loading: false })
    }
  },

  updateExpense: async (id: string, data: Partial<Expense>) => {
    set({ loading: true })
    try {
      const updated = await mockApi.updateExpense(id, data)
      if (updated) {
        set(state => ({
          expenses: state.expenses.map(e => e.id === id ? updated : e)
        }))
        setStorage(STORAGE_KEY, get())
      }
    } finally {
      set({ loading: false })
    }
  },

  deleteExpense: async (id: string) => {
    set({ loading: true })
    try {
      const success = await mockApi.deleteExpense(id)
      if (success) {
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id)
        }))
        setStorage(STORAGE_KEY, get())
      }
    } finally {
      set({ loading: false })
    }
  },

  uploadInvoice: async (expenseId: string, image: File) => {
    set({ loading: true })
    try {
      const result = await mockApi.uploadInvoice(expenseId, image)
      if (result.success) {
        const newImage: InvoiceImage = {
          id: Date.now().toString(),
          expenseId,
          url: result.url,
          fileName: image.name,
          fileSize: image.size,
          uploadTime: new Date().toISOString()
        }
        set(state => ({
          expenses: state.expenses.map(e =>
            e.id === expenseId
              ? { ...e, images: [...e.images, newImage] }
              : e
          )
        }))
        setStorage(STORAGE_KEY, get())
      }
    } finally {
      set({ loading: false })
    }
  },

  uploadInvoices: async (expenseId: string, images: File[]) => {
    set({ loading: true })
    try {
      const newImages: InvoiceImage[] = []
      for (const image of images) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(image)
        })
        newImages.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          expenseId,
          url: base64,
          fileName: image.name,
          fileSize: image.size,
          uploadTime: new Date().toISOString()
        })
      }
      set(state => ({
        expenses: state.expenses.map(e =>
          e.id === expenseId
            ? { ...e, images: [...e.images, ...newImages] }
            : e
        )
      }))
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  removeInvoice: (expenseId: string, imageId: string) => {
    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId
          ? { ...e, images: e.images.filter(img => img.id !== imageId) }
          : e
      )
    }))
    setStorage(STORAGE_KEY, get())
  },

  calculateBudgetComparison: async (itineraryId: string) => {
    set({ loading: true })
    try {
      const comparison = await mockApi.calculateBudgetComparison(itineraryId)
      set({ budgetComparison: comparison })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  }
}))
