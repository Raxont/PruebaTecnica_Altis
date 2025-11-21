import { Router } from 'express';
import {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} from '../controllers/issuesController';
import { authenticateToken } from '../middleware/authMiddleware';

/**
 * Rutas CRUD para gestión de issues
 * * GET / - Listar issues con filtros y paginación
 * * GET /:id - Obtener detalle de un issue
 * * POST / - Crear nuevo issue
 * * PUT /:id - Actualizar issue existente
 * * DELETE /:id - Eliminar issue
 * ! Todas las rutas requieren autenticación
 */
const router = Router();

router.use(authenticateToken);

router.get('/', getIssues);
router.get('/:id', getIssueById);
router.post('/', createIssue);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);

export default router;