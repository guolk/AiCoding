import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '../repositories/materialRepository.js';
import type { Material } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../public/uploads');
const pdfDir = path.join(uploadDir, 'pdfs');
const rubbingDir = path.join(uploadDir, 'rubbings');
const mapDir = path.join(uploadDir, 'maps');

[uploadDir, pdfDir, rubbingDir, mapDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type as Material['type'];
    let dest = uploadDir;
    if (type === 'pdf') dest = pdfDir;
    else if (type === 'rubbing') dest = rubbingDir;
    else if (type === 'map') dest = mapDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'material-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const router = Router();

router.get('/', async (req, res) => {
  try {
    const materials = await getAllMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Failed to get materials:', error);
    res.status(500).json({ error: 'Failed to get materials' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const material = await getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    console.error('Failed to get material:', error);
    res.status(500).json({ error: 'Failed to get material' });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('Upload request received, body:', req.body);
    console.log('Uploaded file:', req.file);
    
    const type = req.body.type as Material['type'];
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    const typeDir = type === 'pdf' ? 'pdfs' : type === 'rubbing' ? 'rubbings' : 'maps';
    const filePath = `/uploads/${typeDir}/${req.file.filename}`;
    
    res.status(200).json({
      filePath,
      title: req.body.title || req.file.originalname
    });
  } catch (error) {
    console.error('Failed to upload material:', error);
    res.status(500).json({ error: 'Failed to upload material' });
  }
});

router.post('/', async (req, res) => {
  try {
    const material = await createMaterial(req.body);
    res.status(201).json(material);
  } catch (error) {
    console.error('Failed to create material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const material = await updateMaterial(req.params.id, req.body);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    console.error('Failed to update material:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const material = await getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    const filePath = path.join(__dirname, '../../public', material.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    const deleted = await deleteMaterial(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

export default router;
