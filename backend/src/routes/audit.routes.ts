import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN', 'ACCOUNTS'));

router.get('/', AuditController.getLogs);

export default router;
