import { create } from 'zustand'
import type { User } from '@/types/common'
import { mockApi } from '@/services/mock'
import { getStorage, setStorage } from '@/utils/storage'

interface UserStore {
  currentUser: User | null
  users: User[]
  loading: boolean
  fetchCurrentUser: () => Promise<void>
  fetchUsers: () => Promise<void>
  updateUser: (user: User) => Promise<void>
}

const STORAGE_KEY = 'userStore'

const getInitialState = () => {
  const stored = getStorage(STORAGE_KEY)
  if (stored) {
    return {
      currentUser: stored.currentUser || null,
      users: stored.users || [],
      loading: false
    }
  }
  return {
    currentUser: null,
    users: [],
    loading: false
  }
}

export const useUserStore = create<UserStore>((set, get) => ({
  ...getInitialState(),

  fetchCurrentUser: async () => {
    set({ loading: true })
    try {
      const user = await mockApi.getCurrentUser()
      set({ currentUser: user })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  fetchUsers: async () => {
    set({ loading: true })
    try {
      const users = await mockApi.getUsers()
      set({ users })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  updateUser: async (user: User) => {
    set({ loading: true })
    try {
      const updatedUser = await mockApi.updateUser(user)
      set(state => ({
        users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u),
        currentUser: state.currentUser?.id === updatedUser.id ? updatedUser : state.currentUser
      }))
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  }
}))
