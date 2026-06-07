import { getDB, getNextId, saveDB } from '../db/index.js';
import type { Portfolio } from '../../shared/types.js';

export function getPortfoliosByStudentId(studentId: number, category?: string, grade?: number): Portfolio[] {
  const db = getDB();
  return db.portfolios.filter(p => {
    const matchesStudent = p.studentId === studentId;
    const matchesCategory = !category || p.category === category;
    const matchesGrade = grade === undefined || p.grade === grade;
    return matchesStudent && matchesCategory && matchesGrade;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPortfolioById(id: number): Portfolio | undefined {
  const db = getDB();
  return db.portfolios.find(p => p.id === id);
}

export function addPortfolio(studentId: number, data: Omit<Portfolio, 'id' | 'studentId' | 'createdAt' | 'isFeatured'>): Portfolio {
  const db = getDB();
  const id = getNextId('portfolios');
  const portfolio: Portfolio = {
    ...data,
    id,
    studentId,
    isFeatured: false,
    createdAt: new Date().toISOString()
  };
  db.portfolios.push(portfolio);
  saveDB();
  return portfolio;
}

export function toggleFeatured(id: number): Portfolio | undefined {
  const db = getDB();
  const portfolio = db.portfolios.find(p => p.id === id);
  if (!portfolio) return undefined;
  
  portfolio.isFeatured = !portfolio.isFeatured;
  saveDB();
  return portfolio;
}

export function deletePortfolio(id: number): boolean {
  const db = getDB();
  const index = db.portfolios.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  db.portfolios.splice(index, 1);
  saveDB();
  return true;
}

export function getFeaturedPortfolios(studentId: number): Portfolio[] {
  const db = getDB();
  return db.portfolios.filter(p => p.studentId === studentId && p.isFeatured)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPortfolioTimeline(studentId: number): { grade: number; portfolios: Portfolio[] }[] {
  const db = getDB();
  const portfolios = db.portfolios.filter(p => p.studentId === studentId);
  const gradeMap = new Map<number, Portfolio[]>();
  
  portfolios.forEach(p => {
    if (!gradeMap.has(p.grade)) {
      gradeMap.set(p.grade, []);
    }
    gradeMap.get(p.grade)!.push(p);
  });
  
  return Array.from(gradeMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([grade, items]) => ({
      grade,
      portfolios: items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }));
}
