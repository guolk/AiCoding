export interface DiaryEntry {
  id: string
  date: string
  title: string
  content: string
  mood: MoodTag | null
  isPrivate: boolean
  photos: Photo[]
  drawings: Drawing[]
  voiceNotes: VoiceNote[]
  weather: WeatherInfo | null
  location: LocationInfo | null
  stickers: StickerPlacement[]
  paperBackground: PaperBackground
  template: TemplateType
  tags: string[]
  isImportant: boolean
  createdAt: string
  updatedAt: string
}

export interface MoodTag {
  id: string
  name: string
  color: string
  emoji: string
  isCustom: boolean
}

export interface Photo {
  id: string
  dataUrl: string
  caption?: string
  createdAt: string
}

export interface Drawing {
  id: string
  dataUrl: string
  createdAt: string
}

export interface VoiceNote {
  id: string
  dataUrl: string
  duration: number
  createdAt: string
}

export interface WeatherInfo {
  condition: string
  temperature: number
  icon: string
}

export interface LocationInfo {
  latitude: number
  longitude: number
  address: string
}

export interface StickerPlacement {
  id: string
  stickerId: string
  x: number
  y: number
  scale: number
  rotation: number
}

export type PaperBackground = 'grid' | 'lines' | 'dots' | 'blank'
export type TemplateType = 'default' | 'travel' | 'reading' | 'mood'

export interface Sticker {
  id: string
  name: string
  category: string
  emoji: string
}

export interface Anniversary {
  id: string
  title: string
  date: string
  type: 'birthday' | 'anniversary' | 'other'
  reminderDays: number
  notes?: string
}

export interface UserSettings {
  password: string | null
  useBiometrics: boolean
  defaultMoods: MoodTag[]
  customMoods: MoodTag[]
  defaultPaperBackground: PaperBackground
  remindersEnabled: boolean
}

export interface AppState {
  diaries: DiaryEntry[]
  settings: UserSettings
  anniversaries: Anniversary[]
  isLocked: boolean
  currentDiaryId: string | null
}
