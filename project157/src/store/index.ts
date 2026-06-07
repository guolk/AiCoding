import { create } from 'zustand';
import type { Student, CourseRecord, Artwork, Evaluation, Communication, ExhibitionRecord } from '../types';
import { mockStudents, mockCourses, mockArtworks, mockEvaluations, mockCommunications, mockExhibitions } from '../data/mockData';

interface AppState {
  students: Student[];
  courses: CourseRecord[];
  artworks: Artwork[];
  evaluations: Evaluation[];
  communications: Communication[];
  exhibitions: ExhibitionRecord[];
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;
  getStudentById: (id: string) => Student | undefined;
  getCoursesByStudentId: (studentId: string) => CourseRecord[];
  getArtworksByStudentId: (studentId: string) => Artwork[];
  getEvaluationsByStudentId: (studentId: string) => Evaluation[];
  getCommunicationsByStudentId: (studentId: string) => Communication[];
  getExhibitionsByStudentId: (studentId: string) => ExhibitionRecord[];
  getPortfolioArtworks: (studentId: string) => Artwork[];
  addCommunication: (comm: Omit<Communication, 'id' | 'date'>) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  addExhibition: (exhibition: Omit<ExhibitionRecord, 'id'>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  students: mockStudents,
  courses: mockCourses,
  artworks: mockArtworks,
  evaluations: mockEvaluations,
  communications: mockCommunications,
  exhibitions: mockExhibitions,
  selectedStudent: null,

  setSelectedStudent: (student) => set({ selectedStudent: student }),

  getStudentById: (id) => get().students.find(s => s.id === id),

  getCoursesByStudentId: (studentId) => 
    get().courses.filter(c => c.studentId === studentId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),

  getArtworksByStudentId: (studentId) =>
    get().artworks.filter(a => a.studentId === studentId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),

  getEvaluationsByStudentId: (studentId) =>
    get().evaluations.filter(e => e.studentId === studentId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),

  getCommunicationsByStudentId: (studentId) =>
    get().communications.filter(c => c.studentId === studentId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),

  getExhibitionsByStudentId: (studentId) =>
    get().exhibitions.filter(e => e.studentId === studentId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),

  getPortfolioArtworks: (studentId) =>
    get().artworks.filter(a => a.studentId === studentId && a.isPortfolio).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),

  addCommunication: (comm) => {
    const newComm: Communication = {
      ...comm,
      id: `comm${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    set({ communications: [...get().communications, newComm] });
  },

  addStudent: (student) => {
    const newStudent: Student = {
      ...student,
      id: `student${Date.now()}`,
    };
    set({ students: [...get().students, newStudent] });
  },

  addExhibition: (exhibition) => {
    const newExhibition: ExhibitionRecord = {
      ...exhibition,
      id: `exhibition${Date.now()}`,
    };
    set({ exhibitions: [...get().exhibitions, newExhibition] });
  },
}));
