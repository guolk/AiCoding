import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDatabase } from '../db/index.js';
import type { ResearchNote, Reference, Viewpoint } from '../../shared/types.js';

function mapRowToNote(row: any): ResearchNote {
  return {
    id: row.id,
    relicId: row.relic_id || undefined,
    title: row.title,
    content: row.content || '',
    personalInsights: row.personal_insights || '',
    tags: row.tags ? JSON.parse(row.tags) : [],
    references: [],
    viewpoints: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapRowToReference(row: any): Reference {
  return {
    id: row.id,
    noteId: row.note_id,
    title: row.title,
    author: row.author || '',
    publication: row.publication || '',
    year: row.year,
    page: row.page || '',
    excerpt: row.excerpt || '',
    doi: row.doi || undefined
  };
}

function mapRowToViewpoint(row: any): Viewpoint {
  return {
    id: row.id,
    noteId: row.note_id,
    scholar: row.scholar,
    aspect: row.aspect,
    content: row.content,
    evidence: row.evidence || '',
    confidence: row.confidence
  };
}

function getReferencesForNote(noteId: string): Reference[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM "references" WHERE note_id = ? ORDER BY year DESC');
  const rows = stmt.getAsObject(noteId);
  const refs: Reference[] = [];
  
  if (Array.isArray(rows)) {
    rows.forEach(row => refs.push(mapRowToReference(row)));
  } else if (rows && typeof rows === 'object' && Object.keys(rows).length > 0) {
    refs.push(mapRowToReference(rows));
  }
  
  return refs;
}

function getViewpointsForNote(noteId: string): Viewpoint[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM viewpoints WHERE note_id = ? ORDER BY aspect');
  const rows = stmt.getAsObject(noteId);
  const viewpoints: Viewpoint[] = [];
  
  if (Array.isArray(rows)) {
    rows.forEach(row => viewpoints.push(mapRowToViewpoint(row)));
  } else if (rows && typeof rows === 'object' && Object.keys(rows).length > 0) {
    viewpoints.push(mapRowToViewpoint(rows));
  }
  
  return viewpoints;
}

export async function getAllNotes(): Promise<ResearchNote[]> {
  const db = getDb();
  const noteRows = db.exec('SELECT * FROM research_notes ORDER BY updated_at DESC')[0]?.values || [];
  const columns = ['id', 'relic_id', 'title', 'content', 'personal_insights', 'tags', 'created_at', 'updated_at'];
  
  const notes = noteRows.map((row: any) => {
    const noteObj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      noteObj[col] = row[idx];
    });
    const note = mapRowToNote(noteObj);
    note.references = getReferencesForNote(note.id);
    note.viewpoints = getViewpointsForNote(note.id);
    return note;
  });
  
  return notes;
}

export async function getNoteById(id: string): Promise<ResearchNote | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM research_notes WHERE id = ?');
  const result = stmt.getAsObject(id);
  
  if (!result || Object.keys(result).length === 0) return null;
  
  const note = mapRowToNote(result);
  note.references = getReferencesForNote(id);
  note.viewpoints = getViewpointsForNote(id);
  return note;
}

