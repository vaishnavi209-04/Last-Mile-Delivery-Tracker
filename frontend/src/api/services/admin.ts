// src/api/services/admin.ts
import apiClient from '../client';
import { ApiResponse } from '../../types/api';

export const adminApi = {
  // Zone & Area Management
  getZones: async () => {
    return apiClient.get<any, ApiResponse<any[]>>('/zones');
  },

  createZone: async (payload: any) => {
    return apiClient.post<any, ApiResponse>('/zones', payload);
  },

  createArea: async (payload: { name: string; pincode: string; zoneId: string }) => {
    return apiClient.post<any, ApiResponse>('/areas', payload);
  },

  // Pricing & Rate Cards
  getRateCards: async () => {
    return apiClient.get<any, ApiResponse<any[]>>('/rate-cards');
  },

  createRateCard: async (payload: any) => {
    return apiClient.post<any, ApiResponse>('/rate-cards', payload);
  },

  updateRateCard: async (id: string, payload: any) => {
    return apiClient.put<any, ApiResponse>(`/rate-cards/${id}`, payload);
  },

  // Platform Configurations
  configureCod: async (payload: { orderType: string; type: string; value: number }) => {
    return apiClient.post<any, ApiResponse>('/rate-cards/cod-surcharge', payload);
  }
};