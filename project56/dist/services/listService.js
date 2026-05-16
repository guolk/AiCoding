"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadHistory = exports.addCompletedBook = exports.getRecommendations = exports.getSimilarBooks = exports.importBookFromList = exports.regenerateShareToken = exports.getReadingListBooks = exports.removeBookFromReadingList = exports.addBookToReadingList = exports.deleteReadingList = exports.updateReadingList = exports.getAllReadingLists = exports.getReadingListByShareToken = exports.getReadingList = exports.createReadingList = void 0;
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../database/db"));
const bookService_1 = require("./bookService");
const openLibraryService_1 = require("./openLibraryService");
const createReadingList = async (name, description, isPublic = false) => {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const shareToken = crypto_1.default.randomBytes(16).toString('hex');
        const now = new Date().toISOString();
        db_1.default.run(`INSERT INTO reading_lists (id, name, description, isPublic, shareToken, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, name, description || null, isPublic ? 1 : 0, shareToken, now, now], function (err) {
            if (err)
                reject(err);
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
        });
    });
};
exports.createReadingList = createReadingList;
const getReadingList = async (id) => {
    return new Promise((resolve, reject) => {
        db_1.default.get(`SELECT * FROM reading_lists WHERE id = ?`, [id], async (err, row) => {
            if (err)
                reject(err);
            else if (!row)
                resolve(null);
            else {
                const books = await (0, exports.getReadingListBooks)(id);
                resolve({
                    ...row,
                    isPublic: row.isPublic === 1,
                    books
                });
            }
        });
    });
};
exports.getReadingList = getReadingList;
const getReadingListByShareToken = async (token) => {
    return new Promise((resolve, reject) => {
        db_1.default.get(`SELECT * FROM reading_lists WHERE shareToken = ?`, [token], async (err, row) => {
            if (err)
                reject(err);
            else if (!row)
                resolve(null);
            else if (row.isPublic !== 1)
                resolve(null);
            else {
                const books = await (0, exports.getReadingListBooks)(row.id);
                resolve({
                    ...row,
                    isPublic: true,
                    books
                });
            }
        });
    });
};
exports.getReadingListByShareToken = getReadingListByShareToken;
const getAllReadingLists = async () => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM reading_lists ORDER BY updatedAt DESC`, async (err, rows) => {
            if (err)
                reject(err);
            else {
                const listsWithBooks = await Promise.all(rows.map(async (row) => {
                    const books = await (0, exports.getReadingListBooks)(row.id);
                    return {
                        ...row,
                        isPublic: row.isPublic === 1,
                        books
                    };
                }));
                resolve(listsWithBooks);
            }
        });
    });
};
exports.getAllReadingLists = getAllReadingLists;
const updateReadingList = async (id, name, description, isPublic) => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        let query = `UPDATE reading_lists SET name = ?, updatedAt = ?`;
        let params = [name, now];
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
        db_1.default.run(query, params, async function (err) {
            if (err)
                reject(err);
            else {
                const updatedList = await (0, exports.getReadingList)(id);
                resolve(updatedList);
            }
        });
    });
};
exports.updateReadingList = updateReadingList;
const deleteReadingList = async (id) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(`DELETE FROM reading_lists WHERE id = ?`, [id], function (err) {
            if (err)
                reject(err);
            else
                resolve(this.changes !== undefined && this.changes > 0);
        });
    });
};
exports.deleteReadingList = deleteReadingList;
const addBookToReadingList = async (listId, bookId) => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db_1.default.run(`INSERT OR IGNORE INTO reading_list_books (listId, bookId, addedAt) VALUES (?, ?, ?)`, [listId, bookId, now], (err) => {
            if (err)
                reject(err);
            else {
                db_1.default.run(`UPDATE reading_lists SET updatedAt = ? WHERE id = ?`, [now, listId], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            }
        });
    });
};
exports.addBookToReadingList = addBookToReadingList;
const removeBookFromReadingList = async (listId, bookId) => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db_1.default.run(`DELETE FROM reading_list_books WHERE listId = ? AND bookId = ?`, [listId, bookId], (err) => {
            if (err)
                reject(err);
            else {
                db_1.default.run(`UPDATE reading_lists SET updatedAt = ? WHERE id = ?`, [now, listId], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            }
        });
    });
};
exports.removeBookFromReadingList = removeBookFromReadingList;
const getReadingListBooks = async (listId) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT b.* FROM books b 
       JOIN reading_list_books rlb ON b.id = rlb.bookId 
       WHERE rlb.listId = ? 
       ORDER BY rlb.addedAt DESC`, [listId], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.getReadingListBooks = getReadingListBooks;
const regenerateShareToken = async (listId) => {
    return new Promise((resolve, reject) => {
        const newToken = crypto_1.default.randomBytes(16).toString('hex');
        db_1.default.run(`UPDATE reading_lists SET shareToken = ? WHERE id = ?`, [newToken, listId], function (err) {
            if (err)
                reject(err);
            else
                resolve(this.changes && this.changes > 0 ? newToken : null);
        });
    });
};
exports.regenerateShareToken = regenerateShareToken;
const importBookFromList = async (shareToken, bookId) => {
    const list = await (0, exports.getReadingListByShareToken)(shareToken);
    if (!list)
        return null;
    const book = list.books?.find(b => b.id === bookId);
    if (!book)
        return null;
    const { createBook } = require('./bookService');
    return await createBook(book);
};
exports.importBookFromList = importBookFromList;
const getSimilarBooks = async (bookId) => {
    const book = await (0, bookService_1.getBook)(bookId);
    if (!book || !book.isbn)
        return [];
    try {
        const similarBooks = await (0, openLibraryService_1.getSimilarBooks)(book.isbn);
        return similarBooks.map((b) => ({
            ...b,
            id: (0, uuid_1.v4)(),
            status: 'want_to_read',
            readCount: 0,
            currentPage: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
    }
    catch (error) {
        console.error('Error fetching similar books:', error);
        return [];
    }
};
exports.getSimilarBooks = getSimilarBooks;
const getRecommendations = async (limit = 10) => {
    return new Promise(async (resolve, reject) => {
        db_1.default.all(`SELECT b.isbn, b.id FROM books b 
       WHERE b.status = 'read' 
       ORDER BY b.updatedAt DESC 
       LIMIT 3`, async (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve([]);
            else {
                const recommendations = [];
                const seenIsbns = new Set();
                for (const row of rows) {
                    if (row.isbn && recommendations.length < limit) {
                        const similar = await (0, exports.getSimilarBooks)(row.id);
                        for (const book of similar) {
                            if (book.isbn && !seenIsbns.has(book.isbn)) {
                                seenIsbns.add(book.isbn);
                                recommendations.push(book);
                                if (recommendations.length >= limit)
                                    break;
                            }
                        }
                    }
                }
                resolve(recommendations.slice(0, limit));
            }
        });
    });
};
exports.getRecommendations = getRecommendations;
const addCompletedBook = async (bookId, rating, review) => {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const completedDate = new Date().toISOString();
        db_1.default.run(`INSERT INTO read_history (id, bookId, completedDate, rating, review) VALUES (?, ?, ?, ?, ?)`, [id, bookId, completedDate, rating || null, review || null], (err) => {
            if (err)
                reject(err);
            else {
                db_1.default.run(`UPDATE books SET status = 'read', readCount = readCount + 1, updatedAt = ? WHERE id = ?`, [completedDate, bookId], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            }
        });
    });
};
exports.addCompletedBook = addCompletedBook;
const getReadHistory = async (bookId) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM read_history WHERE bookId = ? ORDER BY completedDate DESC`, [bookId], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.getReadHistory = getReadHistory;
