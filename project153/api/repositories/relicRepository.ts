import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDatabase } from '../db/index.js';
import type { Relic, RelicPhoto } from '../../shared/types.js';

function mapRowToRelic(row: any): Relic {
  return {
    id: row.id,
    name: row.name,
    category: row.category || '',
    era: row.era || '',
    material: row.material || '',
    decoration: row.decoration || '',
    inscription: row.inscription || '',
    excavateLocation: row.excavate_location || '',
    currentLocation: row.current_location || '',
    relicNumber: row.relic_number || '',
    dimensions: {
      height: row.dimension_height ?? undefined,
      width: row.dimension_width ?? undefined,
      length: row.dimension_length ?? undefined,
      diameter: row.dimension_diameter ?? undefined,
      weight: row.dimension_weight ?? undefined,
      unit: row.dimension_unit || 'cm'
    },
    photos: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapRowToPhoto(row: any): RelicPhoto {
  return {
    id: row.id,
    relicId: row.relic_id,
    type: row.type,
    url: row.url,
    caption: row.caption || '',
    uploadDate: row.upload_date
  };
}

export async function getAllRelics(): Promise<Relic[]> {
  const db = getDb();
  const relicRows = db.exec('SELECT * FROM relics ORDER BY updated_at DESC')[0]?.values || [];
  const relics = relicRows.map((row: any) => {
    const relicObj: Record<string, any> = {};
    const columns = ['id', 'name', 'category', 'era', 'material', 'decoration', 'inscription', 
      'excavate_location', 'current_location', 'relic_number', 'dimension_height', 'dimension_width',
      'dimension_length', 'dimension_diameter', 'dimension_weight', 'dimension_unit', 'created_at', 'updated_at'];
    columns.forEach((col, idx) => {
      relicObj[col] = row[idx];
    });
    const relic = mapRowToRelic(relicObj);
    relic.photos = getPhotosForRelic(relic.id);
    return relic;
  });
  return relics;
}

export async function getRelicById(id: string): Promise<Relic | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM relics WHERE id = ?');
  const result = stmt.getAsObject(id);
  
  if (!result || Object.keys(result).length === 0) return null;
  
  const relic = mapRowToRelic(result);
  relic.photos = getPhotosForRelic(id);
  return relic;
}

function getPhotosForRelic(relicId: string): RelicPhoto[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM relic_photos WHERE relic_id = ? ORDER BY upload_date DESC');
  const rows = stmt.getAsObject(relicId);
  const photos: RelicPhoto[] = [];
  
  if (Array.isArray(rows)) {
    rows.forEach(row => photos.push(mapRowToPhoto(row)));
  } else if (rows && typeof rows === 'object' && Object.keys(rows).length > 0) {
    photos.push(mapRowToPhoto(rows));
  }
  
  return photos;
}

export async function createRelic(data: Omit<Relic, 'id' | 'createdAt' | 'updatedAt' | 'photos'>): Promise<Relic> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO relics (
      id, name, category, era, material, decoration, inscription,
      excavate_location, current_location, relic_number,
      dimension_height, dimension_width, dimension_length, dimension_diameter, dimension_weight, dimension_unit,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id, data.name, data.category, data.era, data.material, data.decoration, data.inscription,
    data.excavateLocation, data.currentLocation, data.relicNumber,
    data.dimensions.height, data.dimensions.width, data.dimensions.length,
    data.dimensions.diameter, data.dimensions.weight, data.dimensions.unit,
    now, now
  );
  
  saveDatabase();
  
  return {
    ...data,
    id,
    photos: [],
    createdAt: now,
    updatedAt: now
  };
}

export async function updateRelic(id: string, data: Partial<Relic>): Promise<Relic | null> {
  const existing = await getRelicById(id);
  if (!existing) return null;
  
  const db = getDb();
  const now = new Date().toISOString();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  const fields: Record<string, keyof Relic | string> = {
    name: 'name',
    category: 'category',
    era: 'era',
    material: 'material',
    decoration: 'decoration',
    inscription: 'inscription',
    excavateLocation: 'excavate_location',
    currentLocation: 'current_location',
    relicNumber: 'relic_number'
  };
  
  Object.entries(fields).forEach(([key, col]) => {
    if (data[key as keyof Relic] !== undefined) {
      updates.push(`${col} = ?`);
      values.push(data[key as keyof Relic]);
    }
  });
  
  if (data.dimensions) {
    const dimFields = ['height', 'width', 'length', 'diameter', 'weight', 'unit'];
    dimFields.forEach(field => {
      const col = `dimension_${field}`;
      const value = data.dimensions![field as keyof typeof data.dimensions];
      if (value !== undefined) {
        updates.push(`${col} = ?`);
        values.push(value);
      }
    });
  }
  
  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  const stmt = db.prepare(`UPDATE relics SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  saveDatabase();
  
  return getRelicById(id);
}

export async function deleteRelic(id: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM relics WHERE id = ?');
  const result = stmt.run(id);
  saveDatabase();
  return (result.changes || 0) > 0;
}

export async function addPhoto(relicId: string, photo: Omit<RelicPhoto, 'id' | 'relicId' | 'uploadDate'>): Promise<RelicPhoto> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO relic_photos (id, relic_id, type, url, caption, upload_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, relicId, photo.type, photo.url, photo.caption, now);
  saveDatabase();
  
  return {
    ...photo,
    id,
    relicId,
    uploadDate: now
  };
}

export async function deletePhoto(photoId: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM relic_photos WHERE id = ?');
  const result = stmt.run(photoId);
  saveDatabase();
  return (result.changes || 0) > 0;
}
