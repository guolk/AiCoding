const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');
const callbackService = require('../src/services/callbackService');
const db = require('../src/database');

describe('Payment Callback Idempotency Tests', () => {
  describe('Basic Idempotency Tests', () => {
    it('should process callback only once for same transactionId', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const firstResult = await testHelpers.sendCallback(payment.transactionId, true);
      expect(firstResult.success).toBe(true);
      expect(firstResult.idempotent).toBe(false);
      
      const orderAfterFirst = await testHelpers.getOrder(order.orderId);
      expect(orderAfterFirst.status).toBe('paid');
      
      const productAfterFirst = await testHelpers.getProduct(product.id);
      expect(productAfterFirst.stock).toBe(9);
      
      const secondResult = await testHelpers.sendCallback(payment.transactionId, true);
      expect(secondResult.success).toBe(true);
      expect(secondResult.idempotent).toBe(true);
      expect(secondResult.message).toBe('Callback already processed');
      
      const orderAfterSecond = await testHelpers.getOrder(order.orderId);
      expect(orderAfterSecond.status).toBe('paid');
      
      const productAfterSecond = await testHelpers.getProduct(product.id);
      expect(productAfterSecond.stock).toBe(9);
    });

    it('should track all callback attempts even when idempotent', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      for (let i = 0; i < 5; i++) {
        await testHelpers.sendCallback(payment.transactionId, true);
      }
      
      const callbacks = await callbackService.getCallback(payment.transactionId);
      
      expect(callbacks.length).toBeGreaterThanOrEqual(1);
      
      const processedCallbacks = callbacks.filter(c => c.processed === 1);
      expect(processedCallbacks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Concurrent Idempotency Tests', () => {
    it('should handle concurrent callback requests idempotently', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const callbackPromises = [];
      for (let i = 0; i < 20; i++) {
        callbackPromises.push(
          testHelpers.sendCallback(payment.transactionId, true)
        );
      }
      
      const results = await Promise.allSettled(callbackPromises);
      
      const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const actualProcessCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.success && !r.value.idempotent
      ).length;
      
      const idempotentCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.success && r.value.idempotent
      ).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      const finalOrder = await testHelpers.getOrder(order.orderId);
      
      expect(successCount).toBe(20);
      expect(actualProcessCount).toBe(1);
      expect(idempotentCount).toBe(19);
      expect(finalProduct.stock).toBe(9);
      expect(finalOrder.status).toBe('paid');
    });
  });

  describe('Failed Callback Retry Tests', () => {
    it('should allow retry after failed callback', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const firstResult = await testHelpers.sendCallback(payment.transactionId, false);
      expect(firstResult.success).toBe(true);
      
      const orderAfterFirst = await testHelpers.getOrder(order.orderId);
      expect(orderAfterFirst.status).toBe('pending');
      
      const retryResult = await testHelpers.sendCallback(payment.transactionId, true);
      expect(retryResult.success).toBe(true);
      
      const orderAfterRetry = await testHelpers.getOrder(order.orderId);
      expect(orderAfterRetry.status).toBe('paid');
      
      const productAfterRetry = await testHelpers.getProduct(product.id);
      expect(productAfterRetry.stock).toBe(9);
    });
  });

  describe('Duplicate Payment Prevention Tests', () => {
    it('should prevent duplicate payment processing through callbacks', async () => {
      const product = await testHelpers.createTestProduct('Expensive Product', 1000, 1);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const initialProduct = await testHelpers.getProduct(product.id);
      expect(initialProduct.stock).toBe(1);
      
      for (let i = 0; i < 100; i++) {
        await testHelpers.sendCallback(payment.transactionId, true);
      }
      
      const finalProduct = await testHelpers.getProduct(product.id);
      const finalOrder = await testHelpers.getOrder(order.orderId);
      
      expect(finalProduct.stock).toBe(0);
      expect(finalOrder.status).toBe('paid');
    });
  });

  describe('Callback Data Consistency Tests', () => {
    it('should maintain data consistency across multiple callback attempts', async () => {
      const product = await testHelpers.createTestProduct('Product', 500, 5);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const firstCallback = {
        transactionId: payment.transactionId,
        success: true,
        data: {
          amount: 500,
          paymentMethod: 'alipay',
          timestamp: Date.now()
        }
      };
      
      const response = await request(app)
        .post('/api/callbacks')
        .send(firstCallback)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      
      for (let i = 0; i < 10; i++) {
        const duplicateCallback = {
          transactionId: payment.transactionId,
          success: true,
          data: {
            amount: 999,
            paymentMethod: 'wechat',
            timestamp: Date.now() + i * 1000
          }
        };
        
        const dupResponse = await request(app)
          .post('/api/callbacks')
          .send(duplicateCallback)
          .expect(200);
        
        expect(dupResponse.body.idempotent).toBe(true);
      }
      
      const finalOrder = await testHelpers.getOrder(order.orderId);
      const finalProduct = await testHelpers.getProduct(product.id);
      
      expect(finalOrder.amount).toBe(500);
      expect(finalOrder.status).toBe('paid');
      expect(finalProduct.stock).toBe(4);
    });
  });

  describe('Edge Case Idempotency Tests', () => {
    it('should handle empty or invalid callback data gracefully', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const validResponse = await testHelpers.sendCallback(payment.transactionId, true);
      expect(validResponse.success).toBe(true);
      
      const emptyDataResponse = await request(app)
        .post('/api/callbacks')
        .send({
          transactionId: payment.transactionId,
          success: true
        })
        .expect(200);
      
      expect(emptyDataResponse.body.idempotent).toBe(true);
      
      const invalidTransactionResponse = await request(app)
        .post('/api/callbacks')
        .send({
          transactionId: 'invalid-transaction-id',
          success: true
        })
        .expect(500);
      
      expect(invalidTransactionResponse.body.error).toBeTruthy();
    });

    it('should handle rapid fire callbacks with minimal delay', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const rapidFirePromises = [];
      for (let i = 0; i < 50; i++) {
        rapidFirePromises.push(
          new Promise(resolve => {
            setTimeout(() => {
              resolve(testHelpers.sendCallback(payment.transactionId, true));
            }, i * 10);
          })
        );
      }
      
      const results = await Promise.allSettled(rapidFirePromises);
      
      const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const actualProcesses = results.filter(r => 
        r.status === 'fulfilled' && r.value.success && !r.value.idempotent
      ).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      expect(successCount).toBe(50);
      expect(actualProcesses).toBe(1);
      expect(finalProduct.stock).toBe(9);
    });
  });
});
