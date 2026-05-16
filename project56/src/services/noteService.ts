import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { Note, NoteType } from '../types';
import { getBook } from './bookService';

export const createNote = async (
  bookId: string,
  type: NoteType,
  content: string,
  pageNumber?: number,
  chapter?: string,
  topics?: string[]
): Promise<Note> => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO notes (id, bookId, type, content, pageNumber, chapter, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, bookId, type, content, pageNumber || null, chapter || null, now, now],
      async function(err) {
        if (err) reject(err);
        else {
          if (topics && topics.length > 0) {
            await Promise.all(topics.map(topic => addTopicToNote(id, topic)));
          }
          resolve({
            id,
            bookId,
            type,
            content,
            pageNumber,
            chapter,
            createdAt: now,
            updatedAt: now,
            topics
          });
        }
      }
    );
  });
};

export const getNote = async (id: string): Promise<Note | null> => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM notes WHERE id = ?`, [id], async (err, row: any) => {
      if (err) reject(err);
      else if (!row) resolve(null);
      else {
        const topics = await getNoteTopics(id);
        resolve({ ...row, topics });
      }
    });
  });
};

export const getBookNotes = async (bookId: string): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM notes WHERE bookId = ? ORDER BY pageNumber, createdAt`,
      [bookId],
      async (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const notesWithTopics = await Promise.all(
            rows.map(async (row) => {
              const topics = await getNoteTopics(row.id);
              return { ...row, topics };
            })
          );
          resolve(notesWithTopics);
        }
      }
    );
  });
};

export const getBookHighlights = async (bookId: string): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM notes WHERE bookId = ? AND type = 'highlight' ORDER BY pageNumber`,
      [bookId],
      async (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const notesWithTopics = await Promise.all(
            rows.map(async (row) => {
              const topics = await getNoteTopics(row.id);
              return { ...row, topics };
            })
          );
          resolve(notesWithTopics);
        }
      }
    );
  });
};

export const getNotesByChapter = async (bookId: string, chapter: string): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM notes WHERE bookId = ? AND chapter = ? ORDER BY pageNumber`,
      [bookId, chapter],
      async (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const notesWithTopics = await Promise.all(
            rows.map(async (row) => {
              const topics = await getNoteTopics(row.id);
              return { ...row, topics };
            })
          );
          resolve(notesWithTopics);
        }
      }
    );
  });
};

export const getBookChapters = async (bookId: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT chapter FROM notes WHERE bookId = ? AND chapter IS NOT NULL ORDER BY chapter`,
      [bookId],
      (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.chapter));
      }
    );
  });
};

export const updateNote = async (
  id: string,
  content: string,
  pageNumber?: number,
  chapter?: string,
  topics?: string[]
): Promise<Note | null> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.run(
      `UPDATE notes SET content = ?, pageNumber = ?, chapter = ?, updatedAt = ? WHERE id = ?`,
      [content, pageNumber || null, chapter || null, now, id],
      async function(err) {
        if (err) reject(err);
        else {
          if (topics !== undefined) {
            await clearNoteTopics(id);
            await Promise.all(topics.map(topic => addTopicToNote(id, topic)));
          }
          const updatedNote = await getNote(id);
          resolve(updatedNote);
        }
      }
    );
  });
};

export const deleteNote = async (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM notes WHERE id = ?`, [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes !== undefined && this.changes > 0);
    });
  });
};

export const addTopicToNote = async (noteId: string, topic: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO note_topics (noteId, topic) VALUES (?, ?)`,
      [noteId, topic],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const removeTopicFromNote = async (noteId: string, topic: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM note_topics WHERE noteId = ? AND topic = ?`,
      [noteId, topic],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const clearNoteTopics = async (noteId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM note_topics WHERE noteId = ?`, [noteId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const getNoteTopics = async (noteId: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT topic FROM note_topics WHERE noteId = ?`,
      [noteId],
      (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.topic));
      }
    );
  });
};

export const getAllTopics = async (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT topic FROM note_topics ORDER BY topic`,
      (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.topic));
      }
    );
  });
};

export const getNotesByTopic = async (topic: string): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT n.* FROM notes n JOIN note_topics nt ON n.id = nt.noteId WHERE nt.topic = ? ORDER BY n.createdAt`,
      [topic],
      async (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const notesWithTopics = await Promise.all(
            rows.map(async (row) => {
              const topics = await getNoteTopics(row.id);
              const book = await getBook(row.bookId);
              return { ...row, topics, bookTitle: book?.title };
            })
          );
          resolve(notesWithTopics);
        }
      }
    );
  });
};

export const getTopicStats = async (): Promise<{ topic: string; noteCount: number; bookCount: number }[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        nt.topic,
        COUNT(DISTINCT nt.noteId) as noteCount,
        COUNT(DISTINCT n.bookId) as bookCount
       FROM note_topics nt
       JOIN notes n ON nt.noteId = n.id
       GROUP BY nt.topic
       ORDER BY noteCount DESC`,
      (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
