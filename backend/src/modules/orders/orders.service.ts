import { OrderStatus, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { calculateCharge, billableWeight } from '../pricing/pricing.service';
import { validateTransition } from '../../lib/stateMachine';
import { notificationsService } from '../notifications/notifications.service';
import { agentsService } from '../agents/agents.service';
import { createError } from '../../middleware/errorHandler';
import { PricingInput } from '../../types';

export const ordersService = {
  async preview(input: PricingInput) {
    const breakdown = await calculateCharge(input);
    return breakdown;
  },

  async confirm(input: PricingInput & { customerId: string; createdById: string; pickupAddress: string; dropAddress: string }) {
    // Re-run pricing server-side — never trust client-sent price
    const breakdown = await calculateCharge(input);
    const bWeight = billableWeight(input.lengthCm, input.breadthCm, input.heightCm, input.actualWeightKg);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: input.customerId,
          createdById: input.createdById,
          pickupAddress: input.pickupAddress,
          pickupPincode: input.pickupPincode,
          pickupZoneId: breakdown.fromZoneId,
          dropAddress: input.dropAddress,
          dropPincode: input.dropPincode,
          dropZoneId: breakdown.toZoneId,
          lengthCm: input.lengthCm,
          breadthCm: input.breadthCm,
          heightCm: input.heightCm,
          actualWeightKg: input.actualWeightKg,
          billableWeightKg: bWeight,
          orderType: input.orderType,
          paymentType: input.paymentType,
          rateCardId: breakdown.rateCardId,
          appliedRateSnapshot: breakdown as object,
          codSurcharge: breakdown.codSurcharge,
          charge: breakdown.total,
          currentStatus: 'CREATED',
        },
      });

      // Append-only history row
      await tx.orderTrackingHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: 'CREATED',
          actorId: input.createdById,
          actorRole: 'customer',
        },
      });

      return newOrder;
    });

    return order;
  },

  async getOrders(userId: string, role: Role, filters: { status?: OrderStatus; zoneId?: string; agentId?: string }) {
    const where: Record<string, unknown> = {};

    if (role === 'customer') where.customerId = userId;
    else if (role === 'agent') {
      const { prisma: db } = await import('../../lib/prisma');
      const agent = await db.agent.findUnique({ where: { userId } });
      if (agent) where.assignedAgentId = agent.id;
    }

    if (filters.status) where.currentStatus = filters.status;
    if (filters.zoneId) where.pickupZoneId = filters.zoneId;
    if (filters.agentId) where.assignedAgentId = filters.agentId;

    return prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true } },
        pickupZone: true,
        dropZone: true,
        assignedAgent: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getOrderById(orderId: string, userId: string, role: Role) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        pickupZone: true,
        dropZone: true,
        assignedAgent: { include: { user: { select: { name: true, email: true, phone: true } } } },
        trackingHistory: { orderBy: { createdAt: 'asc' }, include: { actor: { select: { name: true, role: true } } } },
      },
    });

    if (!order) throw createError('Order not found', 404);
    if (role === 'customer' && order.customerId !== userId) throw createError('Forbidden', 403);

    return order;
  },

  async updateStatus(orderId: string, toStatus: OrderStatus, actorId: string, actorRole: Role, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } });
    if (!order) throw createError('Order not found', 404);

    // Agent can only update their assigned order
    if (actorRole === 'agent') {
      const agent = await prisma.agent.findUnique({ where: { userId: actorId } });
      if (!agent || order.assignedAgentId !== agent.id) throw createError('Forbidden', 403);
    }

    const isValid = validateTransition(order.currentStatus, toStatus);
    if (!isValid) {
      throw createError(
        `Invalid transition: ${order.currentStatus} → ${toStatus}`,
        409
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update cached status pointer
      await tx.order.update({
        where: { id: orderId },
        data: { currentStatus: toStatus, updatedAt: new Date() },
      });

      // Append-only history row — the real source of truth
      await tx.orderTrackingHistory.create({
        data: {
          orderId,
          fromStatus: order.currentStatus,
          toStatus,
          actorId,
          actorRole,
          notes,
        },
      });

      // Decrement agent count if delivered or failed
      if ((toStatus === 'DELIVERED' || toStatus === 'FAILED') && order.assignedAgentId) {
        await tx.agent.update({
          where: { id: order.assignedAgentId },
          data: { activeOrderCount: { decrement: 1 } },
        });
      }
    });

    // Enqueue notification async (outside transaction)
    await notificationsService.enqueueForOrder(
      orderId,
      toStatus,
      order.customer.email,
      order.customer.phone
    );

    return { success: true, newStatus: toStatus };
  },

  async reschedule(orderId: string, customerId: string, rescheduleDate: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw createError('Order not found', 404);
    if (order.customerId !== customerId) throw createError('Forbidden', 403);
    if (order.currentStatus !== 'FAILED') throw createError('Can only reschedule a failed order', 422);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { currentStatus: 'RESCHEDULED', rescheduleDate: new Date(rescheduleDate) },
      });

      await tx.orderTrackingHistory.create({
        data: {
          orderId,
          fromStatus: 'FAILED',
          toStatus: 'RESCHEDULED',
          actorId: customerId,
          actorRole: 'customer',
          notes: `Rescheduled for ${rescheduleDate}`,
        },
      });
    });

    // Trigger auto-assignment for rescheduled order
    try {
      await agentsService.autoAssign(orderId, order.pickupZoneId);
    } catch {
      // Log but don't fail — admin can manually assign
      console.warn(`[Reschedule] Auto-assignment failed for order ${orderId}, requires manual assignment`);
    }

    return { success: true };
  },

  async autoAssign(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw createError('Order not found', 404);
    const agentId = await agentsService.autoAssign(orderId, order.pickupZoneId);
    return { agentId };
  },

  async manualAssign(orderId: string, agentId: string) {
    return agentsService.manualAssign(orderId, agentId);
  },
};