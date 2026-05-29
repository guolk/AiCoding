import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkOrder, SparePartUsage } from '@/types';
import { mockWorkOrders, mockSparePartUsages } from '@/data/mockData';
import { generateId } from '@/utils/helpers';

interface WorkOrderStore {
  workOrders: WorkOrder[];
  sparePartUsages: SparePartUsage[];
  initialized: boolean;
  
  initializeData: () => void;
  
  addWorkOrder: (order: Omit<WorkOrder, 'id'>) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  getWorkOrdersByEquipment: (equipmentId: string) => WorkOrder[];
  
  assignWorkOrder: (id: string, assignee: string) => void;
  startWorkOrder: (id: string) => void;
  completeWorkOrder: (id: string, repairContent: string, workHours: number) => void;
  closeWorkOrder: (id: string) => void;
  
  addSparePart: (part: Omit<SparePartUsage, 'id'>) => void;
  deleteSparePart: (id: string) => void;
  getSparePartsByWorkOrder: (workOrderId: string) => SparePartUsage[];
  
  getPendingWorkOrders: () => WorkOrder[];
  getActiveWorkOrders: () => WorkOrder[];
}

export const useWorkOrderStore = create<WorkOrderStore>()(
  persist(
    (set, get) => ({
      workOrders: [],
      sparePartUsages: [],
      initialized: false,
      
      initializeData: () => {
        if (get().initialized) return;
        set({
          workOrders: mockWorkOrders,
          sparePartUsages: mockSparePartUsages,
          initialized: true,
        });
      },
      
      addWorkOrder: (order) => {
        set((state) => ({
          workOrders: [...state.workOrders, { ...order, id: generateId('wo') }],
        }));
      },
      
      updateWorkOrder: (id, updates) => {
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === id ? { ...wo, ...updates } : wo
          ),
        }));
      },
      
      getWorkOrderById: (id) => {
        return get().workOrders.find((wo) => wo.id === id);
      },
      
      getWorkOrdersByEquipment: (equipmentId) => {
        return get().workOrders.filter((wo) => wo.equipmentId === equipmentId);
      },
      
      assignWorkOrder: (id, assignee) => {
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === id ? { ...wo, status: 'assigned', assignee } : wo
          ),
        }));
      },
      
      startWorkOrder: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === id ? { ...wo, status: 'processing', startTime: now } : wo
          ),
        }));
      },
      
      completeWorkOrder: (id, repairContent, workHours) => {
        const now = new Date().toISOString();
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === id
              ? { ...wo, status: 'completed', endTime: now, repairContent, workHours }
              : wo
          ),
        }));
      },
      
      closeWorkOrder: (id) => {
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === id ? { ...wo, status: 'closed' } : wo
          ),
        }));
      },
      
      addSparePart: (part) => {
        set((state) => ({
          sparePartUsages: [...state.sparePartUsages, { ...part, id: generateId('sp') }],
        }));
      },
      
      deleteSparePart: (id) => {
        set((state) => ({
          sparePartUsages: state.sparePartUsages.filter((p) => p.id !== id),
        }));
      },
      
      getSparePartsByWorkOrder: (workOrderId) => {
        return get().sparePartUsages.filter((p) => p.workOrderId === workOrderId);
      },
      
      getPendingWorkOrders: () => {
        return get().workOrders.filter((wo) => wo.status === 'pending');
      },
      
      getActiveWorkOrders: () => {
        return get().workOrders.filter((wo) => ['assigned', 'processing'].includes(wo.status));
      },
    }),
    {
      name: 'workorder-storage',
    }
  )
);
