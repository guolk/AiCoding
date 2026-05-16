import axios from 'axios';
import { Book, BookStatus, Tag, ReadingSession, Note, ReadingList, ReadingStats, AnnualReport } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bookAPI = {
  getAll: () => api.get<Book[]>('/books'),
  get: (id: string) => api.get<Book>(`/books/${id}`),
  create: (data: Partial<Book>) => api.post<Book>('/books', data),
  createFromISBN: (isbn: string) => api.post<Book>(`/books/isbn/${isbn}`),
  updateStatus: (id: string, status: BookStatus) => api.patch<Book>(`/books/${id}/status`, { status }),
  updateProgress: (id: string, currentPage: number) => api.patch<Book>(`/books/${id}/progress`, { currentPage }),
  delete: (id: string) => api.delete(`/books/${id}`),
  getByAuthor: (author: string) => api.get<Book[]>(`/books/author/${author}`),
  getSimilar: (id: string) => api.get<Book[]>(`/books/${id}/similar`),
  complete: (id: string, rating?: number, review?: string) => api.post<Book>(`/books/${id}/complete`, { rating, review }),
};

export const tagAPI = {
  getAll: () => api.get<Tag[]>('/tags'),
  create: (name: string, color?: string) => api.post<Tag>('/tags', { name, color }),
  addToBook: (bookId: string, tagId: string) => api.post(`/books/${bookId}/tags/${tagId}`),
  removeFromBook: (bookId: string, tagId: string) => api.delete(`/books/${bookId}/tags/${tagId}`),
  getBooks: (tagId: string) => api.get<Book[]>(`/tags/${tagId}/books`),
};

export const readingAPI = {
  startSession: (bookId: string, startPage: number) => api.post<ReadingSession>('/reading/sessions', { bookId, startPage }),
  endSession: (sessionId: string, endPage: number) => api.patch<ReadingSession>(`/reading/sessions/${sessionId}/end`, { endPage }),
  getBookSessions: (bookId: string) => api.get<ReadingSession[]>(`/books/${bookId}/sessions`),
  getActiveSession: (bookId: string) => api.get<ReadingSession | null>(`/books/${bookId}/active-session`),
  estimateRemainingTime: (bookId: string) => api.get<{ remainingTimeMinutes: number | null }>(`/books/${bookId}/remaining-time`),
  getStats: () => api.get<ReadingStats>('/reading/stats'),
  getAnnualReport: (year: number) => api.get<AnnualReport>(`/reading/annual-report/${year}`),
};

export const noteAPI = {
  getBookNotes: (bookId: string) => api.get<Note[]>(`/books/${bookId}/notes`),
  get: (id: string) => api.get<Note>(`/notes/${id}`),
  create: (data: Partial<Note> & { bookId: string; type: 'highlight' | 'note'; content: string }) => api.post<Note>('/notes', data),
  update: (id: string, data: Partial<Note>) => api.put<Note>(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  getChapters: (bookId: string) => api.get<string[]>(`/books/${bookId}/chapters`),
  getAllTopics: () => api.get<string[]>('/topics'),
  getByTopic: (topic: string) => api.get<Note[]>(`/topics/${topic}/notes`),
};

export const listAPI = {
  getAll: () => api.get<ReadingList[]>('/reading-lists'),
  get: (id: string) => api.get<ReadingList>(`/reading-lists/${id}`),
  getShared: (token: string) => api.get<ReadingList>(`/shared-lists/${token}`),
  create: (name: string, description?: string, isPublic?: boolean) => api.post<ReadingList>('/reading-lists', { name, description, isPublic }),
  update: (id: string, data: { name?: string; description?: string; isPublic?: boolean }) => api.put<ReadingList>(`/reading-lists/${id}`, data),
  delete: (id: string) => api.delete(`/reading-lists/${id}`),
  addBook: (listId: string, bookId: string) => api.post(`/reading-lists/${listId}/books/${bookId}`),
  removeBook: (listId: string, bookId: string) => api.delete(`/reading-lists/${listId}/books/${bookId}`),
  regenerateToken: (id: string) => api.post<{ shareToken: string }>(`/reading-lists/${id}/regenerate-token`),
};

export const searchAPI = {
  byISBN: (isbn: string) => api.get(`/search/isbn/${isbn}`),
  books: (query: string) => api.get(`/search/books`, { params: { q: query } }),
  recommendations: (limit?: number) => api.get<Book[]>('/recommendations', { params: { limit } }),
};

export default api;
