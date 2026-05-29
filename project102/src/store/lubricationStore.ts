import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LubricationPoint, LubricationRecord } from '@/types';
import { mockLubricationPoints, mockLubricationRecords } from '@/data/mockData';
import { generateId, getToday, addDays } from '@/utils/helpers';

interface LubricationStore {
  points: LubricationPoint[];
  records: LubricationRecord[];
  initialized: boolean;
  
  initializeData: () => void;
  
  addPoint: (point: Omit<LubricationPoint, 'id'>) => void;
  updatePoint: (id: string, updates: Partial<LubricationPoint>) => void;
  deletePoint: (id: string) => void;
  getPointsByEquipment: (equipmentId: string) => LubricationPoint[];
  
  addRecord: (record: Omit<LubricationRecord, 'id'>) => void;
  getRecordsByPoint: (pointId: string) => LubricationRecord[];
  getRecordsByEquipment: (equipmentId: string) => LubricationRecord[];
  
  performChange: (pointId: string, operator: string, remark?: string) => void;
  
  getDuePoints: () => LubricationPoint[];
  getOverduePoints: () => LubricationPoint[];
}

export const useLubricationStore = create<LubricationStore>()(
  persist(
    (set, get) => ({
      points: [],
      records: [],
      initialized: false,
      
      initializeData: () => {
        if (get().initialized) return;
        set({
          points: mockLubricationPoints,
          records: mockLubricationRecords,
          initialized: true,
        });
      },
      
      addPoint: (point) => {
        set((state) => ({
          points: [...state.points, { ...point, id: generateId('lp') }],
        }));
      },
      
      updatePoint: (id, updates) => {
        set((state) => ({
          points: state.points.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },
      
      deletePoint: (id) => {
        set((state) => ({
          points: state.points.filter((p) => p.id !== id),
        }));
      },
      
      getPointsByEquipment: (equipmentId) => {
        return get().points.filter((p) => p.equipmentId === equipmentId);
      },
      
      addRecord: (record) => {
        set((state) => ({
          records: [...state.records, { ...record, id: generateId('lr') }],
        }));
      },
      
      getRecordsByPoint: (pointId) => {
        return get().records.filter((r) => r.pointId === pointId);
      },
      
      getRecordsByEquipment: (equipmentId) => {
        return get().records.filter((r) => r.equipmentId === equipmentId);
      },
      
      performChange: (pointId, operator, remark) => {
        const today = getToday();
        const point = get().points.find((p) => p.id === pointId);
        if (!point) return;
        
        const nextDate = addDays(today, point.changeCycle);
        
        set((state) => ({
          points: state.points.map((p) =>
            p.id === pointId
              ? { ...p, lastChangeDate: today, nextChangeDate: nextDate }
              : p
          ),
          records: [
            ...state.records,
            {
              id: generateId('lr'),
              pointId,
              equipmentId: point.equipmentId,
              oilType: point.oilType,
              changeDate: today,
              operator,
              remark,
            },
          ],
        }));
      },
      
      getDuePoints: () => {
        const today = getToday();
        const weekLater = addDays(today, 7);
        return get().points.filter((p) => p.nextChangeDate <= weekLater);
      },
      
      getOverduePoints: () => {
        const today = getToday();
        return get().points.filter((p) => p.nextChangeDate < today);
      },
    }),
    {
      name: 'lubrication-storage',
    }
  )
);
