const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('./db');

const papersRouter = require('./routes/papers');
const annotationsRouter = require('./routes/annotations');
const notesRouter = require('./routes/notes');
const insightsRouter = require('./routes/insights');
const relationsRouter = require('./routes/relations');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use(express.json({ limit: '10mb', type: 'application/json' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('只支持PDF文件'), false);
    }
  }
});

app.use('/uploads', express.static(uploadsDir));

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: '没有上传文件' });
    return;
  }
  res.json({ 
    file_path: req.file.filename,
    original_name: req.file.originalname,
    message: '文件上传成功'
  });
});

app.use('/api/papers', papersRouter);
app.use('/api/annotations', annotationsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/relations', relationsRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Research Reader API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
