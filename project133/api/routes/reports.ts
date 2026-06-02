import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';

const router = Router();

router.get('/', ReportController.getAll);
router.get('/dashboard', ReportController.getDashboard);
router.get('/analytics', ReportController.getAnalytics);
router.get('/classes', ReportController.getClasses);
router.get('/:id', ReportController.getById);
router.post('/', ReportController.create);
router.put('/:id', ReportController.update);
router.delete('/:id', ReportController.delete);

export default router;
