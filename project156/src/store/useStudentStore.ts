import { create } from 'zustand';
import type { Student, ParentCommunication, Portfolio, Assessment, Milestone, Report, DashboardStats, GrowthComparison } from '../../shared/types.js';
import { api } from '../lib/api.js';

interface StudentState {
  students: Student[];
  currentStudent: Student | null;
  communications: ParentCommunication[];
  portfolios: Portfolio[];
  portfolioTimeline: { grade: number; portfolios: Portfolio[] }[];
  featuredPortfolios: Portfolio[];
  assessments: Assessment[];
  latestAssessment: Assessment | null;
  milestones: Milestone[];
  reports: Report[];
  currentReport: Report | null;
  growthComparison: GrowthComparison[];
  dashboardStats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  
  fetchDashboardStats: () => Promise<void>;
  fetchStudents: (q?: string, grade?: number) => Promise<void>;
  fetchStudent: (id: number) => Promise<void>;
  updateStudent: (id: number, data: Partial<Student>) => Promise<void>;
  fetchCommunications: (studentId: number) => Promise<void>;
  addCommunication: (studentId: number, data: Omit<ParentCommunication, 'id' | 'studentId'>) => Promise<void>;
  fetchPortfolios: (studentId: number, category?: string, grade?: number) => Promise<void>;
  fetchPortfolioTimeline: (studentId: number) => Promise<void>;
  fetchFeaturedPortfolios: (studentId: number) => Promise<void>;
  toggleFeatured: (portfolioId: number) => Promise<void>;
  addPortfolio: (studentId: number, data: Omit<Portfolio, 'id' | 'studentId' | 'createdAt' | 'isFeatured'>) => Promise<void>;
  deletePortfolio: (portfolioId: number) => Promise<void>;
  fetchAssessments: (studentId: number) => Promise<void>;
  fetchLatestAssessment: (studentId: number) => Promise<void>;
  createAssessment: (studentId: number, data: {
    semester: string;
    intelligence: Assessment['intelligence'];
    keySkills: Assessment['keySkills'];
    teacherComment: string;
  }) => Promise<void>;
  fetchMilestones: (studentId: number) => Promise<void>;
  addMilestone: (studentId: number, data: Omit<Milestone, 'id' | 'studentId'>) => Promise<void>;
  deleteMilestone: (milestoneId: number) => Promise<void>;
  fetchReports: (studentId: number) => Promise<void>;
  fetchReport: (reportId: number) => Promise<void>;
  createReport: (studentId: number, data: {
    semester: string;
    teacherComment: string;
    highlights: string[];
  }) => Promise<void>;
  fetchGrowthComparison: (studentId: number) => Promise<void>;
  setCurrentStudent: (student: Student | null) => void;
  clearError: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  currentStudent: null,
  communications: [],
  portfolios: [],
  portfolioTimeline: [],
  featuredPortfolios: [],
  assessments: [],
  latestAssessment: null,
  milestones: [],
  reports: [],
  currentReport: null,
  growthComparison: [],
  dashboardStats: null,
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await api.getDashboardStats();
      set({ dashboardStats: stats });
    } catch (error) {
      set({ error: '获取统计数据失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchStudents: async (q, grade) => {
    try {
      set({ loading: true, error: null });
      const students = await api.getStudents(q, grade);
      set({ students });
    } catch (error) {
      set({ error: '获取学生列表失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchStudent: async (id) => {
    try {
      set({ loading: true, error: null });
      const student = await api.getStudent(id);
      set({ currentStudent: student });
    } catch (error) {
      set({ error: '获取学生信息失败' });
    } finally {
      set({ loading: false });
    }
  },

  updateStudent: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const student = await api.updateStudent(id, data);
      set({ 
        currentStudent: student,
        students: get().students.map(s => s.id === id ? student : s)
      });
    } catch (error) {
      set({ error: '更新学生信息失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchCommunications: async (studentId) => {
    try {
      set({ loading: true, error: null });
      const communications = await api.getCommunications(studentId);
      set({ communications });
    } catch (error) {
      set({ error: '获取沟通记录失败' });
    } finally {
      set({ loading: false });
    }
  },

  addCommunication: async (studentId, data) => {
    try {
      set({ loading: true, error: null });
      const communication = await api.addCommunication(studentId, data);
      set({ communications: [communication, ...get().communications] });
    } catch (error) {
      set({ error: '添加沟通记录失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchPortfolios: async (studentId, category, grade) => {
    try {
      set({ loading: true, error: null });
      const portfolios = await api.getPortfolios(studentId, category, grade);
      set({ portfolios });
    } catch (error) {
      set({ error: '获取作品列表失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchPortfolioTimeline: async (studentId) => {
    try {
      set({ loading: true, error: null });
      const timeline = await api.getPortfolioTimeline(studentId);
      set({ portfolioTimeline: timeline });
    } catch (error) {
      set({ error: '获取作品时间轴失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchFeaturedPortfolios: async (studentId) => {
    try {
      set({ loading: true, error: null });
      const portfolios = await api.getFeaturedPortfolios(studentId);
      set({ featuredPortfolios: portfolios });
    } catch (error) {
      set({ error: '获取优秀作品失败' });
    } finally {
      set({ loading: false });
    }
  },

  toggleFeatured: async (portfolioId) => {
    try {
      set({ error: null });
      const portfolio = await api.toggleFeatured(portfolioId);
      set({
        portfolios: get().portfolios.map(p => p.id === portfolioId ? portfolio : p),
        featuredPortfolios: get().featuredPortfolios.map(p => p.id === portfolioId ? portfolio : p)
          .filter(p => p.isFeatured)
      });
    } catch (error) {
      set({ error: '更新作品状态失败' });
    }
  },

  addPortfolio: async (studentId, data) => {
    try {
      set({ loading: true, error: null });
      const portfolio = await api.addPortfolio(studentId, data);
      set({ portfolios: [portfolio, ...get().portfolios] });
    } catch (error) {
      set({ error: '添加作品失败' });
    } finally {
      set({ loading: false });
    }
  },

  deletePortfolio: async (portfolioId) => {
    try {
      set({ error: null });
      await api.deletePortfolio(portfolioId);
      set({
        portfolios: get().portfolios.filter(p => p.id !== portfolioId),
        featuredPortfolios: get().featuredPortfolios.filter(p => p.id !== portfolioId)
      });
    } catch (error) {
      set({ error: '删除作品失败' });
    }
  },

  fetchAssessments: async (studentId) => {
    try {
      set({ loading: true, error: null });
      const assessments = await api.getAssessments(studentId);
      set({ assessments });
    } catch (error) {
      set({ error: '获取评估列表失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchLatestAssessment: async (studentId) => {
    try {
      set({ loading: true, error: null });
      const assessment = await api.getLatestAssessment(studentId);
      set({ latestAssessment: assessment });
    } catch (error) {
      set({ error: '获取最新评估失败' });
    } finally {
      set({ loading: false });
    }
  },

  createAssessment: async (studentId, data) => {
    try {
      set({ loading: true, error: null });
      const assessment = await api.createAssessment(studentId, data);
      set({ 
        assessments: [assessment, ...get().assessments],
        latestAssessment: assessment
      });
    } catch (error) {
      set({ error: '创建评估失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchMilestones: async (studentId) => {
    try {
      set({ loading: true, error: null });
      const milestones = await api.getMilestones(studentId);
      set({ milestones });
    } catch (error) {
      set({ error: '获取里程碑失败' });
    } finally {
      set({ loading: false });
    }
  },

  addMilestone: async (studentId, data) => {
    try {
      set({ loading: true, error: null });
      const milestone = await api.addMilestone(studentId, data);
      set({ milestones: [milestone, ...get().milestones] });
    } catch (error) {
      set({ error: '添加里程碑失败' });
    } finally {
      set({ loading: false });
    }
  },

  deleteMilestone: async (milestoneId) => {
    try {
      set({ error: null });
      await api.deleteMilestone(milestoneId);
      set({ milestones: get().milestones.filter(m => m.id !== milestoneId) });
    } catch (error) {
      set({ error: '删除里程碑失败' });
    }
  },

  fetchReports: async (studentId) => {
    try {
      set({ loading: true, error: null });
      const reports = await api.getReports(studentId);
      set({ reports });
    } catch (error) {
      set({ error: '获取报告列表失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchReport: async (reportId) => {
    try {
      set({ loading: true, error: null });
      const report = await api.getReport(reportId);
      set({ currentReport: report });
    } catch (error) {
      set({ error: '获取报告失败' });
    } finally {
      set({ loading: false });
    }
  },

  createReport: async (studentId, data) => {
    try {
      set({ loading: true, error: null });
      const report = await api.createReport(studentId, data);
      set({ reports: [report, ...get().reports] });
    } catch (error) {
      set({ error: '生成报告失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchGrowthComparison: async (studentId) => {
    try {
      set({ loading: true, error: null });
      const comparison = await api.getGrowthComparison(studentId);
      set({ growthComparison: comparison });
    } catch (error) {
      set({ error: '获取成长对比失败' });
    } finally {
      set({ loading: false });
    }
  },

  setCurrentStudent: (student) => set({ currentStudent: student }),

  clearError: () => set({ error: null }),
}));
