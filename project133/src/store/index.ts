import { create } from 'zustand';
import type {
  ExperimentTemplate,
  StudentReport,
  ReportStatus,
  CommentTemplate,
  Resource,
  ResourceType,
  Archive,
  Schedule,
  DashboardStats,
  AnalyticsData
} from '../../shared/types.js';
import {
  templateApi,
  reportApi,
  commentApi,
  resourceApi,
  archiveApi
} from '../api/index.js';

interface AppState {
  templates: ExperimentTemplate[];
  reports: StudentReport[];
  comments: CommentTemplate[];
  resources: Resource[];
  archives: Archive[];
  schedules: Schedule[];
  dashboardStats: DashboardStats | null;
  analyticsData: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  
  fetchTemplates: (keyword?: string) => Promise<void>;
  fetchTemplateById: (id: number) => Promise<ExperimentTemplate | undefined>;
  createTemplate: (data: Omit<ExperimentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: number, data: Partial<ExperimentTemplate>) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  
  fetchReports: (filters?: { className?: string; templateId?: number; status?: ReportStatus }) => Promise<void>;
  fetchReportById: (id: number) => Promise<StudentReport | undefined>;
  updateReport: (id: number, data: Partial<StudentReport>) => Promise<void>;
  
  fetchDashboardStats: () => Promise<void>;
  fetchAnalytics: (templateId?: number) => Promise<void>;
  
  fetchComments: (category?: string) => Promise<void>;
  fetchCommentCategories: () => Promise<string[]>;
  
  fetchResources: (type?: ResourceType) => Promise<void>;
  createResource: (data: Omit<Resource, 'id'>) => Promise<void>;
  
  fetchArchives: () => Promise<void>;
  fetchSchedules: (date?: string) => Promise<void>;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  templates: [],
  reports: [],
  comments: [],
  resources: [],
  archives: [],
  schedules: [],
  dashboardStats: null,
  analyticsData: null,
  loading: false,
  error: null,

  fetchTemplates: async (keyword) => {
    set({ loading: true, error: null });
    try {
      const data = await templateApi.getAll(keyword);
      set({ templates: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTemplateById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await templateApi.getById(id);
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTemplate: async (data) => {
    set({ loading: true, error: null });
    try {
      await templateApi.create(data);
      await get().fetchTemplates();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateTemplate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await templateApi.update(id, data);
      await get().fetchTemplates();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      await templateApi.delete(id);
      await get().fetchTemplates();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchReports: async (filters) => {
    set({ loading: true, error: null });
    try {
      const data = await reportApi.getAll(filters);
      set({ reports: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchReportById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await reportApi.getById(id);
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateReport: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await reportApi.update(id, data);
      await get().fetchReports();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await reportApi.getDashboard();
      set({ dashboardStats: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchAnalytics: async (templateId) => {
    set({ loading: true, error: null });
    try {
      const data = await reportApi.getAnalytics(templateId);
      set({ analyticsData: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchComments: async (category) => {
    set({ loading: true, error: null });
    try {
      const data = await commentApi.getAll(category);
      set({ comments: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchCommentCategories: async () => {
    try {
      return await commentApi.getCategories();
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  fetchResources: async (type) => {
    set({ loading: true, error: null });
    try {
      const data = await resourceApi.getAll(type);
      set({ resources: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createResource: async (data) => {
    set({ loading: true, error: null });
    try {
      await resourceApi.create(data);
      await get().fetchResources();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchArchives: async () => {
    set({ loading: true, error: null });
    try {
      const data = await archiveApi.getAll();
      set({ archives: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSchedules: async (date) => {
    set({ loading: true, error: null });
    try {
      const data = await archiveApi.getSchedule(date);
      set({ schedules: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
