import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const apiEndpoints = {
  dashboard: {
    summary: () => api.get('/dashboard/summary'),
  },
  stores: {
    list: () => api.get('/stores'),
    addData: (data: unknown) => api.post('/stores/data', data),
    importCSV: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/stores/data/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    analysis: () => api.get('/stores/analysis'),
  },
  products: {
    list: () => api.get('/products'),
    updateStatus: (id: string, status: string) =>
      api.put(`/products/${id}/status`, { status }),
    getKeywords: (productId: string) =>
      api.get(`/products/${productId}/keywords`),
    addKeyword: (data: unknown) => api.post('/products/keywords', data),
  },
  reviews: {
    list: () => api.get('/reviews'),
    updateResponse: (id: string, response: string, category: string) =>
      api.put(`/reviews/${id}/response`, { response, category }),
  },
  advertising: {
    campaigns: () => api.get('/advertising/campaigns'),
    addCampaign: (data: unknown) => api.post('/advertising/campaigns', data),
    roi: () => api.get('/advertising/roi'),
  },
  inventory: {
    list: () => api.get('/inventory'),
    shipments: () => api.get('/inventory/shipments'),
    addShipment: (data: unknown) => api.post('/inventory/shipments', data),
  },
  strategy: {
    pricing: () => api.get('/strategy/pricing'),
    addPricing: (data: unknown) => api.post('/strategy/pricing', data),
    promotions: () => api.get('/strategy/promotions'),
    addPromotion: (data: unknown) => api.post('/strategy/promotions', data),
  },
  auth: {
    login: (username: string, password: string) =>
      api.post('/auth/login', { username, password }),
  },
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN');
}

export const platformColors: Record<Platform, string> = {
  amazon: '#FF9900',
  ebay: '#E53238',
  shopify: '#96BF48',
};

export const platformNames: Record<Platform, string> = {
  amazon: 'Amazon',
  ebay: 'eBay',
  shopify: 'Shopify',
};

export const productStatusLabels: Record<string, string> = {
  listing: '上架中',
  promoting: '推广中',
  slow_selling: '滞销',
  clearing: '清库',
};

export const productStatusColors: Record<string, string> = {
  listing: 'badge-info',
  promoting: 'badge-success',
  slow_selling: 'badge-warning',
  clearing: 'badge-danger',
};

export const adStatusLabels: Record<string, string> = {
  active: '投放中',
  paused: '已暂停',
  completed: '已完成',
};

export const adStatusColors: Record<string, string> = {
  active: 'badge-success',
  paused: 'badge-warning',
  completed: 'badge-info',
};

export const shipmentStatusLabels: Record<string, string> = {
  pending: '待发货',
  shipping: '运输中',
  arrived: '已到港',
  warehoused: '已入库',
};

export const shipmentStatusColors: Record<string, string> = {
  pending: 'badge-warning',
  shipping: 'badge-info',
  arrived: 'badge-success',
  warehoused: 'badge-success',
};

export const reviewStatusLabels: Record<string, string> = {
  pending: '待处理',
  responded: '已回复',
  resolved: '已解决',
};

export const reviewStatusColors: Record<string, string> = {
  pending: 'badge-danger',
  responded: 'badge-warning',
  resolved: 'badge-success',
};

export type Platform = 'amazon' | 'ebay' | 'shopify';
