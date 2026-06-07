import { getDB, getNextId, saveDB } from '../db/index.js';
import type { Student, ParentCommunication, DashboardStats } from '../../shared/types.js';

export function getAllStudents(): Student[] {
  const db = getDB();
  return db.students;
}

export function getStudentById(id: number): Student | undefined {
  const db = getDB();
  return db.students.find(s => s.id === id);
}

export function createStudent(data: Omit<Student, 'id' | 'createdAt'>): Student {
  const db = getDB();
  const id = getNextId('students');
  const student: Student = {
    ...data,
    id,
    createdAt: new Date().toISOString()
  };
  db.students.push(student);
  saveDB();
  return student;
}

export function updateStudent(id: number, data: Partial<Student>): Student | undefined {
  const db = getDB();
  const index = db.students.findIndex(s => s.id === id);
  if (index === -1) return undefined;
  
  db.students[index] = { ...db.students[index], ...data };
  saveDB();
  return db.students[index];
}

export function getCommunicationsByStudentId(studentId: number): ParentCommunication[] {
  const db = getDB();
  return db.communications.filter(c => c.studentId === studentId).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function addCommunication(studentId: number, data: Omit<ParentCommunication, 'id' | 'studentId'>): ParentCommunication {
  const db = getDB();
  const id = getNextId('communications');
  const communication: ParentCommunication = {
    ...data,
    id,
    studentId
  };
  db.communications.push(communication);
  saveDB();
  return communication;
}

export function getDashboardStats(): DashboardStats {
  const db = getDB();
  const totalStudents = db.students.length;
  const totalPortfolios = db.portfolios.length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyMilestones = db.milestones.filter(m => {
    const date = new Date(m.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  
  const studentsWithAssessment = new Set(db.assessments.map(a => a.studentId)).size;
  const assessmentCompletion = totalStudents > 0 ? Math.round((studentsWithAssessment / totalStudents) * 100) : 0;
  
  return {
    totalStudents,
    totalPortfolios,
    assessmentCompletion,
    monthlyMilestones
  };
}

export function searchStudents(query: string, grade?: number): Student[] {
  const db = getDB();
  return db.students.filter(s => {
    const matchesQuery = query === '' || 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.className.toLowerCase().includes(query.toLowerCase()) ||
      s.interests.toLowerCase().includes(query.toLowerCase());
    const matchesGrade = grade === undefined || s.grade === grade;
    return matchesQuery && matchesGrade;
  });
}
