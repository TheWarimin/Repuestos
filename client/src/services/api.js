import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjuntar token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejar errores globales
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Products ──────────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getById: (id) => api.get(`/products/${id}`),
  adminGetAll: (params) => api.get('/products/admin/all', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (formData) =>
    api.post('/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (publicId) => api.delete('/products/delete-image', { data: { publicId } }),
};

// ── Categories ────────────────────────────────────
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ── Orders ────────────────────────────────────────
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  adminGetAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getStats: () => api.get('/orders/stats'),
};

// ── Payment ───────────────────────────────────────
export const paymentAPI = {
  createPreference: (orderId) => api.post('/payment/create-preference', { orderId }),
};

// ── Users ─────────────────────────────────────────
export const usersAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  updateAddresses: (data) => api.put('/users/addresses', data),
  adminGetAll: (params) => api.get('/users', { params }),
  adminGetById: (id) => api.get(`/users/${id}`),
  adminUpdate: (id, data) => api.put(`/users/${id}`, data),
};

export default api;
