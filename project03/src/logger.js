const winston = require('winston');
const db = require('./database');

const { combine, timestamp, json } = winston.format;

const consoleLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

class DatabaseLogger {
  log(level, message, meta = {}) {
    const { requestId, orderId, userId } = meta;
    
    db.run(
      'INSERT INTO logs (level, message, request_id, order_id, user_id) VALUES (?, ?, ?, ?, ?)',
      [level, message, requestId || null, orderId || null, userId || null]
    );
    
    consoleLogger[level](message, meta);
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  error(message, meta) {
    this.log('error', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  debug(message, meta) {
    this.log('debug', message, meta);
  }
}

module.exports = new DatabaseLogger();
