import { create } from 'zustand';
import type { Mentor, Investor, ServiceProvider, ServiceRecord } from '../types';
import { mockMentors, mockInvestors, mockProviders } from '../data/mockData';
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers';

interface ResourceStore {
  mentors: Mentor[];
  investors: Investor[];
  providers: ServiceProvider[];
  loadResources: () => void;
  addMentor: (mentor: Omit<Mentor, 'id' | 'serviceRecords'>) => void;
  updateMentor: (id: string, updates: Partial<Mentor>) => void;
  deleteMentor: (id: string) => void;
  addServiceRecord: (mentorId: string, record: Omit<ServiceRecord, 'id'>) => void;
  addInvestor: (investor: Omit<Investor, 'id'>) => void;
  updateInvestor: (id: string, updates: Partial<Investor>) => void;
  deleteInvestor: (id: string) => void;
  addProvider: (provider: Omit<ServiceProvider, 'id'>) => void;
  updateProvider: (id: string, updates: Partial<ServiceProvider>) => void;
  deleteProvider: (id: string) => void;
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
  mentors: [],
  investors: [],
  providers: [],

  loadResources: () => {
    const mentors = loadFromLocalStorage<Mentor[]>('incubator_mentors', mockMentors);
    const investors = loadFromLocalStorage<Investor[]>('incubator_investors', mockInvestors);
    const providers = loadFromLocalStorage<ServiceProvider[]>('incubator_providers', mockProviders);
    set({ mentors, investors, providers });
  },

  addMentor: (mentor) => {
    const newMentor: Mentor = {
      ...mentor,
      id: generateId(),
      serviceRecords: [],
    };
    const mentors = [...get().mentors, newMentor];
    set({ mentors });
    saveToLocalStorage('incubator_mentors', mentors);
  },

  updateMentor: (id, updates) => {
    const mentors = get().mentors.map(m =>
      m.id === id ? { ...m, ...updates } : m
    );
    set({ mentors });
    saveToLocalStorage('incubator_mentors', mentors);
  },

  deleteMentor: (id) => {
    const mentors = get().mentors.filter(m => m.id !== id);
    set({ mentors });
    saveToLocalStorage('incubator_mentors', mentors);
  },

  addServiceRecord: (mentorId, record) => {
    const newRecord: ServiceRecord = {
      ...record,
      id: generateId(),
    };
    const mentors = get().mentors.map(m =>
      m.id === mentorId
        ? { ...m, serviceRecords: [...m.serviceRecords, newRecord] }
        : m
    );
    set({ mentors });
    saveToLocalStorage('incubator_mentors', mentors);
  },

  addInvestor: (investor) => {
    const newInvestor: Investor = {
      ...investor,
      id: generateId(),
    };
    const investors = [...get().investors, newInvestor];
    set({ investors });
    saveToLocalStorage('incubator_investors', investors);
  },

  updateInvestor: (id, updates) => {
    const investors = get().investors.map(i =>
      i.id === id ? { ...i, ...updates } : i
    );
    set({ investors });
    saveToLocalStorage('incubator_investors', investors);
  },

  deleteInvestor: (id) => {
    const investors = get().investors.filter(i => i.id !== id);
    set({ investors });
    saveToLocalStorage('incubator_investors', investors);
  },

  addProvider: (provider) => {
    const newProvider: ServiceProvider = {
      ...provider,
      id: generateId(),
    };
    const providers = [...get().providers, newProvider];
    set({ providers });
    saveToLocalStorage('incubator_providers', providers);
  },

  updateProvider: (id, updates) => {
    const providers = get().providers.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ providers });
    saveToLocalStorage('incubator_providers', providers);
  },

  deleteProvider: (id) => {
    const providers = get().providers.filter(p => p.id !== id);
    set({ providers });
    saveToLocalStorage('incubator_providers', providers);
  },
}));
