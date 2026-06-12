import { create } from 'zustand';
import type { VisaRecord, BorderRecord } from '@/types';
import { loadFromStorage, saveToStorage, generateId } from '@/utils/storage';

interface VisaState {
  visas: VisaRecord[];
  borders: BorderRecord[];
  addVisa: (visa: Omit<VisaRecord, 'id'>) => void;
  updateVisa: (id: string, visa: Partial<VisaRecord>) => void;
  removeVisa: (id: string) => void;
  addBorder: (border: Omit<BorderRecord, 'id'>) => void;
  removeBorder: (id: string) => void;
  getExpiringVisas: (days?: number) => VisaRecord[];
}

const INITIAL_VISAS: VisaRecord[] = [
  {
    id: 'v1',
    country: '泰国',
    countryCode: 'TH',
    visaType: 'tourist',
    issueDate: '2026-04-15',
    expiryDate: '2026-10-15',
    maxStayDays: 60,
    notes: '可在境内续签一次30天',
    requirements: '护照有效期6个月以上, 2寸照片, 返程机票',
  },
  {
    id: 'v2',
    country: '葡萄牙',
    countryCode: 'PT',
    visaType: 'digital-nomad',
    issueDate: '2026-01-10',
    expiryDate: '2027-01-10',
    maxStayDays: 365,
    notes: 'D8数字游民签证, 月收入要求2800欧元以上',
    requirements: '收入证明, 健康保险, 无犯罪记录证明',
  },
  {
    id: 'v3',
    country: '印度尼西亚',
    countryCode: 'ID',
    visaType: 'tourist',
    issueDate: '2026-06-25',
    expiryDate: '2026-07-25',
    maxStayDays: 30,
    notes: 'B211A签证, 可在境内续签4次',
    requirements: '护照, 签证申请表, 入境章',
  },
];

const INITIAL_BORDERS: BorderRecord[] = [
  { id: 'b1', country: '葡萄牙', countryCode: 'PT', direction: 'exit', date: '2026-04-17', notes: '里斯本机场' },
  { id: 'b2', country: '泰国', countryCode: 'TH', direction: 'entry', date: '2026-04-20', notes: '素万那普机场' },
];

export const useVisaStore = create<VisaState>((set, get) => ({
  visas: loadFromStorage('visas', INITIAL_VISAS),
  borders: loadFromStorage('borders', INITIAL_BORDERS),
  addVisa: (visa) => {
    const newVisa = { ...visa, id: generateId() };
    const newList = [...get().visas, newVisa];
    set({ visas: newList });
    saveToStorage('visas', newList);
  },
  updateVisa: (id, visa) => {
    const newList = get().visas.map(v => (v.id === id ? { ...v, ...visa } : v));
    set({ visas: newList });
    saveToStorage('visas', newList);
  },
  removeVisa: (id) => {
    const newList = get().visas.filter(v => v.id !== id);
    set({ visas: newList });
    saveToStorage('visas', newList);
  },
  addBorder: (border) => {
    const newBorder = { ...border, id: generateId() };
    const newList = [...get().borders, newBorder];
    set({ borders: newList });
    saveToStorage('borders', newList);
  },
  removeBorder: (id) => {
    const newList = get().borders.filter(b => b.id !== id);
    set({ borders: newList });
    saveToStorage('borders', newList);
  },
  getExpiringVisas: (days = 30) => {
    const now = Date.now();
    return get().visas.filter(v => {
      const expiry = new Date(v.expiryDate).getTime();
      const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= days;
    });
  },
}));
