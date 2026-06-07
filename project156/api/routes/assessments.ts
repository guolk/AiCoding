import { Router } from 'express';
import {
  getAssessmentsByStudentId,
  getAssessmentById,
  createAssessment,
  getMilestonesByStudentId,
  addMilestone,
  deleteMilestone,
  getLatestAssessment
} from '../services/assessmentService.js';

const router = Router();

router.get('/student/:studentId', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const assessments = getAssessmentsByStudentId(studentId);
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get assessments' });
  }
});

router.get('/student/:studentId/latest', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const assessment = getLatestAssessment(studentId);
    if (!assessment) {
      return res.status(404).json({ error: 'No assessment found' });
    }
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get latest assessment' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const assessment = getAssessmentById(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get assessment' });
  }
});

router.post('/student/:studentId', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const assessment = createAssessment(studentId, req.body);
    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

router.get('/student/:studentId/milestones', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const milestones = getMilestonesByStudentId(studentId);
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get milestones' });
  }
});

router.post('/student/:studentId/milestones', (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const milestone = addMilestone(studentId, req.body);
    res.status(201).json(milestone);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add milestone' });
  }
});

router.delete('/milestones/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = deleteMilestone(id);
    if (!success) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

export default router;
