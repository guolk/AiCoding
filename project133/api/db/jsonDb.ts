import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

interface DataStore<T> {
  [key: string]: T[];
}

let db: DataStore<any> = {};
let isInitialized = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

function loadCollection<T>(collection: string): T[] {
  const filePath = getFilePath(collection);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }
  return [];
}

function saveCollection<T>(collection: string, data: T[]): void {
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function initDb(): void {
  if (isInitialized) return;
  
  ensureDataDir();
  
  const collections = [
    'templates',
    'reports',
    'comments',
    'resources',
    'archives',
    'schedules',
    'classes',
    'students'
  ];
  
  collections.forEach(collection => {
    db[collection] = loadCollection(collection);
  });
  
  isInitialized = true;
}

export function getAll<T>(collection: string): T[] {
  if (!isInitialized) initDb();
  return db[collection] || [];
}

export function getById<T>(collection: string, id: number): T | undefined {
  if (!isInitialized) initDb();
  return (db[collection] || []).find((item: any) => item.id === id);
}

export function create<T extends { id?: number }>(collection: string, item: Omit<T, 'id'>): T {
  if (!isInitialized) initDb();
  if (!db[collection]) db[collection] = [];
  
  const maxId = db[collection].reduce((max: number, item: any) => Math.max(max, item.id || 0), 0);
  const newItem = { ...item, id: maxId + 1 } as T;
  
  db[collection].push(newItem);
  saveCollection(collection, db[collection]);
  
  return newItem;
}

export function update<T extends { id: number }>(collection: string, id: number, updates: Partial<T>): T | undefined {
  if (!isInitialized) initDb();
  const index = (db[collection] || []).findIndex((item: any) => item.id === id);
  
  if (index === -1) return undefined;
  
  db[collection][index] = { ...db[collection][index], ...updates };
  saveCollection(collection, db[collection]);
  
  return db[collection][index];
}

export function remove(collection: string, id: number): boolean {
  if (!isInitialized) initDb();
  const index = (db[collection] || []).findIndex((item: any) => item.id === id);
  
  if (index === -1) return false;
  
  db[collection].splice(index, 1);
  saveCollection(collection, db[collection]);
  
  return true;
}

export function query<T>(
  collection: string,
  predicate: (item: T) => boolean
): T[] {
  if (!isInitialized) initDb();
  return (db[collection] || []).filter(predicate);
}

export function setCollection<T>(collection: string, data: T[]): void {
  if (!isInitialized) initDb();
  db[collection] = data;
  saveCollection(collection, data);
}
