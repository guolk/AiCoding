import axios from 'axios';
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

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const templateApi = {
  getAll: (keyword?: string) => 
    api.get<ExperimentTemplate[]>('/templates', { params: { keyword } }).then(res => res.data),
  getById: (id: number) =>
    api.get<ExperimentTemplate>(`/templates/${id}`).then(res => res.data),
  create: (data: Omit<ExperimentTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<ExperimentTemplate>('/templates', data).then(res => res.data),
  update: (id: number, data: Partial<ExperimentTemplate>) =>
    api.put<ExperimentTemplate>(`/templates/${id}`, data).then(res => res.data),
  delete: (id: number) =>
    api.delete(`/templates/${id}`).then(res => res.data),
};

export const reportApi = {
  getAll: (filters?: { className?: string; templateId?: number; status?: ReportStatus }) =>
    api.get<StudentReport[]>('/reports', { params: filters }).then(res => res.data),
  getById: (id: number) =>
    api.get<StudentReport>(`/reports/${id}`).then(res => res.data),
  create: (data: Omit<StudentReport, 'id'>) =>
    api.post<StudentReport>('/reports', data).then(res => res.data),
  update: (id: number, data: Partial<StudentReport>) =>
    api.put<StudentReport>(`/reports/${id}`, data).then(res => res.data),
  delete: (id: number) =>
    api.delete(`/reports/${id}`).then(res => res.data),
  getDashboard: () =>
    api.get<DashboardStats>('/reports/dashboard').then(res => res.data),
  getAnalytics: (templateId?: number) =>
    api.get<AnalyticsData>('/reports/analytics', { params: { templateId } }).then(res => res.data),
  getClasses: () =>
    api.get<string[]>('/reports/classes').then(res => res.data),
};

export const commentApi = {
  getAll: (category?: string) =>
    api.get<CommentTemplate[]>('/comments', { params: { category } }).then(res => res.data),
  getCategories: () =>
    api.get<string[]>('/comments/categories').then(res => res.data),
  create: (data: Omit<CommentTemplate, 'id'>) =>
    api.post<CommentTemplate>('/comments', data).then(res => res.data),
  delete: (id: number) =>
    api.delete(`/comments/${id}`).then(res => res.data),
};

export const resourceApi = {
  getAll: (type?: ResourceType) =>
    api.get<Resource[]>('/resources', { params: { type } }).then(res => res.data),
  getById: (id: number) =>
    api.get<Resource>(`/resources/${id}`).then(res => res.data),
  create: (data: Omit<Resource, 'id'>) =>
    api.post<Resource>('/resources', data).then(res => res.data),
  update: (id: number, data: Partial<Resource>) =>
    api.put<Resource>(`/resources/${id}`, data).then(res => res.data),
  delete: (id: number) =>
    api.delete(`/resources/${id}`).then(res => res.data),
  getEquipmentStatus: () =>
    api.get<{ total: number; normal: number; maintenance: number }>('/resources/equipment/status').then(res => res.data),
};

export const archiveApi = {
  getAll: () =>
    api.get<Archive[]>('/archives').then(res => res.data),
  getById: (id: number) =>
    api.get<Archive>(`/archives/${id}`).then(res => res.data),
  create: (data: Omit<Archive, 'id'>) =>
    api.post<Archive>('/archives', data).then(res => res.data),
  update: (id: number, data: Partial<Archive>) =>
    api.put<Archive>(`/archives/${id}`, data).then(res => res.data),
  delete: (id: number) =>
    api.delete(`/archives/${id}`).then(res => res.data),
  getSchedule: (date?: string) =>
    api.get<Schedule[]>('/archives/schedule', { params: { date } }).then(res => res.data),
};

export default api;
