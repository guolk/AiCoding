const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');

describe('Payment System API Tests', () => {
  describe('Inventory API', () => {
    it('should create a product successfully', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .send({
          name: 'Test Product',
          price: 100,
          stock: 10
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Product');
      expect(response.body.price).toBe(100);
      expect(response.body.stock).toBe(10);
    });

    it('should get product by id', async () => {
      const product = await testHelpers.createTestProduct();
      
      const response = await request(app)
        .get(`/api/inventory/${product.id}`)
        .expect(200);
      
      expect(response.body.id).toBe(product.id);
      expect(response.body.name).toBe('Test Product');
    });

    it('should decrease stock successfully', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      
      const response = await request(app)
        .post(`/api/inventory/${product.id}/decrease`)
        .send({ quantity: 1 })
        .expect(200);
      
      expect(response.body.oldStock).toBe(10);
      expect(response.body.newStock).toBe(9);
    });

    it('should fail to decrease stock when insufficient', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 1);
      
      await request(app)
        .post(`/api/inventory/${product.id}/decrease`)
        .send({ quantity: 1 });
      
      const response = await request(app)
        .post(`/api/inventory/${product.id}/decrease`)
        .send({ quantity: 1 })
        .expect(500);
      
      expect(response.body.error).toContain('Insufficient stock');
    });
  });

  describe('Order API', () => {
    it('should create an order successfully', async () => {
      const product = await testHelpers.createTestProduct();
      
      const response = await request(app)
        .post('/api/orders')
        .send({
          productId: product.id,
          userId: 'test-user-1'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('orderId');
      expect(response.body.productId).toBe(product.id);
      expect(response.body.status).toBe('pending');
    });

    it('should get order by id', async () => {
      const product = await testHelpers.createTestProduct();
      const order = await testHelpers.createTestOrder(product.id);
      
      const response = await request(app)
        .get(`/api/orders/${order.orderId}`)
        .expect(200);
      
      expect(response.body.id).toBe(order.orderId);
      expect(response.body.status).toBe('pending');
    });

    it('should cancel a pending order', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      
      const response = await request(app)
        .post(`/api/orders/${order.orderId}/cancel`)
        .expect(200);
      
      expect(response.body.status).toBe('cancelled');
      
      const updatedOrder = await testHelpers.getOrder(order.orderId);
      expect(updatedOrder.status).toBe('cancelled');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-order')
        .expect(404);
      
      expect(response.body.error).toBe('Order not found');
    });
  });

  describe('Payment API', () => {
    it('should create a payment successfully', async () => {
      const product = await testHelpers.createTestProduct();
      const order = await testHelpers.createTestOrder(product.id);
      
      const response = await request(app)
        .post('/api/payments')
        .send({ orderId: order.orderId })
        .expect(201);
      
      expect(response.body).toHaveProperty('paymentId');
      expect(response.body.orderId).toBe(order.orderId);
      expect(response.body.status).toBe('pending');
    });

    it('should get payment by id', async () => {
      const product = await testHelpers.createTestProduct();
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const response = await request(app)
        .get(`/api/payments/${payment.paymentId}`)
        .expect(200);
      
      expect(response.body.id).toBe(payment.paymentId);
      expect(response.body.status).toBe('pending');
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/non-existent-payment')
        .expect(404);
      
      expect(response.body.error).toBe('Payment not found');
    });
  });

  describe('Callback API', () => {
    it('should process a callback successfully', async () => {
      const product = await testHelpers.createTestProduct();
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const response = await request(app)
        .post('/api/callbacks')
        .send({
          transactionId: payment.transactionId,
          success: true,
          data: { amount: payment.amount }
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    it('should return idempotent result for duplicate callback', async () => {
      const product = await testHelpers.createTestProduct();
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const firstResponse = await request(app)
        .post('/api/callbacks')
        .send({
          transactionId: payment.transactionId,
          success: true
        });
      
      const secondResponse = await request(app)
        .post('/api/callbacks')
        .send({
          transactionId: payment.transactionId,
          success: true
        })
        .expect(200);
      
      expect(secondResponse.body.idempotent).toBe(true);
      expect(secondResponse.body.message).toBe('Callback already processed');
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
