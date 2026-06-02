import { create } from 'zustand';
import type { DataRoomItem } from '../types';
import { mockDataRoomItems } from '../data/mockData';
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers';

interface DataRoomStore {
  dataRoomItems: DataRoomItem[];
  loadDataRoomItems: () => void;
  addItem: (item: Omit<DataRoomItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<DataRoomItem>) => void;
  updateItemStatus: (id: string, status: DataRoomItem['status']) => void;
  deleteItem: (id: string) => void;
  getItemsByProjectId: (projectId: string) => DataRoomItem[];
}

export const useDataRoomStore = create<DataRoomStore>((set, get) => ({
  dataRoomItems: [],

  loadDataRoomItems: () => {
    const saved = loadFromLocalStorage<DataRoomItem[]>('incubator_dataroom', mockDataRoomItems);
    set({ dataRoomItems: saved });
  },

  addItem: (item) => {
    const newItem: DataRoomItem = {
      ...item,
      id: generateId(),
    };
    const dataRoomItems = [...get().dataRoomItems, newItem];
    set({ dataRoomItems });
    saveToLocalStorage('incubator_dataroom', dataRoomItems);
  },

  updateItem: (id, updates) => {
    const dataRoomItems = get().dataRoomItems.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    set({ dataRoomItems });
    saveToLocalStorage('incubator_dataroom', dataRoomItems);
  },

  updateItemStatus: (id, status) => {
    const now = new Date().toISOString().split('T')[0];
    const dataRoomItems = get().dataRoomItems.map((i) =>
      i.id === id
        ? {
            ...i,
            status,
            uploadDate: status !== 'pending' ? now : i.uploadDate,
          }
        : i
    );
    set({ dataRoomItems });
    saveToLocalStorage('incubator_dataroom', dataRoomItems);
  },

  deleteItem: (id) => {
    const dataRoomItems = get().dataRoomItems.filter((i) => i.id !== id);
    set({ dataRoomItems });
    saveToLocalStorage('incubator_dataroom', dataRoomItems);
  },

  getItemsByProjectId: (projectId) => {
    return get().dataRoomItems.filter((i) => i.projectId === projectId);
  },
}));
