// src/api/services/auth.ts
import apiClient from '../client';
import { ApiResponse, LoginResponse } from '../../types/api';

export const authApi = {
  login: async (credentials: any) => {
    return apiClient.post<any, LoginResponse>('/auth/login', credentials);
  },

  register: async (customerData: any) => {
    return apiClient.post<any, ApiResponse>('/auth/register', customerData);
  }
};