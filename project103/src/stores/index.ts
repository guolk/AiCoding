import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ListeningMaterial, WrongWord, DailyStats, PracticeRecord } from '../types';
import { sampleMaterials } from '../data/materials';
import { getTodayKey, getLastNDays, generateId } from '../utils';

interface MaterialStore {
  materials: ListeningMaterial[];
  filteredMaterials: ListeningMaterial[];
  currentMaterial: ListeningMaterial | null;
  filters: {
    type: string | null;
    difficulty: string | null;
    practiceType: string | null;
    search: string;
  };
  setMaterials: (materials: ListeningMaterial[]) => void;
  setCurrentMaterial: (material: ListeningMaterial | null) => void;
  setFilters: (filters: Partial<MaterialStore['filters']>) => void;
  toggleFavorite: (id: string) => void;
  applyFilters: () => void;
}

export const useMaterialStore = create<MaterialStore>()(
  persist(
    (set, get) => ({
      materials: sampleMaterials,
      filteredMaterials: sampleMaterials,
      currentMaterial: null,
      filters: {
        type: null,
        difficulty: null,
        practiceType: null,
        search: '',
      },
      setMaterials: (materials) => set({ materials, filteredMaterials: materials }),
      setCurrentMaterial: (material) => set({ currentMaterial: material }),
      setFilters: (newFilters) => {
        const { filters, materials } = get();
        const updatedFilters = { ...filters, ...newFilters };
        let filtered = [...materials];

        if (updatedFilters.type) {
          filtered = filtered.filter(m => m.type === updatedFilters.type);
        }
        if (updatedFilters.difficulty) {
          filtered = filtered.filter(m => m.difficulty === updatedFilters.difficulty);
        }
        if (updatedFilters.practiceType) {
          filtered = filtered.filter(m => m.practiceType === updatedFilters.practiceType);
        }
        if (updatedFilters.search) {
          const search = updatedFilters.search.toLowerCase();
          filtered = filtered.filter(m => 
            m.title.toLowerCase().includes(search) || 
            m.transcript.toLowerCase().includes(search)
          );
        }

        set({ filters: updatedFilters, filteredMaterials: filtered });
      },
      toggleFavorite: (id) => {
        const { materials } = get();
        const updated = materials.map(m => 
          m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
        );
        set({ materials: updated });
        get().applyFilters();
      },
      applyFilters: () => {
        const { filters, materials } = get();
        let filtered = [...materials];

        if (filters.type) {
          filtered = filtered.filter(m => m.type === filters.type);
        }
        if (filters.difficulty) {
          filtered = filtered.filter(m => m.difficulty === filters.difficulty);
        }
        if (filters.practiceType) {
          filtered = filtered.filter(m => m.practiceType === filters.practiceType);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(m => 
            m.title.toLowerCase().includes(search) || 
            m.transcript.toLowerCase().includes(search)
          );
        }

        set({ filteredMaterials: filtered });
      },
    }),
    { name: 'material-storage' }
  )
);

interface PracticeStore {
  wrongWords: WrongWord[];
  practiceRecords: PracticeRecord[];
  addWrongWord: (wrongWord: WrongWord) => void;
  updateWrongWord: (id: string, correct: boolean) => void;
  addPracticeRecord: (record: Omit<PracticeRecord, 'id' | 'timestamp'>) => void;
  getMostWrongWords: (limit: number) => WrongWord[];
}

