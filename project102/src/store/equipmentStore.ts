import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, TechParameter, EquipmentDocument } from '@/types';
import { mockEquipments, mockTechParameters, mockDocuments } from '@/data/mockData';
import { generateId, getToday } from '@/utils/helpers';

interface EquipmentStore {
  equipments: Equipment[];
  techParameters: TechParameter[];
  documents: EquipmentDocument[];
  initialized: boolean;
  
  initializeData: () => void;
  
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  getEquipmentById: (id: string) => Equipment | undefined;
  
  addTechParameter: (param: Omit<TechParameter, 'id'>) => void;
  updateTechParameter: (id: string, updates: Partial<TechParameter>) => void;
  deleteTechParameter: (id: string) => void;
  getTechParametersByEquipment: (equipmentId: string) => TechParameter[];
  
  addDocument: (doc: Omit<EquipmentDocument, 'id'>) => void;
  deleteDocument: (id: string) => void;
  getDocumentsByEquipment: (equipmentId: string) => EquipmentDocument[];
}

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      equipments: [],
      techParameters: [],
      documents: [],
      initialized: false,
      
      initializeData: () => {
        if (get().initialized) return;
        set({
          equipments: mockEquipments,
          techParameters: mockTechParameters,
          documents: mockDocuments,
          initialized: true,
        });
      },
      
      addEquipment: (equipment) => {
        const now = getToday();
        const newEquipment: Equipment = {
          ...equipment,
          id: generateId('eq'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ equipments: [...state.equipments, newEquipment] }));
      },
      
      updateEquipment: (id, updates) => {
        set((state) => ({
          equipments: state.equipments.map((eq) =>
            eq.id === id ? { ...eq, ...updates, updatedAt: getToday() } : eq
          ),
        }));
      },
      
      deleteEquipment: (id) => {
        set((state) => ({
          equipments: state.equipments.filter((eq) => eq.id !== id),
          techParameters: state.techParameters.filter((p) => p.equipmentId !== id),
          documents: state.documents.filter((d) => d.equipmentId !== id),
        }));
      },
      
      getEquipmentById: (id) => {
        return get().equipments.find((eq) => eq.id === id);
      },
      
      addTechParameter: (param) => {
        set((state) => ({
          techParameters: [...state.techParameters, { ...param, id: generateId('tp') }],
        }));
      },
      
      updateTechParameter: (id, updates) => {
        set((state) => ({
          techParameters: state.techParameters.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },
      
      deleteTechParameter: (id) => {
        set((state) => ({
          techParameters: state.techParameters.filter((p) => p.id !== id),
        }));
      },
      
      getTechParametersByEquipment: (equipmentId) => {
        return get().techParameters.filter((p) => p.equipmentId === equipmentId);
      },
      
      addDocument: (doc) => {
        set((state) => ({
          documents: [...state.documents, { ...doc, id: generateId('doc') }],
        }));
      },
      
      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        }));
      },
      
      getDocumentsByEquipment: (equipmentId) => {
        return get().documents.filter((d) => d.equipmentId === equipmentId);
      },
    }),
    {
      name: 'equipment-storage',
    }
  )
);
