import { Router } from 'express';
import {
  getAllOutputs,
  getOutputById,
  createOutput,
  updateOutput,
  deleteOutput
} from '../repositories/outputRepository.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const outputs = await getAllOutputs();
    res.json(outputs);
  } catch (error) {
    console.error('Failed to get outputs:', error);
    res.status(500).json({ error: 'Failed to get outputs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const output = await getOutputById(req.params.id);
    if (!output) {
      return res.status(404).json({ error: 'Output not found' });
    }
    res.json(output);
  } catch (error) {
    console.error('Failed to get output:', error);
    res.status(500).json({ error: 'Failed to get output' });
  }
});

router.post('/', async (req, res) => {
  try {
    const output = await createOutput(req.body);
    res.status(201).json(output);
  } catch (error) {
    console.error('Failed to create output:', error);
    res.status(500).json({ error: 'Failed to create output' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const output = await updateOutput(req.params.id, req.body);
    if (!output) {
      return res.status(404).json({ error: 'Output not found' });
    }
    res.json(output);
  } catch (error) {
    console.error('Failed to update output:', error);
    res.status(500).json({ error: 'Failed to update output' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteOutput(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Output not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete output:', error);
    res.status(500).json({ error: 'Failed to delete output' });
  }
});

export default router;
