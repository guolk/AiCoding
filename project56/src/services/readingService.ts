import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { ReadingSession, ReadingStats, AnnualReport, Book } from '../types';
import { getBook } from './bookService';

export const startReadingSession = async (bookId: string, startPage: number): Promise<ReadingSession> => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const startTime = new Date().toISOString();
    
    db.run(
      `INSERT INTO reading_sessions (id, bookId, startTime, startPage, pagesRead, duration) VALUES (?, ?, ?, ?, 0, 0)`,
      [id, bookId, startTime, startPage],
      function(err) {
        if (err) reject(err);
        else {
          resolve({
            id,
            bookId,
            startTime,
            startPage,
            pagesRead: 0,
            duration: 0
          });
        }
      }
    );
  });
};

export const endReadingSession = async (sessionId: string, endPage: number): Promise<ReadingSession | null> => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM reading_sessions WHERE id = ?`, [sessionId], (err, session: any) => {
      if (err) reject(err);
      else if (!session) resolve(null);
      else {
        const endTime = new Date().toISOString();
        const pagesRead = Math.max(0, endPage - session.startPage);
        const duration = Math.floor((new Date(endTime).getTime() - new Date(session.startTime).getTime()) / 1000);
        
        db.run(
          `UPDATE reading_sessions SET endTime = ?, endPage = ?, pagesRead = ?, duration = ? WHERE id = ?`,
          [endTime, endPage, pagesRead, duration, sessionId],
          async function(err) {
            if (err) reject(err);
            else {
              await updateBookProgress(session.bookId, endPage);
              resolve({
                ...session,
                endTime,
                endPage,
                pagesRead,
                duration
              });
            }
          }
        );
      }
    });
  });
};

const updateBookProgress = async (bookId: string, currentPage: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.run(
      `UPDATE books SET currentPage = ?, updatedAt = ? WHERE id = ?`,
      [currentPage, now, bookId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const getReadingSession = async (id: string): Promise<ReadingSession | null> => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM reading_sessions WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row as ReadingSession || null);
    });
  });
};

export const getBookReadingSessions = async (bookId: string): Promise<ReadingSession[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM reading_sessions WHERE bookId = ? ORDER BY startTime DESC`,
      [bookId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows as ReadingSession[]);
      }
    );
  });
};

export const getActiveReadingSession = async (bookId: string): Promise<ReadingSession | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM reading_sessions WHERE bookId = ? AND endTime IS NULL ORDER BY startTime DESC LIMIT 1`,
      [bookId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row as ReadingSession || null);
      }
    );
  });
};

export const calculateReadingSpeed = async (bookId?: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    let query = `SELECT AVG(pagesRead * 60.0 / duration) as speed FROM reading_sessions WHERE duration > 60`;
    let params: any[] = [];
    
    if (bookId) {
      query += ` AND bookId = ?`;
      params.push(bookId);
    }
    
    db.get(query, params, (err, row: any) => {
      if (err) reject(err);
      else resolve(row?.speed || 0);
    });
  });
};

export const estimateRemainingTime = async (bookId: string): Promise<number | null> => {
  const book = await getBook(bookId);
  if (!book || !book.pageCount) return null;
  
  const remainingPages = Math.max(0, book.pageCount - book.currentPage);
  if (remainingPages === 0) return 0;
  
  const speed = await calculateReadingSpeed(bookId);
  if (speed === 0) return null;
  
  return Math.round((remainingPages / speed) * 60);
};

export const getReadingStats = async (): Promise<ReadingStats> => {
  return new Promise(async (resolve, reject) => {
    db.get(`SELECT COUNT(*) as total FROM books`, (err, totalRow: any) => {
      if (err) reject(err);
      else {
        db.get(
          `SELECT SUM(pageCount) as pages FROM books WHERE status = 'read'`,
          (err, pagesRow: any) => {
            if (err) reject(err);
            else {
              db.all(
                `SELECT status, COUNT(*) as count FROM books GROUP BY status`,
                async (err, statusRows: any[]) => {
                  if (err) reject(err);
                  else {
                    const booksByStatus: Record<string, number> = {
                      want_to_read: 0,
                      reading: 0,
                      read: 0,
                      abandoned: 0
                    };
                    statusRows.forEach(row => {
                      booksByStatus[row.status] = row.count;
                    });
                    
                    const averageReadingSpeed = await calculateReadingSpeed();
                    const streaks = await calculateStreaks();
                    
                    db.all(
                      `SELECT t.name, COUNT(bt.bookId) as count 
                       FROM tags t 
                       JOIN book_tags bt ON t.id = bt.tagId 
                       JOIN books b ON bt.bookId = b.id 
                       WHERE b.status = 'read'
                       GROUP BY t.id 
                       ORDER BY count DESC 
                       LIMIT 5`,
                      (err, tagRows: any[]) => {
                        if (err) reject(err);
                        else {
                          resolve({
                            totalBooks: totalRow.total,
                            totalPages: pagesRow.pages || 0,
                            booksByStatus: booksByStatus as any,
                            averageReadingSpeed: Math.round(averageReadingSpeed * 100) / 100,
                            currentStreak: streaks.current,
                            longestStreak: streaks.longest,
                            favoriteTags: tagRows.map(row => ({ tag: row.name, count: row.count }))
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    });
  });
};

const calculateStreaks = async (): Promise<{ current: number; longest: number }> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT DATE(startTime) as date 
       FROM reading_sessions 
       WHERE endTime IS NOT NULL 
       ORDER BY date DESC`,
      (err, rows: any[]) => {
        if (err) reject(err);
        else if (rows.length === 0) {
          resolve({ current: 0, longest: 0 });
        } else {
          let currentStreak = 0;
          let longestStreak = 0;
          let tempStreak = 1;
          
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          
          if (rows[0].date === today || rows[0].date === yesterday) {
            currentStreak = 1;
          }
          
          for (let i = 1; i < rows.length; i++) {
            const prev = new Date(rows[i - 1].date);
            const curr = new Date(rows[i].date);
            const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
              tempStreak++;
              if (currentStreak > 0) currentStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
              currentStreak = 0;
            }
          }
          
          longestStreak = Math.max(longestStreak, tempStreak);
          
          resolve({ current: currentStreak, longest: longestStreak });
        }
      }
    );
  });
};

