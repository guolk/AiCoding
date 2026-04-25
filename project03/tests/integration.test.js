const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');
const TestDataFactory = require('./data/testDataFactory');
const TestDataGenerator = require('./data/testDataGenerator');
const paymentGatewayMock = require('./mocks/paymentGatewayMock');

describe('Integration Tests - Complete Payment Flow', () => {
  beforeEach(() => {
    paymentGatewayMock.reset();
  });

  describe('Normal Payment Flow', () => {
    it('should complete a normal payment flow successfully', async () => {
      const { product, order, payment } = await TestDataFactory.createCompletePaymentFlow({
        productName: 'Normal Product',
        productPrice: 100,
        productStock: 10
      });

      expect(product.stock).toBe(10);
      expect(order.status).toBe('pending');
      expect(payment.status).toBe('pending');

      const callbackResult = await testHelpers.sendCallback(payment.transactionId, true);

      expect(callbackResult.success).toBe(true);
      expect(callbackResult.idempotent).toBe(false);

      const updatedProduct = await testHelpers.getProduct(product.id);
      const updatedOrder = await testHelpers.getOrder(order.orderId);
      const updatedPayment = await testHelpers.getPayment(payment.paymentId);

      expect(updatedProduct.stock).toBe(9);
      expect(updatedOrder.status).toBe('paid');
      expect(updatedPayment.status).toBe('paid');
    });

    it('should handle multiple sequential payments correctly', async () => {
      const product = await TestDataFactory.createTestProduct({
        name: 'Multi-Payment Product',
        price: 50,
        stock: 5
      });

      const payments = [];
      for (let i = 0; i < 5; i++) {
        const order = await TestDataFactory.createTestOrder(
          product.id,
          TestDataGenerator.generateUserId(`seq-user-${i}`)
        );
        const payment = await TestDataFactory.createTestPayment(order.orderId);
        payments.push({ order, payment });
      }

      for (const { order, payment } of payments) {
        const result = await testHelpers.sendCallback(payment.transactionId, true);
        expect(result.success).toBe(true);
      }

      const finalProduct = await testHelpers.getProduct(product.id);
      expect(finalProduct.stock).toBe(0);

      for (const { order } of payments) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        expect(updatedOrder.status).toBe('paid');
      }
    });
  });

  describe('Edge Case Integration Tests', () => {
    it('should reject payment when inventory is zero', async () => {
      const edgeProducts = await TestDataFactory.createEdgeCaseProducts();
      
      const order = await TestDataFactory.createTestOrder(
        edgeProducts.zeroStockProduct.id,
        TestDataGenerator.generateUserId()
      );
      
      const payment = await TestDataFactory.createTestPayment(order.orderId);
      
      try {
        await testHelpers.sendCallback(payment.transactionId, true);
      } catch (error) {
        expect(error.message).toContain('Insufficient stock');
      }

      const updatedOrder = await testHelpers.getOrder(order.orderId);
      expect(updatedOrder.status).toBe('pending');
    });

    it('should handle expensive product payment correctly', async () => {
      const edgeProducts = await TestDataFactory.createEdgeCaseProducts();
      
      const { order, payment } = await TestDataFactory.createCompletePaymentFlow({
        productName: edgeProducts.expensiveProduct.name,
        productPrice: edgeProducts.expensiveProduct.price,
        productStock: 1
      });

      const result = await testHelpers.sendCallback(payment.transactionId, true);
      expect(result.success).toBe(true);

      const updatedOrder = await testHelpers.getOrder(order.orderId);
      expect(updatedOrder.status).toBe('paid');
      expect(updatedOrder.amount).toBe(edgeProducts.expensiveProduct.price);
    });
  });

  describe('Order Cancellation Integration Tests', () => {
    it('should cancel pending order and restore stock', async () => {
      const { product, order, payment } = await TestDataFactory.createCompletePaymentFlow({
        productName: 'Cancellable Product',
        productPrice: 100,
        productStock: 10
      });

      const initialStock = product.stock;

      const cancelResult = await testHelpers.cancelOrder(order.orderId);
      expect(cancelResult.status).toBe('cancelled');

      const updatedOrder = await testHelpers.getOrder(order.orderId);
      const updatedProduct = await testHelpers.getProduct(product.id);

      expect(updatedOrder.status).toBe('cancelled');
    });

    it('should not cancel already paid order', async () => {
      const { order, payment } = await TestDataFactory.createCompletePaymentFlow({
        productName: 'Paid Product',
        productPrice: 100,
        productStock: 10
      });

      await testHelpers.sendCallback(payment.transactionId, true);

      try {
        await testHelpers.cancelOrder(order.orderId);
      } catch (error) {
        expect(error.message).toContain('Cannot cancel');
      }

      const updatedOrder = await testHelpers.getOrder(order.orderId);
      expect(updatedOrder.status).toBe('paid');
    });
  });

  describe('Timeout Order Integration Tests', () => {
    it('should identify and close timeout orders', async () => {
      const { product, orders } = await TestDataFactory.createMultipleOrdersForSingleProduct({
        productName: 'Timeout Product',
        productPrice: 100,
        productStock: 10,
        orderCount: 5
      });

      const closeResult = await request(app)
        .post('/api/orders/close-timeout')
        .send({ timeoutMinutes: 0 })
        .expect(200);

      expect(closeResult.body.count).toBe(5);
      expect(closeResult.body.closedOrders.length).toBe(5);

      for (const order of orders) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        expect(updatedOrder.status).toBe('cancelled');
      }
    });
  });

  describe('Complete End-to-End Scenario', () => {
    it('should handle complete e-commerce payment scenario', async () => {
      const users = TestDataGenerator.generateBatchUsers(5);
      
      const product1 = await TestDataFactory.createTestProduct({
        name: 'Product A - Limited Edition',
        price: 999,
        stock: 3
      });
      
      const product2 = await TestDataFactory.createTestProduct({
        name: 'Product B - Regular',
        price: 199,
        stock: 10
      });

      const orders = [];
      for (let i = 0; i < users.length; i++) {
        const product = i < 3 ? product1 : product2;
        const order = await TestDataFactory.createTestOrder(product.id, users[i].id);
        const payment = await TestDataFactory.createTestPayment(order.orderId);
        orders.push({ order, payment, product });
      }

      for (const { order, payment, product } of orders) {
        const result = await testHelpers.sendCallback(payment.transactionId, true);
        expect(result.success).toBe(true);
      }

      const updatedProduct1 = await testHelpers.getProduct(product1.id);
      const updatedProduct2 = await testHelpers.getProduct(product2.id);

      expect(updatedProduct1.stock).toBe(0);
      expect(updatedProduct2.stock).toBe(10 - 2);

      for (const { order } of orders) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        expect(updatedOrder.status).toBe('paid');
      }
    });
  });

  describe('Data Consistency Verification', () => {
    it('should verify data consistency across all tables', async () => {
      const { product, orders, payments } = await TestDataFactory.createMultipleOrdersForSingleProduct({
        productName: 'Consistency Test Product',
        productPrice: 200,
        productStock: 5,
        orderCount: 10
      });

      const successfulPayments = [];
      const failedPayments = [];

      for (let i = 0; i < payments.length; i++) {
        try {
          const result = await testHelpers.sendCallback(payments[i].transactionId, true);
          if (result.success && !result.idempotent) {
            successfulPayments.push({ order: orders[i], payment: payments[i] });
          }
        } catch (error) {
          failedPayments.push({ order: orders[i], payment: payments[i], error });
        }
      }

      const finalProduct = await testHelpers.getProduct(product.id);
      
      const paidOrders = [];
      const paidPayments = [];
      
      for (const order of orders) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        if (updatedOrder.status === 'paid') {
          paidOrders.push(updatedOrder);
        }
      }

      for (const payment of payments) {
        const updatedPayment = await testHelpers.getPayment(payment.paymentId);
        if (updatedPayment.status === 'paid') {
          paidPayments.push(updatedPayment);
        }
      }

      expect(paidOrders.length).toBe(paidPayments.length);
      expect(finalProduct.stock).toBe(5 - paidOrders.length);
    });
  });
});
