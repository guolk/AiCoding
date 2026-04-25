const request = require('supertest');
const app = require('../src/app');
const inventoryService = require('../src/services/inventoryService');

class TestHelpers {
  constructor() {
    this.app = app;
  }

  async createTestProduct(name = 'Test Product', price = 100, stock = 10) {
    const product = await inventoryService.createProduct(name, price, stock);
    return product;
  }

  async createTestOrder(productId, userId = 'test-user-1') {
    const response = await request(this.app)
      .post('/api/orders')
      .send({ productId, userId })
      .expect('Content-Type', /json/);
    
    return response.body;
  }

  async createTestPayment(orderId) {
    const response = await request(this.app)
      .post('/api/payments')
      .send({ orderId })
      .expect('Content-Type', /json/);
    
    return response.body;
  }

  async getOrder(orderId) {
    const response = await request(this.app)
      .get(`/api/orders/${orderId}`)
      .expect('Content-Type', /json/);
    
    return response.body;
  }

  async getPayment(paymentId) {
    const response = await request(this.app)
      .get(`/api/payments/${paymentId}`)
      .expect('Content-Type', /json/);
    
    return response.body;
  }

  async getProduct(productId) {
    const response = await request(this.app)
      .get(`/api/inventory/${productId}`)
      .expect('Content-Type', /json/);
    
    return response.body;
  }

  async sendCallback(transactionId, success = true) {
    const response = await request(this.app)
      .post('/api/callbacks')
      .send({
        transactionId,
        success,
        data: { timestamp: Date.now() }
      })
      .expect('Content-Type', /json/);
    
    return response.body;
  }

  async processPayment(orderId) {
    const response = await request(this.app)
      .post('/api/payments/process')
      .send({ orderId })
      .expect('Content-Type', /json/);
    
    return response.body;
  }

  async cancelOrder(orderId) {
    const response = await request(this.app)
      .post(`/api/orders/${orderId}/cancel`)
      .expect('Content-Type', /json/);
    
    return response.body;
  }

  async resetProductStock(productId, stock) {
    const response = await request(this.app)
      .post(`/api/inventory/${productId}/reset`)
      .send({ stock })
      .expect('Content-Type', /json/);
    
    return response.body;
  }
}

module.exports = new TestHelpers();
