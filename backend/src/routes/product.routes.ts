import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', ProductController.getAll);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getById);
router.post('/', authorizeRoles('ADMIN', 'WAREHOUSE'), ProductController.create);
router.put('/:id', authorizeRoles('ADMIN', 'WAREHOUSE'), ProductController.update);
router.delete('/:id', authorizeRoles('ADMIN'), ProductController.delete);

export default router;
