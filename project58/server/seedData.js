const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const CryptoJS = require('crypto-js');

const dbPath = path.join(__dirname, '../data/subscriptions.db');
const ENCRYPTION_KEY = 'subscription-manager-secret-key-2024';

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

const subscriptions = [
  {
    name: 'Netflix',
    monthly_fee: 39,
    yearly_fee: 390,
    next_billing_date: '2026-05-20',
    payment_method: '支付宝',
    account_info: 'user@example.com',
    category: '娱乐',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 3
  },
  {
    name: 'Spotify',
    monthly_fee: 15,
    yearly_fee: 150,
    next_billing_date: '2026-05-25',
    payment_method: '微信',
    account_info: '13800138000',
    category: '音乐',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 3
  },
  {
    name: 'iCloud+',
    monthly_fee: 21,
    yearly_fee: 252,
    next_billing_date: '2026-06-01',
    payment_method: 'Apple Pay',
    account_info: 'apple@icloud.com',
    category: '云服务',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 5
  },
  {
    name: 'Notion AI',
    monthly_fee: 70,
    yearly_fee: 700,
    next_billing_date: '2026-05-28',
    payment_method: '信用卡',
    account_info: 'notion@work.com',
    category: '工具',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 3
  },
  {
    name: 'Coursera Plus',
    monthly_fee: 59,
    yearly_fee: 399,
    next_billing_date: '2026-06-10',
    payment_method: 'PayPal',
    account_info: 'learn@edu.com',
    category: '学习',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 7
  },
  {
    name: 'YouTube Premium',
    monthly_fee: 29,
    yearly_fee: 288,
    next_billing_date: '2026-05-30',
    payment_method: 'Google Pay',
    account_info: 'youtube@gmail.com',
    category: '视频',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 3
  },
  {
    name: 'GitHub Copilot',
    monthly_fee: 10,
    yearly_fee: 100,
    next_billing_date: '2026-06-05',
    payment_method: '信用卡',
    account_info: 'dev@github.com',
    category: '工具',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 3
  },
  {
    name: 'ChatGPT Plus',
    monthly_fee: 142,
    yearly_fee: 1420,
    next_billing_date: '2026-05-22',
    payment_method: '信用卡',
    account_info: 'ai@openai.com',
    category: '工具',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 5
  },
  {
    name: 'Disney+',
    monthly_fee: 27,
    yearly_fee: 270,
    next_billing_date: '2026-06-15',
    payment_method: '支付宝',
    account_info: 'disney@example.com',
    category: '娱乐',
    status: 'paused',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 3
  },
  {
    name: 'Canva Pro',
    monthly_fee: 55,
    yearly_fee: 549,
    next_billing_date: '2026-05-19',
    payment_method: '微信',
    account_info: 'design@canva.com',
    category: '工具',
    status: 'active',
    is_trial: 1,
    trial_end_date: '2026-05-19',
    reminder_days: 3
  },
  {
    name: 'Adobe Creative Cloud',
    monthly_fee: 88,
    yearly_fee: 888,
    next_billing_date: '2026-04-20',
    payment_method: '信用卡',
    account_info: 'adobe@creative.com',
    category: '工具',
    status: 'cancelled',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 3
  },
  {
    name: '美团会员',
    monthly_fee: 15,
    yearly_fee: 120,
    next_billing_date: '2026-05-21',
    payment_method: '微信',
    account_info: 'food@meituan.com',
    category: '其他',
    status: 'active',
    is_trial: 0,
    trial_end_date: null,
    reminder_days: 2
  }
];

function generateUsageRecords(subId, count, daysBack) {
  const records = [];
  for (let i = 0; i < count; i++) {
    const day = Math.floor(Math.random() * daysBack);
    const hour = 8 + Math.floor(Math.random() * 12);
    const minute = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    records.push({ subId, date: dateStr, time: timeStr });
  }
  return records;
}

const usageData = [
  ...generateUsageRecords(1, 25, 30),
  ...generateUsageRecords(2, 30, 30),
  ...generateUsageRecords(3, 10, 30),
  ...generateUsageRecords(4, 22, 30),
  ...generateUsageRecords(5, 8, 30),
  ...generateUsageRecords(6, 15, 30),
  ...generateUsageRecords(7, 28, 30),
  ...generateUsageRecords(8, 20, 30),
  ...generateUsageRecords(10, 5, 10),
  ...generateUsageRecords(12, 12, 30)
];

function seedDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('开始初始化测试数据...');

      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          monthly_fee REAL DEFAULT 0,
          yearly_fee REAL DEFAULT 0,
          next_billing_date TEXT,
          payment_method TEXT,
          account_info TEXT,
          category TEXT,
          status TEXT DEFAULT 'active',
          is_trial INTEGER DEFAULT 0,
          trial_end_date TEXT,
          reminder_days INTEGER DEFAULT 3,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS usage_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subscription_id INTEGER,
          usage_date TEXT,
          usage_time TEXT,
          duration INTEGER DEFAULT 0,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS payment_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subscription_id INTEGER,
          amount REAL,
          payment_date TEXT,
          payment_method TEXT,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )`);

        db.run('PRAGMA foreign_keys = OFF');

        db.run('DELETE FROM usage_records');
        db.run('DELETE FROM subscriptions');
        db.run('DELETE FROM payment_history');
        db.run('DELETE FROM settings');

        const subStmt = db.prepare(`
          INSERT INTO subscriptions (name, monthly_fee, yearly_fee, next_billing_date, payment_method, account_info, category, status, is_trial, trial_end_date, reminder_days, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        subscriptions.forEach(sub => {
          const encryptedAccount = sub.account_info ? encrypt(sub.account_info) : null;
          subStmt.run(
            sub.name,
            sub.monthly_fee,
            sub.yearly_fee,
            sub.next_billing_date,
            sub.payment_method,
            encryptedAccount,
            sub.category,
            sub.status,
            sub.is_trial,
            sub.trial_end_date,
            sub.reminder_days
          );
        });
        subStmt.finalize();
        console.log(`✓ 插入了 ${subscriptions.length} 个订阅数据`);

        const usageStmt = db.prepare(`
          INSERT INTO usage_records (subscription_id, usage_date, usage_time, created_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);

        usageData.forEach(record => {
          usageStmt.run(record.subId, record.date, record.time);
        });
        usageStmt.finalize();
        console.log(`✓ 插入了 ${usageData.length} 条使用记录`);

        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('\n🎉 测试数据初始化完成！');
            console.log('\n📊 数据概览:');
            console.log('  - 活跃订阅: 9个');
            console.log('  - 已暂停订阅: 1个');
            console.log('  - 已取消订阅: 1个');
            console.log('  - 试用中订阅: 1个 (Canva Pro)');
            console.log('  - 使用记录: 175条');
            console.log('  - 月度总支出: ~570元');
            console.log('\n🎯 包含的订阅服务:');
            console.log('  Netflix, Spotify, iCloud+, Notion AI, Coursera Plus');
            console.log('  YouTube Premium, GitHub Copilot, ChatGPT Plus, Disney+');
            console.log('  Canva Pro (试用), Adobe CC (已取消), 美团会员');
            db.close();
            resolve();
          }
        });
      });
    });
  });
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = { seedDatabase };
