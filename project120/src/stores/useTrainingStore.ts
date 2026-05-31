import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TrainingRecord, InjuryRecord } from '@/types';
import { mockTrainingRecords, mockInjuryRecords } from '@/utils/mockData';
import { generateId } from '@/utils/storage';

interface TrainingState {
  records: TrainingRecord[];
  injuries: InjuryRecord[];
  addRecord: (record: Omit<TrainingRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, updates: Partial<TrainingRecord>) => void;
  deleteRecord: (id: string) => void;
  addInjury: (injury: Omit<InjuryRecord, 'id' | 'createdAt'>) => void;
  updateInjury: (id: string, updates: Partial<InjuryRecord>) => void;
  deleteInjury: (id: string) => void;
  getRecordsBySport: (sportType: string) => TrainingRecord[];
  getActiveInjuries: () => InjuryRecord[];
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      records: mockTrainingRecords,
      injuries: mockInjuryRecords,
      addRecord: (record) => {
        const newRecord: TrainingRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
      },
      updateRecord: (id, updates) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },
      addInjury: (injury) => {
        const newInjury: InjuryRecord = {
          ...injury,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          injuries: [newInjury, ...state.injuries],
        }));
      },
      updateInjury: (id, updates) => {
        set((state) => ({
          injuries: state.injuries.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }));
      },
      deleteInjury: (id) => {
        set((state) => ({
          injuries: state.injuries.filter((i) => i.id !== id),
        }));
      },
      getRecordsBySport: (sportType) => {
        return get().records.filter((r) => r.sportType === sportType);
      },
      getActiveInjuries: () => {
        return get().injuries.filter((i) => i.status !== 'recovered');
      },
    }),
    {
      name: 'training-storage',
    }
  )
);
