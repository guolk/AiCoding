import { getDB, getNextId, saveDB } from '../db/index.js';
import { getLatestAssessment, calculateOverallScore } from './assessmentService.js';
import { getFeaturedPortfolios } from './portfolioService.js';
import type { Report, GrowthComparison } from '../../shared/types.js';

export function getReportsByStudentId(studentId: number): Report[] {
  const db = getDB();
  return db.reports.filter(r => r.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getReportById(id: number): Report | undefined {
  const db = getDB();
  return db.reports.find(r => r.id === id);
}

export function createReport(
  studentId: number, 
  data: {
    semester: string;
    teacherComment: string;
    highlights: string[];
  }
): Report {
  const db = getDB();
  const id = getNextId('reports');
  
  const assessment = getLatestAssessment(studentId);
  const featuredPortfolios = getFeaturedPortfolios(studentId);
  
  const report: Report = {
    id,
    studentId,
    semester: data.semester,
    featuredWorks: featuredPortfolios.map(p => p.id).slice(0, 5),
    assessmentId: assessment?.id || 0,
    teacherComment: data.teacherComment,
    highlights: data.highlights,
    createdAt: new Date().toISOString()
  };
  
  db.reports.push(report);
  saveDB();
  return report;
}

export function getGrowthComparison(studentId: number): GrowthComparison[] {
  const db = getDB();
  const assessments = db.assessments.filter(a => a.studentId === studentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  return assessments.map(a => ({
    semester: a.semester,
    overallScore: calculateOverallScore(a.intelligence, a.keySkills),
    intelligence: a.intelligence,
    keySkills: a.keySkills
  }));
}

export function getParentVersion(reportId: number): {
  report: Report;
  summary: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
} | undefined {
  const db = getDB();
  const report = db.reports.find(r => r.id === reportId);
  if (!report) return undefined;
  
  const assessment = db.assessments.find(a => a.id === report.assessmentId);
  
  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];
  
  if (assessment) {
    const intelEntries = Object.entries(assessment.intelligence);
    const skillsEntries = Object.entries(assessment.keySkills);
    
    intelEntries.forEach(([key, value]) => {
      if (value >= 85) {
        const names: Record<string, string> = {
          linguistic: '语言表达',
          logicalMathematical: '逻辑数学',
          spatial: '空间想象',
          musical: '音乐',
          bodilyKinesthetic: '运动',
          interpersonal: '人际交往',
          intrapersonal: '自我认知'
        };
        strengths.push(names[key] || key);
      } else if (value < 70) {
        const names: Record<string, string> = {
          linguistic: '语言表达',
          logicalMathematical: '逻辑数学',
          spatial: '空间想象',
          musical: '音乐',
          bodilyKinesthetic: '运动',
          interpersonal: '人际交往',
          intrapersonal: '自我认知'
        };
        improvements.push(names[key] || key);
      }
    });
    
    skillsEntries.forEach(([key, value]) => {
      if (value >= 85) {
        const names: Record<string, string> = {
          criticalThinking: '批判思维',
          creativity: '创造力',
          collaboration: '合作能力',
          learningHabits: '学习习惯'
        };
        strengths.push(names[key] || key);
      } else if (value < 70) {
        const names: Record<string, string> = {
          criticalThinking: '批判思维',
          creativity: '创造力',
          collaboration: '合作能力',
          learningHabits: '学习习惯'
        };
        improvements.push(names[key] || key);
      }
    });
    
    if (improvements.length > 0) {
      recommendations.push(`建议在${improvements.join('、')}方面多加练习`);
    }
    if (strengths.length > 0) {
      recommendations.push(`继续发扬${strengths.slice(0, 2).join('、')}方面的优势`);
    }
    recommendations.push('保持家校沟通，共同关注孩子成长');
  }
  
  return {
    report,
    summary: {
      strengths: [...new Set(strengths)],
      improvements: [...new Set(improvements)],
      recommendations
    }
  };
}
