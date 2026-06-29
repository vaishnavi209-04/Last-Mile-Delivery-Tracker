import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authGuard } from '../../middleware/authGuard';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(authGuard);

router.post('/preview', roleGuard('customer', 'admin'), ordersController.preview);
router.post('/confirm', roleGuard('customer', 'admin'), ordersController.confirm);
router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrder);
router.patch('/:id/status', roleGuard('agent', 'admin'), ordersController.updateStatus);
router.post('/:id/reschedule', roleGuard('customer'), ordersController.reschedule);
router.post('/:id/auto-assign', roleGuard('admin'), ordersController.autoAssign);
router.patch('/:id/assign', roleGuard('admin'), ordersController.manualAssign);

export default router;