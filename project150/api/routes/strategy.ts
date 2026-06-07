import { Router, type Request, type Response } from 'express';
import { mockData } from '../../src/mock/data.js';
import type { PriceAdjustment, Promotion } from '../../shared/types.js';

const router = Router();

router.get('/pricing', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.priceAdjustments });
});

router.post('/pricing', async (req: Request, res: Response): Promise<void> => {
  const newAdjustment: Partial<PriceAdjustment> = req.body;
  const product = mockData.products.find(p => p.id === newAdjustment.productId);
  
  const adjustment: PriceAdjustment = {
    id: `pa-new-${Date.now()}`,
    productId: newAdjustment.productId || '',
    productName: product?.name || '',
    sku: product?.sku || '',
    oldPrice: newAdjustment.oldPrice || 0,
    newPrice: newAdjustment.newPrice || 0,
    date: newAdjustment.date || new Date().toISOString().split('T')[0],
    reason: newAdjustment.reason,
    effectDays: newAdjustment.effectDays || 7,
    salesBefore: newAdjustment.salesBefore,
    salesAfter: newAdjustment.salesAfter,
    createdAt: new Date().toISOString().split('T')[0],
  };
  
  mockData.priceAdjustments.unshift(adjustment);
  
  if (product && newAdjustment.newPrice) {
    product.price = newAdjustment.newPrice;
  }
  
  res.json({ success: true, data: adjustment });
});

router.get('/promotions', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.promotions });
});

router.post('/promotions', async (req: Request, res: Response): Promise<void> => {
  const newPromotion: Partial<Promotion> = req.body;
  const promotion: Promotion = {
    id: `promo-new-${Date.now()}`,
    name: newPromotion.name || '',
    platform: newPromotion.platform || 'amazon',
    type: newPromotion.type || '',
    startDate: newPromotion.startDate || '',
    endDate: newPromotion.endDate || '',
    discountDescription: newPromotion.discountDescription,
    budget: newPromotion.budget,
    targetSales: newPromotion.targetSales,
    actualSales: newPromotion.actualSales,
    roi: newPromotion.roi,
    reviewNotes: newPromotion.reviewNotes,
    createdAt: new Date().toISOString().split('T')[0],
  };
  
  mockData.promotions.unshift(promotion);
  res.json({ success: true, data: promotion });
});

router.put('/promotions/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;
  
  const promotion = mockData.promotions.find(p => p.id === id);
  if (promotion) {
    Object.assign(promotion, updates);
    res.json({ success: true, data: promotion });
  } else {
    res.status(404).json({ success: false, error: 'Promotion not found' });
  }
});

export default router;
