import { create } from 'zustand';
import type { RideRecord, RecordFormData, RecordFilters, RecordPagination, BestRecords, CompareResult } from '@/types/record';
import { mockRecords, getRecordsByRouteId, getBestTimeByRouteId } from '@/mock/records';
import { generateId } from '@/utils/format';
import { useUserStore } from './useUserStore';

interface RecordState {
  records: RideRecord[];
  currentRecord: RideRecord | null;
  loading: boolean;
  total: number;
  fetchRecords: (filters?: Partial<RecordFilters>) => Promise<RecordPagination>;
  fetchRecordById: (id: string) => Promise<RideRecord | null>;
  fetchRecordsByRouteId: (routeId: string) => Promise<RideRecord[]>;
  createRecord: (data: RecordFormData) => Promise<boolean>;
  updateRecord: (id: string, data: Partial<RideRecord>) => Promise<boolean>;
  deleteRecord: (id: string) => Promise<boolean>;
  getBestRecords: () => BestRecords;
  getBestTimeByRoute: (routeId: string) => number | null;
  compareRecords: (recordIds: string[]) => CompareResult | null;
}

export const useRecordStore = create<RecordState>((set, get) => ({
  records: [],
  currentRecord: null,
  loading: false,
  total: 0,

  fetchRecords: async (filters = {}) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = useUserStore.getState().currentUser;
    let filteredRecords = currentUser
      ? mockRecords.filter(r => r.userId === currentUser.id)
      : mockRecords;

    if (filters.routeId) {
      filteredRecords = filteredRecords.filter(r => r.routeId === filters.routeId);
    }
    if (filters.weather && filters.weather.length > 0) {
      filteredRecords = filteredRecords.filter(r => filters.weather!.includes(r.weather));
    }
    if (filters.roadCondition && filters.roadCondition.length > 0) {
      filteredRecords = filteredRecords.filter(r => filters.roadCondition!.includes(r.roadCondition));
    }
    if (filters.startDate) {
      filteredRecords = filteredRecords.filter(r => r.rideDate >= filters.startDate!);
    }
    if (filters.endDate) {
      filteredRecords = filteredRecords.filter(r => r.rideDate <= filters.endDate!);
    }

    if (filters.sortBy) {
      filteredRecords.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'rideDate':
            comparison = new Date(a.rideDate).getTime() - new Date(b.rideDate).getTime();
            break;
          case 'avgSpeed':
            comparison = a.avgSpeed - b.avgSpeed;
            break;
          case 'duration':
            comparison = a.duration - b.duration;
            break;
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    const total = filteredRecords.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + limit);

    set({
      records: paginatedRecords,
      total,
      loading: false,
    });

    return {
      records: paginatedRecords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  fetchRecordById: async (id: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));
    const record = mockRecords.find(r => r.id === id);
    if (record) {
      set({ currentRecord: record, loading: false });
      return record;
    }
    set({ loading: false });
    return null;
  },

  fetchRecordsByRouteId: async (routeId: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));
    const records = getRecordsByRouteId(routeId);
    set({ records, loading: false });
    return records;
  },

  createRecord: async (data: RecordFormData) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
      set({ loading: false });
      return false;
    }

    const newRecord: RideRecord = {
      id: 'record-' + generateId(),
      routeId: data.routeId,
      userId: currentUser.id,
      rideDate: data.rideDate,
      weather: data.weather,
      roadCondition: data.roadCondition,
      avgSpeed: data.avgSpeed,
      maxSpeed: data.maxSpeed,
      duration: data.duration,
      calories: data.calories,
      feeling: data.feeling,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    mockRecords.unshift(newRecord);
    set({ loading: false });
    return true;
  },

  updateRecord: async (id: string, data: Partial<RideRecord>) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = mockRecords.findIndex(r => r.id === id);
    if (index > -1) {
      mockRecords[index] = { ...mockRecords[index], ...data };
      set(state => ({
        records: state.records.map(r => r.id === id ? { ...r, ...data } : r),
        currentRecord: state.currentRecord?.id === id ? { ...state.currentRecord, ...data } : state.currentRecord,
        loading: false,
      }));
      return true;
    }
    set({ loading: false });
    return false;
  },

  deleteRecord: async (id: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = mockRecords.findIndex(r => r.id === id);
    if (index > -1) {
      mockRecords.splice(index, 1);
      set(state => ({
        records: state.records.filter(r => r.id !== id),
        loading: false,
      }));
      return true;
    }
    set({ loading: false });
    return false;
  },

  getBestRecords: () => {
    const currentUser = useUserStore.getState().currentUser;
    const userRecords = currentUser
      ? mockRecords.filter(r => r.userId === currentUser.id)
      : mockRecords;

    if (userRecords.length === 0) {
      return {
        fastestSpeed: 0,
        longestDistance: 0,
        shortestTime: 0,
        mostCalories: 0,
        totalRides: 0,
        totalDistance: 0,
        totalTime: 0,
        totalCalories: 0,
      };
    }

    return {
      fastestSpeed: Math.max(...userRecords.map(r => r.maxSpeed)),
      longestDistance: Math.max(...userRecords.map(r => r.route?.distance || 0)),
      shortestTime: Math.min(...userRecords.map(r => r.duration)),
      mostCalories: Math.max(...userRecords.map(r => r.calories)),
      totalRides: userRecords.length,
      totalDistance: userRecords.reduce((sum, r) => sum + (r.route?.distance || 0), 0),
      totalTime: userRecords.reduce((sum, r) => sum + r.duration, 0),
      totalCalories: userRecords.reduce((sum, r) => sum + r.calories, 0),
    };
  },

  getBestTimeByRoute: (routeId: string) => {
    return getBestTimeByRouteId(routeId);
  },

  compareRecords: (recordIds: string[]) => {
    const records = mockRecords.filter(r => recordIds.includes(r.id));
    if (records.length < 2) return null;

    return {
      records,
      avgSpeedComparison: records.map(r => ({ recordId: r.id, value: r.avgSpeed })),
      durationComparison: records.map(r => ({ recordId: r.id, value: r.duration })),
      weatherComparison: records.map(r => ({ recordId: r.id, weather: r.weather, condition: r.roadCondition })),
    };
  },
}));
