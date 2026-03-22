import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Use env var only if it won't cause mixed content (HTTP url on an HTTPS page)
const resolveBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  if (!envUrl) return '/api';
  if (typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      envUrl.startsWith('http://')) {
    return '/api'; // fall back to Vercel proxy to avoid mixed-content blocking
  }
  return envUrl;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.replace('/auth');
    }
    return Promise.reject(error);
  }
);

export default api;
