import { create } from 'zustand';
import { Student } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId, formatDate } from '../utils/helpers';
import { mockStudents } from '../data/mockData';

interface StudentState {
  students: Student[];
  loading: boolean;
  initialized: boolean;
  initData: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'seatRow' | 'seatCol'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  updateStudentPhoto: (id: string, photoUrl: string) => void;
  updateSeatPosition: (id: string, row: number, col: number) => void;
  swapSeats: (studentId1: string, studentId2: string) => void;
  getStudentById: (id: string) => Student | undefined;
  saveToStorage: () => Promise<void>;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  loading: false,
  initialized: false,

  initData: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    const stored = await storage.get<Student[]>(STORAGE_KEYS.STUDENTS);
    
    if (stored && stored.length > 0) {
      set({ students: stored, initialized: true, loading: false });
    } else {
      const students = mockStudents;
      await storage.set(STORAGE_KEYS.STUDENTS, students);
      set({ students, initialized: true, loading: false });
    }
  },

  addStudent: (studentData) => {
    const { students } = get();
    const maxRow = Math.max(...students.map(s => s.seatRow), 0);
    const maxCol = Math.max(...students.map(s => s.seatCol), 0);
    
    let newRow = 0;
    let newCol = 0;
    
    if (students.length > 0) {
      const lastStudent = students[students.length - 1];
      newCol = lastStudent.seatCol + 1;
      newRow = lastStudent.seatRow;
      if (newCol >= 8) {
        newCol = 0;
        newRow = lastStudent.seatRow + 1;
      }
    }
    
    const newStudent: Student = {
      ...studentData,
      id: generateId(),
      createdAt: formatDate(new Date()),
      seatRow: newRow,
      seatCol: newCol
    };
    
    const newStudents = [...students, newStudent];
    set({ students: newStudents });
    get().saveToStorage();
  },

  updateStudent: (id, updates) => {
    const { students } = get();
    const newStudents = students.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    set({ students: newStudents });
    get().saveToStorage();
  },

  deleteStudent: (id) => {
    const { students } = get();
    const newStudents = students.filter(s => s.id !== id);
    set({ students: newStudents });
    get().saveToStorage();
  },

  updateStudentPhoto: (id, photoUrl) => {
    const { students } = get();
    const newStudents = students.map(s => 
      s.id === id ? { ...s, photoUrl } : s
    );
    set({ students: newStudents });
    get().saveToStorage();
  },

  updateSeatPosition: (id, row, col) => {
    const { students } = get();
    const newStudents = students.map(s => 
      s.id === id ? { ...s, seatRow: row, seatCol: col } : s
    );
    set({ students: newStudents });
    get().saveToStorage();
  },

  swapSeats: (studentId1, studentId2) => {
    const { students } = get();
    const s1 = students.find(s => s.id === studentId1);
    const s2 = students.find(s => s.id === studentId2);
    
    if (!s1 || !s2) return;
    
    const newStudents = students.map(s => {
      if (s.id === studentId1) {
        return { ...s, seatRow: s2.seatRow, seatCol: s2.seatCol };
      }
      if (s.id === studentId2) {
        return { ...s, seatRow: s1.seatRow, seatCol: s1.seatCol };
      }
      return s;
    });
    
    set({ students: newStudents });
    get().saveToStorage();
  },

  getStudentById: (id) => {
    return get().students.find(s => s.id === id);
  },

  saveToStorage: async () => {
    const { students } = get();
    await storage.set(STORAGE_KEYS.STUDENTS, students);
  }
}));
