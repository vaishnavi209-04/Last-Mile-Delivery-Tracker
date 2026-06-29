import { OrderStatus } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED:          ['PICKED_UP', 'FAILED'],
  PICKED_UP:        ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT:       ['OUT_FOR_DELIVERY', 'FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  DELIVERED:        [],
  FAILED:           ['RESCHEDULED'],
  RESCHEDULED:      ['PICKED_UP'],
};

export function validateTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedNextStatuses(from: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}