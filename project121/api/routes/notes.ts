import { Router } from 'express';
import {
  getAllListeningNotes,
  getListeningNoteById,
  createListeningNote,
  updateListeningNote,
  deleteListeningNote
} from '../data/store.js';

const router = Router();

router.get('/', (req, res) => {
  const notes = getAllListeningNotes();
  res.json(notes);
});

router.get('/:id', (req, res) => {
  const note = getListeningNoteById(req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(note);
});

router.post('/', (req, res) => {
  const note = createListeningNote(req.body);
  res.status(201).json(note);
});

router.put('/:id', (req, res) => {
  const note = updateListeningNote(req.params.id, req.body);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(note);
});

router.delete('/:id', (req, res) => {
  const success = deleteListeningNote(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.status(204).send();
});

export default router;
