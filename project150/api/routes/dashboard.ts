import { Router, type Request, type Response } from 'express';
import { mockData, getDashboardSummary, getROIChartData } from '../../src/mock/data.js';

const router = Router();

router.get('/summary', async (_req: Request, res: Response): Promise<void> => {
  const summary = getDashboardSummary();
  res.json({ success: true, data: summary });
});

router.get('/alerts', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.alerts });
});

router.get('/roi-trend', async (_req: Request, res: Response): Promise<void> => {
  const data = getROIChartData();
  res.json({ success: true, data });
});

export default router;
