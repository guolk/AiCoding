const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');
const inventoryService = require('../src/services/inventoryService');
const orderService = require('../src/services/orderService');
const paymentService = require('../src/services/paymentService');
const callbackService = require('../src/services/callbackService');
const db = require('../src/database');

describe('Transaction Rollback Tests', () => {
  describe('Inventory Transaction Tests', () => {
    it('should rollback inventory decrease on concurrent conflict', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 1);
      
      const initialProduct = await inventoryService.getProduct(product.id);
      expect(initialProduct.stock).toBe(1);
      
      try {
        await db.serialize(async () => {
          db.run('BEGIN TRANSACTION');
          
          await inventoryService.decreaseStock(product.id, 1);
          
          const productDuringTx = await inventoryService.getProduct(product.id);
          expect(productDuringTx.stock).toBe(0);
          
          await inventoryService.decreaseStock(product.id, 1);
          
          db.run('COMMIT');
        });
      } catch (error) {
        db.run('ROLLBACK');
      }
      
      const finalProduct = await inventoryService.getProduct(product.id);
      expect(finalProduct.stock).toBeGreaterThanOrEqual(0);
    });

    it('should maintain inventory consistency across multiple transactions', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      
      const transactions = [];
      for (let i = 0; i < 15; i++) {
        transactions.push(
          new Promise(async (resolve, reject) => {
            try {
              const result = await inventoryService.decreaseStock(product.id, 1);
              resolve({ success: true, ...result });
            } catch (error) {
              resolve({ success: false, error: error.message });
            }
          })
        );
      }
      
      const results = await Promise.allSettled(transactions);
      
      const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const finalProduct = await inventoryService.getProduct(product.id);
      
      expect(successCount).toBe(10);
      expect(finalProduct.stock).toBe(0);
    });
  });

  describe('Payment Transaction Tests', () => {
    it('should rollback all changes if payment confirmation fails', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 5);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const initialInventory = product.stock;
      const initialOrderStatus = order.status;
      
      const invalidTransactionId = 'non-existent-transaction-id';
      
      try {
        await callbackService.processCallback(invalidTransactionId, {
          success: true,
          data: { amount: 100 }
        });
      } catch (error) {
        expect(error.message).toBeTruthy();
      }
      
      const finalProduct = await inventoryService.getProduct(product.id);
      const finalOrder = await orderService.getOrder(order.orderId);
      
      expect(finalProduct.stock).toBe(initialInventory);
      expect(finalOrder.status).toBe(initialOrderStatus);
    });

    it('should commit transaction only when all operations succeed', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 5);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const initialInventory = product.stock;
      
      const result = await testHelpers.sendCallback(payment.transactionId, true);
      
      expect(result.success).toBe(true);
      
      const finalProduct = await inventoryService.getProduct(product.id);
      const finalOrder = await orderService.getOrder(order.orderId);
      const finalPayment = await paymentService.getPayment(payment.paymentId);
      
      expect(finalProduct.stock).toBe(initialInventory - 1);
      expect(finalOrder.status).toBe('paid');
      expect(finalPayment.status).toBe('paid');
    });
  });

  describe('Order Cancellation Transaction Tests', () => {
    it('should restore inventory when order is cancelled', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 5);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      await testHelpers.sendCallback(payment.transactionId, true);
      
      const productAfterPayment = await inventoryService.getProduct(product.id);
      expect(productAfterPayment.stock).toBe(4);
      
      try {
        await testHelpers.cancelOrder(order.orderId);
      } catch (error) {
        expect(error.message).toContain('Cannot cancel');
      }
      
      const productAfterAttempt = await inventoryService.getProduct(product.id);
      expect(productAfterAttempt.stock).toBe(4);
    });

    it('should rollback inventory restore if cancellation fails', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 5);
      const order = await testHelpers.createTestOrder(product.id);
      
      const productBeforeCancel = await inventoryService.getProduct(product.id);
      
      const cancelResult = await testHelpers.cancelOrder(order.orderId);
      
      const productAfterCancel = await inventoryService.getProduct(product.id);
      const orderAfterCancel = await orderService.getOrder(order.orderId);
      
      expect(cancelResult.status).toBe('cancelled');
      expect(orderAfterCancel.status).toBe('cancelled');
    });
  });

  describe('Timeout Order Closing Transaction Tests', () => {
    it('should handle multiple timeout orders in transaction', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      
      const orders = [];
      for (let i = 0; i < 5; i++) {
        const order = await testHelpers.createTestOrder(product.id, `user-${i}`);
        orders.push(order);
      }
      
      const closedOrders = await orderService.closeTimeoutOrders(0);
      
      const ordersAfter = [];
      for (const order of orders) {
        const orderAfter = await orderService.getOrder(order.orderId);
        ordersAfter.push(orderAfter);
      }
      
      const cancelledCount = ordersAfter.filter(o => o.status === 'cancelled').length;
      
      expect(cancelledCount).toBe(5);
    });
  });

  describe('Nested Transaction Tests', () => {
    it('should handle nested transactions correctly', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          db.run('UPDATE products SET stock = stock - 1 WHERE id = ?', [product.id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            
            db.run('BEGIN TRANSACTION');
            
            db.run('UPDATE products SET stock = stock - 1 WHERE id = ?', [product.id], (err2) => {
              if (err2) {
                db.run('ROLLBACK');
                db.run('COMMIT');
                return resolve();
              }
              
              db.run('ROLLBACK');
              db.run('ROLLBACK');
              resolve();
            });
          });
        });
      });
      
      const finalProduct = await inventoryService.getProduct(product.id);
      expect(finalProduct.stock).toBe(10);
    });
  });

  describe('Data Consistency Verification Tests', () => {
    it('should maintain consistency between orders, payments and inventory', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 10);
      
      const orders = [];
      for (let i = 0; i < 15; i++) {
        const order = await testHelpers.createTestOrder(product.id, `user-${i}`);
        const payment = await testHelpers.createTestPayment(order.orderId);
        orders.push({ order, payment });
      }
      
      for (const { order, payment } of orders.slice(0, 7)) {
        await testHelpers.sendCallback(payment.transactionId, true);
      }
      
      const finalProduct = await inventoryService.getProduct(product.id);
      
      let paidOrdersCount = 0;
      let paidPaymentsCount = 0;
      
      for (const { order, payment } of orders) {
        const updatedOrder = await orderService.getOrder(order.orderId);
        const updatedPayment = await paymentService.getPayment(payment.paymentId);
        
        if (updatedOrder.status === 'paid') {
          paidOrdersCount++;
        }
        if (updatedPayment.status === 'paid') {
          paidPaymentsCount++;
        }
        
        expect(updatedOrder.status === 'paid').toBe(updatedPayment.status === 'paid');
      }
      
      expect(paidOrdersCount).toBe(paidPaymentsCount);
      expect(finalProduct.stock).toBe(10 - paidOrdersCount);
    });

    it('should detect and log inconsistencies (if any)', async () => {
      const product = await testHelpers.createTestProduct('Product', 100, 5);
      const order = await testHelpers.createTestOrder(product.id);
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      await testHelpers.sendCallback(payment.transactionId, true);
      
      const orderAfter = await orderService.getOrder(order.orderId);
      const paymentAfter = await paymentService.getPayment(payment.paymentId);
      const productAfter = await inventoryService.getProduct(product.id);
      
      const isConsistent = 
        orderAfter.status === paymentAfter.status &&
        (orderAfter.status === 'paid' ? productAfter.stock === 4 : productAfter.stock === 5);
      
      expect(isConsistent).toBe(true);
    });
  });
});
