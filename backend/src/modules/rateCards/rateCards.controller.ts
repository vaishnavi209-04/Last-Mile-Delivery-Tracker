import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { rateCardsService } from './rateCards.service';

export const rateCardsController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rateCards = await rateCardsService.getAll();
      res.json({ rateCards });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const card = await rateCardsService.create(req.body);
      res.status(201).json({ rateCard: card });
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const card = await rateCardsService.update(req.params.id as string, req.body.ratePerKg);
      res.json({ rateCard: card });
    } catch (err) { next(err); }
  },

  async getCodSurcharges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const configs = await rateCardsService.getCodSurcharges();
      res.json({ codSurcharges: configs });
    } catch (err) { next(err); }
  },

  async upsertCodSurcharge(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const config = await rateCardsService.upsertCodSurcharge(req.body);
      res.json({ codSurcharge: config });
    } catch (err) { next(err); }
  },
};