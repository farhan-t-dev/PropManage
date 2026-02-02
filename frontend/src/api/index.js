import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // Avoid infinite loops on auth endpoints
    if (originalRequest.url.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authStore.refreshAccessToken();
        return api(originalRequest);
      } catch (refreshError) {
        authStore.logout_local();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;