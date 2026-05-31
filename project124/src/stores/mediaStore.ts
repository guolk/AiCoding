import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MediaItem, ValueRecord, LendingStatus, SortType, ViewMode } from '@/types'
import { generateId } from '@/utils/helpers'
import { mockMedia } from '@/data/mockData'

interface MediaState {
  media: MediaItem[]
  valueHistory: ValueRecord[]
  sortType: SortType
  viewMode: ViewMode
  searchQuery: string
  filterType: string | null
  filterEdition: string | null
  filterLending: string | null
  
  addMedia: (item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMedia: (id: string, updates: Partial<MediaItem>) => void
  deleteMedia: (id: string) => void
  addValueRecord: (record: Omit<ValueRecord, 'id'>) => void
  
  lendMedia: (id: string, info: { borrower: string; expectedReturnDate: string; notes?: string }) => void
  returnMedia: (id: string) => void
  
  updateRating: (id: string, info: { personalScore: number; review?: string; isRecommended: boolean; recommendedTo?: string[] }) => void
  
  setSortType: (type: SortType) => void
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  setFilterType: (type: string | null) => void
  setFilterEdition: (edition: string | null) => void
  setFilterLending: (status: string | null) => void
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      media: [],
      valueHistory: [],
      sortType: 'title',
      viewMode: 'grid',
      searchQuery: '',
      filterType: null,
      filterEdition: null,
      filterLending: null,
      
      addMedia: (item) => {
        const now = new Date().toISOString()
        const newMedia: MediaItem = {
          ...item,
          id: generateId(),
          createdAt: now,
          updatedAt: now
        }
        set((state) => ({
          media: [...state.media, newMedia]
        }))
      },
      
      updateMedia: (id, updates) => {
        set((state) => ({
          media: state.media.map((m) =>
            m.id === id
              ? { ...m, ...updates, updatedAt: new Date().toISOString() }
              : m
          )
        }))
      },
      
      deleteMedia: (id) => {
        set((state) => ({
          media: state.media.filter((m) => m.id !== id),
          valueHistory: state.valueHistory.filter((v) => v.mediaId !== id)
        }))
      },
      
      addValueRecord: (record) => {
        const newRecord: ValueRecord = {
          ...record,
          id: generateId()
        }
        set((state) => {
          const updatedMedia = state.media.map((m) =>
            m.id === record.mediaId
              ? {
                  ...m,
                  value: {
                    ...m.value,
                    currentEstimate: record.estimate,
                    lastUpdated: record.date,
                    valueHistory: [...m.value.valueHistory, newRecord]
                  },
                  updatedAt: new Date().toISOString()
                }
              : m
          )
          return {
            valueHistory: [...state.valueHistory, newRecord],
            media: updatedMedia
          }
        })
      },
      
      lendMedia: (id, info) => {
        set((state) => ({
          media: state.media.map((m) =>
            m.id === id
              ? {
                  ...m,
                  lending: {
                    status: 'lent' as LendingStatus,
                    borrower: info.borrower,
                    borrowDate: new Date().toISOString(),
                    expectedReturnDate: info.expectedReturnDate,
                    notes: info.notes
                  },
                  updatedAt: new Date().toISOString()
                }
              : m
          )
        }))
      },
      
      returnMedia: (id) => {
        set((state) => ({
          media: state.media.map((m) =>
            m.id === id
              ? {
                  ...m,
                  lending: {
                    status: 'available' as LendingStatus,
                    returnDate: new Date().toISOString()
                  },
                  updatedAt: new Date().toISOString()
                }
              : m
          )
        }))
      },
      
      updateRating: (id, info) => {
        set((state) => ({
          media: state.media.map((m) =>
            m.id === id
              ? {
                  ...m,
                  rating: {
                    ...info,
                    lastUpdated: new Date().toISOString()
                  },
                  updatedAt: new Date().toISOString()
                }
              : m
          )
        }))
      },
      
      setSortType: (type) => set({ sortType: type }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterType: (type) => set({ filterType: type }),
      setFilterEdition: (edition) => set({ filterEdition: edition }),
      setFilterLending: (status) => set({ filterLending: status })
    }),
    {
      name: 'media-collection-store',
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating media store:', error)
            return
          }
          
          if (state && state.media.length === 0) {
            mockMedia.forEach(item => {
              state.addMedia({
                ...item,
                value: {
                  ...item.value,
                  valueHistory: item.value.valueHistory.map(vh => ({ ...vh, mediaId: item.id }))
                }
              })
            })
          }
        }
      }
    }
  )
)
