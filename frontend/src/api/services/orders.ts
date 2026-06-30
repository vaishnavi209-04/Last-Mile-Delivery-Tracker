// src/api/services/orders.ts
import apiClient from '../client';
import { ApiResponse } from '../../types/api';
import { Order } from '../../types/models';

export const ordersApi = {
  // Customer & Admin
  getOrders: async (params?: Record<string, any>) => {
    return apiClient.get<any, ApiResponse<Order[]>>('/orders', { params });
  },

  getOrderDetails: async (id: string) => {
    return apiClient.get<any, ApiResponse<Order>>(`/orders/${id}`);
  },

  getOrderTimeline: async (id: string) => {
    return apiClient.get<any, ApiResponse<any[]>>(`/orders/${id}/timeline`);
  },

  // Customer Journey
  previewPricing: async (payload: any) => {
    return apiClient.post<any, ApiResponse<any>>('/orders/preview', payload);
  },

  confirmOrder: async (payload: any) => {
    return apiClient.post<any, ApiResponse<Order>>('/orders/confirm', payload);
  },

  rescheduleOrder: async (id: string, payload: { date: string }) => {
    return apiClient.post<any, ApiResponse>(`/orders/${id}/reschedule`, payload);
  },

  // Agent Journey
  updateStatus: async (id: string, payload: { status: string; notes?: string }) => {
    return apiClient.patch<any, ApiResponse<Order>>(`/orders/${id}/status`, payload);
  },

  // Admin Journey
  assignAgent: async (id: string, payload: { agentId: string }) => {
    return apiClient.patch<any, ApiResponse>(`/orders/${id}/assign`, payload);
  },

  autoAssignAgent: async (id: string) => {
    return apiClient.post<any, ApiResponse>(`/orders/${id}/auto-assign`);
  }
};