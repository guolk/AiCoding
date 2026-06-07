import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDatabase } from '../db/index.js';
import type { TypeAnalysis } from '../../shared/types.js';

function mapRowToAnalysis(row: any): TypeAnalysis {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description || '',
    relicIds: row.relic_ids ? JSON.parse(row.relic_ids) : [],
    analysisData: row.analysis_data ? JSON.parse(row.analysis_data) : {},
    createdAt: row.created_at
  };
}

export async function getAllAnalysis(): Promise<TypeAnalysis[]> {
  const db = getDb();
  const rows = db.exec('SELECT * FROM type_analysis ORDER BY created_at DESC')[0]?.values || [];
  const columns = ['id', 'name', 'type', 'description', 'relic_ids', 'analysis_data', 'created_at'];
  
  return rows.map((row: any) => {
    const obj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return mapRowToAnalysis(obj);
  });
}

export async function getAnalysisById(id: string): Promise<TypeAnalysis | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM type_analysis WHERE id = ?');
  const result = stmt.getAsObject(id);
  
  if (!result || Object.keys(result).length === 0) return null;
  return mapRowToAnalysis(result);
}

export async function createAnalysis(data: Omit<TypeAnalysis, 'id' | 'createdAt'>): Promise<TypeAnalysis> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO type_analysis (id, name, type, description, relic_ids, analysis_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.name, data.type, data.description, JSON.stringify(data.relicIds), JSON.stringify(data.analysisData), now);
  saveDatabase();
  
  return { ...data, id, createdAt: now };
}

export async function updateAnalysis(id: string, data: Partial<TypeAnalysis>): Promise<TypeAnalysis | null> {
  const existing = await getAnalysisById(id);
  if (!existing) return null;
  
  const db = getDb();
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.type !== undefined) { updates.push('type = ?'); values.push(data.type); }
  if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
  if (data.relicIds !== undefined) { updates.push('relic_ids = ?'); values.push(JSON.stringify(data.relicIds)); }
  if (data.analysisData !== undefined) { updates.push('analysis_data = ?'); values.push(JSON.stringify(data.analysisData)); }
  
  values.push(id);
  
  const stmt = db.prepare(`UPDATE type_analysis SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  saveDatabase();
  return getAnalysisById(id);
}

export async function deleteAnalysis(id: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM type_analysis WHERE id = ?');
  const result = stmt.run(id);
  saveDatabase();
  return (result.changes || 0) > 0;
}
