import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  getAllRelics,
  getRelicById,
  createRelic,
  updateRelic,
  deleteRelic,
  addPhoto,
  deletePhoto
} from '../repositories/relicRepository.js';
import type { PhotoType } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../public/uploads/photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'relic-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = Router();

router.get('/', async (req, res) => {
  try {
    const relics = await getAllRelics();
    res.json(relics);
  } catch (error) {
    console.error('Failed to get relics:', error);
    res.status(500).json({ error: 'Failed to get relics' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const relic = await getRelicById(req.params.id);
    if (!relic) {
      return res.status(404).json({ error: 'Relic not found' });
    }
    res.json(relic);
  } catch (error) {
    console.error('Failed to get relic:', error);
    res.status(500).json({ error: 'Failed to get relic' });
  }
});

router.post('/', async (req, res) => {
  try {
    const relic = await createRelic(req.body);
    res.status(201).json(relic);
  } catch (error) {
    console.error('Failed to create relic:', error);
    res.status(500).json({ error: 'Failed to create relic' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const relic = await updateRelic(req.params.id, req.body);
    if (!relic) {
      return res.status(404).json({ error: 'Relic not found' });
    }
    res.json(relic);
  } catch (error) {
    console.error('Failed to update relic:', error);
    res.status(500).json({ error: 'Failed to update relic' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteRelic(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Relic not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete relic:', error);
    res.status(500).json({ error: 'Failed to delete relic' });
  }
});

router.post('/:id/photos', upload.single('photo'), async (req, res) => {
  try {
    const relicId = req.params.id;
    const type = req.body.type as PhotoType;
    const caption = req.body.caption || '';
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const url = `/uploads/photos/${req.file.filename}`;
    const photo = await addPhoto(relicId, { type, url, caption });
    
    res.status(201).json(photo);
  } catch (error) {
    console.error('Failed to add photo:', error);
    res.status(500).json({ error: 'Failed to add photo' });
  }
});

router.delete('/photos/:photoId', async (req, res) => {
  try {
    const deleted = await deletePhoto(req.params.photoId);
    if (!deleted) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;
