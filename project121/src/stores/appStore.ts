import { create } from 'zustand';
import type {
  Work,
  Version,
  ListeningNote,
  Composer,
  Concert
} from '../../shared/types';
import {
  workApi,
  versionApi,
  noteApi,
  composerApi,
  concertApi
} from '../services/api';

interface AppState {
  works: Work[];
  versions: Version[];
  notes: ListeningNote[];
  composers: Composer[];
  concerts: Concert[];
  loading: boolean;
  error: string | null;
  
  fetchAllData: () => Promise<void>;
  
  fetchWorks: () => Promise<void>;
  addWork: (work: Omit<Work, 'id' | 'createdAt' | 'updatedAt' | 'listenCount'>) => Promise<void>;
  updateWork: (id: string, data: Partial<Work>) => Promise<void>;
  deleteWork: (id: string) => Promise<void>;
  
  fetchVersions: (workId: string) => Promise<void>;
  addVersion: (version: Omit<Version, 'id' | 'createdAt'>) => Promise<void>;
  updateVersion: (id: string, data: Partial<Version>) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  
  fetchNotes: () => Promise<void>;
  addNote: (note: Omit<ListeningNote, 'id' | 'createdAt'>) => Promise<void>;
  updateNote: (id: string, data: Partial<ListeningNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  fetchComposers: () => Promise<void>;
  addComposer: (composer: Omit<Composer, 'id' | 'createdAt'>) => Promise<void>;
  updateComposer: (id: string, data: Partial<Composer>) => Promise<void>;
  deleteComposer: (id: string) => Promise<void>;
  
  fetchConcerts: () => Promise<void>;
  addConcert: (concert: Omit<Concert, 'id' | 'createdAt'>) => Promise<void>;
  updateConcert: (id: string, data: Partial<Concert>) => Promise<void>;
  deleteConcert: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  works: [],
  versions: [],
  notes: [],
  composers: [],
  concerts: [],
  loading: false,
  error: null,

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [works, composers, notes, concerts] = await Promise.all([
        workApi.getAll(),
        composerApi.getAll(),
        noteApi.getAll(),
        concertApi.getAll()
      ]);
      set({ works, composers, notes, concerts, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchWorks: async () => {
    set({ loading: true, error: null });
    try {
      const works = await workApi.getAll();
      set({ works, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addWork: async (work) => {
    set({ loading: true, error: null });
    try {
      const newWork = await workApi.create(work);
      set((state) => ({ works: [...state.works, newWork], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateWork: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedWork = await workApi.update(id, data);
      if (updatedWork) {
        set((state) => ({
          works: state.works.map((w) => (w.id === id ? updatedWork : w)),
          loading: false
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteWork: async (id) => {
    set({ loading: true, error: null });
    try {
      await workApi.delete(id);
      set((state) => ({
        works: state.works.filter((w) => w.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchVersions: async (workId) => {
    set({ loading: true, error: null });
    try {
      const versions = await workApi.getVersions(workId);
      set({ versions, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addVersion: async (version) => {
    set({ loading: true, error: null });
    try {
      const newVersion = await versionApi.create(version);
      set((state) => ({ versions: [...state.versions, newVersion], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateVersion: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedVersion = await versionApi.update(id, data);
      if (updatedVersion) {
        set((state) => ({
          versions: state.versions.map((v) => (v.id === id ? updatedVersion : v)),
          loading: false
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteVersion: async (id) => {
    set({ loading: true, error: null });
    try {
      await versionApi.delete(id);
      set((state) => ({
        versions: state.versions.filter((v) => v.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const notes = await noteApi.getAll();
      set({ notes, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addNote: async (note) => {
    set({ loading: true, error: null });
    try {
      const newNote = await noteApi.create(note);
      set((state) => ({ notes: [...state.notes, newNote], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateNote: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedNote = await noteApi.update(id, data);
      if (updatedNote) {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
          loading: false
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteNote: async (id) => {
    set({ loading: true, error: null });
    try {
      await noteApi.delete(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchComposers: async () => {
    set({ loading: true, error: null });
    try {
      const composers = await composerApi.getAll();
      set({ composers, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addComposer: async (composer) => {
    set({ loading: true, error: null });
    try {
      const newComposer = await composerApi.create(composer);
      set((state) => ({ composers: [...state.composers, newComposer], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateComposer: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedComposer = await composerApi.update(id, data);
      if (updatedComposer) {
        set((state) => ({
          composers: state.composers.map((c) => (c.id === id ? updatedComposer : c)),
          loading: false
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteComposer: async (id) => {
    set({ loading: true, error: null });
    try {
      await composerApi.delete(id);
      set((state) => ({
        composers: state.composers.filter((c) => c.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchConcerts: async () => {
    set({ loading: true, error: null });
    try {
      const concerts = await concertApi.getAll();
      set({ concerts, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addConcert: async (concert) => {
    set({ loading: true, error: null });
    try {
      const newConcert = await concertApi.create(concert);
      set((state) => ({ concerts: [...state.concerts, newConcert], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateConcert: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedConcert = await concertApi.update(id, data);
      if (updatedConcert) {
        set((state) => ({
          concerts: state.concerts.map((c) => (c.id === id ? updatedConcert : c)),
          loading: false
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteConcert: async (id) => {
    set({ loading: true, error: null });
    try {
      await concertApi.delete(id);
      set((state) => ({
        concerts: state.concerts.filter((c) => c.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));
