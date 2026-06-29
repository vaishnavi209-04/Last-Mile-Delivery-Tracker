import { Router } from 'express';
import { agentsController } from './agents.controller';
import { authGuard } from '../../middleware/authGuard';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(authGuard);

router.get('/', roleGuard('admin'), agentsController.getAll);
router.patch('/clock-in', roleGuard('agent'), agentsController.clockIn);
router.patch('/clock-out', roleGuard('agent'), agentsController.clockOut);
router.patch('/location', roleGuard('agent'), agentsController.updateLocation);
router.get('/my-orders', roleGuard('agent'), agentsController.myOrders);

export default router;