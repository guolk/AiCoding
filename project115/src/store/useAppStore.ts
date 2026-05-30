import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, AppActions, Medicine, Supplement, MedicalRecord, DosageRecord, Reminder, ExamReport, InventoryCheck } from '../types';
import { seedMedicines, seedReminders, seedDosageRecords, seedSupplements, seedMedicalRecords, seedInventoryChecks } from '../data/seedData';

const initialState: AppState = {
  medicines: seedMedicines,
  dosageRecords: seedDosageRecords,
  reminders: seedReminders,
  supplements: seedSupplements,
  medicalRecords: seedMedicalRecords,
  examReports: [],
  inventoryChecks: seedInventoryChecks,
  lastInventoryCheckDate: '2026-04-30',
  inventoryCheckInterval: 30,
};

const isFirstTime = !localStorage.getItem('health-manager-storage');

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      ...(isFirstTime ? initialState : {
        medicines: [],
        dosageRecords: [],
        reminders: [],
        supplements: [],
        medicalRecords: [],
        examReports: [],
        inventoryChecks: [],
        inventoryCheckInterval: 30,
      }),
      
      addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => set((state) => ({
        medicines: [...state.medicines, {
          ...medicine,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      })),
      
      updateMedicine: (id: string, updates: Partial<Medicine>) => set((state) => ({
        medicines: state.medicines.map(m => 
          m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
        )
      })),
      
      deleteMedicine: (id: string) => set((state) => ({
        medicines: state.medicines.filter(m => m.id !== id),
        reminders: state.reminders.filter(r => r.medicineId !== id)
      })),
      
      addDosageRecord: (record: Omit<DosageRecord, 'id' | 'createdAt'>) => set((state) => ({
        dosageRecords: [...state.dosageRecords, {
          ...record,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }]
      })),
      
      updateDosageRecord: (id: string, updates: Partial<DosageRecord>) => set((state) => ({
        dosageRecords: state.dosageRecords.map(r =>
          r.id === id ? { ...r, ...updates } : r
        )
      })),
      
      addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => set((state) => ({
        reminders: [...state.reminders, {
          ...reminder,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }]
      })),
      
      updateReminder: (id: string, updates: Partial<Reminder>) => set((state) => ({
        reminders: state.reminders.map(r =>
          r.id === id ? { ...r, ...updates } : r
        )
      })),
      
      deleteReminder: (id: string) => set((state) => ({
        reminders: state.reminders.filter(r => r.id !== id)
      })),
      
      addSupplement: (supplement: Omit<Supplement, 'id' | 'createdAt' | 'updatedAt'>) => set((state) => ({
        supplements: [...state.supplements, {
          ...supplement,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      })),
      
      updateSupplement: (id: string, updates: Partial<Supplement>) => set((state) => ({
        supplements: state.supplements.map(s =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        )
      })),
      
      deleteSupplement: (id: string) => set((state) => ({
        supplements: state.supplements.filter(s => s.id !== id)
      })),
      
      addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => set((state) => ({
        medicalRecords: [...state.medicalRecords, {
          ...record,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      })),
      
      updateMedicalRecord: (id: string, updates: Partial<MedicalRecord>) => set((state) => ({
        medicalRecords: state.medicalRecords.map(r =>
          r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        )
      })),
      
      deleteMedicalRecord: (id: string) => set((state) => ({
        medicalRecords: state.medicalRecords.filter(r => r.id !== id),
        examReports: state.examReports.filter(e => e.recordId !== id)
      })),
      
      addExamReport: (report: Omit<ExamReport, 'id' | 'createdAt'>) => set((state) => ({
        examReports: [...state.examReports, {
          ...report,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }]
      })),
      
      deleteExamReport: (id: string) => set((state) => ({
        examReports: state.examReports.filter(e => e.id !== id)
      })),
      
      addInventoryCheck: (check: Omit<InventoryCheck, 'id' | 'createdAt'>) => set((state) => ({
        inventoryChecks: [...state.inventoryChecks, {
          ...check,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }]
      })),
      
      setInventoryCheckInterval: (days: number) => set(() => ({
        inventoryCheckInterval: days
      })),
      
      updateLastInventoryCheck: (date: string) => set(() => ({
        lastInventoryCheckDate: date
      })),
      
      resetAll: () => set({
        medicines: [],
        dosageRecords: [],
        reminders: [],
        supplements: [],
        medicalRecords: [],
        examReports: [],
        inventoryChecks: [],
        lastInventoryCheckDate: undefined,
        inventoryCheckInterval: 30,
      })
    }),
    {
      name: 'health-manager-storage'
    }
  )
);
