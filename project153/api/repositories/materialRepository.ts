import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDatabase } from '../db/index.js';
import type { Material } from '../../shared/types.js';

function mapRowToMaterial(row: any): Material {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description || '',
    filePath: row.file_path,
    metadata: row.metadata ? JSON.parse(row.metadata) : {},
    createdAt: row.created_at
  };
}

export async function getAllMaterials(): Promise<Material[]> {
  const db = getDb();
  const rows = db.exec('SELECT * FROM materials ORDER BY created_at DESC')[0]?.values || [];
  const columns = ['id', 'type', 'title', 'description', 'file_path', 'metadata', 'created_at'];
  
  return rows.map((row: any) => {
    const obj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return mapRowToMaterial(obj);
  });
}

export async function getMaterialById(id: string): Promise<Material | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM materials WHERE id = ?');
  const result = stmt.getAsObject(id);
  
  if (!result || Object.keys(result).length === 0) return null;
  return mapRowToMaterial(result);
}

export async function createMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO materials (id, type, title, description, file_path, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, data.type, data.title, data.description, data.filePath, JSON.stringify(data.metadata), now);
  saveDatabase();
  
  return { ...data, id, createdAt: now };
}

export async function updateMaterial(id: string, data: Partial<Material>): Promise<Material | null> {
  const existing = await getMaterialById(id);
  if (!existing) return null;
  
  const db = getDb();
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
  if (data.type !== undefined) { updates.push('type = ?'); values.push(data.type); }
  if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
  if (data.filePath !== undefined) { updates.push('file_path = ?'); values.push(data.filePath); }
  if (data.metadata !== undefined) { updates.push('metadata = ?'); values.push(JSON.stringify(data.metadata)); }
  
  values.push(id);
  
  const stmt = db.prepare(`UPDATE materials SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  saveDatabase();
  return getMaterialById(id);
}

export async function deleteMaterial(id: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM materials WHERE id = ?');
  const result = stmt.run(id);
  saveDatabase();
  return (result.changes || 0) > 0;
}
