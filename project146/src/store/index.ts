import { create } from 'zustand';
import type {
  Boat,
  Maintenance,
  Certificate,
  Voyage,
  VoyagePlan,
  WeatherForecast,
  SeasonalWeather,
  Statistics,
} from '../types';
import {
  mockBoats,
  mockMaintenances,
  mockCertificates,
  mockVoyages,
  mockVoyagePlans,
  mockWeatherForecast,
  mockSeasonalWeather,
} from '../mock/data';

interface AppState {
  boats: Boat[];
  maintenances: Maintenance[];
  certificates: Certificate[];
  voyages: Voyage[];
  voyagePlans: VoyagePlan[];
  weatherForecast: WeatherForecast;
  seasonalWeather: SeasonalWeather[];
  initialized: boolean;
  initData: () => void;
  getBoatById: (id: string) => Boat | undefined;
  getVoyageById: (id: string) => Voyage | undefined;
  getPlanById: (id: string) => VoyagePlan | undefined;
  getBoatMaintenances: (boatId: string) => Maintenance[];
  getBoatCertificates: (boatId: string) => Certificate[];
  addVoyage: (voyage: Omit<Voyage, 'id' | 'createdAt'>) => void;
  updateVoyage: (id: string, voyage: Partial<Voyage>) => void;
  deleteVoyage: (id: string) => void;
  addBoat: (boat: Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBoat: (id: string, boat: Partial<Boat>) => void;
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  addPlan: (plan: Omit<VoyagePlan, 'id' | 'createdAt'>) => void;
  updatePlan: (id: string, plan: Partial<VoyagePlan>) => void;
  getStatistics: () => Statistics;
  getExpiringCertificates: (days: number) => Certificate[];
}

const STORAGE_KEY = 'sailing-log-data';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return null;
};

const saveToStorage = (state: Partial<AppState>) => {
  try {
    const data = {
      boats: state.boats,
      maintenances: state.maintenances,
      certificates: state.certificates,
      voyages: state.voyages,
      voyagePlans: state.voyagePlans,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  boats: [],
  maintenances: [],
  certificates: [],
  voyages: [],
  voyagePlans: [],
  weatherForecast: mockWeatherForecast,
  seasonalWeather: mockSeasonalWeather,
  initialized: false,

  initData: () => {
    const stored = loadFromStorage();
    if (stored) {
      set({
        boats: stored.boats,
        maintenances: stored.maintenances,
        certificates: stored.certificates,
        voyages: stored.voyages,
        voyagePlans: stored.voyagePlans,
        initialized: true,
      });
    } else {
      set({
        boats: mockBoats,
        maintenances: mockMaintenances,
        certificates: mockCertificates,
        voyages: mockVoyages,
        voyagePlans: mockVoyagePlans,
        initialized: true,
      });
      saveToStorage({
        boats: mockBoats,
        maintenances: mockMaintenances,
        certificates: mockCertificates,
        voyages: mockVoyages,
        voyagePlans: mockVoyagePlans,
      });
    }
  },

  getBoatById: (id) => get().boats.find((b) => b.id === id),
  getVoyageById: (id) => get().voyages.find((v) => v.id === id),
  getPlanById: (id) => get().voyagePlans.find((p) => p.id === id),
  getBoatMaintenances: (boatId) =>
    get()
      .maintenances.filter((m) => m.boatId === boatId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  getBoatCertificates: (boatId) =>
    get()
      .certificates.filter((c) => c.boatId === boatId)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()),

  addVoyage: (voyage) => {
    const newVoyage: Voyage = {
      ...voyage,
      id: `voyage-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newState = { voyages: [newVoyage, ...state.voyages] };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  updateVoyage: (id, voyage) => {
    set((state) => {
      const newState = {
        voyages: state.voyages.map((v) => (v.id === id ? { ...v, ...voyage } : v)),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  deleteVoyage: (id) => {
    set((state) => {
      const newState = {
        voyages: state.voyages.filter((v) => v.id !== id),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  addBoat: (boat) => {
    const newBoat: Boat = {
      ...boat,
      id: `boat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => {
      const newState = { boats: [...state.boats, newBoat] };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  updateBoat: (id, boat) => {
    set((state) => {
      const newState = {
        boats: state.boats.map((b) =>
          b.id === id ? { ...b, ...boat, updatedAt: new Date().toISOString() } : b
        ),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  addMaintenance: (maintenance) => {
    const newMaintenance: Maintenance = {
      ...maintenance,
      id: `maint-${Date.now()}`,
    };
    set((state) => {
      const newState = { maintenances: [newMaintenance, ...state.maintenances] };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  addPlan: (plan) => {
    const newPlan: VoyagePlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newState = { voyagePlans: [newPlan, ...state.voyagePlans] };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  updatePlan: (id, plan) => {
    set((state) => {
      const newState = {
        voyagePlans: state.voyagePlans.map((p) => (p.id === id ? { ...p, ...plan } : p)),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  getStatistics: () => {
    const state = get();
    const totalVoyages = state.voyages.length;
    const totalDistance = state.voyages.reduce((sum, v) => sum + v.distance, 0);
    const totalHours = state.voyages.reduce((sum, v) => sum + v.duration, 0);
    const avgSpeed = totalHours > 0 ? totalDistance / totalHours : 0;
    const boatsCount = state.boats.length;
    const activePlans = state.voyagePlans.filter(
      (p) => p.status === 'planned' || p.status === 'in-progress'
    ).length;

    return {
      totalVoyages,
      totalDistance,
      totalHours,
      avgSpeed,
      boatsCount,
      activePlans,
    };
  },

  getExpiringCertificates: (days) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return get()
      .certificates.filter((c) => {
        const expiry = new Date(c.expiryDate);
        return expiry >= now && expiry <= cutoff;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  },
}));
