const { v4: uuidv4 } = require('uuid');

class TestDataGenerator {
  static generateUserId(prefix = 'user') {
    return `${prefix}-${uuidv4().substring(0, 8)}`;
  }

  static generateOrderId() {
    return uuidv4();
  }

  static generateTransactionId() {
    return uuidv4();
  }

  static generateProductId() {
    return Math.floor(Math.random() * 100000);
  }

  static generateProduct(options = {}) {
    return {
      id: options.id || this.generateProductId(),
      name: options.name || `Test Product ${Date.now()}`,
      price: options.price || Math.floor(Math.random() * 10000) + 100,
      stock: options.stock !== undefined ? options.stock : Math.floor(Math.random() * 100) + 1
    };
  }

  static generateOrder(options = {}) {
    return {
      orderId: options.orderId || this.generateOrderId(),
      productId: options.productId || this.generateProductId(),
      userId: options.userId || this.generateUserId(),
      amount: options.amount || Math.floor(Math.random() * 10000) + 100,
      status: options.status || 'pending'
    };
  }

  static generatePayment(options = {}) {
    return {
      paymentId: options.paymentId || uuidv4(),
      orderId: options.orderId || this.generateOrderId(),
      transactionId: options.transactionId || this.generateTransactionId(),
      amount: options.amount || Math.floor(Math.random() * 10000) + 100,
      status: options.status || 'pending'
    };
  }

  static generateCallback(options = {}) {
    return {
      transactionId: options.transactionId || this.generateTransactionId(),
      success: options.success !== undefined ? options.success : true,
      data: options.data || {
        amount: Math.floor(Math.random() * 10000) + 100,
        paymentMethod: ['alipay', 'wechat', 'credit_card'][Math.floor(Math.random() * 3)],
        timestamp: Date.now()
      }
    };
  }

  static generateBatchUsers(count = 10) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: this.generateUserId(),
        name: `Test User ${i + 1}`,
        email: `user${i + 1}@test.com`
      });
    }
    return users;
  }

  static generateBatchProducts(count = 10) {
    const products = [];
    for (let i = 0; i < count; i++) {
      products.push(this.generateProduct({
        name: `Batch Product ${i + 1}`,
        price: (i + 1) * 100,
        stock: Math.floor(Math.random() * 50) + 1
      }));
    }
    return products;
  }

  static generateFlashSaleScenario(options = {}) {
    const {
      productName = 'Flash Sale Item',
      productPrice = 99,
      totalStock = 10,
      totalUsers = 100
    } = options;

    const product = this.generateProduct({
      name: productName,
      price: productPrice,
      stock: totalStock
    });

    const users = this.generateBatchUsers(totalUsers);

    return {
      product,
      users,
      config: {
        totalStock,
        totalUsers
      }
    };
  }

  static generateConcurrentPaymentScenario(options = {}) {
    const {
      productCount = 5,
      orderCount = 20,
      userCount = 10
    } = options;

    const products = [];
    for (let i = 0; i < productCount; i++) {
      products.push(this.generateProduct({
        name: `Concurrent Product ${i + 1}`,
        price: (i + 1) * 100,
        stock: Math.floor(Math.random() * 10) + 1
      }));
    }

    const orders = [];
    for (let i = 0; i < orderCount; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      orders.push(this.generateOrder({
        productId: randomProduct.id,
        userId: this.generateUserId(),
        amount: randomProduct.price
      }));
    }

    return {
      products,
      orders,
      config: {
        productCount,
        orderCount,
        userCount
      }
    };
  }

  static generateEdgeCaseScenarios() {
    return {
      zeroStockProduct: this.generateProduct({
        name: 'Out of Stock Product',
        price: 100,
        stock: 0
      }),
      negativePriceProduct: this.generateProduct({
        name: 'Invalid Price Product',
        price: -100,
        stock: 10
      }),
      largeQuantityProduct: this.generateProduct({
        name: 'Large Stock Product',
        price: 1,
        stock: 1000000
      }),
      expensiveProduct: this.generateProduct({
        name: 'Premium Product',
        price: 9999999,
        stock: 1
      })
    };
  }

  static generateTimeoutScenarios() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

    return {
      recentOrder: this.generateOrder({
        status: 'pending',
        createdAt: new Date(now - 10 * 60 * 1000).toISOString()
      }),
      thirtyMinuteOrder: this.generateOrder({
        status: 'pending',
        createdAt: new Date(oneHourAgo + 30 * 60 * 1000).toISOString()
      }),
      oneHourOldOrder: this.generateOrder({
        status: 'pending',
        createdAt: new Date(oneHourAgo).toISOString()
      }),
      twoDayOldOrder: this.generateOrder({
        status: 'pending',
        createdAt: new Date(twoDaysAgo).toISOString()
      })
    };
  }

  static generateCallbackRetryScenarios() {
    const transactionId = this.generateTransactionId();
    
    return {
      failedCallbacks: [
        this.generateCallback({
          transactionId,
          success: false,
          data: { error: 'Network timeout' }
        }),
        this.generateCallback({
          transactionId,
          success: false,
          data: { error: 'Gateway error' }
        }),
        this.generateCallback({
          transactionId,
          success: false,
          data: { error: 'Invalid signature' }
        })
      ],
      successfulCallback: this.generateCallback({
        transactionId,
        success: true,
        data: { amount: 100, paymentMethod: 'alipay' }
      })
    };
  }
}

module.exports = TestDataGenerator;
