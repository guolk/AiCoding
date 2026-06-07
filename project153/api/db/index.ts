import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/research.db');
const DATA_DIR = path.join(__dirname, '../../data');

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(__dirname, '../../node_modules/sql.js/dist', file)
  });

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    createTables(db);
    saveDatabase();
  }

  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function createTables(database: Database): void {
  database.run(`
    CREATE TABLE relics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      era TEXT,
      material TEXT,
      decoration TEXT,
      inscription TEXT,
      excavate_location TEXT,
      current_location TEXT,
      relic_number TEXT,
      dimension_height REAL,
      dimension_width REAL,
      dimension_length REAL,
      dimension_diameter REAL,
      dimension_weight REAL,
      dimension_unit TEXT DEFAULT 'cm',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE relic_photos (
      id TEXT PRIMARY KEY,
      relic_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('front', 'side', 'detail', 'rubbing')),
      url TEXT NOT NULL,
      caption TEXT,
      upload_date TEXT NOT NULL,
      FOREIGN KEY (relic_id) REFERENCES relics(id) ON DELETE CASCADE
    )
  `);

  database.run(`
    CREATE TABLE research_notes (
      id TEXT PRIMARY KEY,
      relic_id TEXT,
      title TEXT NOT NULL,
      content TEXT,
      personal_insights TEXT,
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (relic_id) REFERENCES relics(id) ON DELETE SET NULL
    )
  `);

  database.run(`
    CREATE TABLE "references" (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      publication TEXT,
      year INTEGER,
      page TEXT,
      excerpt TEXT,
      doi TEXT,
      FOREIGN KEY (note_id) REFERENCES research_notes(id) ON DELETE CASCADE
    )
  `);

  database.run(`
    CREATE TABLE viewpoints (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL,
      scholar TEXT NOT NULL,
      aspect TEXT NOT NULL CHECK(aspect IN ('dating', 'usage', 'origin')),
      content TEXT NOT NULL,
      evidence TEXT,
      confidence TEXT NOT NULL CHECK(confidence IN ('high', 'medium', 'low')),
      FOREIGN KEY (note_id) REFERENCES research_notes(id) ON DELETE CASCADE
    )
  `);

  database.run(`
    CREATE TABLE type_analysis (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('comparison', 'evolution', 'periodization')),
      description TEXT,
      relic_ids TEXT,
      analysis_data TEXT,
      created_at TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE materials (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('pdf', 'rubbing', 'map')),
      title TEXT NOT NULL,
      description TEXT,
      file_path TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE outputs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('outline', 'argument')),
      title TEXT NOT NULL,
      content TEXT,
      relic_ids TEXT,
      note_ids TEXT,
      created_at TEXT NOT NULL
    )
  `);

  database.run('CREATE INDEX idx_relic_name ON relics(name)');
  database.run('CREATE INDEX idx_relic_era ON relics(era)');
  database.run('CREATE INDEX idx_relic_category ON relics(category)');
  database.run('CREATE INDEX idx_note_relic_id ON research_notes(relic_id)');
  database.run('CREATE INDEX idx_note_tags ON research_notes(tags)');
}

export function getDb(): Database {
  if (!db) throw new Error('Database not initialized');
  return db;
}
