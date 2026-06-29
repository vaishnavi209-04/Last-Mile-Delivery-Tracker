import { Router } from 'express';
import { rateCardsController } from './rateCards.controller';
import { authGuard } from '../../middleware/authGuard';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(authGuard, roleGuard('admin'));

router.get('/', rateCardsController.getAll);
router.post('/', rateCardsController.create);
router.put('/:id', rateCardsController.update);

router.get('/cod-surcharge', rateCardsController.getCodSurcharges);
router.post('/cod-surcharge', rateCardsController.upsertCodSurcharge);

export default router;