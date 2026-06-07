import { getDB, getNextId, saveDB } from '../db/index.js';
import type { Assessment, Milestone, Intelligence, KeySkills } from '../../shared/types.js';

export function getAssessmentsByStudentId(studentId: number): Assessment[] {
  const db = getDB();
  return db.assessments.filter(a => a.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAssessmentById(id: number): Assessment | undefined {
  const db = getDB();
  return db.assessments.find(a => a.id === id);
}

export function createAssessment(
  studentId: number, 
  data: {
    semester: string;
    intelligence: Intelligence;
    keySkills: KeySkills;
    teacherComment: string;
  }
): Assessment {
  const db = getDB();
  const id = getNextId('assessments');
  const assessment: Assessment = {
    id,
    studentId,
    ...data,
    createdAt: new Date().toISOString()
  };
  db.assessments.push(assessment);
  saveDB();
  return assessment;
}

export function getMilestonesByStudentId(studentId: number): Milestone[] {
  const db = getDB();
  return db.milestones.filter(m => m.studentId === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addMilestone(studentId: number, data: Omit<Milestone, 'id' | 'studentId'>): Milestone {
  const db = getDB();
  const id = getNextId('milestones');
  const milestone: Milestone = {
    ...data,
    id,
    studentId
  };
  db.milestones.push(milestone);
  saveDB();
  return milestone;
}

export function deleteMilestone(id: number): boolean {
  const db = getDB();
  const index = db.milestones.findIndex(m => m.id === id);
  if (index === -1) return false;
  
  db.milestones.splice(index, 1);
  saveDB();
  return true;
}

export function getLatestAssessment(studentId: number): Assessment | undefined {
  const assessments = getAssessmentsByStudentId(studentId);
  return assessments[0];
}

export function calculateOverallScore(intelligence: Intelligence, keySkills: KeySkills): number {
  const intelAvg = Object.values(intelligence).reduce((sum, val) => sum + val, 0) / 7;
  const skillsAvg = Object.values(keySkills).reduce((sum, val) => sum + val, 0) / 4;
  return Math.round((intelAvg * 0.6 + skillsAvg * 0.4));
}
