import { create } from 'zustand';
import { MonitoringSite, SpeciesRecord, EnvironmentalParam, DiversityIndex, PhotoRecord, HistoryEvent } from '../types';
import { mockSites, mockSpecies, mockEnvParams, mockDiversityData, mockPopulationTimeSeries } from '../utils/mockData';
import { generateId, formatDate } from '../utils/calculations';

interface AppState {
  sites: MonitoringSite[];
  species: SpeciesRecord[];
  envParams: EnvironmentalParam[];
  diversityData: DiversityIndex[];
  populationTimeSeries: typeof mockPopulationTimeSeries;
  selectedSiteId: string | null;
  selectedSpeciesId: string | null;
  searchKeyword: string;
  filterSiteId: string | null;
  filterInvasive: boolean | null;

  setSelectedSiteId: (id: string | null) => void;
  setSelectedSpeciesId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setFilterSiteId: (id: string | null) => void;
  setFilterInvasive: (value: boolean | null) => void;

  addSite: (site: Omit<MonitoringSite, 'id' | 'createdAt' | 'photos' | 'historyEvents'>) => void;
  updateSite: (id: string, data: Partial<MonitoringSite>) => void;
  deleteSite: (id: string) => void;
  addSitePhoto: (siteId: string, photo: Omit<PhotoRecord, 'id'>) => void;
  addSiteHistory: (siteId: string, event: Omit<HistoryEvent, 'id'>) => void;

  addSpecies: (species: Omit<SpeciesRecord, 'id' | 'createdAt'>) => void;
  updateSpecies: (id: string, data: Partial<SpeciesRecord>) => void;
  deleteSpecies: (id: string) => void;

  addEnvParam: (param: Omit<EnvironmentalParam, 'id' | 'createdAt'>) => void;
  updateEnvParam: (id: string, data: Partial<EnvironmentalParam>) => void;
  deleteEnvParam: (id: string) => void;

  getSiteById: (id: string) => MonitoringSite | undefined;
  getSpeciesById: (id: string) => SpeciesRecord | undefined;
  getSpeciesBySiteId: (siteId: string) => SpeciesRecord[];
  getEnvParamsBySiteId: (siteId: string) => EnvironmentalParam[];
  getDiversityBySiteId: (siteId: string) => DiversityIndex[];
}

export const useAppStore = create<AppState>((set, get) => ({
  sites: mockSites,
  species: mockSpecies,
  envParams: mockEnvParams,
  diversityData: mockDiversityData,
  populationTimeSeries: mockPopulationTimeSeries,
  selectedSiteId: null,
  selectedSpeciesId: null,
  searchKeyword: '',
  filterSiteId: null,
  filterInvasive: null,

  setSelectedSiteId: (id) => set({ selectedSiteId: id }),
  setSelectedSpeciesId: (id) => set({ selectedSpeciesId: id }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setFilterSiteId: (id) => set({ filterSiteId: id }),
  setFilterInvasive: (value) => set({ filterInvasive: value }),

  addSite: (site) => {
    const newSite: MonitoringSite = {
      ...site,
      id: `site-${generateId()}`,
      createdAt: new Date().toISOString(),
      photos: [],
      historyEvents: [{
        id: `h-${generateId()}`,
        date: formatDate(new Date()),
        event: '监测点建立',
      }],
    };
    set((state) => ({ sites: [...state.sites, newSite] }));
  },

  updateSite: (id, data) => {
    set((state) => ({
      sites: state.sites.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
  },

  deleteSite: (id) => {
    set((state) => ({
      sites: state.sites.filter((s) => s.id !== id),
      species: state.species.filter((sp) => sp.siteId !== id),
      envParams: state.envParams.filter((ep) => ep.siteId !== id),
    }));
  },

  addSitePhoto: (siteId, photo) => {
    const newPhoto: PhotoRecord = { ...photo, id: `p-${generateId()}` };
    set((state) => ({
      sites: state.sites.map((s) =>
        s.id === siteId ? { ...s, photos: [...s.photos, newPhoto] } : s
      ),
    }));
  },

  addSiteHistory: (siteId, event) => {
    const newEvent: HistoryEvent = { ...event, id: `h-${generateId()}` };
    set((state) => ({
      sites: state.sites.map((s) =>
        s.id === siteId ? { ...s, historyEvents: [...s.historyEvents, newEvent] } : s
      ),
    }));
  },

  addSpecies: (sp) => {
    const newSpecies: SpeciesRecord = {
      ...sp,
      id: `sp-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ species: [...state.species, newSpecies] }));
  },

  updateSpecies: (id, data) => {
    set((state) => ({
      species: state.species.map((sp) => (sp.id === id ? { ...sp, ...data } : sp)),
    }));
  },

  deleteSpecies: (id) => {
    set((state) => ({
      species: state.species.filter((sp) => sp.id !== id),
    }));
  },

  addEnvParam: (param) => {
    const newParam: EnvironmentalParam = {
      ...param,
      id: `env-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ envParams: [...state.envParams, newParam] }));
  },

  updateEnvParam: (id, data) => {
    set((state) => ({
      envParams: state.envParams.map((ep) => (ep.id === id ? { ...ep, ...data } : ep)),
    }));
  },

  deleteEnvParam: (id) => {
    set((state) => ({
      envParams: state.envParams.filter((ep) => ep.id !== id),
    }));
  },

  getSiteById: (id) => get().sites.find((s) => s.id === id),
  getSpeciesById: (id) => get().species.find((sp) => sp.id === id),
  getSpeciesBySiteId: (siteId) => get().species.filter((sp) => sp.siteId === siteId),
  getEnvParamsBySiteId: (siteId) => get().envParams.filter((ep) => ep.siteId === siteId),
  getDiversityBySiteId: (siteId) => get().diversityData.filter((d) => d.siteId === siteId),
}));
