const db = require('../database');
const logger = require('../logger');
const paymentService = require('./paymentService');

class CallbackService {
  async processCallback(transactionId, rawData) {
    return new Promise((resolve, reject) => {
      db.serialize(async () => {
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) return reject(err);
        });

        try {
          const existingCallback = await new Promise((resolveQuery, rejectQuery) => {
            db.get(
              'SELECT * FROM callbacks WHERE transaction_id = ? ORDER BY created_at DESC LIMIT 1',
              [transactionId],
              (err, row) => {
                if (err) rejectQuery(err);
                else resolveQuery(row);
              }
            );
          });

          if (existingCallback && existingCallback.processed === 1) {
            logger.warn('Callback already processed', { transactionId });
            db.run('COMMIT', () => {
              resolve({ 
                success: true, 
                idempotent: true,
                message: 'Callback already processed' 
              });
            });
            return;
          }

          await new Promise((resolveInsert, rejectInsert) => {
            db.run(
              'INSERT INTO callbacks (transaction_id, raw_data, processed) VALUES (?, ?, 0)',
              [transactionId, JSON.stringify(rawData)],
              (err) => {
                if (err) rejectInsert(err);
                else resolveInsert();
              }
            );
          });

          const callbackData = rawData;
          
          if (callbackData.success) {
            const payment = await new Promise((resolvePayment, rejectPayment) => {
              db.get(
                'SELECT * FROM payments WHERE transaction_id = ?',
                [transactionId],
                (err, row) => {
                  if (err) rejectPayment(err);
                  else resolvePayment(row);
                }
              );
            });

            if (!payment) {
              throw new Error('Payment not found for transaction');
            }

            await paymentService.confirmPayment(payment.order_id, transactionId, false);
          }

          await new Promise((resolveUpdate, rejectUpdate) => {
            db.run(
              'UPDATE callbacks SET processed = 1, processed_at = ? WHERE transaction_id = ?',
              [new Date().toISOString(), transactionId],
              (err) => {
                if (err) rejectUpdate(err);
                else resolveUpdate();
              }
            );
          });

          db.run('COMMIT', () => {
            logger.info('Callback processed successfully', { transactionId });
            resolve({ 
              success: true, 
              idempotent: false,
              message: 'Callback processed successfully' 
            });
          });

        } catch (error) {
          db.run('ROLLBACK', () => {
            logger.error('Callback processing failed', { 
              transactionId, 
              error: error.message 
            });
            reject(error);
          });
        }
      });
    });
  }

  async getCallback(transactionId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM callbacks WHERE transaction_id = ? ORDER BY created_at DESC',
        [transactionId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = new CallbackService();
