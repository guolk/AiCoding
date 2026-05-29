import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, NoteCategory } from '../types';

interface NoteState {
  notes: Note[];
  selectedCategory: NoteCategory | 'all';
  searchQuery: string;
}

interface NoteActions {
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;
  setCategory: (category: NoteCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
}

export type NoteStore = NoteState & NoteActions;

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: [],
      selectedCategory: 'all',
      searchQuery: '',

      addNote: (note) => {
        const now = new Date();
        const newNote: Note = {
          ...note,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },

      updateNote: (id, updates) => {
        const now = new Date();
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: now } : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      setCategory: (category) => {
        set({ selectedCategory: category });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
    }),
    {
      name: 'note-store',
      version: 1,
    }
  )
);
