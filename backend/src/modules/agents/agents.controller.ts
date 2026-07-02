import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { agentsService } from './agents.service';
import { createError } from '../../middleware/errorHandler';
import { prisma } from '../../lib/prisma';

export const agentsController = {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const agent = await agentsService.getAgentByUserId(req.user!.userId);
      if (!agent) throw createError('Agent profile not found', 404);
      res.json({ agent });
    } catch (err) { next(err); }
  },

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const agents = await agentsService.getAll();
      res.json({ agents });
    } catch (err) { next(err); }
  },

  async clockIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const agent = await agentsService.getAgentByUserId(req.user!.userId);
      if (!agent) throw createError('Agent profile not found', 404);
      const updated = await agentsService.clockIn(agent.id);
      res.json({ agent: updated });
    } catch (err) { next(err); }
  },

  async clockOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const agent = await agentsService.getAgentByUserId(req.user!.userId);
      if (!agent) throw createError('Agent profile not found', 404);
      const updated = await agentsService.clockOut(agent.id);
      res.json({ agent: updated });
    } catch (err) { next(err); }
  },

  async updateLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { lat, lng } = req.body;
      const agent = await agentsService.getAgentByUserId(req.user!.userId);
      if (!agent) throw createError('Agent profile not found', 404);
      const updated = await agentsService.updateLocation(agent.id, lat, lng);
      res.json({ agent: updated });
    } catch (err) { next(err); }
  },

  async myOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const agent = await agentsService.getAgentByUserId(req.user!.userId);
      if (!agent) throw createError('Agent profile not found', 404);
      const orders = await prisma.order.findMany({
        where: { assignedAgentId: agent.id },
        include: { customer: { select: { name: true, email: true, phone: true } }, pickupZone: true, dropZone: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ orders });
    } catch (err) { next(err); }
  },
};