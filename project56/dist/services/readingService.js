"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnnualReport = exports.getReadingStats = exports.estimateRemainingTime = exports.calculateReadingSpeed = exports.getActiveReadingSession = exports.getBookReadingSessions = exports.getReadingSession = exports.endReadingSession = exports.startReadingSession = void 0;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../database/db"));
const bookService_1 = require("./bookService");
const startReadingSession = async (bookId, startPage) => {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const startTime = new Date().toISOString();
        db_1.default.run(`INSERT INTO reading_sessions (id, bookId, startTime, startPage, pagesRead, duration) VALUES (?, ?, ?, ?, 0, 0)`, [id, bookId, startTime, startPage], function (err) {
            if (err)
                reject(err);
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
        });
    });
};
exports.startReadingSession = startReadingSession;
const endReadingSession = async (sessionId, endPage) => {
    return new Promise((resolve, reject) => {
        db_1.default.get(`SELECT * FROM reading_sessions WHERE id = ?`, [sessionId], (err, session) => {
            if (err)
                reject(err);
            else if (!session)
                resolve(null);
            else {
                const endTime = new Date().toISOString();
                const pagesRead = Math.max(0, endPage - session.startPage);
                const duration = Math.floor((new Date(endTime).getTime() - new Date(session.startTime).getTime()) / 1000);
                db_1.default.run(`UPDATE reading_sessions SET endTime = ?, endPage = ?, pagesRead = ?, duration = ? WHERE id = ?`, [endTime, endPage, pagesRead, duration, sessionId], async function (err) {
                    if (err)
                        reject(err);
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
                });
            }
        });
    });
};
exports.endReadingSession = endReadingSession;
const updateBookProgress = async (bookId, currentPage) => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db_1.default.run(`UPDATE books SET currentPage = ?, updatedAt = ? WHERE id = ?`, [currentPage, now, bookId], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
const getReadingSession = async (id) => {
    return new Promise((resolve, reject) => {
        db_1.default.get(`SELECT * FROM reading_sessions WHERE id = ?`, [id], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row || null);
        });
    });
};
exports.getReadingSession = getReadingSession;
const getBookReadingSessions = async (bookId) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM reading_sessions WHERE bookId = ? ORDER BY startTime DESC`, [bookId], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.getBookReadingSessions = getBookReadingSessions;
const getActiveReadingSession = async (bookId) => {
    return new Promise((resolve, reject) => {
        db_1.default.get(`SELECT * FROM reading_sessions WHERE bookId = ? AND endTime IS NULL ORDER BY startTime DESC LIMIT 1`, [bookId], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row || null);
        });
    });
};
exports.getActiveReadingSession = getActiveReadingSession;
const calculateReadingSpeed = async (bookId) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT AVG(pagesRead * 60.0 / duration) as speed FROM reading_sessions WHERE duration > 60`;
        let params = [];
        if (bookId) {
            query += ` AND bookId = ?`;
            params.push(bookId);
        }
        db_1.default.get(query, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row?.speed || 0);
        });
    });
};
exports.calculateReadingSpeed = calculateReadingSpeed;
const estimateRemainingTime = async (bookId) => {
    const book = await (0, bookService_1.getBook)(bookId);
    if (!book || !book.pageCount)
        return null;
    const remainingPages = Math.max(0, book.pageCount - book.currentPage);
    if (remainingPages === 0)
        return 0;
    const speed = await (0, exports.calculateReadingSpeed)(bookId);
    if (speed === 0)
        return null;
    return Math.round((remainingPages / speed) * 60);
};
exports.estimateRemainingTime = estimateRemainingTime;
const getReadingStats = async () => {
    return new Promise(async (resolve, reject) => {
        db_1.default.get(`SELECT COUNT(*) as total FROM books`, (err, totalRow) => {
            if (err)
                reject(err);
            else {
                db_1.default.get(`SELECT SUM(pageCount) as pages FROM books WHERE status = 'read'`, (err, pagesRow) => {
                    if (err)
                        reject(err);
                    else {
                        db_1.default.all(`SELECT status, COUNT(*) as count FROM books GROUP BY status`, async (err, statusRows) => {
                            if (err)
                                reject(err);
                            else {
                                const booksByStatus = {
                                    want_to_read: 0,
                                    reading: 0,
                                    read: 0,
                                    abandoned: 0
                                };
                                statusRows.forEach(row => {
                                    booksByStatus[row.status] = row.count;
                                });
                                const averageReadingSpeed = await (0, exports.calculateReadingSpeed)();
                                const streaks = await calculateStreaks();
                                db_1.default.all(`SELECT t.name, COUNT(bt.bookId) as count 
                       FROM tags t 
                       JOIN book_tags bt ON t.id = bt.tagId 
                       JOIN books b ON bt.bookId = b.id 
                       WHERE b.status = 'read'
                       GROUP BY t.id 
                       ORDER BY count DESC 
                       LIMIT 5`, (err, tagRows) => {
                                    if (err)
                                        reject(err);
                                    else {
                                        resolve({
                                            totalBooks: totalRow.total,
                                            totalPages: pagesRow.pages || 0,
                                            booksByStatus: booksByStatus,
                                            averageReadingSpeed: Math.round(averageReadingSpeed * 100) / 100,
                                            currentStreak: streaks.current,
                                            longestStreak: streaks.longest,
                                            favoriteTags: tagRows.map(row => ({ tag: row.name, count: row.count }))
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
};
exports.getReadingStats = getReadingStats;
const calculateStreaks = async () => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT DISTINCT DATE(startTime) as date 
       FROM reading_sessions 
       WHERE endTime IS NOT NULL 
       ORDER BY date DESC`, (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0) {
                resolve({ current: 0, longest: 0 });
            }
            else {
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
                        if (currentStreak > 0)
                            currentStreak++;
                    }
                    else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                        currentStreak = 0;
                    }
                }
                longestStreak = Math.max(longestStreak, tempStreak);
                resolve({ current: currentStreak, longest: longestStreak });
            }
        });
    });
};
const generateAnnualReport = async (year) => {
    return new Promise(async (resolve, reject) => {
        const startDate = `${year}-01-01`;
        const endDate = `${year + 1}-01-01`;
        db_1.default.get(`SELECT COUNT(*) as booksRead, SUM(pagesRead) as totalPages, SUM(duration) as totalDuration
       FROM reading_sessions rs
       JOIN books b ON rs.bookId = b.id
       WHERE rs.endTime IS NOT NULL
       AND rs.startTime >= ? AND rs.startTime < ?
       AND b.status = 'read'`, [startDate, endDate], (err, summaryRow) => {
            if (err)
                reject(err);
            else {
                db_1.default.all(`SELECT 
              strftime('%m', rs.startTime) as month,
              COUNT(DISTINCT rs.bookId) as books,
              SUM(rs.pagesRead) as pages
             FROM reading_sessions rs
             WHERE rs.endTime IS NOT NULL
             AND rs.startTime >= ? AND rs.startTime < ?
             GROUP BY month
             ORDER BY month`, [startDate, endDate], (err, monthlyRows) => {
                    if (err)
                        reject(err);
                    else {
                        db_1.default.all(`SELECT t.name, COUNT(bt.bookId) as count
                   FROM tags t
                   JOIN book_tags bt ON t.id = bt.tagId
                   JOIN books b ON bt.bookId = b.id
                   JOIN read_history rh ON b.id = rh.bookId
                   WHERE rh.completedDate >= ? AND rh.completedDate < ?
                   GROUP BY t.id
                   ORDER BY count DESC
                   LIMIT 1`, [startDate, endDate], (err, genreRows) => {
                            if (err)
                                reject(err);
                            else {
                                db_1.default.all(`SELECT b.*, rh.rating
                         FROM books b
                         JOIN read_history rh ON b.id = rh.bookId
                         WHERE rh.completedDate >= ? AND rh.completedDate < ?
                         ORDER BY rh.rating DESC
                         LIMIT 5`, [startDate, endDate], async (err, bookRows) => {
                                    if (err)
                                        reject(err);
                                    else {
                                        const streaks = await calculateStreaks();
                                        db_1.default.get(`SELECT AVG(rating) as avgRating
                               FROM read_history
                               WHERE completedDate >= ? AND completedDate < ?
                               AND rating IS NOT NULL`, [startDate, endDate], (err, ratingRow) => {
                                            if (err)
                                                reject(err);
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
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
};
exports.generateAnnualReport = generateAnnualReport;
