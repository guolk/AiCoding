import { Plot, PlantingLog, VolunteerTask, ForumPost, SharingPost, Tool, InventoryItem, ExpenseRecord, ApiResponse } from '../types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: '网络错误' };
  }
}

export const plotAPI = {
  getAll: () => fetchAPI<Plot[]>('/plots'),
  getById: (id: string) => fetchAPI<Plot>(`/plots/${id}`),
  update: (id: string, data: Partial<Plot>) => fetchAPI<Plot>(`/plots/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adopt: (id: string, adopter: Plot['adopter']) => fetchAPI<Plot>(`/plots/${id}/adopt`, { method: 'POST', body: JSON.stringify(adopter) }),
  approve: (id: string) => fetchAPI<Plot>(`/plots/${id}/approve`, { method: 'POST' }),
  release: (id: string) => fetchAPI<Plot>(`/plots/${id}/release`, { method: 'POST' }),
  addRotation: (id: string, record: { season: string; year: number; crop: string; notes: string }) =>
    fetchAPI(`/plots/${id}/rotation`, { method: 'POST', body: JSON.stringify(record) }),
};

export const plantingAPI = {
  getAll: () => fetchAPI<PlantingLog[]>('/planting'),
  getById: (id: string) => fetchAPI<PlantingLog>(`/planting/${id}`),
  create: (data: Omit<PlantingLog, 'id' | 'careRecords' | 'photos' | 'harvests'>) =>
    fetchAPI<PlantingLog>('/planting', { method: 'POST', body: JSON.stringify(data) }),
  addCare: (id: string, record: { date: string; type: string; notes: string }) =>
    fetchAPI(`/planting/${id}/care`, { method: 'POST', body: JSON.stringify(record) }),
  addPhoto: (id: string, record: { date: string; url: string; caption: string }) =>
    fetchAPI(`/planting/${id}/photo`, { method: 'POST', body: JSON.stringify(record) }),
  addHarvest: (id: string, record: { date: string; quantity: number; unit: string; quality: string; notes: string }) =>
    fetchAPI(`/planting/${id}/harvest`, { method: 'POST', body: JSON.stringify(record) }),
};

export const collaborationAPI = {
  getTasks: () => fetchAPI<VolunteerTask[]>('/collaboration/tasks'),
  getTaskById: (id: string) => fetchAPI<VolunteerTask>(`/collaboration/tasks/${id}`),
  createTask: (data: Omit<VolunteerTask, 'id'>) =>
    fetchAPI<VolunteerTask>('/collaboration/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<VolunteerTask>) =>
    fetchAPI<VolunteerTask>(`/collaboration/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  assignTask: (taskId: string, memberName: string) =>
    fetchAPI<VolunteerTask>(`/collaboration/tasks/${taskId}/assign`, { method: 'PUT', body: JSON.stringify({ memberName }) }),
  unassignTask: (taskId: string, memberName: string) =>
    fetchAPI<VolunteerTask>(`/collaboration/tasks/${taskId}/unassign`, { method: 'PUT', body: JSON.stringify({ memberName }) }),
  getPosts: () => fetchAPI<ForumPost[]>('/collaboration/posts'),
  getPostById: (id: string) => fetchAPI<ForumPost>(`/collaboration/posts/${id}`),
  createPost: (data: Omit<ForumPost, 'id' | 'likes' | 'comments' | 'createdAt'>) =>
    fetchAPI<ForumPost>('/collaboration/posts', { method: 'POST', body: JSON.stringify(data) }),
  addComment: (postId: string, data: { author: string; content: string }) =>
    fetchAPI(`/collaboration/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify(data) }),
  likePost: (postId: string) =>
    fetchAPI<ForumPost>(`/collaboration/posts/${postId}/like`, { method: 'POST' }),
  getSharingPosts: () => fetchAPI<SharingPost[]>('/collaboration/sharing'),
  createSharingPost: (data: Omit<SharingPost, 'id' | 'status' | 'createdAt'>) =>
    fetchAPI<SharingPost>('/collaboration/sharing', { method: 'POST', body: JSON.stringify(data) }),
  updateSharingStatus: (id: string, status: SharingPost['status']) =>
    fetchAPI<SharingPost>(`/collaboration/sharing/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const resourcesAPI = {
  getTools: () => fetchAPI<Tool[]>('/resources/tools'),
  getToolById: (id: string) => fetchAPI<Tool>(`/resources/tools/${id}`),
  borrowTool: (id: string, record: { userId: string; userName: string; borrowDate: string; expectedReturn: string }) =>
    fetchAPI<Tool>(`/resources/tools/${id}/borrow`, { method: 'POST', body: JSON.stringify(record) }),
  returnTool: (id: string) =>
    fetchAPI<Tool>(`/resources/tools/${id}/return`, { method: 'POST' }),
  getInventory: () => fetchAPI<InventoryItem[]>('/resources/inventory'),
  getInventoryItem: (id: string) => fetchAPI<InventoryItem>(`/resources/inventory/${id}`),
  createInventoryItem: (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) =>
    fetchAPI<InventoryItem>('/resources/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventory: (id: string, data: Partial<InventoryItem>) =>
    fetchAPI<InventoryItem>(`/resources/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getExpenses: () => fetchAPI<ExpenseRecord[]>('/resources/expenses'),
  createExpense: (data: Omit<ExpenseRecord, 'id' | 'status' | 'createdAt'>) =>
    fetchAPI<ExpenseRecord>('/resources/expenses', { method: 'POST', body: JSON.stringify(data) }),
  payShare: (expenseId: string, userId: string) =>
    fetchAPI<ExpenseRecord>(`/resources/expenses/${expenseId}/pay`, { method: 'PUT', body: JSON.stringify({ userId }) }),
};
