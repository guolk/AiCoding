import { create } from 'zustand';
import type { TravelRecord, WorkEfficiency, Migration } from '@/types';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';

interface TravelState {
  records: TravelRecord[];
  efficiencies: WorkEfficiency[];
  migrations: Migration[];
  addRecord: (record: Omit<TravelRecord, 'id'>) => void;
  updateRecord: (id: string, record: Partial<TravelRecord>) => void;
  removeRecord: (id: string) => void;
  addEfficiency: (eff: Omit<WorkEfficiency, 'id'>) => void;
  addMigration: (migration: Omit<Migration, 'id'>) => void;
  removeMigration: (id: string) => void;
}

const INITIAL_RECORDS: TravelRecord[] = [
  {
    id: 'rec1',
    cityId: 'lisbon',
    startDate: '2026-02-01',
    endDate: '2026-04-15',
    accommodationCost: 1800,
    bestWorkspace: 'Second Home Lisboa',
    communityActivities: '每周三Nomad Meetup, LX Factory参观',
    satisfaction: 4.5,
    notes: '春季气候宜人，适合欧洲深度游',
  },
  {
    id: 'rec2',
    cityId: 'chiang-mai',
    startDate: '2026-04-20',
    endDate: '2026-06-30',
    accommodationCost: 18000,
    bestWorkspace: 'Punspace Nimman',
    communityActivities: 'Sunday Walking Street, 瑜伽课程',
    satisfaction: 5,
    notes: '性价比极高，社群活跃',
  },
];

const INITIAL_EFFICIENCIES: WorkEfficiency[] = [
  { id: 'e1', travelRecordId: 'rec1', cityId: 'lisbon', weekLabel: '2月第1周', tasksCompleted: 18, focusHours: 32 },
  { id: 'e2', travelRecordId: 'rec1', cityId: 'lisbon', weekLabel: '2月第2周', tasksCompleted: 22, focusHours: 35 },
  { id: 'e3', travelRecordId: 'rec1', cityId: 'lisbon', weekLabel: '2月第3周', tasksCompleted: 20, focusHours: 33 },
  { id: 'e4', travelRecordId: 'rec1', cityId: 'lisbon', weekLabel: '2月第4周', tasksCompleted: 24, focusHours: 38 },
  { id: 'e5', travelRecordId: 'rec2', cityId: 'chiang-mai', weekLabel: '5月第1周', tasksCompleted: 26, focusHours: 40 },
  { id: 'e6', travelRecordId: 'rec2', cityId: 'chiang-mai', weekLabel: '5月第2周', tasksCompleted: 28, focusHours: 42 },
  { id: 'e7', travelRecordId: 'rec2', cityId: 'chiang-mai', weekLabel: '5月第3周', tasksCompleted: 25, focusHours: 39 },
  { id: 'e8', travelRecordId: 'rec2', cityId: 'chiang-mai', weekLabel: '5月第4周', tasksCompleted: 30, focusHours: 45 },
  { id: 'e9', travelRecordId: 'rec2', cityId: 'chiang-mai', weekLabel: '6月第1周', tasksCompleted: 27, focusHours: 41 },
  { id: 'e10', travelRecordId: 'rec2', cityId: 'chiang-mai', weekLabel: '6月第2周', tasksCompleted: 29, focusHours: 43 },
];

const INITIAL_MIGRATIONS: Migration[] = [
  {
    id: 'm1',
    fromCityId: 'lisbon',
    toCityId: 'chiang-mai',
    date: '2026-04-18',
    transportType: 'flight',
    cost: 580,
    costCurrency: 'USD',
    durationHours: 16,
    notes: '迪拜转机，卡塔尔航空',
  },
];

export const useTravelStore = create<TravelState>((set, get) => ({
  records: loadFromStorage('travel-records', INITIAL_RECORDS),
  efficiencies: loadFromStorage('travel-efficiencies', INITIAL_EFFICIENCIES),
  migrations: loadFromStorage('travel-migrations', INITIAL_MIGRATIONS),
  addRecord: (record) => {
    const newRecord = { ...record, id: generateId() };
    const newRecords = [...get().records, newRecord];
    set({ records: newRecords });
    saveToStorage('travel-records', newRecords);
  },
  updateRecord: (id, record) => {
    const newRecords = get().records.map(r => (r.id === id ? { ...r, ...record } : r));
    set({ records: newRecords });
    saveToStorage('travel-records', newRecords);
  },
  removeRecord: (id) => {
    const newRecords = get().records.filter(r => r.id !== id);
    set({ records: newRecords });
    saveToStorage('travel-records', newRecords);
  },
  addEfficiency: (eff) => {
    const newEff = { ...eff, id: generateId() };
    const newEfficiencies = [...get().efficiencies, newEff];
    set({ efficiencies: newEfficiencies });
    saveToStorage('travel-efficiencies', newEfficiencies);
  },
  addMigration: (migration) => {
    const newMigration = { ...migration, id: generateId() };
    const newMigrations = [...get().migrations, newMigration];
    set({ migrations: newMigrations });
    saveToStorage('travel-migrations', newMigrations);
  },
  removeMigration: (id) => {
    const newMigrations = get().migrations.filter(m => m.id !== id);
    set({ migrations: newMigrations });
    saveToStorage('travel-migrations', newMigrations);
  },
}));
