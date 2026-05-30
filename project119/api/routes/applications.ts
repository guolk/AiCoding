import express from 'express';
import { store } from '../data/store';

const router = express.Router();

router.get('/', (req, res) => {
  const cases = store.getApplicationCases();
  res.json(cases);
});

router.post('/', (req, res) => {
  const { paperId, title, description, type, url, source, date } = req.body;
  
  if (!paperId || !title || !type) {
    return res.status(400).json({ error: 'Paper ID, title and type are required' });
  }
  
  const newCase = store.addApplicationCase({
    paperId,
    title,
    description: description || '',
    type,
    url: url || '',
    source: source || '',
    date: date || new Date().toISOString()
  });
  
  res.status(201).json(newCase);
});

router.put('/:id', (req, res) => {
  const updated = store.updateApplicationCase(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Application case not found' });
  }
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const success = store.deleteApplicationCase(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Application case not found' });
  }
  res.json({ success: true });
});

router.get('/stats', (req, res) => {
  const cases = store.getApplicationCases();
  const typeStats: { [key: string]: number } = {};
  
  cases.forEach(c => {
    typeStats[c.type] = (typeStats[c.type] || 0) + 1;
  });
  
  res.json({
    total: cases.length,
    byType: typeStats
  });
});

export default router;
