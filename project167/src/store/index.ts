import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Observation, Instrument, QualityRanges } from '@/types';
import { getDefaultMockData } from '@/utils/mock';
import { checkQualityFlag, batchQualityCheck, DEFAULT_QUALITY_RANGES } from '@/utils/quality';

interface WeatherStore {
  observations: Observation[];
  instruments: Instrument[];
  qualityRanges: QualityRanges;
  isInitialized: boolean;

  initData: () => void;
  addObservation: (obs: Omit<Observation, 'id' | 'qualityFlag' | 'reviewStatus'>) => void;
  updateObservation: (id: string, updates: Partial<Observation>) => void;
  deleteObservation: (id: string) => void;
  batchAddObservations: (obs: Omit<Observation, 'id' | 'qualityFlag' | 'reviewStatus'>[]) => void;

  addInstrument: (instrument: Omit<Instrument, 'id'>) => void;
  updateInstrument: (id: string, updates: Partial<Instrument>) => void;
  deleteInstrument: (id: string) => void;

  updateQualityRanges: (ranges: Partial<QualityRanges>) => void;
  runQualityCheck: () => void;

  approveObservation: (id: string) => void;
  rejectObservation: (id: string, reason: string) => void;
  batchApprove: (ids: string[]) => void;
  batchReject: (ids: string[], reason: string) => void;

  resetData: () => void;
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      observations: [],
      instruments: [],
      qualityRanges: DEFAULT_QUALITY_RANGES,
      isInitialized: false,

      initData: () => {
        if (get().isInitialized) return;
        const { observations, instruments } = getDefaultMockData();
        const checkedObservations = batchQualityCheck(observations, get().qualityRanges);
        set({
          observations: checkedObservations,
          instruments,
          isInitialized: true,
        });
      },

      addObservation: (obs) => {
        const newObs: Observation = {
          ...obs,
          id: `OBS-${Date.now()}`,
          qualityFlag: 'normal',
          reviewStatus: 'pending',
        };
        newObs.qualityFlag = checkQualityFlag(newObs, get().qualityRanges);
        set((state) => ({
          observations: [...state.observations, newObs].sort((a, b) =>
            b.datetime.localeCompare(a.datetime)
          ),
        }));
      },

      updateObservation: (id, updates) => {
        set((state) => ({
          observations: state.observations.map((obs) => {
            if (obs.id !== id) return obs;
            const updated = { ...obs, ...updates };
            updated.qualityFlag = checkQualityFlag(updated, state.qualityRanges);
            return updated;
          }),
        }));
      },

      deleteObservation: (id) => {
        set((state) => ({
          observations: state.observations.filter((obs) => obs.id !== id),
        }));
      },

      batchAddObservations: (obsList) => {
        const newObs = obsList.map((obs, index) => {
          const newO: Observation = {
            ...obs,
            id: `OBS-BATCH-${Date.now()}-${index}`,
            qualityFlag: 'normal',
            reviewStatus: 'pending',
          };
          newO.qualityFlag = checkQualityFlag(newO, get().qualityRanges);
          return newO;
        });
        set((state) => ({
          observations: [...state.observations, ...newObs].sort((a, b) =>
            b.datetime.localeCompare(a.datetime)
          ),
        }));
      },

      addInstrument: (instrument) => {
        const newInst: Instrument = {
          ...instrument,
          id: `INST-${Date.now()}`,
        };
        set((state) => ({
          instruments: [...state.instruments, newInst],
        }));
      },

      updateInstrument: (id, updates) => {
        set((state) => ({
          instruments: state.instruments.map((inst) =>
            inst.id === id ? { ...inst, ...updates } : inst
          ),
        }));
      },

      deleteInstrument: (id) => {
        set((state) => ({
          instruments: state.instruments.filter((inst) => inst.id !== id),
        }));
      },

      updateQualityRanges: (ranges) => {
        set((state) => ({
          qualityRanges: { ...state.qualityRanges, ...ranges },
        }));
      },

      runQualityCheck: () => {
        const { observations, qualityRanges } = get();
        const checked = batchQualityCheck(observations, qualityRanges);
        set({ observations: checked });
      },

      approveObservation: (id) => {
        set((state) => ({
          observations: state.observations.map((obs) =>
            obs.id === id ? { ...obs, reviewStatus: 'approved' as const } : obs
          ),
        }));
      },

      rejectObservation: (id, reason) => {
        set((state) => ({
          observations: state.observations.map((obs) =>
            obs.id === id
              ? { ...obs, reviewStatus: 'rejected' as const, remark: reason }
              : obs
          ),
        }));
      },

      batchApprove: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
          observations: state.observations.map((obs) =>
            idSet.has(obs.id) ? { ...obs, reviewStatus: 'approved' as const } : obs
          ),
        }));
      },

      batchReject: (ids, reason) => {
        const idSet = new Set(ids);
        set((state) => ({
          observations: state.observations.map((obs) =>
            idSet.has(obs.id)
              ? { ...obs, reviewStatus: 'rejected' as const, remark: reason }
              : obs
          ),
        }));
      },

      resetData: () => {
        const { observations, instruments } = getDefaultMockData();
        const checkedObservations = batchQualityCheck(observations, get().qualityRanges);
        set({
          observations: checkedObservations,
          instruments,
          isInitialized: true,
        });
      },
    }),
    {
      name: 'weather-station-storage',
      partialize: (state) => ({
        observations: state.observations,
        instruments: state.instruments,
        qualityRanges: state.qualityRanges,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
