import { Router } from 'express';
import {
  getCommentsByIssue,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentsController';
import { authenticateToken } from '../middleware/authMiddleware';

/**
 * Rutas para gestión de comentarios en issues
 * * GET /issue/:issueId - Obtener comentarios de un issue
 * * POST / - Crear nuevo comentario
 * * PUT /:id - Actualizar comentario (solo autor)
 * * DELETE /:id - Eliminar comentario (solo autor)
 * ! Todas las rutas requieren autenticación
 * ? PUT y DELETE verifican que el usuario sea el autor
 */
const router = Router();

router.use(authenticateToken);

router.get('/issue/:issueId', getCommentsByIssue);
router.post('/', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;