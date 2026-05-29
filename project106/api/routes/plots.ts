import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const plots = dataStore.getPlots();
  res.json({ success: true, data: plots });
});

router.get('/:id', (req: Request, res: Response) => {
  const plot = dataStore.getPlot(req.params.id);
  if (!plot) {
    return res.status(404).json({ success: false, error: '地块不存在' });
  }
  res.json({ success: true, data: plot });
});

router.put('/:id', (req: Request, res: Response) => {
  const plot = dataStore.updatePlot(req.params.id, req.body);
  if (!plot) {
    return res.status(404).json({ success: false, error: '地块不存在' });
  }
  res.json({ success: true, data: plot });
});

router.post('/:id/adopt', (req: Request, res: Response) => {
  const plot = dataStore.adoptPlot(req.params.id, req.body);
  if (!plot) {
    return res.status(400).json({ success: false, error: '申请失败' });
  }
  res.json({ success: true, data: plot });
});

router.post('/:id/approve', (req: Request, res: Response) => {
  const plot = dataStore.approvePlot(req.params.id);
  if (!plot) {
    return res.status(400).json({ success: false, error: '审批失败' });
  }
  res.json({ success: true, data: plot });
});

router.post('/:id/release', (req: Request, res: Response) => {
  const plot = dataStore.releasePlot(req.params.id);
  if (!plot) {
    return res.status(400).json({ success: false, error: '释放失败' });
  }
  res.json({ success: true, data: plot });
});

router.post('/:id/rotation', (req: Request, res: Response) => {
  const record = dataStore.addRotationRecord(req.params.id, req.body);
  if (!record) {
    return res.status(400).json({ success: false, error: '添加轮作记录失败' });
  }
  res.json({ success: true, data: record });
});

export default router;
