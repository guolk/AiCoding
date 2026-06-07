import { create } from 'zustand'
import type { Itinerary } from '@/types/itinerary'
import type { City, RouteResult } from '@/utils/routeOptimizer'
import { mockApi } from '@/services/mock'
import { getStorage, setStorage } from '@/utils/storage'

interface ItineraryStore {
  itineraries: Itinerary[]
  currentItinerary: Itinerary | null
  loading: boolean
  routeOptimizationResult: RouteResult | null
  fetchItineraries: () => Promise<void>
  fetchItineraryById: (id: string) => Promise<void>
  createItinerary: (data: Partial<Itinerary>) => Promise<void>
  updateItinerary: (id: string, data: Partial<Itinerary>) => Promise<void>
  deleteItinerary: (id: string) => Promise<void>
  optimizeRoute: (cities: City[], startCity?: City) => Promise<void>
  submitForApproval: (id: string) => Promise<void>
}

const STORAGE_KEY = 'itineraryStore'

const getInitialState = () => {
  const stored = getStorage(STORAGE_KEY)
  if (stored) {
    return {
      itineraries: stored.itineraries || [],
      currentItinerary: stored.currentItinerary || null,
      loading: false,
      routeOptimizationResult: stored.routeOptimizationResult || null
    }
  }
  return {
    itineraries: [],
    currentItinerary: null,
    loading: false,
    routeOptimizationResult: null
  }
}

export const useItineraryStore = create<ItineraryStore>((set, get) => ({
  ...getInitialState(),

  fetchItineraries: async () => {
    set({ loading: true })
    try {
      const itineraries = await mockApi.getItineraries()
      set({ itineraries })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  fetchItineraryById: async (id: string) => {
    set({ loading: true })
    try {
      const itinerary = await mockApi.getItineraryById(id)
      set({ currentItinerary: itinerary })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  createItinerary: async (data: Partial<Itinerary>) => {
    set({ loading: true })
    try {
      const newItinerary = await mockApi.createItinerary(data)
      set(state => ({
        itineraries: [...state.itineraries, newItinerary]
      }))
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  updateItinerary: async (id: string, data: Partial<Itinerary>) => {
    set({ loading: true })
    try {
      const updated = await mockApi.updateItinerary(id, data)
      if (updated) {
        set(state => ({
          itineraries: state.itineraries.map(i => i.id === id ? updated : i),
          currentItinerary: state.currentItinerary?.id === id ? updated : state.currentItinerary
        }))
        setStorage(STORAGE_KEY, get())
      }
    } finally {
      set({ loading: false })
    }
  },

  deleteItinerary: async (id: string) => {
    set({ loading: true })
    try {
      const success = await mockApi.deleteItinerary(id)
      if (success) {
        set(state => ({
          itineraries: state.itineraries.filter(i => i.id !== id),
          currentItinerary: state.currentItinerary?.id === id ? null : state.currentItinerary
        }))
        setStorage(STORAGE_KEY, get())
      }
    } finally {
      set({ loading: false })
    }
  },

  optimizeRoute: async (cities: City[], startCity?: City) => {
    set({ loading: true })
    try {
      const result = await mockApi.optimizeRoute(cities, startCity)
      set({ routeOptimizationResult: result })
      setStorage(STORAGE_KEY, get())
    } finally {
      set({ loading: false })
    }
  },

  submitForApproval: async (id: string) => {
    set({ loading: true })
    try {
      const updated = await mockApi.submitForApproval(id)
      if (updated) {
        set(state => ({
          itineraries: state.itineraries.map(i => i.id === id ? updated : i),
          currentItinerary: state.currentItinerary?.id === id ? updated : state.currentItinerary
        }))
        setStorage(STORAGE_KEY, get())
      }
    } finally {
      set({ loading: false })
    }
  }
}))
