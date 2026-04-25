const nock = require('nock');
const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');

describe('Network Exception Tests', () => {
  const PAYMENT_GATEWAY_URL = 'https://api.payment-gateway-test.com';

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('Payment Gateway Timeout Tests', () => {
    it('should handle payment gateway timeout gracefully', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .delay(15000)
        .reply(200, { success: true, transactionId: payment.transactionId });

      const response = await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      expect(response.body.error).toBeTruthy();

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('pending');

      const productAfter = await testHelpers.getProduct(product.id);
      expect(productAfter.stock).toBe(10);
    });

    it('should allow retry after gateway timeout', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .delay(15000)
        .reply(200, { success: true, transactionId: payment.transactionId });

      await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      nock.cleanAll();
      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .reply(200, { success: true, transactionId: payment.transactionId });

      const callbackResult = await testHelpers.sendCallback(payment.transactionId, true);
      expect(callbackResult.success).toBe(true);

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('paid');

      const productAfter = await testHelpers.getProduct(product.id);
      expect(productAfter.stock).toBe(9);
    });
  });

  describe('Payment Gateway Connection Failure Tests', () => {
    it('should handle payment gateway connection refused', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .replyWithError('ECONNREFUSED');

      const response = await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      expect(response.body.error).toBeTruthy();

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('pending');
    });

    it('should handle DNS resolution failure', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .replyWithError('ENOTFOUND');

      const response = await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      expect(response.body.error).toBeTruthy();
    });
  });

  describe('Payment Gateway Error Response Tests', () => {
    it('should handle 500 Internal Server Error from gateway', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .reply(500, { error: 'Internal Server Error', message: 'Payment processing failed' });

      const response = await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('pending');
    });

    it('should handle 400 Bad Request from gateway', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .reply(400, { error: 'Bad Request', message: 'Invalid payment parameters' });

      const response = await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('pending');
    });

    it('should handle 429 Too Many Requests from gateway', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .reply(429, { error: 'Too Many Requests', message: 'Rate limit exceeded' });

      const response = await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('pending');
    });
  });

  describe('Partial Response Tests', () => {
    it('should handle malformed JSON response from gateway', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .reply(200, '{invalid json}', { 'Content-Type': 'application/json' });

      const response = await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('pending');
    });

    it('should handle empty response from gateway', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .reply(200, '');

      const response = await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);
    });
  });

  describe('Network Interruption During Payment Tests', () => {
    it('should maintain data consistency when network fails after payment creation', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);

      expect(payment.status).toBe('pending');
      
      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .replyWithError('ECONNRESET');

      await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      const paymentAfter = await testHelpers.getPayment(payment.paymentId);
      const orderAfter = await testHelpers.getOrder(order.orderId);
      const productAfter = await testHelpers.getProduct(product.id);

      expect(paymentAfter.status).toBe('pending');
      expect(orderAfter.status).toBe('pending');
      expect(productAfter.stock).toBe(10);
    });

    it('should allow order cancellation after network failure', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .replyWithError('Network Error');

      await request(app)
        .post('/api/payments/process')
        .send({ orderId: order.orderId })
        .expect(500);

      const cancelResponse = await testHelpers.cancelOrder(order.orderId);
      expect(cancelResponse.status).toBe('cancelled');

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('cancelled');
    });
  });

  describe('Slow Network Tests', () => {
    it('should handle slow but successful gateway response', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);

      nock(PAYMENT_GATEWAY_URL)
        .post('/pay')
        .delay(1000)
        .reply(200, { success: true, transactionId: payment.transactionId });

      const callbackResult = await testHelpers.sendCallback(payment.transactionId, true);
      expect(callbackResult.success).toBe(true);

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('paid');

      const productAfter = await testHelpers.getProduct(product.id);
      expect(productAfter.stock).toBe(9);
    });
  });

  describe('Callback Network Issues Tests', () => {
    it('should handle callback data corruption', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);

      const corruptedCallback = {
        transactionId: payment.transactionId,
        success: 'maybe',
        data: {
          amount: null,
          timestamp: 'invalid-date'
        }
      };

      const response = await request(app)
        .post('/api/callbacks')
        .send(corruptedCallback)
        .expect(200);

      const orderAfter = await testHelpers.getOrder(order.orderId);
      expect(orderAfter.status).toBe('paid');
    });

    it('should handle duplicate callbacks with network delays', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);

      const callbackPromises = [];
      const delays = [0, 100, 200, 500, 1000];

      for (const delay of delays) {
        callbackPromises.push(
          new Promise(resolve => {
            setTimeout(async () => {
              const result = await testHelpers.sendCallback(payment.transactionId, true);
              resolve(result);
            }, delay);
          })
        );
      }

      const results = await Promise.allSettled(callbackPromises);

      const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;

      const actualProcesses = results.filter(r => 
        r.status === 'fulfilled' && r.value.success && !r.value.idempotent
      ).length;

      const productAfter = await testHelpers.getProduct(product.id);

      expect(successCount).toBe(5);
      expect(actualProcesses).toBe(1);
      expect(productAfter.stock).toBe(9);
    });
  });
});
