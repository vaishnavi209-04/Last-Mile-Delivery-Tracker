import { Router } from 'express';
import { zonesController } from './zones.controller';
import { authGuard } from '../../middleware/authGuard';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();

router.use(authGuard);

router.get('/', zonesController.getAll);
router.post('/', roleGuard('admin'), zonesController.create);
router.put('/:id', roleGuard('admin'), zonesController.update);

router.post('/areas', roleGuard('admin'), zonesController.createArea);
router.delete('/areas/:pincode', roleGuard('admin'), zonesController.deleteArea);

export default router;