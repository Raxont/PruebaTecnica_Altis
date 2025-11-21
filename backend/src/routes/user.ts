import { Router } from 'express';
import { getUsersByOrganization } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getUsersByOrganization);

export default router;