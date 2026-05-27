import { create } from 'zustand';
import type { WrongNote, ErrorReason } from '../types';
import { getItem, setItem, generateId } from '../utils/storage';
import { calculateNextReview, formatReviewDate } from '../utils/sm2';
import type { Quality } from '../utils/sm2';

interface WrongNoteStore {
  wrongNotes: WrongNote[];
  addWrongNote: (note: Omit<WrongNote, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'nextReviewDate' | 'easeFactor' | 'interval' | 'isMastered'>) => void;
  updateWrongNote: (id: string, updates: Partial<WrongNote>) => void;
  deleteWrongNote: (id: string) => void;
  getWrongNote: (id: string) => WrongNote | undefined;
  reviewWrongNote: (id: string, quality: Quality) => void;
  getDueNotes: () => WrongNote[];
  getNotesByReason: (reason: ErrorReason) => WrongNote[];
  getNotesByTopic: (topic: string, questionIds: string[]) => WrongNote[];
  loadWrongNotes: () => void;
}

export const useWrongNoteStore = create<WrongNoteStore>((set, get) => ({
  wrongNotes: [],

  loadWrongNotes: () => {
    const stored = getItem<WrongNote[]>('wrongNotes');
    if (stored) {
      set({ wrongNotes: stored });
    }
  },

  addWrongNote: (note) => {
    const now = new Date().toISOString();
    const newNote: WrongNote = {
      ...note,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      nextReviewDate: new Date().toISOString().split('T')[0],
      easeFactor: 2.5,
      interval: 1,
      isMastered: false,
    };
    const wrongNotes = [...get().wrongNotes, newNote];
    set({ wrongNotes });
    setItem('wrongNotes', wrongNotes);
  },

  updateWrongNote: (id, updates) => {
    const wrongNotes = get().wrongNotes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    set({ wrongNotes });
    setItem('wrongNotes', wrongNotes);
  },

  deleteWrongNote: (id) => {
    const wrongNotes = get().wrongNotes.filter((n) => n.id !== id);
    set({ wrongNotes });
    setItem('wrongNotes', wrongNotes);
  },

  getWrongNote: (id) => get().wrongNotes.find((n) => n.id === id),

  reviewWrongNote: (id, quality) => {
    const note = get().wrongNotes.find((n) => n.id === id);
    if (!note) return;

    const result = calculateNextReview(note, quality);
    const wrongNotes = get().wrongNotes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          ...result,
          nextReviewDate: formatReviewDate(result.nextReviewDate),
          isMastered: quality >= 4 && n.reviewCount >= 2,
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });
    set({ wrongNotes });
    setItem('wrongNotes', wrongNotes);
  },

  getDueNotes: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().wrongNotes.filter((n) => n.nextReviewDate <= today && !n.isMastered);
  },

  getNotesByReason: (reason) => get().wrongNotes.filter((n) => n.errorReason === reason),

  getNotesByTopic: (topic, questionIds) => {
    return get().wrongNotes.filter((n) => questionIds.includes(n.questionId));
  },
}));
