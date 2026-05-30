import { Router } from 'express';
import {
  getWorks,
  getWorkById,
  createWork,
  updateWork,
  deleteWork,
  getVersionsByWork,
  getListeningNotesByWork
} from '../data/store.js';

const router = Router();

router.get('/', (req, res) => {
  const works = getWorks();
  res.json(works);
});

router.get('/:id', (req, res) => {
  const work = getWorkById(req.params.id);
  if (!work) {
    return res.status(404).json({ error: 'Work not found' });
  }
  res.json(work);
});

router.post('/', (req, res) => {
  const work = createWork(req.body);
  res.status(201).json(work);
});

router.put('/:id', (req, res) => {
  const work = updateWork(req.params.id, req.body);
  if (!work) {
    return res.status(404).json({ error: 'Work not found' });
  }
  res.json(work);
});

router.delete('/:id', (req, res) => {
  const success = deleteWork(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Work not found' });
  }
  res.status(204).send();
});

router.get('/:id/versions', (req, res) => {
  const versions = getVersionsByWork(req.params.id);
  res.json(versions);
});

router.get('/:id/notes', (req, res) => {
  const notes = getListeningNotesByWork(req.params.id);
  res.json(notes);
});

export default router;
