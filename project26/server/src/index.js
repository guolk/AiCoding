const express = require('express');
const cors = require('cors');
const sudokuRoutes = require('./routes/sudoku');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/sudoku', sudokuRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Sudoku server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/sudoku`);
});
