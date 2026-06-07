import { Router } from 'express';
import {
  getAllAnalysis,
  getAnalysisById,
  createAnalysis,
  updateAnalysis,
  deleteAnalysis
} from '../repositories/analysisRepository.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const analysis = await getAllAnalysis();
    res.json(analysis);
  } catch (error) {
    console.error('Failed to get analysis:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const analysis = await getAnalysisById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Failed to get analysis:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

router.post('/', async (req, res) => {
  try {
    const analysis = await createAnalysis(req.body);
    res.status(201).json(analysis);
  } catch (error) {
    console.error('Failed to create analysis:', error);
    res.status(500).json({ error: 'Failed to create analysis' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const analysis = await updateAnalysis(req.params.id, req.body);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Failed to update analysis:', error);
    res.status(500).json({ error: 'Failed to update analysis' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteAnalysis(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete analysis:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

export default router;
