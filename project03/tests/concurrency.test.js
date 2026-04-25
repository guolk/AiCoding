const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');
const inventoryService = require('../src/services/inventoryService');
const orderService = require('../src/services/orderService');

describe('Concurrency Tests', () => {
  describe('Inventory Concurrency Tests', () => {
    it('should handle concurrent stock decreases correctly with version control', async () => {
      const product = await testHelpers.createTestProduct('Limited Item', 100, 5);
      
      const decreasePromises = [];
      for (let i = 0; i < 10; i++) {
        decreasePromises.push(
          request(app)
            .post(`/api/inventory/${product.id}/decrease`)
            .send({ quantity: 1 })
        );
      }
      
      const results = await Promise.allSettled(decreasePromises);
      
      const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      const updatedProduct = await testHelpers.getProduct(product.id);
      
      expect(successCount).toBeLessThanOrEqual(5);
      expect(updatedProduct.stock).toBeGreaterThanOrEqual(0);
      expect(updatedProduct.stock).toBeLessThanOrEqual(5);
    });

    it('should not allow negative stock during concurrent decreases', async () => {
      const product = await testHelpers.createTestProduct('Hot Item', 100, 3);
      
      const decreasePromises = [];
      for (let i = 0; i < 20; i++) {
        decreasePromises.push(
          inventoryService.decreaseStock(product.id, 1)
        );
      }
      
      const results = await Promise.allSettled(decreasePromises);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const updatedProduct = await inventoryService.getProduct(product.id);
      
      expect(successCount).toBe(3);
      expect(updatedProduct.stock).toBe(0);
    });
  });

  describe('Order Concurrency Tests', () => {
    it('should handle concurrent order creation for same product', async () => {
      const product = await testHelpers.createTestProduct('Limited Stock', 100, 5);
      
      const orderPromises = [];
      for (let i = 0; i < 20; i++) {
        orderPromises.push(
          testHelpers.createTestOrder(product.id, `user-${i}`)
        );
      }
      
      const results = await Promise.allSettled(orderPromises);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      expect(successCount).toBe(20);
      
      const productAfter = await testHelpers.getProduct(product.id);
      expect(productAfter.stock).toBe(5);
    });
  });

  describe('Payment Concurrency Tests', () => {
    it('should prevent duplicate payments for same order', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id);
      
      const paymentPromises = [];
      for (let i = 0; i < 5; i++) {
        paymentPromises.push(
          request(app)
            .post('/api/payments')
            .send({ orderId: order.orderId })
        );
      }
      
      const results = await Promise.allSettled(paymentPromises);
      
      const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 201
      ).length;
      
      expect(successCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('High Concurrency Scenario - Flash Sale', () => {
    it('should handle flash sale scenario with limited stock correctly', async () => {
      const TOTAL_STOCK = 10;
      const TOTAL_USERS = 100;
      
      const product = await testHelpers.createTestProduct('Flash Sale Item', 99, TOTAL_STOCK);
      
      const orders = [];
      for (let i = 0; i < TOTAL_USERS; i++) {
        const order = await testHelpers.createTestOrder(product.id, `flash-user-${i}`);
        orders.push(order);
      }
      
      expect(orders.length).toBe(TOTAL_USERS);
      
      const successfulPayments = [];
      const failedPayments = [];
      
      for (const order of orders) {
        try {
          const payment = await testHelpers.createTestPayment(order.orderId);
          
          const callbackResult = await testHelpers.sendCallback(payment.transactionId, true);
          
          if (callbackResult.success && !callbackResult.idempotent) {
            successfulPayments.push({
              orderId: order.orderId,
              paymentId: payment.paymentId
            });
          }
        } catch (error) {
          failedPayments.push({ orderId: order.orderId, error: error.message });
        }
      }
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      console.log(`Flash Sale Results:
        Total Users: ${TOTAL_USERS}
        Total Stock: ${TOTAL_STOCK}
        Successful Payments: ${successfulPayments.length}
        Failed Payments: ${failedPayments.length}
        Final Stock: ${finalProduct.stock}`
      );
      
      expect(successfulPayments.length).toBeLessThanOrEqual(TOTAL_STOCK);
      expect(finalProduct.stock).toBeGreaterThanOrEqual(0);
      expect(finalProduct.stock).toBe(TOTAL_STOCK - successfulPayments.length);
    }, 60000);
  });

  describe('Race Condition Tests', () => {
    it('should detect and handle race conditions in payment processing', async () => {
      const product = await testHelpers.createTestProduct('Race Product', 100, 1);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const callbackPromises = [];
      for (let i = 0; i < 10; i++) {
        callbackPromises.push(
          testHelpers.sendCallback(payment.transactionId, true)
        );
      }
      
      const results = await Promise.allSettled(callbackPromises);
      
      const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const idempotentCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.idempotent
      ).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      expect(successCount).toBe(10);
      expect(idempotentCount).toBe(9);
      expect(finalProduct.stock).toBe(0);
    });
  });
});
