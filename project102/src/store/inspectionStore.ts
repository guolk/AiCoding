import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InspectionStandard, InspectionTask, InspectionRecord } from '@/types';
import { mockInspectionStandards, mockInspectionTasks, mockInspectionRecords } from '@/data/mockData';
import { generateId, getToday, addDays } from '@/utils/helpers';

interface InspectionStore {
  standards: InspectionStandard[];
  tasks: InspectionTask[];
  records: InspectionRecord[];
  initialized: boolean;
  
  initializeData: () => void;
  
  addStandard: (standard: Omit<InspectionStandard, 'id'>) => void;
  updateStandard: (id: string, updates: Partial<InspectionStandard>) => void;
  deleteStandard: (id: string) => void;
  getStandardsByEquipment: (equipmentId: string) => InspectionStandard[];
  
  addTask: (task: Omit<InspectionTask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<InspectionTask>) => void;
  completeTask: (taskId: string, inspector: string) => void;
  getTodayTasks: () => InspectionTask[];
  getPendingTasks: () => InspectionTask[];
  
  addRecord: (record: Omit<InspectionRecord, 'id'>) => void;
  getRecordsByEquipment: (equipmentId: string) => InspectionRecord[];
  
  generateDailyTasks: () => void;
}

export const useInspectionStore = create<InspectionStore>()(
  persist(
    (set, get) => ({
      standards: [],
      tasks: [],
      records: [],
      initialized: false,
      
      initializeData: () => {
        if (get().initialized) return;
        set({
          standards: mockInspectionStandards,
          tasks: mockInspectionTasks,
          records: mockInspectionRecords,
          initialized: true,
        });
      },
      
      addStandard: (standard) => {
        set((state) => ({
          standards: [...state.standards, { ...standard, id: generateId('is') }],
        }));
      },
      
      updateStandard: (id, updates) => {
        set((state) => ({
          standards: state.standards.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },
      
      deleteStandard: (id) => {
        set((state) => ({
          standards: state.standards.filter((s) => s.id !== id),
        }));
      },
      
      getStandardsByEquipment: (equipmentId) => {
        return get().standards.filter((s) => s.equipmentId === equipmentId);
      },
      
      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: generateId('task') }],
        }));
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      
      completeTask: (taskId, inspector) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'completed', completedAt: now, inspector }
              : t
          ),
        }));
      },
      
      getTodayTasks: () => {
        const today = getToday();
        return get().tasks.filter((t) => t.taskDate === today);
      },
      
      getPendingTasks: () => {
        return get().tasks.filter((t) => t.status !== 'completed');
      },
      
      addRecord: (record) => {
        set((state) => ({
          records: [...state.records, { ...record, id: generateId('ir') }],
        }));
      },
      
      getRecordsByEquipment: (equipmentId) => {
        return get().records.filter((r) => r.equipmentId === equipmentId);
      },
      
      generateDailyTasks: () => {
        const today = getToday();
        const { standards, tasks } = get();
        const existingTaskKeys = new Set(tasks.map((t) => `${t.standardId}-${t.taskDate}`));
        
        const newTasks: InspectionTask[] = [];
        
        standards.forEach((standard) => {
          const key = `${standard.id}-${today}`;
          if (!existingTaskKeys.has(key)) {
            newTasks.push({
              id: generateId('task'),
              standardId: standard.id,
              equipmentId: standard.equipmentId,
              taskDate: today,
              status: 'pending',
            });
          }
        });
        
        if (newTasks.length > 0) {
          set((state) => ({ tasks: [...state.tasks, ...newTasks] }));
        }
      },
    }),
    {
      name: 'inspection-storage',
    }
  )
);
