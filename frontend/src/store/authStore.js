import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('token', token);
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          set({
            user: response.data,
            token: response.data.token,
            error: null,
          });
          localStorage.setItem('token', response.data.token);
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', userData);
          set({
            user: response.data,
            token: response.data.token,
            error: null,
          });
          localStorage.setItem('token', response.data.token);
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Registration failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null, isLoading: false });
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
      },

      checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({ token });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist user and token — never persist isLoading or error
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
