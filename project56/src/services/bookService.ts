import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { Book, BookStatus, Tag } from '../types';
import { getBookByISBN, OpenLibraryBook } from './openLibraryService';

export const createBookFromISBN = async (isbn: string): Promise<Book | null> => {
  const openLibraryBook = await getBookByISBN(isbn);
  if (!openLibraryBook) {
    return null;
  }
  return createBook(openLibraryBook);
};

export const createBook = async (bookData: Partial<OpenLibraryBook> & { title: string }): Promise<Book> => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO books (id, isbn, title, author, publisher, publishedDate, description, coverUrl, pageCount, status, readCount, currentPage, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bookData.isbn || null,
        bookData.title,
        bookData.author || null,
        bookData.publisher || null,
        bookData.publishedDate || null,
        bookData.description || null,
        bookData.coverUrl || null,
        bookData.pageCount || null,
        'want_to_read',
        0,
        0,
        now,
        now
      ],
      function(err: any) {
        if (err) {
          // 如果是 ISBN 重复约束错误，尝试获取已存在的书籍
          if (err.code === 'SQLITE_CONSTRAINT' && bookData.isbn) {
            db.get(`SELECT * FROM books WHERE isbn = ?`, [bookData.isbn], (getErr, row) => {
              if (getErr) {
                reject(getErr);
              } else if (row) {
                // 对于已存在的书籍，我们仍然 resolve，但记录日志
                console.log(`Book with ISBN ${bookData.isbn} already exists, returning existing book`);
                resolve(row as Book);
              } else {
                reject(err);
              }
            });
          } else {
            reject(err);
          }
        } else {
          resolve({
            id,
            isbn: bookData.isbn,
            title: bookData.title,
            author: bookData.author,
            publisher: bookData.publisher,
            publishedDate: bookData.publishedDate,
            description: bookData.description,
            coverUrl: bookData.coverUrl,
            pageCount: bookData.pageCount,
            status: 'want_to_read',
            readCount: 0,
            currentPage: 0,
            createdAt: now,
            updatedAt: now
          });
        }
      }
    );
  });
};

const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const getAllBooks = async (): Promise<Book[]> => {
  const rows = await dbAll(`SELECT * FROM books ORDER BY updatedAt DESC`);
  const booksWithTags = await Promise.all(
    rows.map(async (row) => {
      const tags = await getBookTags(row.id);
      return { ...row, tags };
    })
  );
  return booksWithTags;
};

export const getBook = async (id: string): Promise<Book | null> => {
  const row = await dbGet(`SELECT * FROM books WHERE id = ?`, [id]);
  if (!row) return null;
  const tags = await getBookTags(id);
  return { ...row, tags };
};

export const updateBookStatus = async (id: string, status: BookStatus): Promise<Book | null> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.run(
      `UPDATE books SET status = ?, updatedAt = ? WHERE id = ?`,
      [status, now, id],
      function(err) {
        if (err) reject(err);
        else getBook(id).then(resolve).catch(reject);
      }
    );
  });
};

export const updateBookProgress = async (id: string, currentPage: number): Promise<Book | null> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.run(
      `UPDATE books SET currentPage = ?, updatedAt = ? WHERE id = ?`,
      [currentPage, now, id],
      function(err) {
        if (err) reject(err);
        else getBook(id).then(resolve).catch(reject);
      }
    );
  });
};

export const incrementReadCount = async (id: string): Promise<Book | null> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.run(
      `UPDATE books SET readCount = readCount + 1, status = 'read', updatedAt = ? WHERE id = ?`,
      [now, id],
      function(err) {
        if (err) reject(err);
        else getBook(id).then(resolve).catch(reject);
      }
    );
  });
};

export const deleteBook = async (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM books WHERE id = ?`, [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes !== undefined && this.changes > 0);
    });
  });
};

export const createTag = async (name: string, color: string = '#3B82F6'): Promise<Tag> => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO tags (id, name, color, createdAt) VALUES (?, ?, ?, ?)`,
      [id, name, color, now],
      function(err) {
        if (err) reject(err);
        else resolve({ id, name, color, createdAt: now });
      }
    );
  });
};

export const getTags = async (): Promise<Tag[]> => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM tags ORDER BY name`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Tag[]);
    });
  });
};

export const addTagToBook = async (bookId: string, tagId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO book_tags (bookId, tagId) VALUES (?, ?)`,
      [bookId, tagId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const removeTagFromBook = async (bookId: string, tagId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM book_tags WHERE bookId = ? AND tagId = ?`,
      [bookId, tagId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const getBookTags = async (bookId: string): Promise<Tag[]> => {
  return dbAll(
    `SELECT t.* FROM tags t JOIN book_tags bt ON t.id = bt.tagId WHERE bt.bookId = ?`,
    [bookId]
  );
};

export const getBooksByTag = async (tagId: string): Promise<Book[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT b.* FROM books b JOIN book_tags bt ON b.id = bt.bookId WHERE bt.tagId = ?`,
      [tagId],
      async (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const booksWithTags = await Promise.all(
            rows.map(async (row) => {
              const tags = await getBookTags(row.id);
              return { ...row, tags };
            })
          );
          resolve(booksWithTags);
        }
      }
    );
  });
};

export const getBooksByAuthor = async (author: string): Promise<Book[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM books WHERE author LIKE ? ORDER BY publishedDate`,
      [`%${author}%`],
      async (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const booksWithTags = await Promise.all(
            rows.map(async (row) => {
              const tags = await getBookTags(row.id);
              return { ...row, tags };
            })
          );
          resolve(booksWithTags);
        }
      }
    );
  });
};

export const getBooksByDecade = async (decade: number): Promise<Book[]> => {
  const startYear = Math.floor(decade / 10) * 10;
  const endYear = startYear + 9;
  
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM books WHERE publishedDate LIKE ? ORDER BY publishedDate`,
      [`${startYear}%`],
      async (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const booksWithTags = await Promise.all(
            rows.map(async (row) => {
              const tags = await getBookTags(row.id);
              return { ...row, tags };
            })
          );
          resolve(booksWithTags);
        }
      }
    );
  });
};
