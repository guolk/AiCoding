import { create } from 'zustand';
import { Exam, Grade, GradeStats } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId, calculateGradeStats } from '../utils/helpers';
import { mockGrades, mockExams } from '../data/mockData';

interface GradeState {
  exams: Exam[];
  grades: Grade[];
  loading: boolean;
  initialized: boolean;
  initData: () => Promise<void>;
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  addGrade: (studentId: string, examId: string, score: number, subject: string) => void;
  updateGrade: (id: string, score: number) => void;
  deleteGrade: (id: string) => void;
  batchAddGrades: (grades: Omit<Grade, 'id'>[]) => void;
  getGradesByExam: (examId: string) => Grade[];
  getGradesByStudent: (studentId: string) => Grade[];
  getGradesBySubject: (subject: string) => Grade[];
  getStudentGradeStats: (studentId: string, subject?: string) => GradeStats;
  getExamStats: (examId: string, subject?: string) => GradeStats;
  getClassGradeTrend: (subject?: string) => { exam: Exam; average: number }[];
  saveToStorage: () => Promise<void>;
}

export const useGradeStore = create<GradeState>((set, get) => ({
  exams: [],
  grades: [],
  loading: false,
  initialized: false,

  initData: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    const storedExams = await storage.get<Exam[]>(STORAGE_KEYS.EXAMS);
    const storedGrades = await storage.get<Grade[]>(STORAGE_KEYS.GRADES);
    
    const exams = storedExams && storedExams.length > 0 ? storedExams : mockExams;
    const grades = storedGrades && storedGrades.length > 0 ? storedGrades : mockGrades;
    
    if (!storedExams || storedExams.length === 0) {
      await storage.set(STORAGE_KEYS.EXAMS, exams);
    }
    if (!storedGrades || storedGrades.length === 0) {
      await storage.set(STORAGE_KEYS.GRADES, grades);
    }
    
    set({ exams, grades, initialized: true, loading: false });
  },

  addExam: (examData) => {
    const { exams } = get();
    const newExam: Exam = {
      ...examData,
      id: generateId()
    };
    const newExams = [...exams, newExam].sort((a, b) => b.date.localeCompare(a.date));
    set({ exams: newExams });
    get().saveToStorage();
  },

  updateExam: (id, updates) => {
    const { exams } = get();
    const newExams = exams.map(e => e.id === id ? { ...e, ...updates } : e);
    set({ exams: newExams });
    get().saveToStorage();
  },

  deleteExam: (id) => {
    const { exams, grades } = get();
    const newExams = exams.filter(e => e.id !== id);
    const newGrades = grades.filter(g => g.examId !== id);
    set({ exams: newExams, grades: newGrades });
    get().saveToStorage();
  },

  addGrade: (studentId, examId, score, subject) => {
    const { grades } = get();
    const existing = grades.find(g => g.studentId === studentId && g.examId === examId && g.subject === subject);
    
    if (existing) {
      get().updateGrade(existing.id, score);
      return;
    }
    
    const newGrade: Grade = {
      id: generateId(),
      studentId,
      examId,
      score,
      subject
    };
    const newGrades = [...grades, newGrade];
    set({ grades: newGrades });
    get().saveToStorage();
  },

  updateGrade: (id, score) => {
    const { grades } = get();
    const newGrades = grades.map(g => g.id === id ? { ...g, score } : g);
    set({ grades: newGrades });
    get().saveToStorage();
  },

  deleteGrade: (id) => {
    const { grades } = get();
    const newGrades = grades.filter(g => g.id !== id);
    set({ grades: newGrades });
    get().saveToStorage();
  },

  batchAddGrades: (gradesData) => {
    const { grades } = get();
    const newGrades = gradesData.map(g => ({ ...g, id: generateId() }));
    set({ grades: [...grades, ...newGrades] });
    get().saveToStorage();
  },

  getGradesByExam: (examId) => {
    return get().grades.filter(g => g.examId === examId);
  },

  getGradesByStudent: (studentId) => {
    return get().grades
      .filter(g => g.studentId === studentId)
      .sort((a, b) => {
        const examA = get().exams.find(e => e.id === a.examId);
        const examB = get().exams.find(e => e.id === b.examId);
        return (examB?.date || '').localeCompare(examA?.date || '');
      });
  },

  getGradesBySubject: (subject) => {
    return get().grades.filter(g => g.subject === subject);
  },

  getStudentGradeStats: (studentId, subject) => {
    let studentGrades = get().getGradesByStudent(studentId);
    if (subject) {
      studentGrades = studentGrades.filter(g => g.subject === subject);
    }
    return calculateGradeStats(studentGrades);
  },

  getExamStats: (examId, subject) => {
    let examGrades = get().getGradesByExam(examId);
    if (subject) {
      examGrades = examGrades.filter(g => g.subject === subject);
    }
    return calculateGradeStats(examGrades);
  },

  getClassGradeTrend: (subject) => {
    const { exams } = get();
    return exams
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(exam => {
        const stats = get().getExamStats(exam.id, subject);
        return { exam, average: stats.average };
      });
  },

  saveToStorage: async () => {
    const { exams, grades } = get();
    await storage.set(STORAGE_KEYS.EXAMS, exams);
    await storage.set(STORAGE_KEYS.GRADES, grades);
  }
}));
