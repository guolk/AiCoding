import { create } from 'zustand';
import type { Relic, ResearchNote, TypeAnalysis, Material, Output, DashboardStats } from '../../shared/types';

interface AppState {
  dashboard: DashboardStats | null;
  relics: Relic[];
  notes: ResearchNote[];
  analysis: TypeAnalysis[];
  materials: Material[];
  outputs: Output[];
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDashboard: (data: DashboardStats) => void;
  setRelics: (data: Relic[]) => void;
  addRelic: (relic: Relic) => void;
  updateRelic: (relic: Relic) => void;
  removeRelic: (id: string) => void;
  setNotes: (data: ResearchNote[]) => void;
  addNote: (note: ResearchNote) => void;
  updateNote: (note: ResearchNote) => void;
  removeNote: (id: string) => void;
  setAnalysis: (data: TypeAnalysis[]) => void;
  addAnalysis: (item: TypeAnalysis) => void;
  updateAnalysis: (item: TypeAnalysis) => void;
  removeAnalysis: (id: string) => void;
  setMaterials: (data: Material[]) => void;
  addMaterial: (item: Material) => void;
  updateMaterial: (item: Material) => void;
  removeMaterial: (id: string) => void;
  setOutputs: (data: Output[]) => void;
  addOutput: (item: Output) => void;
  updateOutput: (item: Output) => void;
  removeOutput: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  dashboard: null,
  relics: [],
  notes: [],
  analysis: [],
  materials: [],
  outputs: [],
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDashboard: (data) => set({ dashboard: data }),
  setRelics: (data) => set({ relics: data }),
  addRelic: (relic) => set((state) => ({ relics: [relic, ...state.relics] })),
  updateRelic: (relic) => set((state) => {
    return { relics: state.relics.map((r) => (r.id === relic.id ? relic : r)) };
  }),
  removeRelic: (id) => set((state) => ({ relics: state.relics.filter((r) => r.id !== id) })),
  setNotes: (data) => set({ notes: data }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (note) => set((state) => {
    return { notes: state.notes.map((n) => (n.id === note.id ? note : n)) };
  }),
  removeNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  setAnalysis: (data) => set({ analysis: data }),
  addAnalysis: (item) => set((state) => ({ analysis: [item, ...state.analysis] })),
  updateAnalysis: (item) => set((state) => {
    return { analysis: state.analysis.map((a) => (a.id === item.id ? item : a)) };
  }),
  removeAnalysis: (id) => set((state) => ({ analysis: state.analysis.filter((a) => a.id !== id) })),
  setMaterials: (data) => set({ materials: data }),
  addMaterial: (item) => set((state) => ({ materials: [item, ...state.materials] })),
  updateMaterial: (item) => set((state) => {
    return { materials: state.materials.map((m) => (m.id === item.id ? item : m)) };
  }),
  removeMaterial: (id) => set((state) => ({ materials: state.materials.filter((m) => m.id !== id) })),
  setOutputs: (data) => set({ outputs: data }),
  addOutput: (item) => set((state) => ({ outputs: [item, ...state.outputs] })),
  updateOutput: (item) => set((state) => {
    return { outputs: state.outputs.map((o) => (o.id === item.id ? item : o)) };
  }),
  removeOutput: (id) => set((state) => ({ outputs: state.outputs.filter((o) => o.id !== id) })),
}));
