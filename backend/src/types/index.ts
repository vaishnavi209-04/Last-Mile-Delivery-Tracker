import { Request } from 'express';
import { Role, OrderStatus, OrderType, PaymentType } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  role: Role;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PriceBreakdown {
  fromZoneId: string;
  fromZoneName: string;
  toZoneId: string;
  toZoneName: string;
  rateCardId: string;
  ratePerKg: number;
  billableWeight: number;
  base: number;
  codSurcharge: number;
  total: number;
  surchargeType?: string;
  surchargeValue?: number;
}

export interface PricingInput {
  pickupPincode: string;
  dropPincode: string;
  orderType: OrderType;
  paymentType: PaymentType;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
}

export { Role, OrderStatus, OrderType, PaymentType };