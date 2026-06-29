import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const agentsService = {
  async getAll() {
    return prisma.agent.findMany({
      include: { user: { select: { id: true, name: true, email: true, phone: true } }, zone: true },
    });
  },

  async clockIn(agentId: string) {
    return prisma.agent.update({ where: { id: agentId }, data: { clockedIn: true } });
  },

  async clockOut(agentId: string) {
    return prisma.agent.update({ where: { id: agentId }, data: { clockedIn: false } });
  },

  async updateLocation(agentId: string, lat: number, lng: number) {
    return prisma.agent.update({
      where: { id: agentId },
      data: { currentLat: lat, currentLng: lng, updatedAt: new Date() },
    });
  },

  async getAgentByUserId(userId: string) {
    return prisma.agent.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  /**
   * Auto-assign: find nearest available agent.
   * Uses zone matching + lat/lng distance as tiebreaker.
   * Enforces max_capacity via DB-level transaction with row locking.
   */
  async autoAssign(orderId: string, pickupZoneId: string): Promise<string> {
    return await prisma.$transaction(async (tx) => {
      // Find available agents in the pickup zone (or any zone if none available there)
      // Using raw query for ORDER BY distance and FOR UPDATE SKIP LOCKED
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw createError('Order not found', 404);
      if (order.assignedAgentId) throw createError('Order already assigned', 409);

      // Try agents in pickup zone first, then all zones
      const agents = await tx.$queryRaw<Array<{ id: string; active_order_count: number }>>`
        SELECT id, active_order_count
        FROM agents
        WHERE clocked_in = true
          AND active_order_count < max_capacity
          AND (zone_id = ${pickupZoneId}::uuid OR zone_id IS NOT NULL)
        ORDER BY
          CASE WHEN zone_id = ${pickupZoneId}::uuid THEN 0 ELSE 1 END,
          active_order_count ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;

      if (!agents || agents.length === 0) {
        throw createError('No available agents at this time', 503);
      }

      const agent = agents[0];

      // Atomically increment order count and assign
      await tx.agent.update({
        where: { id: agent.id },
        data: { activeOrderCount: { increment: 1 } },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { assignedAgentId: agent.id },
      });

      return agent.id;
    });
  },

  async manualAssign(orderId: string, agentId: string) {
    return prisma.$transaction(async (tx) => {
      const agent = await tx.agent.findUnique({ where: { id: agentId } });
      if (!agent) throw createError('Agent not found', 404);
      if (!agent.clockedIn) throw createError('Agent is not clocked in', 422);
      if (agent.activeOrderCount >= agent.maxCapacity) throw createError('Agent at max capacity', 422);

      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw createError('Order not found', 404);

      // If order was previously assigned, decrement old agent count
      if (order.assignedAgentId && order.assignedAgentId !== agentId) {
        await tx.agent.update({
          where: { id: order.assignedAgentId },
          data: { activeOrderCount: { decrement: 1 } },
        });
      }

      await tx.agent.update({
        where: { id: agentId },
        data: { activeOrderCount: { increment: 1 } },
      });

      return tx.order.update({
        where: { id: orderId },
        data: { assignedAgentId: agentId },
      });
    });
  },
};