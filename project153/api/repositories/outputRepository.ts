import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDatabase } from '../db/index.js';
import type { Output } from '../../shared/types.js';

function mapRowToOutput(row: any): Output {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content ? JSON.parse(row.content) : {},
    relicIds: row.relic_ids ? JSON.parse(row.relic_ids) : [],
    noteIds: row.note_ids ? JSON.parse(row.note_ids) : [],
    createdAt: row.created_at
  };
}

export async function getAllOutputs(): Promise<Output[]> {
  const db = getDb();
  const rows = db.exec('SELECT * FROM outputs ORDER BY created_at DESC')[0]?.values || [];
  const columns = ['id', 'type', 'title', 'content', 'relic_ids', 'note_ids', 'created_at'];
  
  return rows.map((row: any) => {
    const obj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return mapRowToOutput(obj);
  });
}

export async function getOutputById(id: string): Promise<Output | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM outputs WHERE id = ?');
  const result = stmt.getAsObject(id);
  
  if (!result || Object.keys(result).length === 0) return null;
  return mapRowToOutput(result);
}

export async function createOutput(data: Omit<Output, 'id' | 'createdAt'>): Promise<Output> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO outputs (id, type, title, content, relic_ids, note_ids, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run([id, data.type, data.title, JSON.stringify(data.content), JSON.stringify(data.relicIds), JSON.stringify(data.noteIds), now]);
  saveDatabase();
  
  return { ...data, id, createdAt: now };
}

export async function updateOutput(id: string, data: Partial<Output>): Promise<Output | null> {
  const existing = await getOutputById(id);
  if (!existing) return null;
  
  const db = getDb();
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
  if (data.type !== undefined) { updates.push('type = ?'); values.push(data.type); }
  if (data.content !== undefined) { updates.push('content = ?'); values.push(JSON.stringify(data.content)); }
  if (data.relicIds !== undefined) { updates.push('relic_ids = ?'); values.push(JSON.stringify(data.relicIds)); }
  if (data.noteIds !== undefined) { updates.push('note_ids = ?'); values.push(JSON.stringify(data.noteIds)); }
  
  values.push(id);
  
  const stmt = db.prepare(`UPDATE outputs SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(values);
  
  saveDatabase();
  return getOutputById(id);
}

export async function deleteOutput(id: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM outputs WHERE id = ?');
  const result = stmt.run(id);
  saveDatabase();
  return (result.changes || 0) > 0;
}
