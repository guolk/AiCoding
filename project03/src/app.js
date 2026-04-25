const express = require('express');
const { v4: uuidv4 } = require('uuid');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const callbackRoutes = require('./routes/callbackRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  
  logger.info('Request received', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  next();
});

app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/callbacks', callbackRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  const requestId = req.headers['x-request-id'];
  logger.error('Unhandled error', {
    requestId,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    error: 'Internal server error',
    requestId
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Payment system server running on port ${PORT}`);
  });
}

module.exports = app;
