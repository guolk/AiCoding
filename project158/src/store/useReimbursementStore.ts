import { create } from 'zustand'
import type { Reimbursement, ReimbursementStatus } from '@/types/reimbursement'
import { mockApi } from '@/services/mock'
import { getStorage, setStorage } from '@/utils/storage'

interface ReimbursementStore {
  reimbursements: Reimbursement[]
  currentReimbursement: Reimbursement | null
  loading: boolean
  fetchReimbursements: () => Promise<void>
  fetchReimbursementById: (id: string) => Promise<void>
  createReimbursement: (expenseIds: string[], title: string, itineraryId?: string) => Promise<void>
  submitReimbursement: (id: string) => Promise<void>
  updateReimbursementStatus: (id: string, status: ReimbursementStatus, comment?: string) => Promise<void>
  checkCompleteness: (expenseIds: string[]) => { complete: boolean; missing: string[] }
}

const STORAGE_KEY = 'reimbursementStore'

const getInitialState = () => {
  const stored = getStorage(STORAGE_KEY)
  if (stored) {
    return {
      reimbursements: stored.reimbursements || [],
      currentReimbursement: stored.currentReimbursement || null,
      loading: false
    }
  }
  return {
    reimbursements: [],
    currentReimbursement: null,
    loading: false
  }
}

export const useReimbursementStore = create<ReimbursementStore>((set, get) => ({
  ...getInitialState(),

  fetchReimbursements: async () => {
    set({ loading: true })
    try {
      const reimbursements = await mockApi.getReimbursements()
      set({ reimbursements })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  fetchReimbursementById: async (id: string) => {
    set({ loading: true })
    try {
      const reimbursement = await mockApi.getReimbursementById(id)
      set({ currentReimbursement: reimbursement })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  createReimbursement: async (expenseIds: string[], title: string, itineraryId?: string) => {
    set({ loading: true })
    try {
      const newReimbursement = await mockApi.createReimbursement(expenseIds, title, itineraryId)
      set(state => ({
        reimbursements: [...state.reimbursements, newReimbursement]
      }))
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  submitReimbursement: async (id: string) => {
    set({ loading: true })
    try {
      const updated = await mockApi.submitReimbursement(id)
      if (updated) {
        set(state => ({
          reimbursements: state.reimbursements.map(r => r.id === id ? updated : r),
          currentReimbursement: state.currentReimbursement?.id === id ? updated : state.currentReimbursement
        }))
        setStorage(STORAGE_KEY, get())
      }
    } finally {
      set({ loading: false })
    }
  },

  updateReimbursementStatus: async (id: string, status: ReimbursementStatus, comment?: string) => {
    set({ loading: true })
    try {
      const updated = await mockApi.updateReimbursementStatus(id, status, comment)
      if (updated) {
        set(state => ({
          reimbursements: state.reimbursements.map(r => r.id === id ? updated : r),
          currentReimbursement: state.currentReimbursement?.id === id ? updated : state.currentReimbursement
        }))
        setStorage(STORAGE_KEY, get())
      }
    } finally {
      set({ loading: false })
    }
  },

  checkCompleteness: (expenseIds: string[]) => {
    return mockApi.checkCompleteness(expenseIds)
  }
}))
