import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const logs = dataStore.getPlantingLogs();
  res.json({ success: true, data: logs });
});

router.get('/:id', (req: Request, res: Response) => {
  const log = dataStore.getPlantingLog(req.params.id);
  if (!log) {
    return res.status(404).json({ success: false, error: '种植记录不存在' });
  }
  res.json({ success: true, data: log });
});

router.post('/', (req: Request, res: Response) => {
  const log = dataStore.createPlantingLog(req.body);
  res.json({ success: true, data: log });
});

router.post('/:id/care', (req: Request, res: Response) => {
  const record = dataStore.addCareRecord(req.params.id, req.body);
  if (!record) {
    return res.status(400).json({ success: false, error: '添加护理记录失败' });
  }
  res.json({ success: true, data: record });
});

router.post('/:id/photo', (req: Request, res: Response) => {
  const record = dataStore.addPhoto(req.params.id, req.body);
  if (!record) {
    return res.status(400).json({ success: false, error: '添加照片失败' });
  }
  res.json({ success: true, data: record });
});

router.post('/:id/harvest', (req: Request, res: Response) => {
  const record = dataStore.addHarvest(req.params.id, req.body);
  if (!record) {
    return res.status(400).json({ success: false, error: '添加收获记录失败' });
  }
  res.json({ success: true, data: record });
});

export default router;
