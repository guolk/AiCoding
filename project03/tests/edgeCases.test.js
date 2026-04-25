const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');
const inventoryService = require('../src/services/inventoryService');
const orderService = require('../src/services/orderService');
const paymentService = require('../src/services/paymentService');
const callbackService = require('../src/services/callbackService');
const db = require('../src/database');

describe('Edge Case Tests - Enhanced Coverage', () => {
  describe('Duplicate Payment Prevention Tests', () => {
    it('should prevent creating duplicate payments for the same order', async () => {
      console.log('\n🔒 Testing Duplicate Payment Prevention:');
      
      const product = await testHelpers.createTestProduct('Duplicate Test Product', 100, 10);
      const order = await testHelpers.createTestOrder(product.id, 'dup-test-user');
      
      const payment1 = await testHelpers.createTestPayment(order.orderId);
      console.log(`  First payment created: ${payment1.paymentId}`);
      
      const payment2 = await testHelpers.createTestPayment(order.orderId);
      console.log(`  Second payment created: ${payment2.paymentId}`);
      
      console.log('  Processing first payment...');
      const callback1 = await testHelpers.sendCallback(payment1.transactionId, true);
      console.log(`  First payment result: success=${callback1.success}, idempotent=${callback1.idempotent}`);
      
      try {
        console.log('  Attempting to process second payment...');
        const callback2 = await testHelpers.sendCallback(payment2.transactionId, true);
        console.log(`  Second payment result: success=${callback2.success}, idempotent=${callback2.idempotent}`);
      } catch (error) {
        console.log(`  Second payment failed: ${error.message}`);
      }
      
      const finalProduct = await testHelpers.getProduct(product.id);
      const finalOrder = await testHelpers.getOrder(order.orderId);
      
      console.log('\n  📊 Verification:');
      console.log(`    Order Status: ${finalOrder.status}`);
      console.log(`    Final Stock: ${finalProduct.stock}`);
      console.log(`    Expected Stock: 9 (if 1 payment succeeded)`);
      
      if (finalOrder.status === 'paid') {
        expect(finalProduct.stock).toBe(9);
      }
    });

    it('should prevent multiple payments using same transaction ID', async () => {
      console.log('\n🔗 Testing Same Transaction ID Prevention:');
      
      const product = await testHelpers.createTestProduct('Transaction ID Test', 200, 5);
      const order = await testHelpers.createTestOrder(product.id, 'txn-test-user');
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      console.log(`  Transaction ID: ${payment.transactionId}`);
      
      const results = [];
      for (let i = 0; i < 20; i++) {
        try {
          const result = await testHelpers.sendCallback(payment.transactionId, true);
          results.push({
            attempt: i + 1,
            success: result.success,
            idempotent: result.idempotent
          });
        } catch (error) {
          results.push({
            attempt: i + 1,
            success: false,
            error: error.message
          });
        }
      }
      
      const actualProcesses = results.filter(r => r.success && !r.idempotent).length;
      const idempotentResponses = results.filter(r => r.success && r.idempotent).length;
      const failures = results.filter(r => !r.success).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      const finalOrder = await testHelpers.getOrder(order.orderId);
      
      console.log('\n  📊 Results:');
      console.log(`    Total Attempts: ${results.length}`);
      console.log(`    Actual Processes: ${actualProcesses}`);
      console.log(`    Idempotent Responses: ${idempotentResponses}`);
      console.log(`    Failures: ${failures}`);
      console.log(`    Final Stock: ${finalProduct.stock}`);
      console.log(`    Order Status: ${finalOrder.status}`);
      
      expect(actualProcesses).toBe(1);
      expect(finalProduct.stock).toBe(4);
      expect(finalOrder.status).toBe('paid');
    });

    it('should handle rapid fire payment attempts correctly', async () => {
      console.log('\n⚡ Testing Rapid Fire Payment Attempts:');
      
      const product = await testHelpers.createTestProduct('Rapid Fire Test', 50, 1);
      const order = await testHelpers.createTestOrder(product.id, 'rapid-user');
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      console.log('  Sending 50 rapid callback requests...');
      
      const tasks = [];
      for (let i = 0; i < 50; i++) {
        tasks.push(
          testHelpers.sendCallback(payment.transactionId, true)
        );
      }
      
      const results = await Promise.allSettled(tasks);
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const actualProcess = results.filter(r => 
        r.status === 'fulfilled' && r.value.success && !r.value.idempotent
      ).length;
      const idempotent = results.filter(r => 
        r.status === 'fulfilled' && r.value.success && r.value.idempotent
      ).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      const finalOrder = await testHelpers.getOrder(order.orderId);
      
      console.log('\n  📊 Rapid Fire Results:');
      console.log(`    Total Requests: ${tasks.length}`);
      console.log(`    Successful Responses: ${successful}`);
      console.log(`    Actual Processes: ${actualProcess}`);
      console.log(`    Idempotent Responses: ${idempotent}`);
      console.log(`    Final Stock: ${finalProduct.stock}`);
      console.log(`    Order Status: ${finalOrder.status}`);
      
      expect(actualProcess).toBe(1);
      expect(finalProduct.stock).toBe(0);
      expect(finalOrder.status).toBe('paid');
    });
  });

  describe('Timeout Order Tests', () => {
    it('should close orders that exceed timeout threshold', async () => {
      console.log('\n⏰ Testing Timeout Order Closing:');
      
      const product = await testHelpers.createTestProduct('Timeout Test Product', 100, 20);
      
      console.log('  Creating orders...');
      const orders = [];
      for (let i = 0; i < 10; i++) {
        const order = await testHelpers.createTestOrder(product.id, `timeout-user-${i}`);
        orders.push(order);
      }
      
      console.log('  Closing orders with 0 minute timeout...');
      const result = await request(app)
        .post('/api/orders/close-timeout')
        .send({ timeoutMinutes: 0 })
        .expect(200);
      
      console.log(`  Closed ${result.body.count} orders`);
      
      console.log('  Verifying order statuses...');
      let cancelledCount = 0;
      for (const order of orders) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        if (updatedOrder.status === 'cancelled') {
          cancelledCount++;
        }
      }
      
      console.log('\n  📊 Timeout Results:');
      console.log(`    Total Orders: ${orders.length}`);
      console.log(`    Reported Closed: ${result.body.count}`);
      console.log(`    Actually Cancelled: ${cancelledCount}`);
      
      expect(result.body.count).toBe(10);
      expect(cancelledCount).toBe(10);
    });

    it('should not close orders within timeout window', async () => {
      console.log('\n⏳ Testing Orders Within Timeout Window:');
      
      const product = await testHelpers.createTestProduct('Recent Order Test', 100, 10);
      
      const orders = [];
      for (let i = 0; i < 5; i++) {
        const order = await testHelpers.createTestOrder(product.id, `recent-user-${i}`);
        orders.push(order);
      }
      
      console.log('  Attempting to close with 60 minute timeout...');
      const result = await request(app)
        .post('/api/orders/close-timeout')
        .send({ timeoutMinutes: 60 })
        .expect(200);
      
      console.log(`  Reported closed: ${result.body.count} orders`);
      
      let pendingCount = 0;
      for (const order of orders) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        if (updatedOrder.status === 'pending') {
          pendingCount++;
        }
      }
      
      console.log(`  Actually pending: ${pendingCount} orders`);
      
      expect(result.body.count).toBe(0);
      expect(pendingCount).toBe(5);
    });

    it('should handle mixed timeout and non-timeout orders', async () => {
      console.log('\n🔄 Testing Mixed Timeout Scenario:');
      
      const product = await testHelpers.createTestProduct('Mixed Test Product', 100, 50);
      
      const oldOrders = [];
      for (let i = 0; i < 8; i++) {
        const order = await testHelpers.createTestOrder(product.id, `old-user-${i}`);
        oldOrders.push(order);
      }
      
      console.log('  Closing old orders...');
      await request(app)
        .post('/api/orders/close-timeout')
        .send({ timeoutMinutes: 0 })
        .expect(200);
      
      const recentOrders = [];
      for (let i = 0; i < 5; i++) {
        const order = await testHelpers.createTestOrder(product.id, `recent-user-${i}`);
        recentOrders.push(order);
      }
      
      console.log('  Closing with 60 minute timeout...');
      const result = await request(app)
        .post('/api/orders/close-timeout')
        .send({ timeoutMinutes: 60 })
        .expect(200);
      
      console.log('\n  📊 Mixed Scenario Results:');
      console.log(`    Newly closed: ${result.body.count} orders`);
      
      for (const order of recentOrders) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        expect(updatedOrder.status).toBe('pending');
      }
    });

    it('should restore inventory when cancelling timeout orders', async () => {
      console.log('\n📦 Testing Inventory Restoration on Timeout:');
      
      const product = await testHelpers.createTestProduct('Inventory Restore Test', 100, 20);
      const initialStock = product.stock;
      
      console.log(`  Initial Stock: ${initialStock}`);
      
      const orders = [];
      for (let i = 0; i < 10; i++) {
        const order = await testHelpers.createTestOrder(product.id, `restore-user-${i}`);
        orders.push(order);
      }
      
      console.log('  Closing orders...');
      await request(app)
        .post('/api/orders/close-timeout')
        .send({ timeoutMinutes: 0 })
        .expect(200);
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      console.log(`  Final Stock: ${finalProduct.stock}`);
      
      expect(finalProduct.stock).toBe(initialStock);
    });
  });

  describe('Log Tracing Tests', () => {
    it('should track requests with request ID', async () => {
      console.log('\n🔍 Testing Request ID Tracking:');
      
      const customRequestId = 'test-req-' + Date.now();
      
      console.log(`  Custom Request ID: ${customRequestId}`);
      
      const product = await testHelpers.createTestProduct('Log Test Product', 100, 10);
      
      const response = await request(app)
        .post('/api/orders')
        .set('x-request-id', customRequestId)
        .send({
          productId: product.id,
          userId: 'log-test-user'
        })
        .expect(201);
      
      console.log(`  Response Request ID: ${response.headers['x-request-id']}`);
      
      expect(response.headers['x-request-id']).toBe(customRequestId);
    });

    it('should auto-generate request ID if not provided', async () => {
      console.log('\n🆔 Testing Auto-Generated Request ID:');
      
      const product = await testHelpers.createTestProduct('Auto ID Test', 100, 10);
      
      const response = await request(app)
        .post('/api/orders')
        .send({
          productId: product.id,
          userId: 'auto-id-user'
        })
        .expect(201);
      
      console.log(`  Generated Request ID: ${response.headers['x-request-id']}`);
      
      expect(response.headers['x-request-id']).toBeTruthy();
      expect(response.headers['x-request-id'].length).toBeGreaterThan(0);
    });

    it('should track order and payment in logs', async () => {
      console.log('\n📋 Testing Order and Payment Logging:');
      
      const product = await testHelpers.createTestProduct('Log Tracking Test', 200, 5);
      
      const requestId = 'log-track-' + Date.now();
      
      console.log(`  Request ID: ${requestId}`);
      
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('x-request-id', requestId)
        .send({
          productId: product.id,
          userId: 'log-user'
        })
        .expect(201);
      
      const order = orderResponse.body;
      console.log(`  Order ID: ${order.orderId}`);
      
      const paymentResponse = await request(app)
        .post('/api/payments')
        .set('x-request-id', requestId)
        .send({ orderId: order.orderId })
        .expect(201);
      
      const payment = paymentResponse.body;
      console.log(`  Payment ID: ${payment.paymentId}`);
      
      const callbackResponse = await request(app)
        .post('/api/callbacks')
        .set('x-request-id', requestId)
        .send({
          transactionId: payment.transactionId,
          success: true
        })
        .expect(200);
      
      console.log(`  Callback Success: ${callbackResponse.body.success}`);
      
      const finalOrder = await testHelpers.getOrder(order.orderId);
      const finalProduct = await testHelpers.getProduct(product.id);
      
      console.log('\n  📊 Final State:');
      console.log(`    Order Status: ${finalOrder.status}`);
      console.log(`    Product Stock: ${finalProduct.stock}`);
      
      expect(finalOrder.status).toBe('paid');
      expect(finalProduct.stock).toBe(4);
    });
  });

  describe('Concurrency Edge Cases', () => {
    it('should handle concurrent order creation and cancellation', async () => {
      console.log('\n🔄 Testing Concurrent Create and Cancel:');
      
      const product = await testHelpers.createTestProduct('Concurrent Test', 100, 100);
      
      console.log('  Creating and cancelling orders concurrently...');
      
      const tasks = [];
      for (let i = 0; i < 30; i++) {
        if (i % 2 === 0) {
          tasks.push(async () => {
            try {
              const order = await testHelpers.createTestOrder(product.id, `concurrent-user-${i}`);
              return { type: 'create', orderId: order.orderId, success: true };
            } catch (error) {
              return { type: 'create', success: false, error: error.message };
            }
          });
        } else {
          tasks.push(async () => {
            try {
              const order = await testHelpers.createTestOrder(product.id, `concurrent-cancel-${i}`);
              await testHelpers.cancelOrder(order.orderId);
              return { type: 'cancel', orderId: order.orderId, success: true };
            } catch (error) {
              return { type: 'cancel', success: false, error: error.message };
            }
          });
        }
      }
      
      const results = await Promise.allSettled(tasks.map(t => t()));
      
      const createSuccess = results.filter(r => 
        r.status === 'fulfilled' && r.value.type === 'create' && r.value.success
      ).length;
      
      const cancelSuccess = results.filter(r => 
        r.status === 'fulfilled' && r.value.type === 'cancel' && r.value.success
      ).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      console.log('\n  📊 Concurrent Operation Results:');
      console.log(`    Create Success: ${createSuccess}`);
      console.log(`    Cancel Success: ${cancelSuccess}`);
      console.log(`    Final Stock: ${finalProduct.stock}`);
      
      expect(finalProduct.stock).toBe(100);
    });

    it('should handle read and write operations concurrently', async () => {
      console.log('\n📖 Testing Concurrent Reads and Writes:');
      
      const product = await testHelpers.createTestProduct('Read Write Test', 100, 50);
      
      console.log('  Running concurrent reads and writes...');
      
      const tasks = [];
      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) {
          tasks.push(async () => {
            try {
              await inventoryService.decreaseStock(product.id, 1);
              return { type: 'write', success: true };
            } catch (error) {
              return { type: 'write', success: false, error: error.message };
            }
          });
        } else {
          tasks.push(async () => {
            try {
              const p = await inventoryService.getProduct(product.id);
              return { type: 'read', success: true, stock: p.stock };
            } catch (error) {
              return { type: 'read', success: false, error: error.message };
            }
          });
        }
      }
      
      const results = await Promise.allSettled(tasks.map(t => t()));
      
      const writeSuccess = results.filter(r => 
        r.status === 'fulfilled' && r.value.type === 'write' && r.value.success
      ).length;
      
      const readSuccess = results.filter(r => 
        r.status === 'fulfilled' && r.value.type === 'read' && r.value.success
      ).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      console.log('\n  📊 Read/Write Results:');
      console.log(`    Total Operations: ${tasks.length}`);
      console.log(`    Write Success: ${writeSuccess}`);
      console.log(`    Read Success: ${readSuccess}`);
      console.log(`    Initial Stock: 50`);
      console.log(`    Final Stock: ${finalProduct.stock}`);
      console.log(`    Expected Stock: ${50 - writeSuccess}`);
      
      expect(finalProduct.stock).toBe(50 - writeSuccess);
    });
  });

  describe('Extreme Edge Cases', () => {
    it('should handle very small inventory (1 item) with high concurrency', async () => {
      console.log('\n🎯 Testing Single Item High Concurrency:');
      
      const product = await testHelpers.createTestProduct('Single Item', 999, 1);
      
      console.log('  Creating 200 payment attempts for 1 item...');
      
      const orders = [];
      for (let i = 0; i < 200; i++) {
        const order = await testHelpers.createTestOrder(product.id, `single-user-${i}`);
        const payment = await testHelpers.createTestPayment(order.orderId);
        orders.push({ order, payment });
      }
      
      const tasks = orders.map(({ payment }) => 
        testHelpers.sendCallback(payment.transactionId, true)
      );
      
      const results = await Promise.allSettled(tasks);
      
      const actualPayments = results.filter(r => 
        r.status === 'fulfilled' && r.value.success && !r.value.idempotent
      ).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      console.log('\n  📊 Single Item Results:');
      console.log(`    Total Attempts: ${tasks.length}`);
      console.log(`    Actual Payments: ${actualPayments}`);
      console.log(`    Final Stock: ${finalProduct.stock}`);
      
      expect(actualPayments).toBe(1);
      expect(finalProduct.stock).toBe(0);
    }, 120000);

    it('should handle zero inventory correctly', async () => {
      console.log('\n❌ Testing Zero Inventory:');
      
      const product = await testHelpers.createTestProduct('Zero Stock', 100, 0);
      
      const order = await testHelpers.createTestOrder(product.id, 'zero-user');
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      try {
        await testHelpers.sendCallback(payment.transactionId, true);
        console.log('  Unexpected: Payment succeeded');
      } catch (error) {
        console.log(`  Expected: Payment failed - ${error.message}`);
      }
      
      const finalProduct = await testHelpers.getProduct(product.id);
      const finalOrder = await testHelpers.getOrder(order.orderId);
      
      console.log('\n  📊 Zero Inventory Results:');
      console.log(`    Final Stock: ${finalProduct.stock}`);
      console.log(`    Order Status: ${finalOrder.status}`);
      
      expect(finalProduct.stock).toBe(0);
      expect(finalOrder.status).toBe('pending');
    });

    it('should handle large number of pending orders', async () => {
      console.log('\n📋 Testing Large Number of Pending Orders:');
      
      const product = await testHelpers.createTestProduct('Large Scale Test', 100, 100);
      
      console.log('  Creating 100 pending orders...');
      const orders = [];
      for (let i = 0; i < 100; i++) {
        const order = await testHelpers.createTestOrder(product.id, `pending-user-${i}`);
        orders.push(order);
      }
      
      console.log('  Processing 50 payments...');
      for (let i = 0; i < 50; i++) {
        const payment = await testHelpers.createTestPayment(orders[i].orderId);
        await testHelpers.sendCallback(payment.transactionId, true);
      }
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      let paidCount = 0;
      let pendingCount = 0;
      for (const order of orders) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        if (updatedOrder.status === 'paid') paidCount++;
        if (updatedOrder.status === 'pending') pendingCount++;
      }
      
      console.log('\n  📊 Large Scale Results:');
      console.log(`    Total Orders: ${orders.length}`);
      console.log(`    Paid Orders: ${paidCount}`);
      console.log(`    Pending Orders: ${pendingCount}`);
      console.log(`    Final Stock: ${finalProduct.stock}`);
      
      expect(paidCount).toBe(50);
      expect(finalProduct.stock).toBe(50);
    }, 120000);
  });
});
