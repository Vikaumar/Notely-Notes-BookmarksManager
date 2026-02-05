import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Notes API
export const notesApi = {
  getAll: (params) => api.get('/notes', { params }),
  getOne: (id) => api.get(`/notes/${id}`),
  getStats: () => api.get('/notes/stats'),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  deleteAll: () => api.delete('/notes'),
};

// Bookmarks API
export const bookmarksApi = {
  getAll: (params) => api.get('/bookmarks', { params }),
  getOne: (id) => api.get(`/bookmarks/${id}`),
  getStats: () => api.get('/bookmarks/stats'),
  create: (data) => api.post('/bookmarks', data),
  update: (id, data) => api.put(`/bookmarks/${id}`, data),
  delete: (id) => api.delete(`/bookmarks/${id}`),
  deleteAll: () => api.delete('/bookmarks'),
};

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

export default api;
