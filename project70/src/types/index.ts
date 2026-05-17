export interface Plant {
  id: string
  name: string
  scientificName?: string
  family?: string
  genus?: string
  purchaseDate: string
  purchasePrice?: number
  potInfo?: string
  location: string
  notes?: string
  photos: PlantPhoto[]
  createdAt: string
  updatedAt: string
}

export interface PlantPhoto {
  id: string
  url: string
  date: string
  notes?: string
  isHealthy?: boolean
}

export interface PlantIdentification {
  id: string
  plantId?: string
  photoUrl: string
  suggestions: PlantSuggestion[]
  createdAt: string
}

export interface PlantSuggestion {
  name: string
  scientificName: string
  probability: number
  family?: string
  genus?: string
}

export type TaskType = 'water' | 'fertilize' | 'repot' | 'prune' | 'spray'

export interface CareTask {
  id: string
  plantId: string
  type: TaskType
  frequencyDays: number
  lastDoneDate?: string
  nextDueDate: string
  notes?: string
  enabled: boolean
}

export interface CareRecord {
  id: string
  plantId: string
  type: TaskType
  date: string
  amount?: string
  result?: string
  photoUrl?: string
  notes?: string
}

export interface HealthObservation {
  id: string
  plantId: string
  date: string
  leafColor: string
  soilCondition: string
  hasPests: boolean
  pestDetails?: string
  photoUrl?: string
  notes?: string
}

export interface EnvironmentRecord {
  id: string
  location: string
  date: string
  lightLevel: number
  humidity: number
  temperature?: number
  notes?: string
}

export interface SeasonalReminder {
  id: string
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  title: string
  description: string
  plants: string[]
}

export interface KnowledgeEntry {
  id: string
  name: string
  scientificName?: string
  category: string
  wateringFrequency: string
  lightRequirement: string
  fertilizerRequirement: string
  pestControl: string
  description?: string
  imageUrl?: string
}

export interface GardenCalendarEntry {
  id: string
  month: number
  title: string
  description: string
  plantTypes: string[]
}

export interface Post {
  id: string
  type: 'experience' | 'exchange'
  title: string
  content: string
  author: string
  createdAt: string
  plantType?: string
  photos: string[]
  comments: Comment[]
  likes: number
}

export interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface ExchangePost extends Post {
  type: 'exchange'
  havePlant: string
  wantPlant: string
  location: string
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  water: '浇水',
  fertilize: '施肥',
  repot: '换盆',
  prune: '修剪',
  spray: '喷药'
}

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  water: 'bg-blue-500',
  fertilize: 'bg-yellow-500',
  repot: 'bg-amber-600',
  prune: 'bg-green-500',
  spray: 'bg-purple-500'
}

export const SEASON_LABELS: Record<string, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季'
}
