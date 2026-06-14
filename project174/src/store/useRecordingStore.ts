import { create } from 'zustand';
import { Recording, Collection, Tag } from '@/types';
import { mockRecordings } from '@/data/recordings';
import { mockCollections } from '@/data/collections';
import { defaultTags } from '@/data/tags';

interface RecordingState {
  recordings: Recording[];
  collections: Collection[];
  tags: Tag[];
  currentRecording: Recording | null;
  selectedTags: string[];
  searchQuery: string;
  sortBy: 'date' | 'title' | 'rating' | 'duration';
  sortOrder: 'asc' | 'desc';
  
  setCurrentRecording: (recording: Recording | null) => void;
  addRecording: (recording: Recording) => void;
  updateRecording: (id: string, updates: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'date' | 'title' | 'rating' | 'duration') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  addRecordingToCollection: (collectionId: string, recordingId: string) => void;
  removeRecordingFromCollection: (collectionId: string, recordingId: string) => void;
  getFilteredRecordings: () => Recording[];
  getRecordingById: (id: string) => Recording | undefined;
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  recordings: mockRecordings,
  collections: mockCollections.map((c, i) => ({
    ...c,
    recordingIds: mockRecordings.slice(i * 2, i * 2 + 2).map(r => r.id),
  })),
  tags: defaultTags,
  currentRecording: null,
  selectedTags: [],
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',

  setCurrentRecording: (recording) => set({ currentRecording: recording }),

  addRecording: (recording) => set((state) => ({
    recordings: [recording, ...state.recordings],
  })),

  updateRecording: (id, updates) => set((state) => ({
    recordings: state.recordings.map(r => 
      r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
    ),
    currentRecording: state.currentRecording?.id === id 
      ? { ...state.currentRecording, ...updates, updatedAt: new Date() } 
      : state.currentRecording,
  })),

  deleteRecording: (id) => set((state) => ({
    recordings: state.recordings.filter(r => r.id !== id),
    currentRecording: state.currentRecording?.id === id ? null : state.currentRecording,
    collections: state.collections.map(c => ({
      ...c,
      recordingIds: c.recordingIds.filter(rid => rid !== id),
    })),
  })),

  setSelectedTags: (tags) => set({ selectedTags: tags }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSortOrder: (sortOrder) => set({ sortOrder }),

  addCollection: (collection) => set((state) => ({
    collections: [collection, ...state.collections],
  })),

  updateCollection: (id, updates) => set((state) => ({
    collections: state.collections.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ),
  })),

  deleteCollection: (id) => set((state) => ({
    collections: state.collections.filter(c => c.id !== id),
  })),

  addRecordingToCollection: (collectionId, recordingId) => set((state) => ({
    collections: state.collections.map(c => 
      c.id === collectionId && !c.recordingIds.includes(recordingId)
        ? { ...c, recordingIds: [...c.recordingIds, recordingId] }
        : c
    ),
  })),

  removeRecordingFromCollection: (collectionId, recordingId) => set((state) => ({
    collections: state.collections.map(c => 
      c.id === collectionId
        ? { ...c, recordingIds: c.recordingIds.filter(id => id !== recordingId) }
        : c
    ),
  })),

  getFilteredRecordings: () => {
    const { recordings, selectedTags, searchQuery, sortBy, sortOrder } = get();
    
    let filtered = [...recordings];
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter(r => 
        r.tags.some(t => selectedTags.includes(t.id))
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.locationName.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.name.toLowerCase().includes(query))
      );
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = (a.qualityAssessment?.overallRating || 0) - (b.qualityAssessment?.overallRating || 0);
          break;
        case 'duration':
          comparison = (a.audioMetadata?.duration || 0) - (b.audioMetadata?.duration || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  },

  getRecordingById: (id) => {
    return get().recordings.find(r => r.id === id);
  },
}));
