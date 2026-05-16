import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../library.db');
const db = new sqlite3.Database(dbPath);

const runQuery = (sql: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const initDatabase = async () => {
  const createTables = [
    `CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      isbn TEXT UNIQUE,
      title TEXT NOT NULL,
      author TEXT,
      publisher TEXT,
      publishedDate TEXT,
      description TEXT,
      coverUrl TEXT,
      pageCount INTEGER,
      status TEXT CHECK(status IN ('want_to_read', 'reading', 'read', 'abandoned')) DEFAULT 'want_to_read',
      readCount INTEGER DEFAULT 0,
      currentPage INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#3B82F6',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS book_tags (
      bookId TEXT,
      tagId TEXT,
      PRIMARY KEY (bookId, tagId),
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS reading_sessions (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME,
      startPage INTEGER NOT NULL,
      endPage INTEGER,
      pagesRead INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      type TEXT CHECK(type IN ('highlight', 'note')) NOT NULL,
      content TEXT NOT NULL,
      pageNumber INTEGER,
      chapter TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS note_topics (
      noteId TEXT,
      topic TEXT,
      PRIMARY KEY (noteId, topic),
      FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS reading_lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      isPublic BOOLEAN DEFAULT 0,
      shareToken TEXT UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS reading_list_books (
      listId TEXT,
      bookId TEXT,
      addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (listId, bookId),
      FOREIGN KEY (listId) REFERENCES reading_lists(id) ON DELETE CASCADE,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS read_history (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      completedDate DATETIME,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      review TEXT,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    )`
  ];

  for (const sql of createTables) {
    await runQuery(sql);
  }
};

export default db;