export async function createNote(data: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt' | 'references' | 'viewpoints'>): Promise<ResearchNote> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const params = [id, data.relicId || null, data.title, data.content, data.personalInsights, JSON.stringify(data.tags), now, now];
  
  const stmt = db.prepare(`
    INSERT INTO research_notes (id, relic_id, title, content, personal_insights, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(params);
  saveDatabase();
  
  return {
    ...data,
    id,
    references: [],
    viewpoints: [],
    createdAt: now,
    updatedAt: now
  };
}

export async function updateNote(id: string, data: Partial<ResearchNote>): Promise<ResearchNote | null> {
  const existing = await getNoteById(id);
  if (!existing) return null;
  
  const db = getDb();
  const now = new Date().toISOString();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
  if (data.relicId !== undefined) { updates.push('relic_id = ?'); values.push(data.relicId || null); }
  if (data.content !== undefined) { updates.push('content = ?'); values.push(data.content); }
  if (data.personalInsights !== undefined) { updates.push('personal_insights = ?'); values.push(data.personalInsights); }
  if (data.tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(data.tags)); }
  
  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  const stmt = db.prepare(`UPDATE research_notes SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(values);
  
  saveDatabase();
  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM research_notes WHERE id = ?');
  const result = stmt.run(id);
  saveDatabase();
  return (result.changes || 0) > 0;
}

export async function addReference(noteId: string, ref: Omit<Reference, 'id' | 'noteId'>): Promise<Reference> {
  const db = getDb();
  const id = uuidv4();
  
  const stmt = db.prepare(`
    INSERT INTO "references" (id, note_id, title, author, publication, year, page, excerpt, doi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run([id, noteId, ref.title, ref.author, ref.publication, ref.year, ref.page, ref.excerpt, ref.doi || null]);
  saveDatabase();
  
  return { ...ref, id, noteId };
}

export async function updateReference(refId: string, ref: Partial<Reference>): Promise<Reference | null> {
  const db = getDb();
  
  const checkStmt = db.prepare('SELECT * FROM "references" WHERE id = ?');
  const existing = checkStmt.getAsObject(refId);
  
  if (!existing || Object.keys(existing).length === 0) return null;
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (ref.title !== undefined) { updates.push('title = ?'); values.push(ref.title); }
  if (ref.author !== undefined) { updates.push('author = ?'); values.push(ref.author); }
  if (ref.publication !== undefined) { updates.push('publication = ?'); values.push(ref.publication); }
  if (ref.year !== undefined) { updates.push('year = ?'); values.push(ref.year); }
  if (ref.page !== undefined) { updates.push('page = ?'); values.push(ref.page); }
  if (ref.excerpt !== undefined) { updates.push('excerpt = ?'); values.push(ref.excerpt); }
  if (ref.doi !== undefined) { updates.push('doi = ?'); values.push(ref.doi || null); }
  
  values.push(refId);
  
  const stmt = db.prepare(`UPDATE "references" SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(values);
  saveDatabase();
  
  const updated = checkStmt.getAsObject(refId);
  return mapRowToReference(updated);
}

export async function deleteReference(refId: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM "references" WHERE id = ?');
  const result = stmt.run(refId);
  saveDatabase();
  return (result.changes || 0) > 0;
}

export async function addViewpoint(noteId: string, vp: Omit<Viewpoint, 'id' | 'noteId'>): Promise<Viewpoint> {
  const db = getDb();
  const id = uuidv4();
  
  const stmt = db.prepare(`
    INSERT INTO viewpoints (id, note_id, scholar, aspect, content, evidence, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run([id, noteId, vp.scholar, vp.aspect, vp.content, vp.evidence, vp.confidence]);
  saveDatabase();
  
  return { ...vp, id, noteId };
}

export async function updateViewpoint(vpId: string, vp: Partial<Viewpoint>): Promise<Viewpoint | null> {
  const db = getDb();
  
  const checkStmt = db.prepare('SELECT * FROM viewpoints WHERE id = ?');
  const existing = checkStmt.getAsObject(vpId);
  
  if (!existing || Object.keys(existing).length === 0) return null;
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (vp.scholar !== undefined) { updates.push('scholar = ?'); values.push(vp.scholar); }
  if (vp.aspect !== undefined) { updates.push('aspect = ?'); values.push(vp.aspect); }
  if (vp.content !== undefined) { updates.push('content = ?'); values.push(vp.content); }
  if (vp.evidence !== undefined) { updates.push('evidence = ?'); values.push(vp.evidence); }
  if (vp.confidence !== undefined) { updates.push('confidence = ?'); values.push(vp.confidence); }
  
  values.push(vpId);
  
  const stmt = db.prepare(`UPDATE viewpoints SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(values);
  saveDatabase();
  
  const updated = checkStmt.getAsObject(vpId);
  return mapRowToViewpoint(updated);
}

export async function deleteViewpoint(vpId: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM viewpoints WHERE id = ?');
  const result = stmt.run(vpId);
  saveDatabase();
  return (result.changes || 0) > 0;
}
