import { create } from 'zustand';
import type {
  Institution,
  Donation,
  VolunteerRecord,
  ItemDonation,
  OnlineAction,
  ProjectProgress,
  ImpactEstimate,
  InstitutionStatistics,
  AnnualReportData,
} from '../../shared/types';
import { api } from '@/lib/api';

interface AppState {
  institutions: Institution[];
  donations: Donation[];
  volunteerRecords: VolunteerRecord[];
  itemDonations: ItemDonation[];
  onlineActions: OnlineAction[];
  progress: ProjectProgress[];
  impactEstimates: ImpactEstimate[];
  statistics: InstitutionStatistics[];
  annualReport: AnnualReportData | null;
  loading: boolean;
  error: string | null;

  loadAllData: (year?: number) => Promise<void>;
  loadInstitutions: () => Promise<void>;
  loadDonations: () => Promise<void>;
  loadStatistics: () => Promise<void>;
  loadVolunteerRecords: () => Promise<void>;
  loadItemDonations: () => Promise<void>;
  loadOnlineActions: () => Promise<void>;
  loadProgress: (donationId?: number) => Promise<void>;
  loadImpactEstimates: () => Promise<void>;
  loadAnnualReport: (year: number) => Promise<void>;

  addDonation: (data: Partial<Donation>) => Promise<boolean>;
  updateDonation: (id: number, data: Partial<Donation>) => Promise<boolean>;
  deleteDonation: (id: number) => Promise<boolean>;

  addInstitution: (data: Partial<Institution>) => Promise<boolean>;
  updateInstitution: (id: number, data: Partial<Institution>) => Promise<boolean>;
  deleteInstitution: (id: number) => Promise<boolean>;

  addVolunteerRecord: (data: Partial<VolunteerRecord>) => Promise<boolean>;
  updateVolunteerRecord: (id: number, data: Partial<VolunteerRecord>) => Promise<boolean>;
  deleteVolunteerRecord: (id: number) => Promise<boolean>;

  addItemDonation: (data: Partial<ItemDonation>) => Promise<boolean>;
  updateItemDonation: (id: number, data: Partial<ItemDonation>) => Promise<boolean>;
  deleteItemDonation: (id: number) => Promise<boolean>;

  addOnlineAction: (data: Partial<OnlineAction>) => Promise<boolean>;
  updateOnlineAction: (id: number, data: Partial<OnlineAction>) => Promise<boolean>;
  deleteOnlineAction: (id: number) => Promise<boolean>;

  addProgress: (data: Partial<ProjectProgress>) => Promise<boolean>;
  addImpactEstimate: (data: Partial<ImpactEstimate>) => Promise<boolean>;

  getInstitutionName: (id: number) => string;
  getTotalDonations: () => number;
  getTotalVolunteerHours: () => number;
  getTotalPeopleHelped: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  institutions: [],
  donations: [],
  volunteerRecords: [],
  itemDonations: [],
  onlineActions: [],
  progress: [],
  impactEstimates: [],
  statistics: [],
  annualReport: null,
  loading: false,
  error: null,

