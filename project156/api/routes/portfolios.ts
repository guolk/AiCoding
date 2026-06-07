import { Router } from 'express';
import {
  getPortfoliosByStudentId,
  getPortfolioById,
  addPortfolio,
  toggleFeatured,
  deletePortfolio,
  getFeaturedPortfolios,
  getPortfolioTimeline
} from '../services/portfolioService.js';

const router = Router();

router.get('/student/:studentId', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { category, grade } = req.query;
    const portfolios = getPortfoliosByStudentId(
      studentId,
      category as string,
      grade ? parseInt(grade as string) : undefined
    );
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get portfolios' });
  }
});

router.get('/student/:studentId/timeline', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const timeline = getPortfolioTimeline(studentId);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get portfolio timeline' });
  }
});

router.get('/student/:studentId/featured', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const portfolios = getFeaturedPortfolios(studentId);
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get featured portfolios' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const portfolio = getPortfolioById(id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

router.post('/student/:studentId', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const portfolio = addPortfolio(studentId, req.body);
    res.status(201).json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add portfolio' });
  }
});

router.put('/:id/feature', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const portfolio = toggleFeatured(id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle featured' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = deletePortfolio(id);
    if (!success) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete portfolio' });
  }
});

export default router;
