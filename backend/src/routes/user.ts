import { Router } from 'express';
import { getUsersByOrganization } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

/**
 * Rutas para gestión de usuarios
 * * GET / - Obtener todos los usuarios de la organización del usuario autenticado
 * ! Requiere autenticación
 * ? Solo retorna usuarios de la misma organización
 */
const router = Router();

router.use(authenticateToken);

router.get('/', getUsersByOrganization);

export default router;