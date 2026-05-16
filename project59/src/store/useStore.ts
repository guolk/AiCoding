import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AppState,
  DiaryEntry,
  MoodTag,
  Anniversary,
  PaperBackground,
  UserSettings
} from '../types'

const defaultMoods: MoodTag[] = [
  { id: '1', name: '开心', color: '#4ade80', emoji: '😊', isCustom: false },
  { id: '2', name: '兴奋', color: '#fbbf24', emoji: '🤩', isCustom: false },
  { id: '3', name: '平静', color: '#60a5fa', emoji: '😌', isCustom: false },
  { id: '4', name: '难过', color: '#94a3b8', emoji: '😢', isCustom: false },
  { id: '5', name: '生气', color: '#f87171', emoji: '😠', isCustom: false },
  { id: '6', name: '焦虑', color: '#fb923c', emoji: '😰', isCustom: false },
  { id: '7', name: '感恩', color: '#34d399', emoji: '🙏', isCustom: false },
  { id: '8', name: '疲惫', color: '#a78bfa', emoji: '😴', isCustom: false },
]

const defaultSettings: UserSettings = {
  password: null,
  useBiometrics: false,
  defaultMoods,
  customMoods: [],
  defaultPaperBackground: 'lines',
  remindersEnabled: true,
}

const sampleDiaries: DiaryEntry[] = [
  {
    id: 'sample-1',
    date: '2024-01-15',
    title: '美好的一天',
    content: '<p>今天天气真好，和朋友们一起去了公园野餐。阳光明媚，心情特别好！</p><p>希望每天都能这么开心。</p>',
    mood: defaultMoods[0],
    isPrivate: false,
    photos: [],
    drawings: [],
    voiceNotes: [],
    weather: { condition: '晴', temperature: 22, icon: '☀️' },
    location: { latitude: 39.9, longitude: 116.4, address: '北京朝阳公园' },
    stickers: [],
    paperBackground: 'lines',
    template: 'default',
    tags: ['朋友', '野餐', '开心'],
    isImportant: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'sample-2',
    date: '2024-02-20',
    title: '读完了一本书',
    content: '<p>今天终于读完了《活着》，感触很深。余华的文字总是那么有力量，让我思考了很多关于人生的意义。</p>',
    mood: defaultMoods[2],
    isPrivate: false,
    photos: [],
    drawings: [],
    voiceNotes: [],
    weather: { condition: '多云', temperature: 15, icon: '⛅' },
    location: null,
    stickers: [],
    paperBackground: 'lines',
    template: 'reading',
    tags: ['阅读', '思考', '书籍'],
    isImportant: true,
    createdAt: '2024-02-20T15:00:00Z',
    updatedAt: '2024-02-20T15:00:00Z',
  },
]

const sampleAnniversaries: Anniversary[] = [
  {
    id: 'ann-1',
    title: '妈妈生日',
    date: '2024-05-20',
    type: 'birthday',
    reminderDays: 3,
    notes: '记得准备礼物和蛋糕',
  },
]

export const useStore = create<AppState & {
  addDiary: (diary: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDiary: (id: string, diary: Partial<DiaryEntry>) => void
  deleteDiary: (id: string) => void
  getDiary: (id: string) => DiaryEntry | undefined
  setCurrentDiary: (id: string | null) => void
  addCustomMood: (mood: Omit<MoodTag, 'id' | 'isCustom'>) => void
  deleteCustomMood: (id: string) => void
  addAnniversary: (anniversary: Omit<Anniversary, 'id'>) => void
  updateAnniversary: (id: string, anniversary: Partial<Anniversary>) => void
  deleteAnniversary: (id: string) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  setPassword: (password: string | null) => void
  toggleLock: () => void
  unlock: (password: string) => boolean
  getAllMoods: () => MoodTag[]
}>()(
  persist(
    (set, get) => ({
      diaries: sampleDiaries,
      settings: defaultSettings,
      anniversaries: sampleAnniversaries,
      isLocked: false,
      currentDiaryId: null,

      addDiary: (diaryData) => {
        const newDiary: DiaryEntry = {
          ...diaryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ diaries: [...state.diaries, newDiary] }))
      },

      updateDiary: (id, diaryData) => {
        set((state) => ({
          diaries: state.diaries.map((d) =>
            d.id === id ? { ...d, ...diaryData, updatedAt: new Date().toISOString() } : d
          ),
        }))
      },

      deleteDiary: (id) => {
        set((state) => ({
          diaries: state.diaries.filter((d) => d.id !== id),
        }))
      },

      getDiary: (id) => {
        return get().diaries.find((d) => d.id === id)
      },

      setCurrentDiary: (id) => {
        set({ currentDiaryId: id })
      },

      addCustomMood: (moodData) => {
        const newMood: MoodTag = {
          ...moodData,
          id: Date.now().toString(),
          isCustom: true,
        }
        set((state) => ({
          settings: {
            ...state.settings,
            customMoods: [...state.settings.customMoods, newMood],
          },
        }))
      },

      deleteCustomMood: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            customMoods: state.settings.customMoods.filter((m) => m.id !== id),
          },
        }))
      },

      addAnniversary: (anniversaryData) => {
        const newAnniversary: Anniversary = {
          ...anniversaryData,
          id: Date.now().toString(),
        }
        set((state) => ({
          anniversaries: [...state.anniversaries, newAnniversary],
        }))
      },

      updateAnniversary: (id, anniversaryData) => {
        set((state) => ({
          anniversaries: state.anniversaries.map((a) =>
            a.id === id ? { ...a, ...anniversaryData } : a
          ),
        }))
      },

      deleteAnniversary: (id) => {
        set((state) => ({
          anniversaries: state.anniversaries.filter((a) => a.id !== id),
        }))
      },

      updateSettings: (settingsData) => {
        set((state) => ({
          settings: { ...state.settings, ...settingsData },
        }))
      },

      setPassword: (password) => {
        set((state) => ({
          settings: { ...state.settings, password },
        }))
      },

      toggleLock: () => {
        set((state) => ({ isLocked: !state.isLocked }))
      },

      unlock: (password) => {
        const state = get()
        if (state.settings.password === password) {
          set({ isLocked: false })
          return true
        }
        return false
      },

      getAllMoods: () => {
        const state = get()
        return [...state.settings.defaultMoods, ...state.settings.customMoods]
      },
    }),
    {
      name: 'digital-journal-storage',
    }
  )
)
