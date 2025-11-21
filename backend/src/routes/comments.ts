import { Router } from 'express';
import {
  getCommentsByIssue,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/issue/:issueId', getCommentsByIssue);
router.post('/', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;