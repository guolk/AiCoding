const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'community.db'));

db.serialize(() => {
  db.run(`PRAGMA journal_mode = WAL`);
  db.run(`PRAGMA foreign_keys = ON`);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL,
      avatar TEXT,
      phone TEXT UNIQUE,
      community TEXT NOT NULL,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reputation INTEGER DEFAULT 100
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      images TEXT,
      location TEXT NOT NULL,
      location_range INTEGER DEFAULT 1,
      expires_at DATETIME,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS help_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      skill_tags TEXT,
      is_urgent INTEGER DEFAULT 0,
      location TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      helper_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (helper_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS thank_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      help_post_id INTEGER NOT NULL,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (help_post_id) REFERENCES help_posts(id),
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      condition TEXT NOT NULL,
      images TEXT,
      trade_method TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS price_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_keyword TEXT NOT NULL,
      avg_price REAL,
      min_price REAL,
      max_price REAL,
      sample_count INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      reviewee_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id),
      FOREIGN KEY (reviewer_id) REFERENCES users(id),
      FOREIGN KEY (reviewee_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      activity_date DATETIME NOT NULL,
      location TEXT NOT NULL,
      max_participants INTEGER,
      images TEXT,
      is_recurring INTEGER DEFAULT 0,
      recurring_pattern TEXT,
      status TEXT DEFAULT 'upcoming',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(activity_id, user_id),
      FOREIGN KEY (activity_id) REFERENCES activities(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (activity_id) REFERENCES activities(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS merchant_deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      merchant_name TEXT NOT NULL,
      deal_content TEXT NOT NULL,
      location TEXT NOT NULL,
      valid_until DATETIME,
      images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS useful_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO users (nickname, avatar, phone, community, address) VALUES (?, ?, ?, ?, ?)');
      stmt.run('张小明', 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', '13800138001', '阳光花园', '1号楼2单元301');
      stmt.run('李大姐', 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', '13800138002', '阳光花园', '2号楼1单元102');
      stmt.run('王叔叔', 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', '13800138003', '阳光花园', '3号楼3单元501');
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM useful_contacts', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO useful_contacts (name, phone, category, location, description) VALUES (?, ?, ?, ?, ?)');
      stmt.run('顺丰快递', '95338', '快递', '小区西门', '每日9:00-20:00');
      stmt.run('中通快递', '95311', '快递', '小区东门', '每日8:00-19:00');
      stmt.run('张师傅维修', '13900139001', '维修', '阳光花园3号楼', '家电维修、管道疏通');
      stmt.run('美团外卖', '10109777', '外卖', '', '24小时服务');
      stmt.run('社区医院', '010-12345678', '医疗', '小区南门对面', '门诊时间8:00-18:00');
      stmt.run('派出所', '110', '警务', '街道办事处旁', '24小时值班');
      stmt.finalize();
    }
  });
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { db, run, get, all };
