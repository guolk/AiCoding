import { Router } from 'express';
import {
  getConcerts,
  getConcertById,
  createConcert,
  updateConcert,
  deleteConcert
} from '../data/store.js';

const router = Router();

router.get('/', (req, res) => {
  const concerts = getConcerts();
  res.json(concerts);
});

router.get('/:id', (req, res) => {
  const concert = getConcertById(req.params.id);
  if (!concert) {
    return res.status(404).json({ error: 'Concert not found' });
  }
  res.json(concert);
});

router.post('/', (req, res) => {
  const concert = createConcert(req.body);
  res.status(201).json(concert);
});

router.put('/:id', (req, res) => {
  const concert = updateConcert(req.params.id, req.body);
  if (!concert) {
    return res.status(404).json({ error: 'Concert not found' });
  }
  res.json(concert);
});

router.delete('/:id', (req, res) => {
  const success = deleteConcert(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Concert not found' });
  }
  res.status(204).send();
});

export default router;
