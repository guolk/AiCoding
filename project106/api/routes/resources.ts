import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

const router = Router();

router.get('/tools', (req: Request, res: Response) => {
  const tools = dataStore.getTools();
  res.json({ success: true, data: tools });
});

router.get('/tools/:id', (req: Request, res: Response) => {
  const tool = dataStore.getTool(req.params.id);
  if (!tool) {
    return res.status(404).json({ success: false, error: '工具不存在' });
  }
  res.json({ success: true, data: tool });
});

router.post('/tools/:id/borrow', (req: Request, res: Response) => {
  const tool = dataStore.borrowTool(req.params.id, req.body);
  if (!tool) {
    return res.status(400).json({ success: false, error: '借用失败，工具可能不可用' });
  }
  res.json({ success: true, data: tool });
});

router.post('/tools/:id/return', (req: Request, res: Response) => {
  const tool = dataStore.returnTool(req.params.id);
  if (!tool) {
    return res.status(400).json({ success: false, error: '归还失败' });
  }
  res.json({ success: true, data: tool });
});

router.get('/inventory', (req: Request, res: Response) => {
  const inventory = dataStore.getInventory();
  res.json({ success: true, data: inventory });
});

router.get('/inventory/:id', (req: Request, res: Response) => {
  const item = dataStore.getInventoryItem(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: '库存项目不存在' });
  }
  res.json({ success: true, data: item });
});

router.post('/inventory', (req: Request, res: Response) => {
  const item = dataStore.createInventoryItem(req.body);
  res.json({ success: true, data: item });
});

router.put('/inventory/:id', (req: Request, res: Response) => {
  const item = dataStore.updateInventory(req.params.id, req.body);
  if (!item) {
    return res.status(404).json({ success: false, error: '库存项目不存在' });
  }
  res.json({ success: true, data: item });
});

router.get('/expenses', (req: Request, res: Response) => {
  const expenses = dataStore.getExpenses();
  res.json({ success: true, data: expenses });
});

router.post('/expenses', (req: Request, res: Response) => {
  const expense = dataStore.createExpense(req.body);
  res.json({ success: true, data: expense });
});

router.put('/expenses/:id/pay', (req: Request, res: Response) => {
  const { userId } = req.body;
  const expense = dataStore.payShare(req.params.id, userId);
  if (!expense) {
    return res.status(400).json({ success: false, error: '缴费失败' });
  }
  res.json({ success: true, data: expense });
});

export default router;
