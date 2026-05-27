const API_BASE = '/api'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  if (response.status === 204) {
    return undefined as T
  }
  
  return response.json()
}

export const api = {
  wines: {
    getAll: () => request<any[]>('/wines'),
    get: (id: string) => request<any>(`/wines/${id}`),
    create: (data: any) => request<any>('/wines', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/wines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/wines/${id}`, { method: 'DELETE' }),
    searchVivino: (winery: string, vintage: number) => request<any>(`/wines/vivino/search?winery=${encodeURIComponent(winery)}&vintage=${vintage}`),
    getDrinkingWindow: (id: string) => request<any>(`/wines/${id}/drinking-window`),
  },
  
  bottles: {
    getAll: () => request<any[]>('/bottles'),
    get: (id: string) => request<any>(`/bottles/${id}`),
    create: (data: any) => request<any>('/bottles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/bottles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/bottles/${id}`, { method: 'DELETE' }),
  },
  
  tasting: {
    getAll: () => request<any[]>('/tasting'),
    get: (id: string) => request<any>(`/tasting/${id}`),
    create: (data: any) => request<any>('/tasting', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/tasting/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/tasting/${id}`, { method: 'DELETE' }),
  },
  
  inventory: {
    getSummary: () => request<any>('/inventory/summary'),
    getByWine: () => request<any[]>('/inventory/by-wine'),
    getAlerts: () => request<any>('/inventory/alerts'),
  },
  
  purchases: {
    getAll: () => request<any[]>('/purchases'),
    getStatistics: () => request<any>('/purchases/statistics'),
    get: (id: string) => request<any>(`/purchases/${id}`),
    create: (data: any) => request<any>('/purchases', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/purchases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/purchases/${id}`, { method: 'DELETE' }),
  },
  
  wishlist: {
    getAll: () => request<any[]>('/wishlist'),
    get: (id: string) => request<any>(`/wishlist/${id}`),
    create: (data: any) => request<any>('/wishlist', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/wishlist/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/wishlist/${id}`, { method: 'DELETE' }),
  },
  
  promotions: {
    getAll: () => request<any[]>('/promotions'),
    getActive: () => request<any[]>('/promotions/active'),
    get: (id: string) => request<any>(`/promotions/${id}`),
    create: (data: any) => request<any>('/promotions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/promotions/${id}`, { method: 'DELETE' }),
  },
  
  recommendations: {
    getPairings: () => request<any[]>('/recommendations/pairings'),
    createPairing: (data: any) => request<any>('/recommendations/pairings', { method: 'POST', body: JSON.stringify(data) }),
    getPairingSuggestions: (dishType: string) => request<any[]>(`/recommendations/pairings/suggest/${encodeURIComponent(dishType)}`),
    getPersonalized: () => request<any>('/recommendations/personalized'),
    suggestPairing: (wineId: string) => request<any>(`/recommendations/suggest-pairing/${wineId}`),
    getPreferences: () => request<any>('/recommendations/preferences'),
    updatePreferences: (data: any) => request<any>('/recommendations/preferences', { method: 'PUT', body: JSON.stringify(data) }),
  },
}
