import axios from 'axios';
import type { Store } from '@reduxjs/toolkit';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (store) {
        store.dispatch(logout());
      }
      localStorage.removeItem('accessToken');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
