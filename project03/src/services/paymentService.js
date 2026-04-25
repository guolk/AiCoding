const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const logger = require('../logger');
const orderService = require('./orderService');
const inventoryService = require('./inventoryService');
const axios = require('axios');

class PaymentService {
  constructor() {
    this.paymentGatewayUrl = process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com/pay';
  }

  async createPayment(orderId) {
    const order = await orderService.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status !== 'pending') {
      throw new Error('Order is not pending');
    }

    const paymentId = uuidv4();
    const transactionId = uuidv4();

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO payments (id, order_id, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)',
        [paymentId, orderId, transactionId, order.amount, 'pending'],
        (err) => {
          if (err) return reject(err);

          logger.info('Payment created', { paymentId, orderId, amount: order.amount });
          resolve({ paymentId, orderId, transactionId, amount: order.amount, status: 'pending' });
        }
      );
    });
  }

  async processPayment(orderId) {
    const payment = await this.getPaymentByOrderId(orderId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    if (payment.status === 'paid') {
      throw new Error('Payment already processed');
    }

    try {
      const response = await this.callPaymentGateway(payment);
      
      if (response.success) {
        await this.confirmPayment(payment.order_id, response.transactionId);
        return { success: true, payment };
      } else {
        await this.failPayment(payment.order_id);
        return { success: false, payment, error: response.error };
      }
    } catch (error) {
      logger.error('Payment processing failed', { 
        orderId, 
        error: error.message 
      });
      throw error;
    }
  }

  async callPaymentGateway(payment) {
    try {
      const response = await axios.post(this.paymentGatewayUrl, {
        transactionId: payment.transaction_id,
        amount: payment.amount,
        orderId: payment.order_id
      }, {
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      logger.error('Payment gateway call failed', { 
        transactionId: payment.transaction_id,
        error: error.message 
      });
      throw error;
    }
  }

  async getPayment(paymentId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM payments WHERE id = ?', [paymentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getPaymentByOrderId(orderId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM payments WHERE order_id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async confirmPayment(orderId, transactionId, useTransaction = true) {
    const order = await orderService.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const executeOperations = async () => {
      await inventoryService.decreaseStock(order.product_id, 1);
      
      await new Promise((resolveUpdate, rejectUpdate) => {
        db.run(
          'UPDATE payments SET status = ?, paid_at = ? WHERE order_id = ?',
          ['paid', new Date().toISOString(), orderId],
          (err) => {
            if (err) rejectUpdate(err);
            else resolveUpdate();
          }
        );
      });

      await orderService.updateOrderStatus(orderId, 'paid');
    };

    if (!useTransaction) {
      await executeOperations();
      logger.info('Payment confirmed (no transaction wrapper)', { orderId, transactionId });
      return { success: true, orderId };
    }

    return new Promise((resolve, reject) => {
      db.serialize(async () => {
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) return reject(err);
        });

        try {
          await executeOperations();

          db.run('COMMIT', (err) => {
            if (err) return reject(err);
            logger.info('Payment confirmed and transaction committed', { orderId, transactionId });
            resolve({ success: true, orderId });
          });
        } catch (error) {
          db.run('ROLLBACK', () => {
            logger.error('Payment failed, transaction rolled back', { 
              orderId, 
              error: error.message 
            });
            reject(error);
          });
        }
      });
    });
  }

  async failPayment(orderId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE payments SET status = ? WHERE order_id = ?',
        ['failed', orderId],
        function(err) {
          if (err) return reject(err);
          
          logger.info('Payment failed', { orderId });
          resolve({ orderId, status: 'failed' });
        }
      );
    });
  }
}

module.exports = new PaymentService();
