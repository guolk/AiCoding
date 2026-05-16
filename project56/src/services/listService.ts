import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import db from '../database/db';
import { ReadingList, Book } from '../types';
import { getBook } from './bookService';
import { getSimilarBooks as fetchSimilarBooks } from './openLibraryService';

export const createReadingList = async (
  name: string,
  description?: string,
  isPublic: boolean = false
): Promise<ReadingList> => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const shareToken = crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO reading_lists (id, name, description, isPublic, shareToken, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description || null, isPublic ? 1 : 0, shareToken, now, now],
      function(err) {
        if (err) reject(err);
        else {
          resolve({
            id,
            name,
            description,
            isPublic,
            shareToken,
            createdAt: now,
            updatedAt: now,
            books: []
          });
        }
      }
    );
  });
};

export const getReadingList = async (id: string): Promise<ReadingList | null> => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM reading_lists WHERE id = ?`, [id], async (err, row: any) => {
      if (err) reject(err);
      else if (!row) resolve(null);
      else {
        const books = await getReadingListBooks(id);
        resolve({
          ...row,
          isPublic: row.isPublic === 1,
          books
        });
      }
    });
  });
};

export const getReadingListByShareToken = async (token: string): Promise<ReadingList | null> => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM reading_lists WHERE shareToken = ?`, [token], async (err, row: any) => {
      if (err) reject(err);
      else if (!row) resolve(null);
      else if (row.isPublic !== 1) resolve(null);
      else {
        const books = await getReadingListBooks(row.id);
        resolve({
          ...row,
          isPublic: true,
          books
        });
      }
    });
  });
};

export const getAllReadingLists = async (): Promise<ReadingList[]> => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM reading_lists ORDER BY updatedAt DESC`, async (err, rows: any[]) => {
      if (err) reject(err);
      else {
        const listsWithBooks = await Promise.all(
          rows.map(async (row) => {
            const books = await getReadingListBooks(row.id);
            return {
              ...row,
              isPublic: row.isPublic === 1,
              books
            };
          })
        );
        resolve(listsWithBooks);
      }
    });
  });
};

export const updateReadingList = async (
  id: string,
  name: string,
  description?: string,
  isPublic?: boolean
): Promise<ReadingList | null> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    let query = `UPDATE reading_lists SET name = ?, updatedAt = ?`;
    let params: any[] = [name, now];
    
    if (description !== undefined) {
      query += `, description = ?`;
      params.push(description || null);
    }
    
    if (isPublic !== undefined) {
      query += `, isPublic = ?`;
      params.push(isPublic ? 1 : 0);
    }
    
    query += ` WHERE id = ?`;
    params.push(id);
    
    db.run(query, params, async function(err) {
      if (err) reject(err);
      else {
        const updatedList = await getReadingList(id);
        resolve(updatedList);
      }
    });
  });
};

export const deleteReadingList = async (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM reading_lists WHERE id = ?`, [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes !== undefined && this.changes > 0);
    });
  });
};

export const addBookToReadingList = async (listId: string, bookId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.run(
      `INSERT OR IGNORE INTO reading_list_books (listId, bookId, addedAt) VALUES (?, ?, ?)`,
      [listId, bookId, now],
      (err) => {
        if (err) reject(err);
        else {
          db.run(
            `UPDATE reading_lists SET updatedAt = ? WHERE id = ?`,
            [now, listId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        }
      }
    );
  });
};

export const removeBookFromReadingList = async (listId: string, bookId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.run(
      `DELETE FROM reading_list_books WHERE listId = ? AND bookId = ?`,
      [listId, bookId],
      (err) => {
        if (err) reject(err);
        else {
          db.run(
            `UPDATE reading_lists SET updatedAt = ? WHERE id = ?`,
            [now, listId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        }
      }
    );
  });
};

export const getReadingListBooks = async (listId: string): Promise<Book[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT b.* FROM books b 
       JOIN reading_list_books rlb ON b.id = rlb.bookId 
       WHERE rlb.listId = ? 
       ORDER BY rlb.addedAt DESC`,
      [listId],
      (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

export const regenerateShareToken = async (listId: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const newToken = crypto.randomBytes(16).toString('hex');
    
    db.run(
      `UPDATE reading_lists SET shareToken = ? WHERE id = ?`,
      [newToken, listId],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes && this.changes > 0 ? newToken : null);
      }
    );
  });
};

export const importBookFromList = async (shareToken: string, bookId: string): Promise<Book | null> => {
  const list = await getReadingListByShareToken(shareToken);
  if (!list) return null;
  
  const book = list.books?.find(b => b.id === bookId);
  if (!book) return null;
  
  const { createBook } = require('./bookService');
  return await createBook(book);
};

export const getSimilarBooks = async (bookId: string): Promise<Book[]> => {
  const book = await getBook(bookId);
  if (!book || !book.isbn) return [];
  
  try {
    const similarBooks = await fetchSimilarBooks(book.isbn);
    return similarBooks.map((b: any) => ({
      ...b,
      id: uuidv4(),
      status: 'want_to_read' as const,
      readCount: 0,
      currentPage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching similar books:', error);
    return [];
  }
};

export const getRecommendations = async (limit: number = 10): Promise<Book[]> => {
  return new Promise(async (resolve, reject) => {
    db.all(
      `SELECT b.isbn, b.id FROM books b 
       WHERE b.status = 'read' 
       ORDER BY b.updatedAt DESC 
       LIMIT 3`,
      async (err, rows: any[]) => {
        if (err) reject(err);
        else if (rows.length === 0) resolve([]);
        else {
          const recommendations: Book[] = [];
          const seenIsbns = new Set<string>();
          
          for (const row of rows) {
            if (row.isbn && recommendations.length < limit) {
              const similar = await getSimilarBooks(row.id);
              for (const book of similar) {
                if (book.isbn && !seenIsbns.has(book.isbn)) {
                  seenIsbns.add(book.isbn);
                  recommendations.push(book);
                  if (recommendations.length >= limit) break;
                }
              }
            }
          }
          
          resolve(recommendations.slice(0, limit));
        }
      }
    );
  });
};

export const addCompletedBook = async (
  bookId: string,
  rating?: number,
  review?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const completedDate = new Date().toISOString();
    
    db.run(
      `INSERT INTO read_history (id, bookId, completedDate, rating, review) VALUES (?, ?, ?, ?, ?)`,
      [id, bookId, completedDate, rating || null, review || null],
      (err) => {
        if (err) reject(err);
        else {
          db.run(
            `UPDATE books SET status = 'read', readCount = readCount + 1, updatedAt = ? WHERE id = ?`,
            [completedDate, bookId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        }
      }
    );
  });
};

export const getReadHistory = async (bookId: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM read_history WHERE bookId = ? ORDER BY completedDate DESC`,
      [bookId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
