import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const articleApi = {
  getArticles: (params = {}) => api.get('/articles/', { params }),
  getArticle: (id) => api.get(`/articles/${id}`),
  createArticle: (data) => api.post('/articles/', data),
  updateArticle: (id, data) => api.put(`/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/articles/${id}`)
}

export const tagApi = {
  getTags: () => api.get('/tags/')
}

export default api