export const usePracticeStore = create<PracticeStore>()(
  persist(
    (set, get) => ({
      wrongWords: [],
      practiceRecords: [],
      addWrongWord: (wrongWord) => {
        const { wrongWords } = get();
        const existing = wrongWords.find(w => 
          w.materialId === wrongWord.materialId && 
          w.segmentId === wrongWord.segmentId && 
          w.word.toLowerCase() === wrongWord.word.toLowerCase()
        );
        
        if (existing) {
          const updated = wrongWords.map(w => 
            w.id === existing.id 
              ? { ...w, practiceCount: w.practiceCount + 1 } 
              : w
          );
          set({ wrongWords: updated });
        } else {
          set({ wrongWords: [...wrongWords, wrongWord] });
        }
      },
      updateWrongWord: (id, correct) => {
        const { wrongWords } = get();
        const updated = wrongWords.map(w => 
          w.id === id 
            ? { ...w, correctCount: correct ? w.correctCount + 1 : w.correctCount } 
            : w
        );
        set({ wrongWords: updated });
      },
      addPracticeRecord: (record) => {
        const { practiceRecords } = get();
        const newRecord: PracticeRecord = {
          ...record,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set({ practiceRecords: [...practiceRecords, newRecord] });
      },
      getMostWrongWords: (limit = 10) => {
        const { wrongWords } = get();
        return [...wrongWords]
          .sort((a, b) => b.practiceCount - a.practiceCount)
          .slice(0, limit);
      },
    }),
    { name: 'practice-storage' }
  )
);

interface ProgressStore {
  dailyStats: Record<string, DailyStats>;
  currentSession: {
    startTime: number;
    materialId: string | null;
  };
  completedMaterials: string[];
  startSession: (materialId: string) => void;
  endSession: (accuracy?: number) => void;
  addToCompleted: (materialId: string) => void;
  getStatsForLastNDays: (days: number) => DailyStats[];
  getTotalPracticeTime: () => number;
  getAverageAccuracy: () => number;
  getCompletedCount: () => number;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      dailyStats: {},
      currentSession: {
        startTime: 0,
        materialId: null,
      },
      completedMaterials: [],
      startSession: (materialId) => {
        set({ currentSession: { startTime: Date.now(), materialId } });
      },
      endSession: (accuracy) => {
        const { currentSession, dailyStats } = get();
        const today = getTodayKey();
        const duration = currentSession.startTime > 0 
          ? Math.round((Date.now() - currentSession.startTime) / 1000) 
          : 0;

        const todayStats = dailyStats[today] || {
          date: today,
          practiceDuration: 0,
          dictationAccuracy: 0,
          materialsCompleted: 0,
          wrongWords: [],
        };

        const accuracyCount = todayStats.dictationAccuracy > 0 ? 2 : 1;
        const newAccuracy = accuracy 
          ? Math.round(((todayStats.dictationAccuracy * (accuracyCount - 1)) + accuracy) / accuracyCount)
          : todayStats.dictationAccuracy;

        set({
          dailyStats: {
            ...dailyStats,
            [today]: {
              ...todayStats,
              practiceDuration: todayStats.practiceDuration + duration,
              dictationAccuracy: newAccuracy,
            },
          },
          currentSession: { startTime: 0, materialId: null },
        });
      },
      addToCompleted: (materialId) => {
        const { completedMaterials, dailyStats } = get();
        if (!completedMaterials.includes(materialId)) {
          const today = getTodayKey();
          const todayStats = dailyStats[today] || {
            date: today,
            practiceDuration: 0,
            dictationAccuracy: 0,
            materialsCompleted: 0,
            wrongWords: [],
          };

          set({
            completedMaterials: [...completedMaterials, materialId],
            dailyStats: {
              ...dailyStats,
              [today]: {
                ...todayStats,
                materialsCompleted: todayStats.materialsCompleted + 1,
              },
            },
          });
        }
      },
      getStatsForLastNDays: (days) => {
        const { dailyStats } = get();
        const lastNDays = getLastNDays(days);
        return lastNDays.map(date => 
          dailyStats[date] || {
            date,
            practiceDuration: 0,
            dictationAccuracy: 0,
            materialsCompleted: 0,
            wrongWords: [],
          }
        );
      },
      getTotalPracticeTime: () => {
        const { dailyStats } = get();
        return Object.values(dailyStats).reduce((total, day) => total + day.practiceDuration, 0);
      },
      getAverageAccuracy: () => {
        const { dailyStats } = get();
        const statsWithData = Object.values(dailyStats).filter(d => d.dictationAccuracy > 0);
        if (statsWithData.length === 0) return 0;
        return Math.round(statsWithData.reduce((sum, d) => sum + d.dictationAccuracy, 0) / statsWithData.length);
      },
      getCompletedCount: () => {
        const { completedMaterials } = get();
        return completedMaterials.length;
      },
    }),
    { name: 'progress-storage' }
  )
);
