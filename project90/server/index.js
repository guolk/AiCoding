const express = require('express');
const cors = require('cors');
const path = require('path');
const initDB = require('./database');
const projectRoutes = require('./routes/projects');
const filamentRoutes = require('./routes/filaments');
const printerRoutes = require('./routes/printers');
const profileRoutes = require('./routes/profiles');
const costRoutes = require('./routes/costs');

const app = express();
const PORT = process.env.PORT || 8765;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const db = initDB();

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/api/projects', projectRoutes);
app.use('/api/filaments', filamentRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/costs', costRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '3D Print Manager API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});