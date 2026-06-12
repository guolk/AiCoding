import { create } from 'zustand';
import type { Workspace, ChecklistItem } from '@/types';
import { INITIAL_WORKSPACES, INITIAL_CHECKLIST } from '@/data/workspaces';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';

interface WorkspaceState {
  workspaces: Workspace[];
  checklist: ChecklistItem[];
  addWorkspace: (ws: Omit<Workspace, 'id'>) => void;
  updateWorkspace: (id: string, ws: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;
  toggleChecklist: (id: string) => void;
  addChecklist: (item: Omit<ChecklistItem, 'id'>) => void;
  removeChecklist: (id: string) => void;
  getWorkspacesByCity: (cityId: string) => Workspace[];
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: loadFromStorage('workspaces', INITIAL_WORKSPACES),
  checklist: loadFromStorage('workspace-checklist', INITIAL_CHECKLIST),
  addWorkspace: (ws) => {
    const newWs = { ...ws, id: generateId() };
    const newList = [...get().workspaces, newWs];
    set({ workspaces: newList });
    saveToStorage('workspaces', newList);
  },
  updateWorkspace: (id, ws) => {
    const newList = get().workspaces.map(w => (w.id === id ? { ...w, ...ws } : w));
    set({ workspaces: newList });
    saveToStorage('workspaces', newList);
  },
  removeWorkspace: (id) => {
    const newList = get().workspaces.filter(w => w.id !== id);
    set({ workspaces: newList });
    saveToStorage('workspaces', newList);
  },
  toggleChecklist: (id) => {
    const newList = get().checklist.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    set({ checklist: newList });
    saveToStorage('workspace-checklist', newList);
  },
  addChecklist: (item) => {
    const newItem = { ...item, id: generateId() };
    const newList = [...get().checklist, newItem];
    set({ checklist: newList });
    saveToStorage('workspace-checklist', newList);
  },
  removeChecklist: (id) => {
    const newList = get().checklist.filter(c => c.id !== id);
    set({ checklist: newList });
    saveToStorage('workspace-checklist', newList);
  },
  getWorkspacesByCity: (cityId) => get().workspaces.filter(w => w.cityId === cityId),
}));
