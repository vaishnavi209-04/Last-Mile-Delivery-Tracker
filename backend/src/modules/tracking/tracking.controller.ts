import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../lib/prisma';

export const trackingController = {
  async getTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await prisma.orderTrackingHistory.findMany({
        where: { orderId: req.params.id as string },
        orderBy: { createdAt: 'asc' },
        include: {
          actor: { select: { name: true, role: true } },
        },
      });
      res.json({ timeline: history });
    } catch (err) { next(err); }
  },
};