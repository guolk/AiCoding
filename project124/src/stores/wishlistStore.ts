import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WishlistItem, BidRecord } from '@/types'
import { generateId } from '@/utils/helpers'
import { mockWishlist } from '@/data/mockData'

interface WishlistState {
  wishlist: WishlistItem[]
  bidHistory: BidRecord[]
  
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt' | 'bidHistory'>) => void
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void
  deleteWishlistItem: (id: string) => void
  addBidRecord: (record: Omit<BidRecord, 'id'>) => void
  updateBidRecord: (id: string, updates: Partial<BidRecord>) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      wishlist: [],
      bidHistory: [],
      
      addWishlistItem: (item) => {
        const now = new Date().toISOString()
        const newItem: WishlistItem = {
          ...item,
          id: generateId(),
          bidHistory: [],
          createdAt: now,
          updatedAt: now
        }
        set((state) => ({
          wishlist: [...state.wishlist, newItem]
        }))
      },
      
      updateWishlistItem: (id, updates) => {
        set((state) => ({
          wishlist: state.wishlist.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          )
        }))
      },
      
      deleteWishlistItem: (id) => {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
          bidHistory: state.bidHistory.filter((bid) => bid.wishlistId !== id)
        }))
      },
      
      addBidRecord: (record) => {
        const newRecord: BidRecord = {
          ...record,
          id: generateId()
        }
        set((state) => {
          const updatedWishlist = state.wishlist.map((item) =>
            item.id === record.wishlistId
              ? {
                  ...item,
                  bidHistory: [...item.bidHistory, newRecord],
                  updatedAt: new Date().toISOString()
                }
              : item
          )
          return {
            bidHistory: [...state.bidHistory, newRecord],
            wishlist: updatedWishlist
          }
        })
      },
      
      updateBidRecord: (id, updates) => {
        set((state) => {
          const updatedBidHistory = state.bidHistory.map((bid) =>
            bid.id === id ? { ...bid, ...updates } : bid
          )
          const updatedWishlist = state.wishlist.map((item) => ({
            ...item,
            bidHistory: item.bidHistory.map((bid) =>
              bid.id === id ? { ...bid, ...updates } : bid
            )
          }))
          return {
            bidHistory: updatedBidHistory,
            wishlist: updatedWishlist
          }
        })
      }
    }),
    {
      name: 'wishlist-store',
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating wishlist store:', error)
            return
          }
          
          if (state && state.wishlist.length === 0) {
            mockWishlist.forEach(item => {
              state.addWishlistItem({
                title: item.title,
                mediaType: item.mediaType,
                targetPrice: item.targetPrice,
                currentMarketPrice: item.currentMarketPrice,
                priority: item.priority,
                notes: item.notes
              })
            })
          }
        }
      }
    }
  )
)
