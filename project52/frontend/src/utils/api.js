import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const contentPlanningAPI = {
  getCalendar: (params) => api.get('/content-planning/calendar', { params }),
  createCalendarItem: (data) => api.post('/content-planning/calendar', data),
  updateCalendarItem: (id, data) => api.put(`/content-planning/calendar/${id}`, data),
  deleteCalendarItem: (id) => api.delete(`/content-planning/calendar/${id}`),

  getTopics: (params) => api.get('/content-planning/topics', { params }),
  createTopic: (data) => api.post('/content-planning/topics', data),
  updateTopic: (id, data) => api.put(`/content-planning/topics/${id}`, data),
  deleteTopic: (id) => api.delete(`/content-planning/topics/${id}`),

  getCompetitors: (params) => api.get('/content-planning/competitors', { params }),
  createCompetitor: (data) => api.post('/content-planning/competitors', data),
  updateCompetitor: (id, data) => api.put(`/content-planning/competitors/${id}`, data),
  deleteCompetitor: (id) => api.delete(`/content-planning/competitors/${id}`),
  getCompetitorData: (id, params) => api.get(`/content-planning/competitors/${id}/data`, { params }),
  addCompetitorData: (id, data) => api.post(`/content-planning/competitors/${id}/data`, data)
}

export const dataAggregationAPI = {
  getAccounts: () => api.get('/data-aggregation/accounts'),
  createAccount: (data) => api.post('/data-aggregation/accounts', data),
  updateAccount: (id, data) => api.put(`/data-aggregation/accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/data-aggregation/accounts/${id}`),

  getAnalytics: (accountId, params) => api.get(`/data-aggregation/analytics/${accountId}`, { params }),
  addAnalytics: (accountId, data) => api.post(`/data-aggregation/analytics/${accountId}`, data),

  getContentPerformance: (params) => api.get('/data-aggregation/content-performance', { params }),
  addContentPerformance: (data) => api.post('/data-aggregation/content-performance', data),

  getDashboard: () => api.get('/data-aggregation/dashboard')
}

export const contentProductionAPI = {
  getScriptTemplates: (params) => api.get('/content-production/script-templates', { params }),
  createScriptTemplate: (data) => api.post('/content-production/script-templates', data),
  updateScriptTemplate: (id, data) => api.put(`/content-production/script-templates/${id}`, data),
  deleteScriptTemplate: (id) => api.delete(`/content-production/script-templates/${id}`),
  generateScript: (id, topic) => api.post(`/content-production/script-templates/${id}/generate`, null, { params: { topic } }),

  getKeywordResearch: (params) => api.get('/content-production/keyword-research', { params }),
  createKeywordResearch: (data) => api.post('/content-production/keyword-research', data),
  analyzeKeyword: (keyword, platform) => api.post('/content-production/keyword-research/analyze', null, { params: { keyword, platform } }),

  getCoverTemplates: (params) => api.get('/content-production/cover-templates', { params }),
  createCoverTemplate: (data) => api.post('/content-production/cover-templates', data),
  updateCoverTemplate: (id, data) => api.put(`/content-production/cover-templates/${id}`, data),
  deleteCoverTemplate: (id) => api.delete(`/content-production/cover-templates/${id}`),
  generateCover: (id, title, subtitle) => api.post(`/content-production/cover-templates/${id}/generate`, null, { params: { title, subtitle } }),

  getPlatformSizes: () => api.get('/content-production/platform-sizes')
}

export const monetizationAPI = {
  getRevenue: (params) => api.get('/monetization/revenue', { params }),
  createRevenue: (data) => api.post('/monetization/revenue', data),
  updateRevenue: (id, data) => api.put(`/monetization/revenue/${id}`, data),
  deleteRevenue: (id) => api.delete(`/monetization/revenue/${id}`),
  getRevenueSummary: (period) => api.get('/monetization/revenue/summary', { params: { period } }),

  getPriceRecommendation: (params) => api.post('/monetization/revenue/price-recommendation', null, { params }),

  getCooperations: (params) => api.get('/monetization/cooperations', { params }),
  createCooperation: (data) => api.post('/monetization/cooperations', data),
  updateCooperation: (id, data) => api.put(`/monetization/cooperations/${id}`, data),
  deleteCooperation: (id) => api.delete(`/monetization/cooperations/${id}`)
}

export const analyticsAPI = {
  getContentAttribution: (params) => api.get('/analytics/content-attribution', { params }),
  getFollowerInsights: (params) => api.get('/analytics/follower-insights', { params }),
  getGrowthTrend: (params) => api.get('/analytics/growth-trend', { params }),
  getTopContent: (params) => api.get('/analytics/top-performing-content', { params })
}
