import { create } from 'zustand';
import api from '../api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),

  login: async (username, password) => {
    try {
      await api.post('/auth/token/', { username, password });
      await get().fetchUser();
      return true;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      await api.post('/users/register/', userData);
      // Automatically login after registration
      await get().login(userData.username, userData.password);
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/users/me/');
      const user = response.data;
      set({ user, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to fetch user details', error);
      get().logout_local();
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } finally {
      get().logout_local();
    }
  },

  logout_local: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('user');
  },

  checkAuth: async () => {
    if (!get().user) {
      await get().fetchUser();
    }
  }
}));