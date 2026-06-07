import { Router, type Request, type Response } from 'express';
import { mockData } from '../../src/mock/data.js';
import type { AdCampaign, KeywordBid } from '../../shared/types.js';

const router = Router();

router.get('/campaigns', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.adCampaigns });
});

router.post('/campaigns', async (req: Request, res: Response): Promise<void> => {
  const newCampaign: Partial<AdCampaign> = req.body;
  const campaign: AdCampaign = {
    id: `ad-new-${Date.now()}`,
    name: newCampaign.name || '',
    platform: newCampaign.platform || 'amazon',
    type: newCampaign.type || 'SP',
    budget: newCampaign.budget || 0,
    dailyBudget: newCampaign.dailyBudget,
    acos: newCampaign.acos,
    impressions: newCampaign.impressions || 0,
    clicks: newCampaign.clicks || 0,
    cpc: newCampaign.cpc,
    sales: newCampaign.sales || 0,
    orders: newCampaign.orders || 0,
    startDate: newCampaign.startDate || new Date().toISOString().split('T')[0],
    endDate: newCampaign.endDate,
    status: newCampaign.status || 'active',
    notes: newCampaign.notes,
    createdAt: new Date().toISOString().split('T')[0],
  };
  mockData.adCampaigns.unshift(campaign);
  res.json({ success: true, data: campaign });
});

router.put('/campaigns/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;
  
  const campaign = mockData.adCampaigns.find(c => c.id === id);
  if (campaign) {
    Object.assign(campaign, updates);
    res.json({ success: true, data: campaign });
  } else {
    res.status(404).json({ success: false, error: 'Campaign not found' });
  }
});

router.get('/bids', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockData.keywordBids });
});

router.post('/bids', async (req: Request, res: Response): Promise<void> => {
  const newBid: Partial<KeywordBid> = req.body;
  const bid: KeywordBid = {
    id: `kb-new-${Date.now()}`,
    campaignId: newBid.campaignId || '',
    keyword: newBid.keyword || '',
    oldBid: newBid.oldBid || 0,
    newBid: newBid.newBid || 0,
    date: newBid.date || new Date().toISOString().split('T')[0],
    reason: newBid.reason,
    effect7dAcos: newBid.effect7dAcos,
    effect7dSales: newBid.effect7dSales,
    createdAt: new Date().toISOString().split('T')[0],
  };
  mockData.keywordBids.unshift(bid);
  res.json({ success: true, data: bid });
});

router.get('/roi', async (_req: Request, res: Response): Promise<void> => {
  const data = mockData.dates30.map(date => {
    const dayData = mockData.salesData.filter(s => s.date === date);
    const adSpend = dayData.reduce((sum, s) => sum + s.adSpend, 0);
    const sales = dayData.reduce((sum, s) => sum + s.salesAmount, 0);
    return {
      date,
      adSpend,
      sales,
      roi: +((sales - adSpend) / adSpend).toFixed(2),
    };
  });
  
  const summary = {
    totalAdSpend: data.reduce((sum, d) => sum + d.adSpend, 0),
    totalSales: data.reduce((sum, d) => sum + d.sales, 0),
    avgROI: +(data.reduce((sum, d) => sum + d.roi, 0) / data.length).toFixed(2),
    dailyData: data,
  };
  
  res.json({ success: true, data: summary });
});

export default router;
