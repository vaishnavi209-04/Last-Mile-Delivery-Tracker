import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { zonesService } from './zones.service';

export const zonesController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const zones = await zonesService.getAllZones();
      res.json({ zones });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const zone = await zonesService.createZone(req.body.name);
      res.status(201).json({ zone });
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const zone = await zonesService.updateZone(req.params.id, req.body.name);
      res.json({ zone });
    } catch (err) { next(err); }
  },

  async createArea(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const area = await zonesService.createArea(req.body.pincode, req.body.zoneId);
      res.status(201).json({ area });
    } catch (err) { next(err); }
  },

  async deleteArea(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await zonesService.deleteArea(req.params.pincode);
      res.json({ message: 'Area removed' });
    } catch (err) { next(err); }
  },
};