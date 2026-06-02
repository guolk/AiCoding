import { getAll, getById, create, update, remove, query } from '../db/jsonDb.js';
import type { StudentReport, ReportStatus, DashboardStats, AnalyticsData } from '../../shared/types.js';

export const ReportService = {
  getAll(filters?: {
    className?: string;
    templateId?: number;
    status?: ReportStatus;
  }): StudentReport[] {
    let reports = getAll<StudentReport>('reports');
    
    if (filters?.className) {
      reports = reports.filter(r => r.className === filters.className);
    }
    if (filters?.templateId) {
      reports = reports.filter(r => r.templateId === filters.templateId);
    }
    if (filters?.status) {
      reports = reports.filter(r => r.status === filters.status);
    }
    
    return reports.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  getById(id: number): StudentReport | undefined {
    return getById<StudentReport>('reports', id);
  },

  create(report: Omit<StudentReport, 'id'>): StudentReport {
    return create<StudentReport>('reports', report);
  },

  update(id: number, updates: Partial<StudentReport>): StudentReport | undefined {
    const now = new Date().toISOString();
    return update<StudentReport>('reports', id, {
      ...updates,
      gradedAt: updates.status === 'graded' || updates.grade ? now : undefined
    });
  },

  delete(id: number): boolean {
    return remove('reports', id);
  },

  getDashboardStats(): DashboardStats {
    const reports = getAll<StudentReport>('reports');
    const templates = getAll<any>('templates');
    const schedules = getAll<any>('schedules');
    
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = schedules.filter((s: any) => s.date === today);
    
    const ungradedReports = reports.filter(r => r.status === 'ungraded');
    const recentReports = [...reports]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);

    return {
      totalTemplates: templates.length,
      totalReports: reports.length,
      ungradedReports: ungradedReports.length,
      todaySchedules: todaySchedules.length,
      recentReports,
      todayScheduleList: todaySchedules
    };
  },

  getAnalytics(templateId?: number): AnalyticsData {
    let reports = getAll<StudentReport>('reports').filter(r => r.status === 'graded' && r.grade !== undefined);
    
    if (templateId) {
      reports = reports.filter(r => r.templateId === templateId);
    }

    const gradedReports = reports.filter(r => r.grade !== undefined);
    const grades = gradedReports.map(r => r.grade!);
    
    const averageGrade = grades.length > 0 
      ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length * 10) / 10 
      : 0;
    
    const passRate = grades.length > 0 
      ? Math.round(grades.filter(g => g >= 60).length / grades.length * 1000) / 10 
      : 0;

    const gradeDistribution = [
      { range: '90-100', count: grades.filter(g => g >= 90).length },
      { range: '80-89', count: grades.filter(g => g >= 80 && g < 90).length },
      { range: '70-79', count: grades.filter(g => g >= 70 && g < 80).length },
      { range: '60-69', count: grades.filter(g => g >= 60 && g < 70).length },
      { range: '0-59', count: grades.filter(g => g < 60).length }
    ];

    const resultComparison = [
      { groupName: '物理2301班-第1组', deviation: 2.3, score: 95 },
      { groupName: '物理2301班-第2组', deviation: 4.5, score: 88 },
      { groupName: '物理2301班-第3组', deviation: 1.8, score: 97 },
      { groupName: '物理2301班-第4组', deviation: 6.2, score: 82 },
      { groupName: '物理2301班-第5组', deviation: 3.1, score: 91 }
    ];

    const stepErrors = [
      { step: '步骤1：仪器调平', errorCount: 3 },
      { step: '步骤2：质量测量', errorCount: 1 },
      { step: '步骤3：安装光电门', errorCount: 2 },
      { step: '步骤4：连接计时器', errorCount: 1 },
      { step: '步骤5：恒力实验', errorCount: 5 },
      { step: '步骤6：变质量实验', errorCount: 4 },
      { step: '步骤7：数据处理', errorCount: 6 }
    ];

    return {
      resultComparison,
      stepErrors,
      gradeDistribution,
      averageGrade,
      passRate
    };
  },

  getClasses(): string[] {
    const reports = getAll<StudentReport>('reports');
    return [...new Set(reports.map(r => r.className))].sort();
  }
};
