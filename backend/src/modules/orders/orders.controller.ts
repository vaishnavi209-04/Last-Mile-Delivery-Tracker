import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { ordersService } from './orders.service';
import { OrderStatus } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

export const ordersController = {
  async preview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const breakdown = await ordersService.preview(req.body);
      res.json({ breakdown });
    } catch (err) { next(err); }
  },

  async confirm(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.user!;
      // Admin can specify a customerId; customer uses their own id
      const customerId = role === 'admin' ? req.body.customerId : userId;
      if (!customerId) throw createError('customerId is required for admin order creation', 400);

      const order = await ordersService.confirm({
        ...req.body,
        customerId,
        createdById: userId,
      });
      res.status(201).json({ order });
    } catch (err) { next(err); }
  },

  async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.user!;
      const { status, zoneId, agentId } = req.query;
      const orders = await ordersService.getOrders(userId, role, {
        status: status as OrderStatus,
        zoneId: zoneId as string,
        agentId: agentId as string,
      });
      res.json({ orders });
    } catch (err) { next(err); }
  },

  async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.getOrderById(req.params.id as string, req.user!.userId, req.user!.role);
      res.json({ order });
    } catch (err) { next(err); }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { toStatus, notes } = req.body;
      const result = await ordersService.updateStatus(
        req.params.id as string,
        toStatus,
        req.user!.userId,
        req.user!.role,
        notes
      );
      res.json(result);
    } catch (err) { next(err); }
  },

  async reschedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ordersService.reschedule(req.params.id as string, req.user!.userId, req.body.rescheduleDate);
      res.json(result);
    } catch (err) { next(err); }
  },

  async autoAssign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ordersService.autoAssign(req.params.id as string);
      res.json(result);
    } catch (err) { next(err); }
  },

  async manualAssign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ordersService.manualAssign(
        req.params.id as string,
        req.body.agentId,
        req.user!.userId,
        req.user!.role
      );
      res.json({ order: result });
    } catch (err) { next(err); }
  },
};