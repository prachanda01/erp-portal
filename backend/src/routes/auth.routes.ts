import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.registerUser);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', authenticateJWT, AuthController.getProfile);
router.post('/users', authenticateJWT, authorizeRoles('ADMIN'), AuthController.registerUser);

export default router;
