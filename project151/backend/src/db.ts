import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'agriculture.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('已连接到 SQLite 数据库');
  }
});

export function runQuery(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

export function allQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export function execQuery(sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function prepareQuery(sql: string) {
  return {
    run: async (params: any[] = []) => runQuery(sql, params),
    get: async (params: any[] = []) => getQuery(sql, params),
    all: async (params: any[] = []) => allQuery(sql, params),
  };
}

export async function initDatabase() {
  await execQuery(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS plots (
      id TEXT PRIMARY KEY,
      plot_number TEXT UNIQUE NOT NULL,
      area REAL NOT NULL,
      soil_type TEXT,
      previous_crop TEXT,
      irrigation_method TEXT,
      location TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS planting_records (
      id TEXT PRIMARY KEY,
      plot_id TEXT NOT NULL,
      crop_variety TEXT NOT NULL,
      sowing_date TEXT NOT NULL,
      harvest_date TEXT,
      yield REAL,
      year INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS soil_tests (
      id TEXT PRIMARY KEY,
      plot_id TEXT NOT NULL,
      test_date TEXT NOT NULL,
      ph REAL,
      organic_matter REAL,
      total_nitrogen REAL,
      available_phosphorus REAL,
      available_potassium REAL,
      testing_agency TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pesticides (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      active_ingredient TEXT,
      purchase_date TEXT,
      batch_number TEXT,
      type TEXT NOT NULL,
      quantity REAL,
      unit TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS machinery (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT,
      serial_number TEXT,
      purchase_date TEXT,
      status TEXT DEFAULT 'available',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS farming_operations (
      id TEXT PRIMARY KEY,
      plot_id TEXT NOT NULL,
      operation_type TEXT NOT NULL,
      operation_date TEXT NOT NULL,
      operation_area REAL,
      pesticide_id TEXT,
      pesticide_quantity REAL,
      fertilizer_id TEXT,
      fertilizer_quantity REAL,
      machinery_id TEXT,
      operation_hours REAL,
      fuel_consumption REAL,
      operator TEXT,
      cost REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE,
      FOREIGN KEY (pesticide_id) REFERENCES pesticides(id),
      FOREIGN KEY (fertilizer_id) REFERENCES pesticides(id),
      FOREIGN KEY (machinery_id) REFERENCES machinery(id)
    );

    CREATE TABLE IF NOT EXISTS pest_diseases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      symptoms TEXT,
      common_season TEXT,
      prevention_methods TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pest_disease_records (
      id TEXT PRIMARY KEY,
      plot_id TEXT NOT NULL,
      pest_disease_id TEXT,
      discovery_date TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      affected_area REAL,
      severity TEXT,
      photos TEXT,
      status TEXT DEFAULT 'reported',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE,
      FOREIGN KEY (pest_disease_id) REFERENCES pest_diseases(id)
    );

    CREATE TABLE IF NOT EXISTS control_measures (
      id TEXT PRIMARY KEY,
      pest_record_id TEXT NOT NULL,
      measure_type TEXT NOT NULL,
      measure_date TEXT NOT NULL,
      pesticide_id TEXT,
      quantity REAL,
      description TEXT,
      operator TEXT,
      effect TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pest_record_id) REFERENCES pest_disease_records(id) ON DELETE CASCADE,
      FOREIGN KEY (pesticide_id) REFERENCES pesticides(id)
    );

    CREATE TABLE IF NOT EXISTS harvest_records (
      id TEXT PRIMARY KEY,
      plot_id TEXT NOT NULL,
      planting_record_id TEXT,
      harvest_date TEXT NOT NULL,
      yield REAL NOT NULL,
      quality_grade TEXT,
      unit_price REAL,
      total_revenue REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE,
      FOREIGN KEY (planting_record_id) REFERENCES planting_records(id)
    );

    CREATE TABLE IF NOT EXISTS traceability_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      harvest_record_id TEXT NOT NULL,
      plot_id TEXT NOT NULL,
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      batch_number TEXT,
      product_info TEXT,
      qr_code_path TEXT,
      FOREIGN KEY (harvest_record_id) REFERENCES harvest_records(id),
      FOREIGN KEY (plot_id) REFERENCES plots(id)
    );

    CREATE INDEX IF NOT EXISTS idx_planting_records_plot_id ON planting_records(plot_id);
    CREATE INDEX IF NOT EXISTS idx_planting_records_year ON planting_records(year);
    CREATE INDEX IF NOT EXISTS idx_soil_tests_plot_id ON soil_tests(plot_id);
    CREATE INDEX IF NOT EXISTS idx_farming_operations_plot_id ON farming_operations(plot_id);
    CREATE INDEX IF NOT EXISTS idx_farming_operations_date ON farming_operations(operation_date);
    CREATE INDEX IF NOT EXISTS idx_pest_records_plot_id ON pest_disease_records(plot_id);
    CREATE INDEX IF NOT EXISTS idx_pest_records_date ON pest_disease_records(discovery_date);
    CREATE INDEX IF NOT EXISTS idx_harvest_records_plot_id ON harvest_records(plot_id);
    CREATE INDEX IF NOT EXISTS idx_harvest_records_date ON harvest_records(harvest_date);
    CREATE INDEX IF NOT EXISTS idx_traceability_code ON traceability_codes(code);
  `);
}
