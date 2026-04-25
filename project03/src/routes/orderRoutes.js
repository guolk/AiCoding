const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const logger = require('../logger');

router.post('/', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    const requestId = req.headers['x-request-id'];
    
    if (!productId || !userId) {
      return res.status(400).json({ error: 'productId and userId are required' });
    }

    const order = await orderService.createOrder(productId, userId);
    logger.info('Order created successfully', { requestId, orderId: order.orderId });
    
    res.status(201).json(order);
  } catch (error) {
    logger.error('Failed to create order', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    logger.error('Failed to get order', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.post('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await orderService.cancelOrder(orderId);
    
    res.json(result);
  } catch (error) {
    logger.error('Failed to cancel order', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.post('/close-timeout', async (req, res) => {
  try {
    const { timeoutMinutes } = req.body;
    const closedOrders = await orderService.closeTimeoutOrders(timeoutMinutes || 30);
    
    res.json({ closedOrders, count: closedOrders.length });
  } catch (error) {
    logger.error('Failed to close timeout orders', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
