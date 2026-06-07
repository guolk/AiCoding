import { Router } from 'express';
import { getDashboardStats } from '../repositories/dashboardRepository.js';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Failed to get dashboard stats:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

export default router;
