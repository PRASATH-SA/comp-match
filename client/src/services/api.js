import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect if already on auth page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        // Optionally redirect
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  googleLogin: () => { window.location.href = `${API_URL}/auth/google`; },
};

// ─── Products ───────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getBySlug: (slug) => api.get(`/products/${slug}`),
};

// ─── Categories ─────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

// ─── Cart ───────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
};

// ─── Enquiries ──────────────────────────────────────────
export const enquiryAPI = {
  submit: (data) => api.post('/enquiries', data),
};

// ─── Ads ────────────────────────────────────────────────
export const adAPI = {
  getActive: (placement) => api.get('/ads/active', { params: { placement } }),
  trackClick: (id) => api.post(`/ads/${id}/click`),
};

// ─── Activity ───────────────────────────────────────────
export const activityAPI = {
  log: (data) => api.post('/activity', data),
};

export default api;
