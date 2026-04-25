const db = require('../database');
const logger = require('../logger');

class InventoryService {
  async getProduct(productId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async decreaseStock(productId, quantity = 1) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
        if (err) return reject(err);
        if (!product) return reject(new Error('Product not found'));
        if (product.stock < quantity) return reject(new Error('Insufficient stock'));

        const newStock = product.stock - quantity;
        const newVersion = product.version + 1;

        db.run(
          'UPDATE products SET stock = ?, version = ? WHERE id = ? AND version = ?',
          [newStock, newVersion, productId, product.version],
          function(err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error('Concurrency conflict'));

            logger.info('Stock decreased', {
              productId,
              quantity,
              oldStock: product.stock,
              newStock
            });

            resolve({ productId, oldStock: product.stock, newStock });
          }
        );
      });
    });
  }

  async increaseStock(productId, quantity = 1) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [quantity, productId],
        function(err) {
          if (err) return reject(err);
          if (this.changes === 0) return reject(new Error('Product not found'));

          logger.info('Stock increased', { productId, quantity });
          resolve({ productId, quantity });
        }
      );
    });
  }

  async createProduct(name, price, stock) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO products (name, price, stock, version) VALUES (?, ?, ?, 0)',
        [name, price, stock],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, price, stock });
        }
      );
    });
  }

  async resetStock(productId, stock) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE products SET stock = ?, version = 0 WHERE id = ?',
        [stock, productId],
        function(err) {
          if (err) reject(err);
          else resolve({ productId, stock });
        }
      );
    });
  }
}

module.exports = new InventoryService();
