import { Router, type Request, type Response } from 'express';
import { mockData } from '../../src/mock/data.js';
import type { SalesData } from '../../shared/types.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.stores });
});

router.get('/sales', async (req: Request, res: Response): Promise<void> => {
  const { platform, storeId, startDate, endDate } = req.query;
  let data = [...mockData.salesData];
  
  if (platform && platform !== 'all') {
    data = data.filter(s => s.platform === platform);
  }
  if (storeId) {
    data = data.filter(s => s.storeId === storeId);
  }
  if (startDate) {
    data = data.filter(s => s.date >= startDate);
  }
  if (endDate) {
    data = data.filter(s => s.date <= endDate);
  }
  
  res.json({ success: true, data });
});

router.post('/data', async (req: Request, res: Response): Promise<void> => {
  const newData: Partial<SalesData> = req.body;
  const id = `sd-new-${Date.now()}`;
  const store = mockData.stores.find(s => s.id === newData.storeId);
  
  const record: SalesData = {
    id,
    storeId: newData.storeId || '',
    platform: newData.platform || 'amazon',
    storeName: store?.name || '',
    date: newData.date || new Date().toISOString().split('T')[0],
    salesAmount: newData.salesAmount || 0,
    orderCount: newData.orderCount || 0,
    refundCount: newData.refundCount || 0,
    refundRate: newData.refundRate || 0,
    reviewScore: newData.reviewScore,
    adSpend: newData.adSpend || 0,
    profit: newData.profit || (newData.salesAmount || 0) * 0.3,
    createdAt: new Date().toISOString().split('T')[0],
  };
  
  mockData.salesData.unshift(record);
  res.json({ success: true, data: record });
});

router.post('/data/import', async (req: Request, res: Response): Promise<void> => {
  res.json({ 
    success: true, 
    message: 'CSV导入成功',
    imported: Math.floor(Math.random() * 50) + 10
  });
});

router.get('/analysis', async (_req: Request, res: Response): Promise<void> => {
  const analysis = {
    platformComparison: mockData.platformComparison,
    totalSales: mockData.platformComparison.reduce((sum, p) => sum + p.sales, 0),
    totalProfit: mockData.platformComparison.reduce((sum, p) => sum + p.profit, 0),
    avgROI: mockData.platformComparison.reduce((sum, p) => sum + p.roi, 0) / mockData.platformComparison.length,
  };
  res.json({ success: true, data: analysis });
});

export default router;
