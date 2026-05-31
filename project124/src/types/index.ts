export type MediaType = 'dvd' | 'bluray' | 'vinyl' | 'cd' | 'game'

export type EditionType = 'standard' | 'limited' | 'director_cut' | 'collector' | 'special'

export type ConditionGrade = 'mint' | 'near_mint' | 'very_good' | 'good' | 'fair' | 'poor'

export type LendingStatus = 'available' | 'lent' | 'overdue'

export type Priority = 'high' | 'medium' | 'low'

export type BidStatus = 'active' | 'won' | 'lost' | 'expired'

export interface MediaItem {
  id: string
  title: string
  mediaType: MediaType
  barcode?: string
  director?: string
  artist?: string
  publisher?: string
  releaseYear?: number
  genre?: string[]
  duration?: number
  description?: string
  coverImage?: string
  region?: string
  edition: EditionType
  editionDescription?: string
  editionFeatures?: string[]
  condition: {
    cover: ConditionGrade
    disc: ConditionGrade
    booklet: ConditionGrade
    overall: ConditionGrade
    notes?: string
  }
  location: {
    shelf: number
    layer: number
    position: number
    notes?: string
  }
  value: {
    purchasePrice: number
    purchaseDate: string
    purchaseChannel?: string
    purchaseNotes?: string
    currentEstimate: number
    lastUpdated: string
    valueHistory: ValueRecord[]
  }
  lending: {
    status: LendingStatus
    borrower?: string
    borrowDate?: string
    expectedReturnDate?: string
    returnDate?: string
    notes?: string
  }
  rating: {
    personalScore: number
    review?: string
    isRecommended: boolean
    recommendedTo?: string[]
    lastUpdated: string
  }
  createdAt: string
  updatedAt: string
}

export interface ValueRecord {
  id: string
  mediaId: string
  estimate: number
  source: string
  date: string
  notes?: string
}

export interface WishlistItem {
  id: string
  title: string
  mediaType: MediaType
  targetPrice: {
    min: number
    max: number
  }
  currentMarketPrice?: number
  priority: Priority
  notes?: string
  bidHistory: BidRecord[]
  createdAt: string
  updatedAt: string
}

export interface BidRecord {
  id: string
  wishlistId: string
  price: number
  source: string
  date: string
  status: BidStatus
  notes?: string
}

export interface Shelf {
  id: string
  name: string
  layers: number
  positionsPerLayer: number
  notes?: string
}

export type SortType = 'title' | 'director' | 'year' | 'genre' | 'price' | 'rating'

export type ViewMode = 'grid' | 'list'
