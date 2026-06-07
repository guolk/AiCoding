import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  addReference,
  updateReference,
  deleteReference,
  addViewpoint,
  updateViewpoint,
  deleteViewpoint
} from '../repositories/noteRepository.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const notes = await getAllNotes();
    res.json(notes);
  } catch (error) {
    console.error('Failed to get notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await getNoteById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Failed to get note:', error);
    res.status(500).json({ error: 'Failed to get note' });
  }
});

router.post('/', async (req, res) => {
  try {
    const note = await createNote(req.body);
    res.status(201).json(note);
  } catch (error) {
    console.error('Failed to create note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const note = await updateNote(req.params.id, req.body);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Failed to update note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteNote(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

router.post('/:id/references', async (req, res) => {
  try {
    const ref = await addReference(req.params.id, req.body);
    res.status(201).json(ref);
  } catch (error) {
    console.error('Failed to add reference:', error);
    res.status(500).json({ error: 'Failed to add reference' });
  }
});

router.put('/references/:refId', async (req, res) => {
  try {
    const ref = await updateReference(req.params.refId, req.body);
    if (!ref) {
      return res.status(404).json({ error: 'Reference not found' });
    }
    res.json(ref);
  } catch (error) {
    console.error('Failed to update reference:', error);
    res.status(500).json({ error: 'Failed to update reference' });
  }
});

router.delete('/references/:refId', async (req, res) => {
  try {
    const deleted = await deleteReference(req.params.refId);
    if (!deleted) {
      return res.status(404).json({ error: 'Reference not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete reference:', error);
    res.status(500).json({ error: 'Failed to delete reference' });
  }
});

router.post('/:id/viewpoints', async (req, res) => {
  try {
    const vp = await addViewpoint(req.params.id, req.body);
    res.status(201).json(vp);
  } catch (error) {
    console.error('Failed to add viewpoint:', error);
    res.status(500).json({ error: 'Failed to add viewpoint' });
  }
});

router.put('/viewpoints/:vpId', async (req, res) => {
  try {
    const vp = await updateViewpoint(req.params.vpId, req.body);
    if (!vp) {
      return res.status(404).json({ error: 'Viewpoint not found' });
    }
    res.json(vp);
  } catch (error) {
    console.error('Failed to update viewpoint:', error);
    res.status(500).json({ error: 'Failed to update viewpoint' });
  }
});

router.delete('/viewpoints/:vpId', async (req, res) => {
  try {
    const deleted = await deleteViewpoint(req.params.vpId);
    if (!deleted) {
      return res.status(404).json({ error: 'Viewpoint not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete viewpoint:', error);
    res.status(500).json({ error: 'Failed to delete viewpoint' });
  }
});

export default router;
