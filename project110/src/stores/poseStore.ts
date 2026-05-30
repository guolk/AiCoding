import { create } from 'zustand';
import { YogaPose, PoseCategory, DifficultyLevel } from '@/types';
import { yogaPoses } from '@/data/poses';

interface PoseStore {
  poses: YogaPose[];
  selectedCategory: PoseCategory | null;
  selectedDifficulty: DifficultyLevel | null;
  searchQuery: string;
  filteredPoses: YogaPose[];
  
  setSelectedCategory: (category: PoseCategory | null) => void;
  setSelectedDifficulty: (difficulty: DifficultyLevel | null) => void;
  setSearchQuery: (query: string) => void;
  getPoseById: (id: string) => YogaPose | undefined;
  filterPoses: (params?: {
    category?: PoseCategory | null;
    difficulty?: DifficultyLevel | null;
    query?: string;
  }) => void;
}

export const usePoseStore = create<PoseStore>((set, get) => ({
  poses: yogaPoses,
  selectedCategory: null,
  selectedDifficulty: null,
  searchQuery: '',
  filteredPoses: yogaPoses,
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().filterPoses({ category });
  },
  
  setSelectedDifficulty: (difficulty) => {
    set({ selectedDifficulty: difficulty });
    get().filterPoses({ difficulty });
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterPoses({ query });
  },
  
  getPoseById: (id) => {
    return get().poses.find(pose => pose.id === id);
  },
  
  filterPoses: (params) => {
    const state = get();
    const category = params?.category !== undefined ? params.category : state.selectedCategory;
    const difficulty = params?.difficulty !== undefined ? params.difficulty : state.selectedDifficulty;
    const query = params?.query !== undefined ? params.query : state.searchQuery;
    
    let filtered = [...state.poses];
    
    if (category) {
      filtered = filtered.filter(pose => pose.category === category);
    }
    
    if (difficulty) {
      filtered = filtered.filter(pose => pose.difficulty === difficulty);
    }
    
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(pose =>
        pose.nameChinese.toLowerCase().includes(lowerQuery) ||
        pose.nameSanskrit.toLowerCase().includes(lowerQuery) ||
        pose.benefits.toLowerCase().includes(lowerQuery)
      );
    }
    
    set({ filteredPoses: filtered });
  },
}));
