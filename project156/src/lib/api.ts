import type { 
  Student, ParentCommunication, Portfolio, Assessment, 
  Milestone, Report, DashboardStats, GrowthComparison 
} from '../../shared/types.js';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  getDashboardStats: () => request<DashboardStats>('/students/stats'),
  
  getStudents: (q?: string, grade?: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (grade !== undefined) params.set('grade', String(grade));
    return request<Student[]>(`/students${params.toString() ? `?${params.toString()}` : ''}`);
  },
  
  getStudent: (id: number) => request<Student>(`/students/${id}`),
  
  updateStudent: (id: number, data: Partial<Student>) => 
    request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  getCommunications: (studentId: number) => 
    request<ParentCommunication[]>(`/students/${studentId}/communications`),
  
  addCommunication: (studentId: number, data: Omit<ParentCommunication, 'id' | 'studentId'>) => 
    request<ParentCommunication>(`/students/${studentId}/communications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getPortfolios: (studentId: number, category?: string, grade?: number) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (grade !== undefined) params.set('grade', String(grade));
    return request<Portfolio[]>(`/portfolios/student/${studentId}${params.toString() ? `?${params.toString()}` : ''}`);
  },
  
  getPortfolioTimeline: (studentId: number) => 
    request<{ grade: number; portfolios: Portfolio[] }[]>(`/portfolios/student/${studentId}/timeline`),
  
  getFeaturedPortfolios: (studentId: number) => 
    request<Portfolio[]>(`/portfolios/student/${studentId}/featured`),
  
  toggleFeatured: (portfolioId: number) => 
    request<Portfolio>(`/portfolios/${portfolioId}/feature`, {
      method: 'PUT',
    }),
  
  addPortfolio: (studentId: number, data: Omit<Portfolio, 'id' | 'studentId' | 'createdAt' | 'isFeatured'>) => 
    request<Portfolio>(`/portfolios/student/${studentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deletePortfolio: (portfolioId: number) => 
    request(`/portfolios/${portfolioId}`, {
      method: 'DELETE',
    }),
  
  getAssessments: (studentId: number) => 
    request<Assessment[]>(`/assessments/student/${studentId}`),
  
  getLatestAssessment: (studentId: number) => 
    request<Assessment>(`/assessments/student/${studentId}/latest`),
  
  createAssessment: (studentId: number, data: {
    semester: string;
    intelligence: Assessment['intelligence'];
    keySkills: Assessment['keySkills'];
    teacherComment: string;
  }) => 
    request<Assessment>(`/assessments/student/${studentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getMilestones: (studentId: number) => 
    request<Milestone[]>(`/assessments/student/${studentId}/milestones`),
  
  addMilestone: (studentId: number, data: Omit<Milestone, 'id' | 'studentId'>) => 
    request<Milestone>(`/assessments/student/${studentId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deleteMilestone: (milestoneId: number) => 
    request(`/assessments/milestones/${milestoneId}`, {
      method: 'DELETE',
    }),
  
  getReports: (studentId: number) => 
    request<Report[]>(`/reports/student/${studentId}`),
  
  getReport: (reportId: number) => 
    request<Report>(`/reports/${reportId}`),
  
  createReport: (studentId: number, data: {
    semester: string;
    teacherComment: string;
    highlights: string[];
  }) => 
    request<Report>(`/reports/student/${studentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getParentVersion: (reportId: number) => 
    request<{
      report: Report;
      summary: {
        strengths: string[];
        improvements: string[];
        recommendations: string[];
      };
    }>(`/reports/${reportId}/parent-version`),
  
  getGrowthComparison: (studentId: number) => 
    request<GrowthComparison[]>(`/reports/student/${studentId}/growth-comparison`),
};
