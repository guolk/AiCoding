import { Router } from 'express';
import {
  getComposers,
  getComposerById,
  createComposer,
  updateComposer,
  deleteComposer
} from '../data/store.js';

const router = Router();

router.get('/', (req, res) => {
  const composers = getComposers();
  res.json(composers);
});

router.get('/:id', (req, res) => {
  const composer = getComposerById(req.params.id);
  if (!composer) {
    return res.status(404).json({ error: 'Composer not found' });
  }
  res.json(composer);
});

router.post('/', (req, res) => {
  const composer = createComposer(req.body);
  res.status(201).json(composer);
});

router.put('/:id', (req, res) => {
  const composer = updateComposer(req.params.id, req.body);
  if (!composer) {
    return res.status(404).json({ error: 'Composer not found' });
  }
  res.json(composer);
});

router.delete('/:id', (req, res) => {
  const success = deleteComposer(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Composer not found' });
  }
  res.status(204).send();
});

export default router;
