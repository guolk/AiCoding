import type {
  Institution,
  Donation,
  VolunteerRecord,
  ItemDonation,
  OnlineAction,
  ProjectProgress,
  ImpactEstimate,
  InstitutionStatistics,
  AnnualReportData,
  ApiResponse,
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const api = {
  institutions: {
    getAll: () => request<Institution[]>('/institutions'),
    getById: (id: number) => request<{
      institution: Institution;
      annualReports: any[];
      credibilityAssessments: any[];
    }>(`/institutions/${id}`),
    create: (data: Partial<Institution>) =>
      request<Institution>('/institutions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Institution>) =>
      request<Institution>(`/institutions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request(`/institutions/${id}`, { method: 'DELETE' }),
  },

  donations: {
    getAll: () => request<Donation[]>('/donations'),
    getById: (id: number) => request<Donation>(`/donations/${id}`),
    create: (data: Partial<Donation>) =>
      request<Donation>('/donations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Donation>) =>
      request<Donation>(`/donations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request(`/donations/${id}`, { method: 'DELETE' }),
    getStatistics: () => request<InstitutionStatistics[]>('/donations/statistics'),
  },

  volunteer: {
    getAll: () => request<VolunteerRecord[]>('/volunteer'),
    create: (data: Partial<VolunteerRecord>) =>
      request<VolunteerRecord>('/volunteer', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<VolunteerRecord>) =>
      request<VolunteerRecord>(`/volunteer/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request(`/volunteer/${id}`, { method: 'DELETE' }),
  },

  items: {
    getAll: () => request<ItemDonation[]>('/items'),
    create: (data: Partial<ItemDonation>) =>
      request<ItemDonation>('/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<ItemDonation>) =>
      request<ItemDonation>(`/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request(`/items/${id}`, { method: 'DELETE' }),
  },

  onlineActions: {
    getAll: () => request<OnlineAction[]>('/online-actions'),
    create: (data: Partial<OnlineAction>) =>
      request<OnlineAction>('/online-actions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<OnlineAction>) =>
      request<OnlineAction>(`/online-actions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request(`/online-actions/${id}`, { method: 'DELETE' }),
  },

  progress: {
    getAll: (donationId?: number) =>
      request<ProjectProgress[]>(donationId ? `/progress?donation_id=${donationId}` : '/progress'),
    create: (data: Partial<ProjectProgress>) =>
      request<ProjectProgress>('/progress', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request(`/progress/${id}`, { method: 'DELETE' }),
  },

  impact: {
    getAll: () => request<ImpactEstimate[]>('/impact'),
    create: (data: Partial<ImpactEstimate>) =>
      request<ImpactEstimate>('/impact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request(`/impact/${id}`, { method: 'DELETE' }),
  },

  report: {
    getAnnual: (year: number) =>
      request<AnnualReportData>(`/report/annual?year=${year}`),
  },
};
