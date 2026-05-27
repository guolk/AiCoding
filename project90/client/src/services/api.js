import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getFailures: (id) => api.get(`/projects/${id}/failures`),
  createFailure: (id, data) => api.post(`/projects/${id}/failures`, data),
  updateFailure: (id, data) => api.put(`/projects/failures/${id}`, data),
  deleteFailure: (id) => api.delete(`/projects/failures/${id}`),
};

export const filamentsAPI = {
  getAll: (params) => api.get('/filaments', { params }),
  getById: (id) => api.get(`/filaments/${id}`),
  create: (data) => api.post('/filaments', data),
  update: (id, data) => api.put(`/filaments/${id}`, data),
  delete: (id) => api.delete(`/filaments/${id}`),
  getUsageHistory: (id) => api.get(`/filaments/${id}/usage-history`),
};

export const printersAPI = {
  getAll: () => api.get('/printers'),
  getById: (id) => api.get(`/printers/${id}`),
  create: (data) => api.post('/printers', data),
  update: (id, data) => api.put(`/printers/${id}`, data),
  delete: (id) => api.delete(`/printers/${id}`),
  getMaintenance: (id) => api.get(`/printers/${id}/maintenance`),
  createMaintenance: (id, data) => api.post(`/printers/${id}/maintenance`, data),
  updateMaintenance: (id, data) => api.put(`/printers/maintenance/${id}`, data),
  deleteMaintenance: (id) => api.delete(`/printers/maintenance/${id}`),
  getMilestones: (id) => api.get(`/printers/${id}/milestones`),
  createMilestone: (id, data) => api.post(`/printers/${id}/milestones`, data),
  updateMilestone: (id, data) => api.put(`/printers/milestones/${id}`, data),
  deleteMilestone: (id) => api.delete(`/printers/milestones/${id}`),
  getTroubleshooting: (id) => api.get(`/printers/${id}/troubleshooting`),
  createTroubleshooting: (id, data) => api.post(`/printers/${id}/troubleshooting`, data),
  updateTroubleshooting: (id, data) => api.put(`/printers/troubleshooting/${id}`, data),
  deleteTroubleshooting: (id) => api.delete(`/printers/troubleshooting/${id}`),
};

export const profilesAPI = {
  getAll: (params) => api.get('/profiles', { params }),
  getById: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post('/profiles', data),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
};

export const costsAPI = {
  getSettings: () => api.get('/costs/settings'),
  updateSettings: (data) => api.put('/costs/settings', data),
  calculateProject: (projectId) => api.get(`/costs/calculate/${projectId}`),
  calculate: (data) => api.post('/costs/calculate', data),
  getSummary: (period) => api.get('/costs/summary', { params: { period } }),
};

export default api;