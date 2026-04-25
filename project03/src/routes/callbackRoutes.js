const express = require('express');
const router = express.Router();
const callbackService = require('../services/callbackService');
const logger = require('../logger');

router.post('/', async (req, res) => {
  try {
    const { transactionId, success, data } = req.body;
    const requestId = req.headers['x-request-id'];
    
    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId is required' });
    }

    const result = await callbackService.processCallback(transactionId, {
      success,
      data,
      raw: req.body
    });

    logger.info('Callback processed', { 
      requestId, 
      transactionId, 
      idempotent: result.idempotent 
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Failed to process callback', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const callbacks = await callbackService.getCallback(transactionId);
    
    res.json(callbacks);
  } catch (error) {
    logger.error('Failed to get callbacks', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
