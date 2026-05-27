import { create } from 'zustand';
import type { StudyNote, NoteType, Topic } from '../types';
import { getItem, setItem, generateId } from '../utils/storage';

interface NoteStore {
  notes: StudyNote[];
  addNote: (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<StudyNote>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => StudyNote | undefined;
  getNotesByType: (type: NoteType) => StudyNote[];
  getNotesByTopic: (topic: Topic) => StudyNote[];
  loadNotes: () => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],

  loadNotes: () => {
    const stored = getItem<StudyNote[]>('notes');
    if (stored) {
      set({ notes: stored });
    }
  },

  addNote: (note) => {
    const now = new Date().toISOString();
    const newNote: StudyNote = {
      ...note,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const notes = [...get().notes, newNote];
    set({ notes });
    setItem('notes', notes);
  },

  updateNote: (id, updates) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    set({ notes });
    setItem('notes', notes);
  },

  deleteNote: (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    set({ notes });
    setItem('notes', notes);
  },

  getNote: (id) => get().notes.find((n) => n.id === id),

  getNotesByType: (type) => get().notes.filter((n) => n.type === type),

  getNotesByTopic: (topic) => get().notes.filter((n) => n.topic === topic),
}));
