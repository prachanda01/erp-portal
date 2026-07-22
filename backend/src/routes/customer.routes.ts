import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getById);
router.post('/', authorizeRoles('ADMIN', 'SALES'), CustomerController.create);
router.put('/:id', authorizeRoles('ADMIN', 'SALES'), CustomerController.update);
router.delete('/:id', authorizeRoles('ADMIN'), CustomerController.delete);
router.post('/:id/followups', authorizeRoles('ADMIN', 'SALES'), CustomerController.addFollowup);

export default router;
