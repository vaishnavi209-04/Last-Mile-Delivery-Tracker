// src/types/models.ts

export type Role = 'ADMIN' | 'CUSTOMER' | 'AGENT';

export type OrderStatus = 
  | 'PENDING' 
  | 'ASSIGNED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  trackingId: string;
  status: OrderStatus;
  pickupAddress: Address;
  dropAddress: Address;
  actualWeight: number;
  billableWeight: number;
  baseCharge: number;
  codSurcharge: number;
  totalCharge: number;
  orderType: 'B2C' | 'B2B';
  paymentType: 'PREPAID' | 'COD';
  agentId?: string | null;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  actorId: string;
  notes?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  phone: string;
  isAvailable: boolean;
  currentZoneId?: string;
  activeDeliveries: number;
  capacity: number;
}

export interface Zone {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Area {
  id: string;
  pincode: string;
  name: string;
  zoneId: string;
}

export interface RateCard {
  id: string;
  baseWeight: number;
  basePrice: number;
  extraWeightPrice: number;
  zoneId: string;
  isActive: boolean;
}