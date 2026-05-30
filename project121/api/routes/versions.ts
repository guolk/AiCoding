import { Router } from 'express';
import {
  getVersionById,
  createVersion,
  updateVersion,
  deleteVersion
} from '../data/store.js';

const router = Router();

router.get('/:id', (req, res) => {
  const version = getVersionById(req.params.id);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }
  res.json(version);
});

router.post('/', (req, res) => {
  const version = createVersion(req.body);
  res.status(201).json(version);
});

router.put('/:id', (req, res) => {
  const version = updateVersion(req.params.id, req.body);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }
  res.json(version);
});

router.delete('/:id', (req, res) => {
  const success = deleteVersion(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Version not found' });
  }
  res.status(204).send();
});

export default router;
