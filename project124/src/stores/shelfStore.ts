import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Shelf } from '@/types'
import { generateId } from '@/utils/helpers'

interface ShelfState {
  shelves: Shelf[]
  
  addShelf: (shelf: Omit<Shelf, 'id'>) => void
  updateShelf: (id: string, updates: Partial<Shelf>) => void
  deleteShelf: (id: string) => void
}

export const useShelfStore = create<ShelfState>()(
  persist(
    (set) => ({
      shelves: [],
      
      addShelf: (shelf) => {
        const newShelf: Shelf = {
          ...shelf,
          id: generateId()
        }
        set((state) => ({
          shelves: [...state.shelves, newShelf]
        }))
      },
      
      updateShelf: (id, updates) => {
        set((state) => ({
          shelves: state.shelves.map((shelf) =>
            shelf.id === id ? { ...shelf, ...updates } : shelf
          )
        }))
      },
      
      deleteShelf: (id) => {
        set((state) => ({
          shelves: state.shelves.filter((shelf) => shelf.id !== id)
        }))
      }
    }),
    {
      name: 'shelf-store'
    }
  )
)
