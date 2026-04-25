const TestDataGenerator = require('./testDataGenerator');
const inventoryService = require('../../src/services/inventoryService');
const orderService = require('../../src/services/orderService');
const paymentService = require('../../src/services/paymentService');

class TestDataFactory {
  static async createTestProduct(options = {}) {
    const productData = TestDataGenerator.generateProduct(options);
    const product = await inventoryService.createProduct(
      productData.name,
      productData.price,
      productData.stock
    );
    return product;
  }

  static async createTestOrder(productId, userId = null) {
    const userIdToUse = userId || TestDataGenerator.generateUserId();
    const order = await orderService.createOrder(productId, userIdToUse);
    return order;
  }

  static async createTestPayment(orderId) {
    const payment = await paymentService.createPayment(orderId);
    return payment;
  }

  static async createCompletePaymentFlow(options = {}) {
    const {
      productName = 'Test Product',
      productPrice = 100,
      productStock = 10,
      userId = null
    } = options;

    const product = await this.createTestProduct({
      name: productName,
      price: productPrice,
      stock: productStock
    });

    const order = await this.createTestOrder(product.id, userId);
    const payment = await this.createTestPayment(order.orderId);

    return {
      product,
      order,
      payment
    };
  }

  static async createMultipleOrdersForSingleProduct(options = {}) {
    const {
      productName = 'Hot Product',
      productPrice = 100,
      productStock = 5,
      orderCount = 10
    } = options;

    const product = await this.createTestProduct({
      name: productName,
      price: productPrice,
      stock: productStock
    });

    const orders = [];
    const payments = [];

    for (let i = 0; i < orderCount; i++) {
      const order = await this.createTestOrder(
        product.id,
        TestDataGenerator.generateUserId(`user-${i}`)
      );
      const payment = await this.createTestPayment(order.orderId);
      
      orders.push(order);
      payments.push(payment);
    }

    return {
      product,
      orders,
      payments
    };
  }

  static async createFlashSaleScenario(options = {}) {
    const {
      productName = 'Flash Sale Item',
      productPrice = 99,
      totalStock = 10,
      totalUsers = 100
    } = options;

    const product = await this.createTestProduct({
      name: productName,
      price: productPrice,
      stock: totalStock
    });

    const users = TestDataGenerator.generateBatchUsers(totalUsers);
    const orders = [];
    const payments = [];

    for (const user of users) {
      const order = await this.createTestOrder(product.id, user.id);
      const payment = await this.createTestPayment(order.orderId);
      
      orders.push(order);
      payments.push(payment);
    }

    return {
      product,
      users,
      orders,
      payments,
      config: {
        totalStock,
        totalUsers
      }
    };
  }

  static async createTestProducts(count = 5) {
    const products = [];
    for (let i = 0; i < count; i++) {
      const product = await this.createTestProduct({
        name: `Product ${i + 1}`,
        price: (i + 1) * 100,
        stock: Math.floor(Math.random() * 20) + 1
      });
      products.push(product);
    }
    return products;
  }

  static async createEdgeCaseProducts() {
    const edgeCases = TestDataGenerator.generateEdgeCaseScenarios();
    
    return {
      zeroStockProduct: await this.createTestProduct({
        name: edgeCases.zeroStockProduct.name,
        price: edgeCases.zeroStockProduct.price,
        stock: 0
      }),
      largeQuantityProduct: await this.createTestProduct({
        name: edgeCases.largeQuantityProduct.name,
        price: edgeCases.largeQuantityProduct.price,
        stock: edgeCases.largeQuantityProduct.stock
      }),
      expensiveProduct: await this.createTestProduct({
        name: edgeCases.expensiveProduct.name,
        price: edgeCases.expensiveProduct.price,
        stock: edgeCases.expensiveProduct.stock
      })
    };
  }

  static async resetProductStock(productId, stock) {
    return await inventoryService.resetStock(productId, stock);
  }
}

module.exports = TestDataFactory;
