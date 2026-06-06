import { create } from 'zustand';
import type {
  Aquarium,
  WaterTest,
  Plant,
  Fish,
  Photo,
  WaterChange,
  Fertilization,
  CO2Log,
  EquipmentMaintenance,
  Anomaly,
  GrowthLog,
  DiseaseRecord,
  BreedingRecord,
  AppState,
} from '@/types';
import { loadState, saveState, generateId } from '@/utils/storage';
import {
  mockAquariums,
  mockWaterTests,
  mockPlants,
  mockFishes,
  mockPhotos,
  mockWaterChanges,
  mockFertilizations,
  mockCO2Logs,
  mockEquipmentMaintenances,
  mockAnomalies,
  mockGrowthLogs,
  mockDiseaseRecords,
  mockBreedingRecords,
} from '@/utils/mock';

interface StoreState extends AppState {
  initialize: () => void;
  addAquarium: (tank: Omit<Aquarium, 'id'>) => void;
  updateAquarium: (id: string, updates: Partial<Aquarium>) => void;
  deleteAquarium: (id: string) => void;
  
  addWaterTest: (test: Omit<WaterTest, 'id'>) => void;
  addPlant: (plant: Omit<Plant, 'id'>) => void;
  addFish: (fish: Omit<Fish, 'id'>) => void;
  addPhoto: (photo: Omit<Photo, 'id'>) => void;
  addWaterChange: (change: Omit<WaterChange, 'id'>) => void;
  addFertilization: (fert: Omit<Fertilization, 'id'>) => void;
  addCO2Log: (log: Omit<CO2Log, 'id'>) => void;
  addEquipmentMaintenance: (maint: Omit<EquipmentMaintenance, 'id'>) => void;
  addAnomaly: (anomaly: Omit<Anomaly, 'id'>) => void;
  updateAnomaly: (id: string, updates: Partial<Anomaly>) => void;
  addGrowthLog: (log: Omit<GrowthLog, 'id'>) => void;
  addDiseaseRecord: (record: Omit<DiseaseRecord, 'id'>) => void;
  updateDiseaseRecord: (id: string, updates: Partial<DiseaseRecord>) => void;
  addBreedingRecord: (record: Omit<BreedingRecord, 'id'>) => void;
}

const getInitialState = (): AppState => {
  const saved = loadState();
  if (saved) {
    return {
      aquariums: saved.aquariums || [],
      waterTests: saved.waterTests || [],
      plants: saved.plants || [],
      fishes: saved.fishes || [],
      photos: saved.photos || [],
      waterChanges: saved.waterChanges || [],
      fertilizations: saved.fertilizations || [],
      co2Logs: saved.co2Logs || [],
      equipmentMaintenances: saved.equipmentMaintenances || [],
      anomalies: saved.anomalies || [],
      growthLogs: saved.growthLogs || [],
      diseaseRecords: saved.diseaseRecords || [],
      breedingRecords: saved.breedingRecords || [],
    };
  }
  return {
    aquariums: mockAquariums,
    waterTests: mockWaterTests,
    plants: mockPlants,
    fishes: mockFishes,
    photos: mockPhotos,
    waterChanges: mockWaterChanges,
    fertilizations: mockFertilizations,
    co2Logs: mockCO2Logs,
    equipmentMaintenances: mockEquipmentMaintenances,
    anomalies: mockAnomalies,
    growthLogs: mockGrowthLogs,
    diseaseRecords: mockDiseaseRecords,
    breedingRecords: mockBreedingRecords,
  };
};

