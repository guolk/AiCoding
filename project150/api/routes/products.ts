import { Router, type Request, type Response } from 'express';
import { mockData } from '../../src/mock/data.js';
import type { Product, KeywordRank, NegativeReview } from '../../shared/types.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.products });
});

router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  
  const product = mockData.products.find(p => p.id === id);
  if (product) {
    product.status = status;
    res.json({ success: true, data: product });
  } else {
    res.status(404).json({ success: false, error: 'Product not found' });
  }
});

router.get('/:productId/keywords', async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params;
  const keywords = mockData.keywordRanks.filter(k => k.productId === productId);
  res.json({ success: true, data: keywords });
});

router.post('/keywords', async (req: Request, res: Response): Promise<void> => {
  const newKeyword: Partial<KeywordRank> = req.body;
  const keyword: KeywordRank = {
    id: `kr-new-${Date.now()}`,
    productId: newKeyword.productId || '',
    keyword: newKeyword.keyword || '',
    platform: newKeyword.platform || 'amazon',
    rank: newKeyword.rank || 50,
    targetRank: newKeyword.targetRank,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0],
  };
  mockData.keywordRanks.unshift(keyword);
  res.json({ success: true, data: keyword });
});

router.get('/reviews', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.negativeReviews });
});

router.put('/reviews/:id/response', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { response, category } = req.body;
  
  const review = mockData.negativeReviews.find(r => r.id === id);
  if (review) {
    review.responseStrategy = response;
    review.reasonCategory = category;
    review.responseDate = new Date().toISOString().split('T')[0];
    review.status = 'responded';
    res.json({ success: true, data: review });
  } else {
    res.status(404).json({ success: false, error: 'Review not found' });
  }
});

export default router;
