import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      const { logout } = useAuthStore.getState();
      logout();

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle other error responses
    if (status === 403) {
      console.error('Forbidden: You do not have permission to perform this action');
    }

    if (status === 404) {
      console.error('Resource not found');
    }

    if (status && status >= 500) {
      console.error('Server error. Please try again later');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