export const useStore = create<StoreState>((set, get) => {
  const persist = () => {
    const state = get();
    saveState({
      aquariums: state.aquariums,
      waterTests: state.waterTests,
      plants: state.plants,
      fishes: state.fishes,
      photos: state.photos,
      waterChanges: state.waterChanges,
      fertilizations: state.fertilizations,
      co2Logs: state.co2Logs,
      equipmentMaintenances: state.equipmentMaintenances,
      anomalies: state.anomalies,
      growthLogs: state.growthLogs,
      diseaseRecords: state.diseaseRecords,
      breedingRecords: state.breedingRecords,
    });
  };

  return {
    ...getInitialState(),

    initialize: () => {
      const saved = loadState();
      if (!saved) {
        persist();
      }
    },

    addAquarium: (tank) => {
      set((state) => ({
        aquariums: [...state.aquariums, { ...tank, id: generateId() }],
      }));
      persist();
    },

    updateAquarium: (id, updates) => {
      set((state) => ({
        aquariums: state.aquariums.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
      persist();
    },

    deleteAquarium: (id) => {
      set((state) => ({
        aquariums: state.aquariums.filter((t) => t.id !== id),
        waterTests: state.waterTests.filter((t) => t.tankId !== id),
        plants: state.plants.filter((p) => p.tankId !== id),
        fishes: state.fishes.filter((f) => f.tankId !== id),
        photos: state.photos.filter((p) => p.tankId !== id),
        waterChanges: state.waterChanges.filter((w) => w.tankId !== id),
        fertilizations: state.fertilizations.filter((f) => f.tankId !== id),
        co2Logs: state.co2Logs.filter((c) => c.tankId !== id),
        equipmentMaintenances: state.equipmentMaintenances.filter(
          (e) => e.tankId !== id
        ),
        anomalies: state.anomalies.filter((a) => a.tankId !== id),
      }));
      persist();
    },

    addWaterTest: (test) => {
      set((state) => ({
        waterTests: [...state.waterTests, { ...test, id: generateId() }],
      }));
      persist();
    },

    addPlant: (plant) => {
      set((state) => ({
        plants: [...state.plants, { ...plant, id: generateId() }],
      }));
      persist();
    },

    addFish: (fish) => {
      set((state) => ({
        fishes: [...state.fishes, { ...fish, id: generateId() }],
      }));
      persist();
    },

    addPhoto: (photo) => {
      set((state) => ({
        photos: [...state.photos, { ...photo, id: generateId() }],
      }));
      persist();
    },

    addWaterChange: (change) => {
      set((state) => ({
        waterChanges: [...state.waterChanges, { ...change, id: generateId() }],
      }));
      persist();
    },

    addFertilization: (fert) => {
      set((state) => ({
        fertilizations: [
          ...state.fertilizations,
          { ...fert, id: generateId() },
        ],
      }));
      persist();
    },

    addCO2Log: (log) => {
      set((state) => ({
        co2Logs: [...state.co2Logs, { ...log, id: generateId() }],
      }));
      persist();
    },

    addEquipmentMaintenance: (maint) => {
      set((state) => ({
        equipmentMaintenances: [
          ...state.equipmentMaintenances,
          { ...maint, id: generateId() },
        ],
      }));
      persist();
    },

    addAnomaly: (anomaly) => {
      set((state) => ({
        anomalies: [...state.anomalies, { ...anomaly, id: generateId() }],
      }));
      persist();
    },

    updateAnomaly: (id, updates) => {
      set((state) => ({
        anomalies: state.anomalies.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      }));
      persist();
    },

    addGrowthLog: (log) => {
      set((state) => ({
        growthLogs: [...state.growthLogs, { ...log, id: generateId() }],
      }));
      persist();
    },

    addDiseaseRecord: (record) => {
      set((state) => ({
        diseaseRecords: [
          ...state.diseaseRecords,
          { ...record, id: generateId() },
        ],
      }));
      persist();
    },

    updateDiseaseRecord: (id, updates) => {
      set((state) => ({
        diseaseRecords: state.diseaseRecords.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      }));
      persist();
    },

    addBreedingRecord: (record) => {
      set((state) => ({
        breedingRecords: [
          ...state.breedingRecords,
          { ...record, id: generateId() },
        ],
      }));
      persist();
    },
  };
});
