// src/api/services/agents.ts
import apiClient from '../client';
import { ApiResponse } from '../../types/api';

export const agentsApi = {
  // Admin Journey
  getAgents: async (params?: Record<string, any>) => {
    return apiClient.get<any, ApiResponse<any[]>>('/agents', { params });
  },

  // Agent Journey (Availability & Tracking)
  clockIn: async (agentId: string) => {
    return apiClient.patch<any, ApiResponse>('/agents/clock-in');
  },

  clockOut: async (agentId: string) => {
    return apiClient.patch<any, ApiResponse>('/agents/clock-out');
  },

  updateLocation: async (agentId: string, payload: { lat: number; lng: number }) => {
    return apiClient.patch<any, ApiResponse>('/agents/location', payload);
  }
};