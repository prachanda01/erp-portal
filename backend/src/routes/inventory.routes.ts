import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/adjust', authorizeRoles('ADMIN', 'WAREHOUSE'), InventoryController.adjustStock);
router.get('/movements', InventoryController.getMovements);
router.get('/warehouses', InventoryController.getWarehouses);

export default router;
