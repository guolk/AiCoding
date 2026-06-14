import { create } from 'zustand';
import { Recording } from '@/types';

interface PlayerState {
  currentRecording: Recording | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  queue: Recording[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  
  setCurrentRecording: (recording: Recording) => void;
  play: () => void;
  pause: () => void;
  pauseRecording: () => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  next: () => void;
  previous: () => void;
  addToQueue: (recording: Recording) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  playRecording: (recording: Recording) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentRecording: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  playbackRate: 1,
  queue: [],
  currentIndex: -1,
  isShuffled: false,
  repeatMode: 'none',

  setCurrentRecording: (recording) => set({ 
    currentRecording: recording,
    duration: recording.audioMetadata?.duration || 0,
    currentTime: 0,
  }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  pauseRecording: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setPlaybackRate: (rate) => set({ playbackRate: Math.max(0.5, Math.min(2, rate)) }),

  next: () => {
    const { queue, currentIndex, repeatMode, isShuffled } = get();
    if (queue.length === 0) return;
    
    let nextIndex: number;
    if (repeatMode === 'one') {
      nextIndex = currentIndex;
    } else if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          set({ isPlaying: false });
          return;
        }
      }
    }
    
    const nextRecording = queue[nextIndex];
    if (nextRecording) {
      set({
        currentRecording: nextRecording,
        currentIndex: nextIndex,
        currentTime: 0,
        duration: nextRecording.audioMetadata?.duration || 0,
      });
    }
  },

  previous: () => {
    const { queue, currentIndex, currentTime } = get();
    
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }
    
    if (queue.length === 0 || currentIndex <= 0) {
      set({ currentTime: 0 });
      return;
    }
    
    const prevRecording = queue[currentIndex - 1];
    if (prevRecording) {
      set({
        currentRecording: prevRecording,
        currentIndex: currentIndex - 1,
        currentTime: 0,
        duration: prevRecording.audioMetadata?.duration || 0,
      });
    }
  },

  addToQueue: (recording) => set((state) => ({
    queue: [...state.queue, recording],
  })),

  removeFromQueue: (index) => set((state) => ({
    queue: state.queue.filter((_, i) => i !== index),
    currentIndex: state.currentIndex > index ? state.currentIndex - 1 : state.currentIndex,
  })),

  clearQueue: () => set({ queue: [], currentIndex: -1 }),

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  setRepeatMode: (mode) => set({ repeatMode: mode }),

  playRecording: (recording) => {
    const { queue } = get();
    const existingIndex = queue.findIndex(r => r.id === recording.id);
    
    if (existingIndex !== -1) {
      set({
        currentRecording: recording,
        currentIndex: existingIndex,
        currentTime: 0,
        duration: recording.audioMetadata?.duration || 0,
        isPlaying: true,
      });
    } else {
      set((state) => ({
        currentRecording: recording,
        queue: [...state.queue, recording],
        currentIndex: state.queue.length,
        currentTime: 0,
        duration: recording.audioMetadata?.duration || 0,
        isPlaying: true,
      }));
    }
  },
}));
