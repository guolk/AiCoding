import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const papersAPI = {
  getAll: (params) => api.get('/papers', { params }),
  get: (id) => api.get(`/papers/${id}`),
  create: (data) => api.post('/papers', data),
  update: (id, data) => api.put(`/papers/${id}`, data),
  delete: (id) => api.delete(`/papers/${id}`),
  fetchMetadata: (data) => api.post('/papers/fetch-metadata', data),
  updateProgress: (id, data) => api.put(`/papers/${id}/progress`, data),
};

export const annotationsAPI = {
  getAll: (params) => api.get('/annotations', { params }),
  create: (data) => api.post('/annotations', data),
  update: (id, data) => api.put(`/annotations/${id}`, data),
  delete: (id) => api.delete(`/annotations/${id}`),
  export: (paperId) => api.get(`/annotations/export/${paperId}`),
};

export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const insightsAPI = {
  get: (paperId) => api.get(`/insights/${paperId}`),
  update: (paperId, data) => api.put(`/insights/${paperId}`, data),
};

export const relationsAPI = {
  getAll: (params) => api.get('/relations', { params }),
  create: (data) => api.post('/relations', data),
  delete: (id) => api.delete(`/relations/${id}`),
};

export const statsAPI = {
  getMonthlyReading: () => api.get('/stats/monthly-reading'),
  getStatusDistribution: () => api.get('/stats/status-distribution'),
  getYearDistribution: () => api.get('/stats/year-distribution'),
  getSummary: () => api.get('/stats/summary'),
};

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('http://localhost:3001/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
