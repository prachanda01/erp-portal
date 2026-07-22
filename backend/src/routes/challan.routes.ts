import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', ChallanController.getAll);
router.get('/:id', ChallanController.getById);
router.post('/', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), ChallanController.create);
router.patch('/:id/status', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), ChallanController.updateStatus);

export default router;
