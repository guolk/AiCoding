const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.db');
const db = new sqlite3.Database(dbPath);
db.run('PRAGMA encoding = "UTF-8"');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      authors TEXT,
      abstract TEXT,
      year INTEGER,
      doi TEXT UNIQUE,
      arxiv_id TEXT UNIQUE,
      journal TEXT,
      file_path TEXT,
      status TEXT DEFAULT 'unread',
      rating INTEGER,
      notes TEXT,
      reading_progress REAL DEFAULT 0,
      last_read_page INTEGER DEFAULT 1,
      last_read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS annotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_id INTEGER,
      type TEXT,
      content TEXT,
      page INTEGER,
      color TEXT,
      x REAL,
      y REAL,
      width REAL,
      height REAL,
      selected_text TEXT,
      context_before TEXT,
      context_after TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_id INTEGER,
      annotation_id INTEGER,
      title TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
      FOREIGN KEY (annotation_id) REFERENCES annotations(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS paper_relations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_id1 INTEGER,
      paper_id2 INTEGER,
      relation_type TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id1) REFERENCES papers(id) ON DELETE CASCADE,
      FOREIGN KEY (paper_id2) REFERENCES papers(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS key_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_id INTEGER,
      research_question TEXT,
      methods TEXT,
      conclusions TEXT,
      limitations TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reading_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_id INTEGER,
      start_time DATETIME,
      end_time DATETIME,
      pages_read INTEGER,
      duration INTEGER,
      FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
