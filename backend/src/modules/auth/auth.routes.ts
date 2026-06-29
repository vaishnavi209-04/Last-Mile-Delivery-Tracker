import { Router } from 'express';
import { authController } from './auth.controller';
import { authGuard } from '../../middleware/authGuard';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authGuard, authController.me);
router.post('/agents', authGuard, roleGuard('admin'), authController.createAgent);

export default router;