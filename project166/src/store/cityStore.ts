import { create } from 'zustand';
import type { City } from '@/types';
import { CITIES } from '@/data/cities';

interface CityState {
  cities: City[];
  selectedTag: string | null;
  searchQuery: string;
  sortBy: 'score' | 'cost' | 'internet' | 'name';
  setSelectedTag: (tag: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (sort: 'score' | 'cost' | 'internet' | 'name') => void;
  getFilteredCities: () => City[];
}

export const useCityStore = create<CityState>((set, get) => ({
  cities: CITIES,
  selectedTag: null,
  searchQuery: '',
  sortBy: 'score',
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (sort) => set({ sortBy: sort }),
  getFilteredCities: () => {
    const { cities, selectedTag, searchQuery, sortBy } = get();
    let filtered = [...cities];
    if (selectedTag) {
      filtered = filtered.filter(c => c.tags.includes(selectedTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'score':
        filtered.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case 'cost':
        filtered.sort((a, b) => a.monthlyCostUsd - b.monthlyCostUsd);
        break;
      case 'internet':
        filtered.sort((a, b) => b.avgInternetMbps - a.avgInternetMbps);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
        break;
    }
    return filtered;
  },
}));
