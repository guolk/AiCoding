import { Router } from 'express';
import { ResourceController } from '../controllers/ResourceController.js';

const router = Router();

router.get('/', ResourceController.getAll);
router.get('/equipment/status', ResourceController.getEquipmentStatus);
router.get('/:id', ResourceController.getById);
router.post('/', ResourceController.create);
router.put('/:id', ResourceController.update);
router.delete('/:id', ResourceController.delete);

export default router;