  loadAllData: async (year = new Date().getFullYear()) => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().loadInstitutions(),
        get().loadDonations(),
        get().loadStatistics(),
        get().loadVolunteerRecords(),
        get().loadItemDonations(),
        get().loadOnlineActions(),
        get().loadProgress(),
        get().loadImpactEstimates(),
        get().loadAnnualReport(year),
      ]);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load data' });
    } finally {
      set({ loading: false });
    }
  },

  loadInstitutions: async () => {
    const result = await api.institutions.getAll();
    if (result.success && result.data) {
      set({ institutions: result.data });
    }
  },

  loadDonations: async () => {
    const result = await api.donations.getAll();
    if (result.success && result.data) {
      set({ donations: result.data });
    }
  },

  loadStatistics: async () => {
    const result = await api.donations.getStatistics();
    if (result.success && result.data) {
      set({ statistics: result.data });
    }
  },

  loadVolunteerRecords: async () => {
    const result = await api.volunteer.getAll();
    if (result.success && result.data) {
      set({ volunteerRecords: result.data });
    }
  },

  loadItemDonations: async () => {
    const result = await api.items.getAll();
    if (result.success && result.data) {
      set({ itemDonations: result.data });
    }
  },

  loadOnlineActions: async () => {
    const result = await api.onlineActions.getAll();
    if (result.success && result.data) {
      set({ onlineActions: result.data });
    }
  },

  loadProgress: async (donationId?: number) => {
    const result = await api.progress.getAll(donationId);
    if (result.success && result.data) {
      set({ progress: result.data });
    }
  },

  loadImpactEstimates: async () => {
    const result = await api.impact.getAll();
    if (result.success && result.data) {
      set({ impactEstimates: result.data });
    }
  },

  loadAnnualReport: async (year: number) => {
    const result = await api.report.getAnnual(year);
    if (result.success && result.data) {
      set({ annualReport: result.data });
    }
  },

  addDonation: async (data) => {
    const result = await api.donations.create(data);
    if (result.success) {
      await get().loadDonations();
      await get().loadStatistics();
      return true;
    }
    return false;
  },

  updateDonation: async (id, data) => {
    const result = await api.donations.update(id, data);
    if (result.success) {
      await get().loadDonations();
      await get().loadStatistics();
      return true;
    }
    return false;
  },

  deleteDonation: async (id) => {
    const result = await api.donations.delete(id);
    if (result.success) {
      await get().loadDonations();
      await get().loadStatistics();
      return true;
    }
    return false;
  },

  addInstitution: async (data) => {
    const result = await api.institutions.create(data);
    if (result.success) {
      await get().loadInstitutions();
      return true;
    }
    return false;
  },

  updateInstitution: async (id, data) => {
    const result = await api.institutions.update(id, data);
    if (result.success) {
      await get().loadInstitutions();
      return true;
    }
    return false;
  },

  deleteInstitution: async (id) => {
    const result = await api.institutions.delete(id);
    if (result.success) {
      await get().loadInstitutions();
      return true;
    }
    return false;
  },

  addVolunteerRecord: async (data) => {
    const result = await api.volunteer.create(data);
    if (result.success) {
      await get().loadVolunteerRecords();
      return true;
    }
    return false;
  },

  updateVolunteerRecord: async (id, data) => {
    const result = await api.volunteer.update(id, data);
    if (result.success) {
      await get().loadVolunteerRecords();
      return true;
    }
    return false;
  },

  deleteVolunteerRecord: async (id) => {
    const result = await api.volunteer.delete(id);
    if (result.success) {
      await get().loadVolunteerRecords();
      return true;
    }
    return false;
  },

  addItemDonation: async (data) => {
    const result = await api.items.create(data);
    if (result.success) {
      await get().loadItemDonations();
      return true;
    }
    return false;
  },

  updateItemDonation: async (id, data) => {
    const result = await api.items.update(id, data);
    if (result.success) {
      await get().loadItemDonations();
      return true;
    }
    return false;
  },

  deleteItemDonation: async (id) => {
    const result = await api.items.delete(id);
    if (result.success) {
      await get().loadItemDonations();
      return true;
    }
    return false;
  },

  addOnlineAction: async (data) => {
    const result = await api.onlineActions.create(data);
    if (result.success) {
      await get().loadOnlineActions();
      return true;
    }
    return false;
  },

  updateOnlineAction: async (id, data) => {
    const result = await api.onlineActions.update(id, data);
    if (result.success) {
      await get().loadOnlineActions();
      return true;
    }
    return false;
  },

  deleteOnlineAction: async (id) => {
    const result = await api.onlineActions.delete(id);
    if (result.success) {
      await get().loadOnlineActions();
      return true;
    }
    return false;
  },

  addProgress: async (data) => {
    const result = await api.progress.create(data);
    if (result.success) {
      await get().loadProgress();
      return true;
    }
    return false;
  },

  addImpactEstimate: async (data) => {
    const result = await api.impact.create(data);
    if (result.success) {
      await get().loadImpactEstimates();
      return true;
    }
    return false;
  },

  getInstitutionName: (id: number) => {
    const inst = get().institutions.find(i => i.id === id);
    return inst?.name || '未知机构';
  },

  getTotalDonations: () => {
    return get().donations.reduce((sum, d) => sum + d.amount, 0);
  },

  getTotalVolunteerHours: () => {
    return get().volunteerRecords.reduce((sum, v) => sum + v.hours, 0);
  },

  getTotalPeopleHelped: () => {
    return get().impactEstimates.reduce((sum, i) => sum + (i.people_helped || 0), 0);
  },
}));
