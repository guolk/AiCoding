import { Router } from 'express';
import { CommentController } from '../controllers/CommentController.js';

const router = Router();

router.get('/', CommentController.getAll);
router.get('/categories', CommentController.getCategories);
router.post('/', CommentController.create);
router.delete('/:id', CommentController.delete);

export default router;
