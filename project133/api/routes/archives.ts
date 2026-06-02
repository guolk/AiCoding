import { Router } from 'express';
import { ArchiveController } from '../controllers/ArchiveController.js';

const router = Router();

router.get('/', ArchiveController.getAll);
router.get('/schedule', ArchiveController.getSchedule);
router.get('/:id', ArchiveController.getById);
router.post('/', ArchiveController.create);
router.put('/:id', ArchiveController.update);
router.delete('/:id', ArchiveController.delete);

export default router;
