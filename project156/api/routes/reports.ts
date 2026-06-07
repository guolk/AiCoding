import { Router } from 'express';
import {
  getReportsByStudentId,
  getReportById,
  createReport,
  getGrowthComparison,
  getParentVersion
} from '../services/reportService.js';

const router = Router();

router.get('/student/:studentId', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const reports = getReportsByStudentId(studentId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

router.get('/student/:studentId/growth-comparison', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const comparison = getGrowthComparison(studentId);
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get growth comparison' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const report = getReportById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get report' });
  }
});

router.get('/:id/parent-version', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parentVersion = getParentVersion(id);
    if (!parentVersion) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(parentVersion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get parent version' });
  }
});

router.post('/student/:studentId', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const report = createReport(studentId, req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
  }
});

export default router;
