import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../types';
import { prisma } from '../../lib/prisma';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ user });
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) { next(err); }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, phone: true },
      });
      res.json({ user });
    } catch (err) { next(err); }
  },

  async createAgent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.createAgentUser(req.body);
      res.status(201).json({ user });
    } catch (err) { next(err); }
  },
};