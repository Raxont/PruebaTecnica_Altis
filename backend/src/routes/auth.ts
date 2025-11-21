import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimit';

/**
 * Rutas de autenticación de usuarios
 * * POST /register - Crear nuevo usuario
 * * POST /login - Iniciar sesión
 * * POST /logout - Cerrar sesión
 * * GET /me - Obtener usuario autenticado actual
 * ! Las rutas de register y login tienen rate limiting (5 intentos/15min)
 */
const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);

export default router;