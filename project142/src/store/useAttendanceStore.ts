import { create } from 'zustand';
import { Attendance, AttendanceStatus, AttendanceStats } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId, formatDate, calculateAttendanceStats } from '../utils/helpers';
import { mockAttendance } from '../data/mockData';

interface AttendanceState {
  attendanceList: Attendance[];
  loading: boolean;
  initialized: boolean;
  initData: () => Promise<void>;
  addAttendance: (studentId: string, date: string, status: AttendanceStatus, remarks?: string) => void;
  updateAttendance: (id: string, status: AttendanceStatus, remarks?: string) => void;
  batchUpdateAttendance: (date: string, records: { studentId: string; status: AttendanceStatus; remarks?: string }[]) => void;
  getAttendanceByDate: (date: string) => Attendance[];
  getAttendanceByStudent: (studentId: string) => Attendance[];
  getAttendanceStats: (startDate?: string, endDate?: string) => AttendanceStats[];
  getStudentAttendanceRate: (studentId: string, startDate?: string, endDate?: string) => number;
  saveToStorage: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendanceList: [],
  loading: false,
  initialized: false,

  initData: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    const stored = await storage.get<Attendance[]>(STORAGE_KEYS.ATTENDANCE);
    
    if (stored && stored.length > 0) {
      set({ attendanceList: stored, initialized: true, loading: false });
    } else {
      const attendanceList = mockAttendance;
      await storage.set(STORAGE_KEYS.ATTENDANCE, attendanceList);
      set({ attendanceList, initialized: true, loading: false });
    }
  },

  addAttendance: (studentId, date, status, remarks = '') => {
    const { attendanceList } = get();
    const existing = attendanceList.find(a => a.studentId === studentId && a.date === date);
    
    if (existing) {
      get().updateAttendance(existing.id, status, remarks);
      return;
    }
    
    const newAttendance: Attendance = {
      id: generateId(),
      studentId,
      date,
      status,
      remarks
    };
    
    const newList = [...attendanceList, newAttendance];
    set({ attendanceList: newList });
    get().saveToStorage();
  },

  updateAttendance: (id, status, remarks) => {
    const { attendanceList } = get();
    const newList = attendanceList.map(a => 
      a.id === id ? { ...a, status, remarks: remarks ?? a.remarks } : a
    );
    set({ attendanceList: newList });
    get().saveToStorage();
  },

  batchUpdateAttendance: (date, records) => {
    const { attendanceList } = get();
    let newList = [...attendanceList];
    
    records.forEach(record => {
      const existingIndex = newList.findIndex(
        a => a.studentId === record.studentId && a.date === date
      );
      
      if (existingIndex >= 0) {
        newList[existingIndex] = {
          ...newList[existingIndex],
          status: record.status,
          remarks: record.remarks ?? newList[existingIndex].remarks
        };
      } else {
        newList.push({
          id: generateId(),
          studentId: record.studentId,
          date,
          status: record.status,
          remarks: record.remarks ?? ''
        });
      }
    });
    
    set({ attendanceList: newList });
    get().saveToStorage();
  },

  getAttendanceByDate: (date) => {
    return get().attendanceList.filter(a => a.date === date);
  },

  getAttendanceByStudent: (studentId) => {
    return get().attendanceList
      .filter(a => a.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getAttendanceStats: (startDate, endDate) => {
    let list = get().attendanceList;
    
    if (startDate) {
      list = list.filter(a => a.date >= startDate);
    }
    if (endDate) {
      list = list.filter(a => a.date <= endDate);
    }
    
    return calculateAttendanceStats(list);
  },

  getStudentAttendanceRate: (studentId, startDate, endDate) => {
    const records = get().getAttendanceByStudent(studentId);
    let filtered = records;
    
    if (startDate) {
      filtered = filtered.filter(a => a.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(a => a.date <= endDate);
    }
    
    if (filtered.length === 0) return 100;
    
    const presentCount = filtered.filter(a => a.status === 'present' || a.status === 'late').length;
    return Math.round((presentCount / filtered.length) * 100);
  },

  saveToStorage: async () => {
    const { attendanceList } = get();
    await storage.set(STORAGE_KEYS.ATTENDANCE, attendanceList);
  }
}));