export const generateAnnualReport = async (year: number): Promise<AnnualReport> => {
  return new Promise(async (resolve, reject) => {
    const startDate = `${year}-01-01`;
    const endDate = `${year + 1}-01-01`;
    
    db.get(
      `SELECT COUNT(*) as booksRead, SUM(pagesRead) as totalPages, SUM(duration) as totalDuration
       FROM reading_sessions rs
       JOIN books b ON rs.bookId = b.id
       WHERE rs.endTime IS NOT NULL
       AND rs.startTime >= ? AND rs.startTime < ?
       AND b.status = 'read'`,
      [startDate, endDate],
      (err, summaryRow: any) => {
        if (err) reject(err);
        else {
          db.all(
            `SELECT 
              strftime('%m', rs.startTime) as month,
              COUNT(DISTINCT rs.bookId) as books,
              SUM(rs.pagesRead) as pages
             FROM reading_sessions rs
             WHERE rs.endTime IS NOT NULL
             AND rs.startTime >= ? AND rs.startTime < ?
             GROUP BY month
             ORDER BY month`,
            [startDate, endDate],
            (err, monthlyRows: any[]) => {
              if (err) reject(err);
              else {
                db.all(
                  `SELECT t.name, COUNT(bt.bookId) as count
                   FROM tags t
                   JOIN book_tags bt ON t.id = bt.tagId
                   JOIN books b ON bt.bookId = b.id
                   JOIN read_history rh ON b.id = rh.bookId
                   WHERE rh.completedDate >= ? AND rh.completedDate < ?
                   GROUP BY t.id
                   ORDER BY count DESC
                   LIMIT 1`,
                  [startDate, endDate],
                  (err, genreRows: any[]) => {
                    if (err) reject(err);
                    else {
                      db.all(
                        `SELECT b.*, rh.rating
                         FROM books b
                         JOIN read_history rh ON b.id = rh.bookId
                         WHERE rh.completedDate >= ? AND rh.completedDate < ?
                         ORDER BY rh.rating DESC
                         LIMIT 5`,
                        [startDate, endDate],
                        async (err, bookRows: any[]) => {
                          if (err) reject(err);
                          else {
                            const streaks = await calculateStreaks();
                            
                            db.get(
                              `SELECT AVG(rating) as avgRating
                               FROM read_history
                               WHERE completedDate >= ? AND completedDate < ?
                               AND rating IS NOT NULL`,
                              [startDate, endDate],
                              (err, ratingRow: any) => {
                                if (err) reject(err);
                                else {
                                  const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => ({
                                    month: i + 1,
                                    books: 0,
                                    pages: 0
                                  }));
                                  
                                  monthlyRows.forEach(row => {
                                    const monthIdx = parseInt(row.month) - 1;
                                    if (monthIdx >= 0 && monthIdx < 12) {
                                      monthlyBreakdown[monthIdx] = {
                                        month: monthIdx + 1,
                                        books: row.books,
                                        pages: row.pages || 0
                                      };
                                    }
                                  });
                                  
                                  resolve({
                                    year,
                                    totalBooksRead: summaryRow.booksRead || 0,
                                    totalPagesRead: summaryRow.totalPages || 0,
                                    totalReadingHours: Math.round((summaryRow.totalDuration || 0) / 3600),
                                    favoriteGenre: genreRows[0]?.name || 'N/A',
                                    longestStreak: streaks.longest,
                                    averageRating: ratingRow?.avgRating ? Math.round(ratingRow.avgRating * 10) / 10 : 0,
                                    monthlyBreakdown,
                                    topBooks: bookRows.map(row => ({
                                      book: row,
                                      rating: row.rating
                                    }))
                                  });
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  });
};
