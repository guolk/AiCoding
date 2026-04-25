const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');
const inventoryService = require('../src/services/inventoryService');
const orderService = require('../src/services/orderService');
const paymentService = require('../src/services/paymentService');
const { v4: uuidv4 } = require('uuid');

describe('High Concurrency Tests - Enhanced', () => {
  const CONCURRENCY_LEVELS = {
    LOW: 50,
    MEDIUM: 200,
    HIGH: 500,
    VERY_HIGH: 1000
  };

  const generateDetailedReport = (scenario, stats) => {
    const report = {
      scenario,
      timestamp: new Date().toISOString(),
      totalRequests: stats.totalRequests,
      successfulRequests: stats.successfulRequests,
      failedRequests: stats.failedRequests,
      successRate: ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%',
      errorsByType: stats.errorsByType || {},
      averageResponseTime: stats.averageResponseTime ? stats.averageResponseTime.toFixed(2) + 'ms' : 'N/A',
      dataConsistency: stats.dataConsistency || 'Not verified'
    };
    
    console.log('\n' + '='.repeat(80));
    console.log(`CONCURRENCY TEST REPORT: ${scenario}`);
    console.log('='.repeat(80));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(80) + '\n');
    
    return report;
  };

  const runWithConcurrencyControl = async (tasks, maxConcurrency = 50) => {
    const results = [];
    let currentIndex = 0;
    
    const workers = [];
    for (let i = 0; i < maxConcurrency; i++) {
      workers.push(
        (async () => {
          while (currentIndex < tasks.length) {
            const taskIndex = currentIndex++;
            if (taskIndex < tasks.length) {
              try {
                const result = await tasks[taskIndex]();
                results.push({ index: taskIndex, success: true, result });
              } catch (error) {
                results.push({ index: taskIndex, success: false, error: error.message });
              }
            }
          }
        })()
      );
    }
    
    await Promise.all(workers);
    return results.sort((a, b) => a.index - b.index);
  };

  describe('Ultra High Concurrency Inventory Tests', () => {
    it('should handle 500 concurrent stock decrease requests with version control', async () => {
      const TOTAL_STOCK = 50;
      const CONCURRENT_REQUESTS = 500;
      
      const product = await testHelpers.createTestProduct('High Concurrency Item', 100, TOTAL_STOCK);
      
      const tasks = [];
      const startTime = Date.now();
      const errorsByType = {};
      
      for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        tasks.push(async () => {
          try {
            const response = await request(app)
              .post(`/api/inventory/${product.id}/decrease`)
              .send({ quantity: 1 })
              .timeout(30000);
            return { status: response.status, body: response.body };
          } catch (error) {
            const errorType = error.message || 'Unknown';
            errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
            throw error;
          }
        });
      }
      
      const results = await runWithConcurrencyControl(tasks, 50);
      const endTime = Date.now();
      
      const successCount = results.filter(r => r.success && r.result.status === 200).length;
      const failCount = results.filter(r => !r.success || (r.result && r.result.status !== 200)).length;
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      const stats = {
        totalRequests: CONCURRENT_REQUESTS,
        successfulRequests: successCount,
        failedRequests: failCount,
        averageResponseTime: (endTime - startTime) / CONCURRENT_REQUESTS,
        errorsByType,
        dataConsistency: {
          initialStock: TOTAL_STOCK,
          finalStock: finalProduct.stock,
          expectedStock: TOTAL_STOCK - successCount,
          isConsistent: finalProduct.stock === TOTAL_STOCK - successCount
        }
      };
      
      generateDetailedReport('500 Concurrent Stock Decreases', stats);
      
      expect(successCount).toBeLessThanOrEqual(TOTAL_STOCK);
      expect(finalProduct.stock).toBeGreaterThanOrEqual(0);
      expect(finalProduct.stock).toBe(TOTAL_STOCK - successCount);
    }, 120000);

    it('should handle 200 concurrent inventory check and update operations', async () => {
      const TOTAL_STOCK = 20;
      const CONCURRENT_REQUESTS = 200;
      
      const product = await testHelpers.createTestProduct('Race Condition Item', 100, TOTAL_STOCK);
      
      const tasks = [];
      const errorsByType = {};
      
      for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        const operationType = i % 3;
        
        if (operationType === 0) {
          tasks.push(async () => {
            try {
              const response = await request(app)
                .get(`/api/inventory/${product.id}`);
              return { type: 'read', status: response.status, body: response.body };
            } catch (error) {
              errorsByType['read_error'] = (errorsByType['read_error'] || 0) + 1;
              throw error;
            }
          });
        } else if (operationType === 1) {
          tasks.push(async () => {
            try {
              const response = await request(app)
                .post(`/api/inventory/${product.id}/decrease`)
                .send({ quantity: 1 });
              return { type: 'decrease', status: response.status, body: response.body };
            } catch (error) {
              const errorType = error.response?.body?.error || 'decrease_error';
              errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
              throw error;
            }
          });
        } else {
          tasks.push(async () => {
            try {
              const response = await request(app)
                .post(`/api/inventory/${product.id}/reset`)
                .send({ stock: TOTAL_STOCK });
              return { type: 'reset', status: response.status, body: response.body };
            } catch (error) {
              errorsByType['reset_error'] = (errorsByType['reset_error'] || 0) + 1;
              throw error;
            }
          });
        }
      }
      
      const results = await runWithConcurrencyControl(tasks, 30);
      
      const readResults = results.filter(r => r.success && r.result.type === 'read');
      const decreaseResults = results.filter(r => r.success && r.result.type === 'decrease' && r.result.status === 200);
      const resetResults = results.filter(r => r.success && r.result.type === 'reset');
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      console.log('\nMixed Operation Results:');
      console.log(`  Read operations: ${readResults.length}`);
      console.log(`  Successful decreases: ${decreaseResults.length}`);
      console.log(`  Reset operations: ${resetResults.length}`);
      console.log(`  Final stock: ${finalProduct.stock}`);
      
      expect(finalProduct.stock).toBeGreaterThanOrEqual(0);
    }, 90000);
  });

  describe('Ultra High Concurrency Payment Tests', () => {
    it('should handle 300 concurrent payment attempts with limited stock', async () => {
      const TOTAL_STOCK = 30;
      const TOTAL_USERS = 300;
      
      console.log(`\nStarting High Concurrency Payment Test:`);
      console.log(`  Total Stock: ${TOTAL_STOCK}`);
      console.log(`  Total Users: ${TOTAL_USERS}`);
      
      const product = await testHelpers.createTestProduct('Premium Flash Sale', 999, TOTAL_STOCK);
      
      console.log('  Creating orders...');
      const orders = [];
      for (let i = 0; i < TOTAL_USERS; i++) {
        const order = await testHelpers.createTestOrder(product.id, `hc-user-${i}-${uuidv4()}`);
        orders.push(order);
      }
      
      console.log('  Creating payments...');
      const payments = [];
      for (const order of orders) {
        const payment = await testHelpers.createTestPayment(order.orderId);
        payments.push({ order, payment });
      }
      
      console.log('  Running concurrent callbacks...');
      const startTime = Date.now();
      const errorsByType = {};
      
      const tasks = payments.map(({ order, payment }, index) => async () => {
        try {
          const result = await testHelpers.sendCallback(payment.transactionId, true);
          return { 
            index, 
            orderId: order.orderId, 
            paymentId: payment.paymentId,
            transactionId: payment.transactionId,
            success: result.success,
            idempotent: result.idempotent,
            message: result.message
          };
        } catch (error) {
          const errorType = error.message || 'Unknown Error';
          errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
          return {
            index,
            orderId: order.orderId,
            success: false,
            error: error.message
          };
        }
      });
      
      const results = await runWithConcurrencyControl(tasks, 50);
      const endTime = Date.now();
      
      const successfulPayments = results.filter(r => r.success && r.result && r.result.success && !r.result.idempotent);
      const idempotentPayments = results.filter(r => r.success && r.result && r.result.idempotent);
      const failedPayments = results.filter(r => !r.success || (r.result && !r.result.success));
      
      const finalProduct = await testHelpers.getProduct(product.id);
      
      let finalPaidOrders = 0;
      let finalPaidPayments = 0;
      
      for (const { order, payment } of payments) {
        const updatedOrder = await testHelpers.getOrder(order.orderId);
        const updatedPayment = await testHelpers.getPayment(payment.paymentId);
        
        if (updatedOrder.status === 'paid') finalPaidOrders++;
        if (updatedPayment.status === 'paid') finalPaidPayments++;
      }
      
      const stats = {
        totalRequests: TOTAL_USERS,
        successfulRequests: successfulPayments.length,
        failedRequests: failedPayments.length,
        idempotentRequests: idempotentPayments.length,
        averageResponseTime: (endTime - startTime) / TOTAL_USERS,
        totalTime: (endTime - startTime) + 'ms',
        errorsByType,
        dataConsistency: {
          initialStock: TOTAL_STOCK,
          finalStock: finalProduct.stock,
          successfulPayments: successfulPayments.length,
          finalPaidOrders,
          finalPaidPayments,
          isConsistent: 
            finalProduct.stock === TOTAL_STOCK - finalPaidOrders &&
            finalPaidOrders === finalPaidPayments
        }
      };
      
      generateDetailedReport('300 Concurrent Payment Attempts', stats);
      
      expect(successfulPayments.length).toBeLessThanOrEqual(TOTAL_STOCK);
      expect(finalProduct.stock).toBeGreaterThanOrEqual(0);
      expect(finalPaidOrders).toBe(finalPaidPayments);
      expect(finalProduct.stock).toBe(TOTAL_STOCK - finalPaidOrders);
    }, 180000);

    it('should handle 1000 concurrent duplicate payment prevention checks', async () => {
      const product = await testHelpers.createTestProduct('Single Item', 100, 1);
      const order = await testHelpers.createTestOrder(product.id, 'single-user');
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      const TOTAL_ATTEMPTS = 1000;
      
      console.log(`\nStarting Duplicate Payment Prevention Test:`);
      console.log(`  Total Attempts: ${TOTAL_ATTEMPTS}`);
      console.log(`  Transaction ID: ${payment.transactionId}`);
      
      const tasks = [];
      const errorsByType = {};
      
      for (let i = 0; i < TOTAL_ATTEMPTS; i++) {
        tasks.push(async () => {
          try {
            const result = await testHelpers.sendCallback(payment.transactionId, true);
            return { 
              attempt: i,
              success: result.success,
              idempotent: result.idempotent
            };
          } catch (error) {
            const errorType = error.message || 'Unknown';
            errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
            return {
              attempt: i,
              success: false,
              error: error.message
            };
          }
        });
      }
      
      const startTime = Date.now();
      const results = await runWithConcurrencyControl(tasks, 100);
      const endTime = Date.now();
      
      const actualProcessing = results.filter(r => r.success && r.result && r.result.success && !r.result.idempotent);
      const idempotentResponses = results.filter(r => r.success && r.result && r.result.idempotent);
      const failedAttempts = results.filter(r => !r.success);
      
      const finalProduct = await testHelpers.getProduct(product.id);
      const finalOrder = await testHelpers.getOrder(order.orderId);
      const finalPayment = await testHelpers.getPayment(payment.paymentId);
      
      const stats = {
        totalRequests: TOTAL_ATTEMPTS,
        successfulRequests: actualProcessing.length + idempotentResponses.length,
        actualProcessing: actualProcessing.length,
        idempotentResponses: idempotentResponses.length,
        failedRequests: failedAttempts.length,
        totalTime: (endTime - startTime) + 'ms',
        errorsByType,
        dataConsistency: {
          finalStock: finalProduct.stock,
          orderStatus: finalOrder.status,
          paymentStatus: finalPayment.status,
          isConsistent: 
            finalProduct.stock === 0 &&
            finalOrder.status === 'paid' &&
            finalPayment.status === 'paid'
        }
      };
      
      generateDetailedReport('1000 Concurrent Duplicate Payment Prevention', stats);
      
      expect(actualProcessing.length).toBe(1);
      expect(idempotentResponses.length).toBe(TOTAL_ATTEMPTS - 1 - failedAttempts.length);
      expect(finalProduct.stock).toBe(0);
      expect(finalOrder.status).toBe('paid');
      expect(finalPayment.status).toBe('paid');
    }, 120000);
  });

  describe('Multiple Product Concurrency Tests', () => {
    it('should handle concurrent payments across multiple products', async () => {
      const PRODUCT_COUNT = 10;
      const USERS_PER_PRODUCT = 50;
      const STOCK_PER_PRODUCT = 10;
      
      console.log(`\nStarting Multiple Product Concurrency Test:`);
      console.log(`  Products: ${PRODUCT_COUNT}`);
      console.log(`  Users per Product: ${USERS_PER_PRODUCT}`);
      console.log(`  Stock per Product: ${STOCK_PER_PRODUCT}`);
      console.log(`  Total Users: ${PRODUCT_COUNT * USERS_PER_PRODUCT}`);
      
      const products = [];
      for (let i = 0; i < PRODUCT_COUNT; i++) {
        const product = await testHelpers.createTestProduct(
          `Multi-Product ${i + 1}`,
          (i + 1) * 100,
          STOCK_PER_PRODUCT
        );
        products.push(product);
      }
      
      const allPayments = [];
      for (const product of products) {
        for (let i = 0; i < USERS_PER_PRODUCT; i++) {
          const order = await testHelpers.createTestOrder(
            product.id, 
            `mp-user-${product.id}-${i}`
          );
          const payment = await testHelpers.createTestPayment(order.orderId);
          allPayments.push({ product, order, payment });
        }
      }
      
      const tasks = allPayments.map(({ product, order, payment }) => async () => {
        try {
          const result = await testHelpers.sendCallback(payment.transactionId, true);
          return {
            productId: product.id,
            orderId: order.orderId,
            success: result.success,
            idempotent: result.idempotent
          };
        } catch (error) {
          return {
            productId: product.id,
            orderId: order.orderId,
            success: false,
            error: error.message
          };
        }
      });
      
      console.log('  Processing payments...');
      const results = await runWithConcurrencyControl(tasks, 50);
      
      const productStats = {};
      for (const product of products) {
        const productResults = results.filter(r => r.result && r.result.productId === product.id);
        const successful = productResults.filter(r => r.success && r.result && r.result.success && !r.result.idempotent);
        productStats[product.id] = {
          total: USERS_PER_PRODUCT,
          successful: successful.length,
          initialStock: STOCK_PER_PRODUCT
        };
      }
      
      let totalSuccessful = 0;
      let totalConsistent = 0;
      
      for (const product of products) {
        const finalProduct = await testHelpers.getProduct(product.id);
        const stats = productStats[product.id];
        stats.finalStock = finalProduct.stock;
        stats.expectedStock = STOCK_PER_PRODUCT - stats.successful;
        stats.isConsistent = finalProduct.stock === stats.expectedStock;
        
        totalSuccessful += stats.successful;
        if (stats.isConsistent) totalConsistent++;
        
        console.log(`\n  Product ${product.id}:`);
        console.log(`    Successful Payments: ${stats.successful}`);
        console.log(`    Final Stock: ${stats.finalStock}`);
        console.log(`    Expected Stock: ${stats.expectedStock}`);
        console.log(`    Consistent: ${stats.isConsistent}`);
      }
      
      console.log(`\nSummary:`);
      console.log(`  Total Successful Payments: ${totalSuccessful}`);
      console.log(`  Consistent Products: ${totalConsistent}/${PRODUCT_COUNT}`);
      
      expect(totalConsistent).toBe(PRODUCT_COUNT);
    }, 180000);
  });
});
