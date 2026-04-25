const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');
const logger = require('../logger');

router.post('/', async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'name, price and stock are required' });
    }

    const product = await inventoryService.createProduct(name, price, stock);
    logger.info('Product created', { productId: product.id, name, price, stock });
    
    res.status(201).json(product);
  } catch (error) {
    logger.error('Failed to create product', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await inventoryService.getProduct(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    logger.error('Failed to get product', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.post('/:productId/decrease', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const result = await inventoryService.decreaseStock(productId, quantity || 1);
    
    logger.info('Stock decreased', { productId, quantity: quantity || 1 });
    res.json(result);
  } catch (error) {
    logger.error('Failed to decrease stock', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.post('/:productId/reset', async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;
    
    if (stock === undefined) {
      return res.status(400).json({ error: 'stock is required' });
    }

    const result = await inventoryService.resetStock(productId, stock);
    
    logger.info('Stock reset', { productId, stock });
    res.json(result);
  } catch (error) {
    logger.error('Failed to reset stock', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
