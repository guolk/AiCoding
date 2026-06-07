import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const plotsAPI = {
  getAll: (search?: string) => api.get('/plots', { params: { search } }),
  get: (id: string) => api.get(`/plots/${id}`),
  create: (data: any) => api.post('/plots', data),
  update: (id: string, data: any) => api.put(`/plots/${id}`, data),
  delete: (id: string) => api.delete(`/plots/${id}`),
  getPlantingRecords: (id: string, year?: number) => 
    api.get(`/plots/${id}/planting-records`, { params: { year } }),
  createPlantingRecord: (id: string, data: any) => 
    api.post(`/plots/${id}/planting-records`, data),
  updatePlantingRecord: (recordId: string, data: any) => 
    api.put(`/plots/planting-records/${recordId}`, data),
  deletePlantingRecord: (recordId: string) => 
    api.delete(`/plots/planting-records/${recordId}`),
  getSoilTests: (id: string) => api.get(`/plots/${id}/soil-tests`),
  createSoilTest: (id: string, data: any) => api.post(`/plots/${id}/soil-tests`, data),
  updateSoilTest: (testId: string, data: any) => api.put(`/plots/soil-tests/${testId}`, data),
  deleteSoilTest: (testId: string) => api.delete(`/plots/soil-tests/${testId}`),
};

export const farmingAPI = {
  getPesticides: (type?: string) => api.get('/farming/pesticides', { params: { type } }),
  createPesticide: (data: any) => api.post('/farming/pesticides', data),
  updatePesticide: (id: string, data: any) => api.put(`/farming/pesticides/${id}`, data),
  deletePesticide: (id: string) => api.delete(`/farming/pesticides/${id}`),
  getMachinery: () => api.get('/farming/machinery'),
  createMachinery: (data: any) => api.post('/farming/machinery', data),
  updateMachinery: (id: string, data: any) => api.put(`/farming/machinery/${id}`, data),
  deleteMachinery: (id: string) => api.delete(`/farming/machinery/${id}`),
  getOperations: (params?: any) => api.get('/farming/operations', { params }),
  getOperation: (id: string) => api.get(`/farming/operations/${id}`),
  createOperation: (data: any) => api.post('/farming/operations', data),
  updateOperation: (id: string, data: any) => api.put(`/farming/operations/${id}`, data),
  deleteOperation: (id: string) => api.delete(`/farming/operations/${id}`),
};

export const pestsAPI = {
  getCatalog: (type?: string) => api.get('/pests/catalog', { params: { type } }),
  createCatalogItem: (data: any) => api.post('/pests/catalog', data),
  updateCatalogItem: (id: string, data: any) => api.put(`/pests/catalog/${id}`, data),
  deleteCatalogItem: (id: string) => api.delete(`/pests/catalog/${id}`),
  getRecords: (params?: any) => api.get('/pests/records', { params }),
  getRecord: (id: string) => api.get(`/pests/records/${id}`),
  createRecord: (data: any) => api.post('/pests/records', data),
  updateRecord: (id: string, data: any) => api.put(`/pests/records/${id}`, data),
  deleteRecord: (id: string) => api.delete(`/pests/records/${id}`),
  addControlMeasure: (recordId: string, data: any) => 
    api.post(`/pests/records/${recordId}/control-measures`, data),
  updateControlMeasure: (id: string, data: any) => 
    api.put(`/pests/control-measures/${id}`, data),
  deleteControlMeasure: (id: string) => 
    api.delete(`/pests/control-measures/${id}`),
  getSeasonPatterns: (year?: number) => 
    api.get('/pests/season-patterns', { params: { year } }),
};

export const harvestAPI = {
  getAll: (params?: any) => api.get('/harvest', { params }),
  get: (id: string) => api.get(`/harvest/${id}`),
  create: (data: any) => api.post('/harvest', data),
  update: (id: string, data: any) => api.put(`/harvest/${id}`, data),
  delete: (id: string) => api.delete(`/harvest/${id}`),
  getYieldInputAnalysis: (year?: number) => 
    api.get('/harvest/analysis/yield-input', { params: { year } }),
  getVarietyCompare: (year?: number) => 
    api.get('/harvest/analysis/variety-compare', { params: { year } }),
};

export const traceabilityAPI = {
  getAll: (params?: any) => api.get('/traceability', { params }),
  get: (code: string) => api.get(`/traceability/${code}`),
  create: (data: any) => api.post('/traceability', data),
  update: (code: string, data: any) => api.put(`/traceability/${code}`, data),
  delete: (code: string) => api.delete(`/traceability/${code}`),
};

export default api;
