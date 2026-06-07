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
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  dashboard: {
    getStats: () => request<import('../../shared/types').DashboardStats>('/dashboard/stats'),
  },
  
  relics: {
    getAll: () => request<import('../../shared/types').Relic[]>('/relics'),
    getById: (id: string) => request<import('../../shared/types').Relic>(`/relics/${id}`),
    create: (data: any) => request<import('../../shared/types').Relic>('/relics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<import('../../shared/types').Relic>(`/relics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/relics/${id}`, { method: 'DELETE' }),
    addPhoto: (id: string, formData: FormData) => {
      return fetch(`${API_BASE}/relics/${id}/photos`, {
        method: 'POST',
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      });
    },
    deletePhoto: (photoId: string) => request<{ success: boolean }>(`/relics/photos/${photoId}`, { method: 'DELETE' }),
  },

  notes: {
    getAll: () => request<import('../../shared/types').ResearchNote[]>('/notes'),
    getById: (id: string) => request<import('../../shared/types').ResearchNote>(`/notes/${id}`),
    create: (data: any) => request<import('../../shared/types').ResearchNote>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<import('../../shared/types').ResearchNote>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/notes/${id}`, { method: 'DELETE' }),
    addReference: (noteId: string, data: any) => request<import('../../shared/types').Reference>(`/notes/${noteId}/references`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateReference: (refId: string, data: any) => request<import('../../shared/types').Reference>(`/notes/references/${refId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    deleteReference: (refId: string) => request<{ success: boolean }>(`/notes/references/${refId}`, { method: 'DELETE' }),
    addViewpoint: (noteId: string, data: any) => request<import('../../shared/types').Viewpoint>(`/notes/${noteId}/viewpoints`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateViewpoint: (vpId: string, data: any) => request<import('../../shared/types').Viewpoint>(`/notes/viewpoints/${vpId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    deleteViewpoint: (vpId: string) => request<{ success: boolean }>(`/notes/viewpoints/${vpId}`, { method: 'DELETE' }),
  },

  analysis: {
    getAll: () => request<import('../../shared/types').TypeAnalysis[]>('/analysis'),
    getById: (id: string) => request<import('../../shared/types').TypeAnalysis>(`/analysis/${id}`),
    create: (data: any) => request<import('../../shared/types').TypeAnalysis>('/analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<import('../../shared/types').TypeAnalysis>(`/analysis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/analysis/${id}`, { method: 'DELETE' }),
  },

  materials: {
    getAll: () => request<import('../../shared/types').Material[]>('/materials'),
    getById: (id: string) => request<import('../../shared/types').Material>(`/materials/${id}`),
    upload: (formData: FormData) => {
      return fetch(`${API_BASE}/materials/upload`, {
        method: 'POST',
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      });
    },
    create: (data: any) => request<import('../../shared/types').Material>('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<import('../../shared/types').Material>(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/materials/${id}`, { method: 'DELETE' }),
  },

  output: {
    getAll: () => request<import('../../shared/types').Output[]>('/output'),
    getById: (id: string) => request<import('../../shared/types').Output>(`/output/${id}`),
    create: (data: any) => request<import('../../shared/types').Output>('/output', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<import('../../shared/types').Output>(`/output/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/output/${id}`, { method: 'DELETE' }),
  },
};
