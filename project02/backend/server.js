const express = require('express');
const cors = require('cors');
const path = require('path');
const codeExecution = require('./routes/codeExecution');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/execute', codeExecution);
app.use('/api/history', historyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Code Runner API is running' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Code Runner API server running on port ${PORT}`);
});
