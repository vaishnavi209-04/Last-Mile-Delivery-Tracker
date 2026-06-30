// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/api';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Standardize responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // API Contract Success Response Standard
    return response.data;
  },
  (error: AxiosError<ApiError>) => {
    const customError: ApiError = {
      success: false,
      message: 'An unexpected error occurred.',
      errors: [],
      status: error.response?.status || 500,
    };

    if (error.response?.data) {
      customError.message = error.response.data.message || customError.message;
      customError.errors = error.response.data.errors || [];
    }

    if (customError.status === 401) {
      // Only force re-auth if user is NOT already on the login page
      // (a failed login attempt also returns 401, and we don't want to redirect in that case)
      const isOnLoginPage = window.location.pathname === '/login';
      if (!isOnLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(customError);
  }
);

export default apiClient;