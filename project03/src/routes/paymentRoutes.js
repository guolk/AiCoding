const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const logger = require('../logger');

router.post('/', async (req, res) => {
  try {
    const { orderId } = req.body;
    const requestId = req.headers['x-request-id'];
    
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const payment = await paymentService.createPayment(orderId);
    logger.info('Payment created', { requestId, paymentId: payment.paymentId, orderId });
    
    res.status(201).json(payment);
  } catch (error) {
    logger.error('Failed to create payment', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.post('/process', async (req, res) => {
  try {
    const { orderId } = req.body;
    const requestId = req.headers['x-request-id'];
    
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const result = await paymentService.processPayment(orderId);
    logger.info('Payment processed', { requestId, orderId, success: result.success });
    
    res.json(result);
  } catch (error) {
    logger.error('Failed to process payment', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentService.getPayment(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    logger.error('Failed to get payment', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
