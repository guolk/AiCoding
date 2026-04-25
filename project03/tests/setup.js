const db = require('../src/database');
const path = require('path');
const fs = require('fs');

const testDbPath = path.join(__dirname, '..', 'test.db');

beforeAll((done) => {
  process.env.DB_PATH = testDbPath;
  process.env.PAYMENT_GATEWAY_URL = 'https://api.payment-gateway-test.com/pay';
  done();
});

afterAll((done) => {
  db.close(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    done();
  });
});

beforeEach((done) => {
  db.serialize(() => {
    db.run('DELETE FROM callbacks');
    db.run('DELETE FROM payments');
    db.run('DELETE FROM orders');
    db.run('DELETE FROM logs');
    db.run('DELETE FROM products', done);
  });
});
