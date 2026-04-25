const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const logger = require('../logger');
const inventoryService = require('./inventoryService');

class OrderService {
  async createOrder(productId, userId) {
    const product = await inventoryService.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const orderId = uuidv4();
    const amount = product.price;

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO orders (id, product_id, user_id, amount, status) VALUES (?, ?, ?, ?, ?)',
        [orderId, productId, userId, amount, 'pending'],
        (err) => {
          if (err) return reject(err);

          logger.info('Order created', { orderId, productId, userId, amount });
          resolve({ orderId, productId, userId, amount, status: 'pending' });
        }
      );
    });
  }

  async getOrder(orderId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateOrderStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      const updateFields = { status };
      if (status === 'paid') {
        updateFields.paid_at = new Date().toISOString();
      }

      db.run(
        'UPDATE orders SET status = ?, paid_at = ? WHERE id = ?',
        [status, updateFields.paid_at || null, orderId],
        function(err) {
          if (err) return reject(err);
          if (this.changes === 0) return reject(new Error('Order not found'));

          logger.info('Order status updated', { orderId, status });
          resolve({ orderId, status });
        }
      );
    });
  }

  async closeTimeoutOrders(timeoutMinutes = 30) {
    const timeoutTime = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString();

    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM orders WHERE status = 'pending' AND created_at < ?`,
        [timeoutTime],
        async (err, orders) => {
          if (err) return reject(err);

          const closedOrders = [];
          for (const order of orders) {
            try {
              await this.updateOrderStatus(order.id, 'cancelled');
              closedOrders.push(order.id);
              logger.info('Timeout order closed', { orderId: order.id });
            } catch (e) {
              logger.error('Failed to close timeout order', { orderId: order.id, error: e.message });
            }
          }

          resolve(closedOrders);
        }
      );
    });
  }

  async cancelOrder(orderId) {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status !== 'pending') {
      throw new Error('Cannot cancel non-pending order');
    }

    await this.updateOrderStatus(orderId, 'cancelled');
    
    try {
      await inventoryService.increaseStock(order.product_id, 1);
    } catch (e) {
      logger.error('Failed to restore stock after order cancellation', { 
        orderId, 
        productId: order.product_id,
        error: e.message 
      });
    }

    return { orderId, status: 'cancelled' };
  }
}

module.exports = new OrderService();
