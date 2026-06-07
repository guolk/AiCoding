import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  getCommunicationsByStudentId,
  addCommunication,
  getDashboardStats,
  searchStudents
} from '../services/studentService.js';

const router = Router();

router.get('/stats', (_req, res) => {
  try {
    const stats = getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

router.get('/', (req, res) => {
  try {
    const { q, grade } = req.query;
    const students = searchStudents(
      (q as string) || '',
      grade ? parseInt(grade as string) : undefined
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get students' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get student' });
  }
});

router.post('/', (req, res) => {
  try {
    const student = createStudent(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = updateStudent(id, req.body);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

router.get('/:id/communications', (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const communications = getCommunicationsByStudentId(studentId);
    res.json(communications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get communications' });
  }
});

router.post('/:id/communications', (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const communication = addCommunication(studentId, req.body);
    res.status(201).json(communication);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add communication' });
  }
});

export default router;
