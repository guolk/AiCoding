const request = require('supertest');
const app = require('../src/app');
const testHelpers = require('./testHelpers');
const inventoryService = require('../src/services/inventoryService');
const orderService = require('../src/services/orderService');
const paymentService = require('../src/services/paymentService');
const callbackService = require('../src/services/callbackService');
const db = require('../src/database');

describe('Transaction Rollback Analytics Tests', () => {
  class RollbackStatistics {
    constructor() {
      this.totalTransactions = 0;
      this.successfulCommits = 0;
      this.rolledBackTransactions = 0;
      this.rollbackReasons = {};
      this.rollbackDetails = [];
      this.dataConsistencyChecks = [];
    }

    recordTransaction(type, success, reason = null, details = {}) {
      this.totalTransactions++;
      
      if (success) {
        this.successfulCommits++;
      } else {
        this.rolledBackTransactions++;
        const reasonKey = reason || 'Unknown';
        this.rollbackReasons[reasonKey] = (this.rollbackReasons[reasonKey] || 0) + 1;
        this.rollbackDetails.push({
          type,
          reason: reasonKey,
          timestamp: new Date().toISOString(),
          ...details
        });
      }
    }

    recordConsistencyCheck(isConsistent, details = {}) {
      this.dataConsistencyChecks.push({
        isConsistent,
        timestamp: new Date().toISOString(),
        ...details
      });
    }

    generateReport() {
      const successRate = this.totalTransactions > 0 
        ? ((this.successfulCommits / this.totalTransactions) * 100).toFixed(2)
        : '0';
      
      const rollbackRate = this.totalTransactions > 0
        ? ((this.rolledBackTransactions / this.totalTransactions) * 100).toFixed(2)
        : '0';
      
      const consistentChecks = this.dataConsistencyChecks.filter(c => c.isConsistent).length;
      const consistencyRate = this.dataConsistencyChecks.length > 0
        ? ((consistentChecks / this.dataConsistencyChecks.length) * 100).toFixed(2)
        : 'N/A';

      return {
        summary: {
          totalTransactions: this.totalTransactions,
          successfulCommits: this.successfulCommits,
          rolledBackTransactions: this.rolledBackTransactions,
          successRate: successRate + '%',
          rollbackRate: rollbackRate + '%'
        },
        rollbackAnalysis: {
          rollbackReasons: this.rollbackReasons,
          topReasons: Object.entries(this.rollbackReasons)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([reason, count]) => ({ reason, count })),
          recentRollbacks: this.rollbackDetails.slice(-10)
        },
        dataConsistency: {
          totalChecks: this.dataConsistencyChecks.length,
          consistentChecks,
          inconsistentChecks: this.dataConsistencyChecks.length - consistentChecks,
          consistencyRate: consistencyRate + '%'
        }
      };
    }

    printReport() {
      const report = this.generateReport();
      
      console.log('\n' + '='.repeat(80));
      console.log('TRANSACTION ROLLBACK ANALYTICS REPORT');
      console.log('='.repeat(80));
      
      console.log('\n📊 SUMMARY:');
      console.log(`  Total Transactions: ${report.summary.totalTransactions}`);
      console.log(`  ✅ Successful Commits: ${report.summary.successfulCommits} (${report.summary.successRate})`);
      console.log(`  ❌ Rolled Back: ${report.summary.rolledBackTransactions} (${report.summary.rollbackRate})`);
      
      if (Object.keys(report.rollbackAnalysis.rollbackReasons).length > 0) {
        console.log('\n🔍 ROLLBACK REASONS:');
        for (const [reason, count] of Object.entries(report.rollbackAnalysis.rollbackReasons)) {
          const percentage = ((count / report.summary.rolledBackTransactions) * 100).toFixed(1);
          console.log(`  - ${reason}: ${count} (${percentage}%)`);
        }
        
        console.log('\n📈 TOP ROLLBACK REASONS:');
        for (const { reason, count } of report.rollbackAnalysis.topReasons) {
          console.log(`  ${reason}: ${count} occurrences`);
        }
      }
      
      console.log('\n✅ DATA CONSISTENCY:');
      console.log(`  Total Checks: ${report.dataConsistency.totalChecks}`);
      console.log(`  Consistent: ${report.dataConsistency.consistentChecks}`);
      console.log(`  Inconsistent: ${report.dataConsistency.inconsistentChecks}`);
      console.log(`  Consistency Rate: ${report.dataConsistency.consistencyRate}`);
      
      console.log('\n' + '='.repeat(80) + '\n');
      
      return report;
    }
  }

  const verifyDataConsistency = async (product, orders, payments, initialStock) => {
    const finalProduct = await inventoryService.getProduct(product.id);
    
    let paidOrdersCount = 0;
    let paidPaymentsCount = 0;
    
    for (let i = 0; i < orders.length; i++) {
      const updatedOrder = await orderService.getOrder(orders[i].orderId);
      const updatedPayment = await paymentService.getPayment(payments[i].paymentId);
      
      if (updatedOrder.status === 'paid') paidOrdersCount++;
      if (updatedPayment.status === 'paid') paidPaymentsCount++;
      
      if (updatedOrder.status === 'paid' !== updatedPayment.status === 'paid') {
        return {
          isConsistent: false,
          reason: 'Order and Payment status mismatch',
          details: {
            orderId: orders[i].orderId,
            orderStatus: updatedOrder.status,
            paymentStatus: updatedPayment.status
          }
        };
      }
    }
    
    const expectedStock = initialStock - paidOrdersCount;
    const stockConsistent = finalProduct.stock === expectedStock;
    
    const orderPaymentConsistent = paidOrdersCount === paidPaymentsCount;
    
    return {
      isConsistent: stockConsistent && orderPaymentConsistent,
      details: {
        initialStock,
        finalStock: finalProduct.stock,
        expectedStock,
        paidOrdersCount,
        paidPaymentsCount,
        stockConsistent,
        orderPaymentConsistent
      }
    };
  };

  describe('Rollback Statistics Collection', () => {
    it('should track and report inventory rollbacks with detailed statistics', async () => {
      const stats = new RollbackStatistics();
      
      const product = await testHelpers.createTestProduct('Analytics Test Product', 100, 5);
      const initialStock = product.stock;
      
      console.log('\nTesting inventory rollback scenarios...');
      
      for (let i = 0; i < 10; i++) {
        try {
          const result = await inventoryService.decreaseStock(product.id, 1);
          stats.recordTransaction('inventory_decrease', true, null, { 
            productId: product.id,
            oldStock: result.oldStock,
            newStock: result.newStock
          });
        } catch (error) {
          stats.recordTransaction('inventory_decrease', false, error.message, {
            productId: product.id,
            attempt: i + 1
          });
        }
      }
      
      const finalProduct = await inventoryService.getProduct(product.id);
      stats.recordConsistencyCheck(finalProduct.stock >= 0, {
        productId: product.id,
        initialStock,
        finalStock: finalProduct.stock
      });
      
      const report = stats.printReport();
      
      console.log('Verification:');
      console.log(`  Expected successful decreases: 5`);
      console.log(`  Actual successful decreases: ${report.summary.successfulCommits}`);
      console.log(`  Expected rollbacks: 5`);
      console.log(`  Actual rollbacks: ${report.summary.rolledBackTransactions}`);
      
      expect(report.summary.successfulCommits).toBe(5);
      expect(report.summary.rolledBackTransactions).toBe(5);
      expect(report.rollbackAnalysis.rollbackReasons['Insufficient stock']).toBe(5);
      expect(finalProduct.stock).toBe(0);
    });

    it('should track payment transaction rollbacks with detailed analytics', async () => {
      const stats = new RollbackStatistics();
      
      const product = await testHelpers.createTestProduct('Payment Rollback Test', 200, 3);
      const initialStock = product.stock;
      
      const orders = [];
      const payments = [];
      
      console.log('\nCreating test orders and payments...');
      for (let i = 0; i < 10; i++) {
        const order = await testHelpers.createTestOrder(product.id, `analytics-user-${i}`);
        const payment = await testHelpers.createTestPayment(order.orderId);
        orders.push(order);
        payments.push(payment);
      }
      
      console.log('Processing payments...');
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        const order = orders[i];
        
        try {
          const result = await testHelpers.sendCallback(payment.transactionId, true);
          
          if (result.success && !result.idempotent) {
            stats.recordTransaction('payment_confirmation', true, null, {
              orderId: order.orderId,
              paymentId: payment.paymentId,
              transactionId: payment.transactionId
            });
          } else if (result.idempotent) {
            stats.recordTransaction('payment_confirmation', true, 'Idempotent response', {
              orderId: order.orderId,
              note: 'Already processed'
            });
          }
        } catch (error) {
          stats.recordTransaction('payment_confirmation', false, error.message, {
            orderId: order.orderId,
            paymentId: payment.paymentId
          });
        }
      }
      
      const consistencyResult = await verifyDataConsistency(product, orders, payments, initialStock);
      stats.recordConsistencyCheck(consistencyResult.isConsistent, consistencyResult.details);
      
      const report = stats.printReport();
      
      console.log('📊 Payment Rollback Analysis:');
      console.log(`  Initial Stock: ${initialStock}`);
      console.log(`  Total Payment Attempts: ${report.summary.totalTransactions}`);
      console.log(`  Successful Payments: ${report.summary.successfulCommits}`);
      console.log(`  Rolled Back Payments: ${report.summary.rolledBackTransactions}`);
      
      expect(consistencyResult.isConsistent).toBe(true);
      expect(report.summary.successfulCommits).toBeLessThanOrEqual(initialStock);
    });

    it('should track concurrent payment rollbacks with comprehensive analytics', async () => {
      const stats = new RollbackStatistics();
      
      const TOTAL_STOCK = 10;
      const TOTAL_USERS = 100;
      
      console.log(`\n🚀 High Concurrency Rollback Analysis:`);
      console.log(`  Stock: ${TOTAL_STOCK}`);
      console.log(`  Users: ${TOTAL_USERS}`);
      
      const product = await testHelpers.createTestProduct('High Concurrency Rollback Test', 99, TOTAL_STOCK);
      const initialStock = product.stock;
      
      const orders = [];
      const payments = [];
      
      console.log('  Creating orders...');
      for (let i = 0; i < TOTAL_USERS; i++) {
        const order = await testHelpers.createTestOrder(product.id, `hc-rollback-user-${i}`);
        const payment = await testHelpers.createTestPayment(order.orderId);
        orders.push(order);
        payments.push(payment);
      }
      
      console.log('  Processing concurrent payments...');
      const tasks = payments.map((payment, index) => async () => {
        try {
          const result = await testHelpers.sendCallback(payment.transactionId, true);
          
          if (result.success && !result.idempotent) {
            return {
              type: 'success',
              orderId: orders[index].orderId,
              paymentId: payment.paymentId
            };
          } else if (result.idempotent) {
            return {
              type: 'idempotent',
              orderId: orders[index].orderId
            };
          }
        } catch (error) {
          return {
            type: 'rollback',
            reason: error.message,
            orderId: orders[index].orderId
          };
        }
        return { type: 'unknown' };
      });
      
      const results = [];
      const concurrencyLimit = 20;
      for (let i = 0; i < tasks.length; i += concurrencyLimit) {
        const batch = tasks.slice(i, i + concurrencyLimit);
        const batchResults = await Promise.allSettled(batch.map(t => t()));
        results.push(...batchResults);
      }
      
      console.log('  Analyzing results...');
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const value = result.value;
          if (value.type === 'success') {
            stats.recordTransaction('concurrent_payment', true, null, value);
          } else if (value.type === 'rollback') {
            stats.recordTransaction('concurrent_payment', false, value.reason, value);
          }
        } else {
          stats.recordTransaction('concurrent_payment', false, result.reason?.message || 'Promise rejected');
        }
      }
      
      const consistencyResult = await verifyDataConsistency(product, orders, payments, initialStock);
      stats.recordConsistencyCheck(consistencyResult.isConsistent, consistencyResult.details);
      
      const report = stats.printReport();
      
      console.log('🎯 Final Verification:');
      console.log(`  Total Transactions: ${report.summary.totalTransactions}`);
      console.log(`  Successful: ${report.summary.successfulCommits}`);
      console.log(`  Rolled Back: ${report.summary.rolledBackTransactions}`);
      console.log(`  Data Consistent: ${consistencyResult.isConsistent}`);
      
      if (Object.keys(report.rollbackAnalysis.rollbackReasons).length > 0) {
        console.log('\n🔍 Rollback Reasons Breakdown:');
        for (const [reason, count] of Object.entries(report.rollbackAnalysis.rollbackReasons)) {
          const percentage = ((count / report.summary.rolledBackTransactions) * 100).toFixed(1);
          console.log(`  • ${reason}: ${count} (${percentage}%)`);
        }
      }
      
      expect(consistencyResult.isConsistent).toBe(true);
      expect(report.summary.successfulCommits).toBeLessThanOrEqual(TOTAL_STOCK);
      expect(report.dataConsistency.consistencyRate).toBe('100.00%');
    }, 120000);
  });

  describe('Rollback Cause Analysis', () => {
    it('should identify and categorize different rollback causes', async () => {
      const stats = new RollbackStatistics();
      
      console.log('\n🔬 Analyzing Different Rollback Causes:');
      
      const product1 = await testHelpers.createTestProduct('Zero Stock Product', 100, 0);
      try {
        await inventoryService.decreaseStock(product1.id, 1);
        stats.recordTransaction('test', true);
      } catch (error) {
        stats.recordTransaction('test', false, error.message, { category: 'Insufficient Stock' });
      }
      
      const product2 = await testHelpers.createTestProduct('Conflict Test Product', 100, 1);
      try {
        await db.serialize(async () => {
          db.run('BEGIN TRANSACTION');
          await inventoryService.decreaseStock(product2.id, 1);
          await inventoryService.decreaseStock(product2.id, 1);
          db.run('COMMIT');
        });
        stats.recordTransaction('concurrent_test', true);
      } catch (error) {
        stats.recordTransaction('concurrent_test', false, error.message, { category: 'Concurrency Conflict' });
      }
      
      const invalidTransactionId = 'non-existent-transaction-' + Date.now();
      try {
        await callbackService.processCallback(invalidTransactionId, {
          success: true,
          data: { amount: 100 }
        });
        stats.recordTransaction('callback_test', true);
      } catch (error) {
        stats.recordTransaction('callback_test', false, error.message, { category: 'Invalid Transaction' });
      }
      
      const report = stats.printReport();
      
      console.log('\n📋 Rollback Cause Categories:');
      for (const [reason, count] of Object.entries(report.rollbackAnalysis.rollbackReasons)) {
        console.log(`  - ${reason}: ${count}`);
      }
      
      expect(report.summary.rolledBackTransactions).toBeGreaterThanOrEqual(2);
    });

    it('should verify data integrity after rollbacks', async () => {
      console.log('\n🔒 Verifying Data Integrity After Rollbacks:');
      
      const product = await testHelpers.createTestProduct('Integrity Test Product', 150, 5);
      const initialStock = product.stock;
      
      const orders = [];
      const payments = [];
      
      for (let i = 0; i < 15; i++) {
        const order = await testHelpers.createTestOrder(product.id, `integrity-user-${i}`);
        const payment = await testHelpers.createTestPayment(order.orderId);
        orders.push(order);
        payments.push(payment);
      }
      
      console.log('  Processing payments (some will rollback)...');
      for (let i = 0; i < payments.length; i++) {
        try {
          await testHelpers.sendCallback(payments[i].transactionId, true);
        } catch (error) {
          console.log(`  Payment ${i + 1} rolled back: ${error.message}`);
        }
      }
      
      console.log('\n  Performing consistency check...');
      const finalProduct = await inventoryService.getProduct(product.id);
      
      let paidCount = 0;
      for (let i = 0; i < orders.length; i++) {
        const order = await orderService.getOrder(orders[i].orderId);
        const payment = await paymentService.getPayment(payments[i].paymentId);
        
        if (order.status === 'paid') {
          paidCount++;
          expect(payment.status).toBe('paid');
        }
        
        expect(order.status === 'paid').toBe(payment.status === 'paid');
      }
      
      const expectedStock = initialStock - paidCount;
      
      console.log('\n  📊 Integrity Check Results:');
      console.log(`    Initial Stock: ${initialStock}`);
      console.log(`    Final Stock: ${finalProduct.stock}`);
      console.log(`    Expected Stock: ${expectedStock}`);
      console.log(`    Paid Orders: ${paidCount}`);
      console.log(`    Stock Matches: ${finalProduct.stock === expectedStock ? '✅' : '❌'}`);
      
      expect(finalProduct.stock).toBe(expectedStock);
      expect(finalProduct.stock).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Rollback Recovery Testing', () => {
    it('should allow retry after rollback and maintain consistency', async () => {
      console.log('\n🔄 Testing Rollback and Recovery:');
      
      const product = await testHelpers.createTestProduct('Recovery Test Product', 200, 1);
      const initialStock = product.stock;
      
      const order = await testHelpers.createTestOrder(product.id, 'recovery-user');
      const payment = await testHelpers.createTestPayment(order.orderId);
      
      console.log('  Simulating concurrent conflict (first attempt will rollback)...');
      
      const concurrentTask = inventoryService.decreaseStock(product.id, 1);
      
      try {
        await testHelpers.sendCallback(payment.transactionId, true);
      } catch (error) {
        console.log(`  First attempt rolled back: ${error.message}`);
      }
      
      try {
        await concurrentTask;
      } catch (error) {
        console.log(`  Concurrent task rolled back: ${error.message}`);
      }
      
      console.log('  Retrying payment...');
      
      try {
        const result = await testHelpers.sendCallback(payment.transactionId, true);
        console.log(`  Retry ${result.idempotent ? 'was idempotent (already processed)' : 'succeeded'}`);
      } catch (error) {
        console.log(`  Retry failed: ${error.message}`);
      }
      
      const finalProduct = await inventoryService.getProduct(product.id);
      const finalOrder = await orderService.getOrder(order.orderId);
      const finalPayment = await paymentService.getPayment(payment.paymentId);
      
      console.log('\n  📊 Final State:');
      console.log(`    Stock: ${finalProduct.stock}`);
      console.log(`    Order Status: ${finalOrder.status}`);
      console.log(`    Payment Status: ${finalPayment.status}`);
      
      expect(finalOrder.status === 'paid').toBe(finalPayment.status === 'paid');
      
      if (finalOrder.status === 'paid') {
        expect(finalProduct.stock).toBe(0);
      } else {
        expect(finalProduct.stock).toBe(1);
      }
    });
  });
});
