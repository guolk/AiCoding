import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadCIF = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const parseCIFContent = (cifContent) => {
  return api.post('/parse', { cif_content: cifContent });
};

export const analyzeStructure = (lattice, atoms) => {
  return api.post('/analyze', { lattice, atoms });
};

export const simulateXRD = (lattice, atoms, options = {}) => {
  return api.post('/xrd/simulate', {
    lattice,
    atoms,
    ...options,
  });
};

export const getSymmetryElements = (lattice, atoms) => {
  return api.post('/symmetry/elements', { lattice, atoms });
};

export const getEquivalentPositions = (position, symmetryOperations) => {
  return api.post('/equivalent-positions', {
    position,
    symmetry_operations: symmetryOperations,
  });
};

export const calculateMillerSpacing = (lattice, h, k, l) => {
  return api.post('/miller/spacing', { lattice, h, k, l });
};

export const getExamples = () => {
  return api.get('/examples');
};

export const getExample = (name) => {
  return api.get(`/examples/${name}`);
};

export const searchCOD = (params) => {
  return api.post('/cod/search', params);
};

export const downloadFromCOD = (codId) => {
  return api.get(`/cod/download/${codId}`);
};

export const generateReport = (crystalData, analysisResults, xrdData) => {
  return api.post('/report/generate', {
    crystal_data: crystalData,
    analysis_results: analysisResults,
    xrd_data: xrdData,
  }, {
    responseType: 'blob',
  });
};

export const healthCheck = () => {
  return api.get('/health');
};

export default api;
