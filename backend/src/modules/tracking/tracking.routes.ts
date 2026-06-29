import { Router } from 'express';
import { trackingController } from './tracking.controller';
import { authGuard } from '../../middleware/authGuard';

const router = Router();
router.use(authGuard);
router.get('/:id/timeline', trackingController.getTimeline);

export default router;