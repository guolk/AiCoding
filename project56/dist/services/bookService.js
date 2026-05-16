"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooksByDecade = exports.getBooksByAuthor = exports.getBooksByTag = exports.getBookTags = exports.removeTagFromBook = exports.addTagToBook = exports.getTags = exports.createTag = exports.deleteBook = exports.incrementReadCount = exports.updateBookProgress = exports.updateBookStatus = exports.getBook = exports.getAllBooks = exports.createBook = exports.createBookFromISBN = void 0;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../database/db"));
const openLibraryService_1 = require("./openLibraryService");
const createBookFromISBN = async (isbn) => {
    const openLibraryBook = await (0, openLibraryService_1.getBookByISBN)(isbn);
    if (!openLibraryBook) {
        return null;
    }
    return (0, exports.createBook)(openLibraryBook);
};
exports.createBookFromISBN = createBookFromISBN;
const createBook = async (bookData) => {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        db_1.default.run(`INSERT INTO books (id, isbn, title, author, publisher, publishedDate, description, coverUrl, pageCount, status, readCount, currentPage, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ], function (err) {
            if (err) {
                // 如果是 ISBN 重复约束错误，尝试获取已存在的书籍
                if (err.code === 'SQLITE_CONSTRAINT' && bookData.isbn) {
                    db_1.default.get(`SELECT * FROM books WHERE isbn = ?`, [bookData.isbn], (getErr, row) => {
                        if (getErr) {
                            reject(getErr);
                        }
                        else if (row) {
                            // 对于已存在的书籍，我们仍然 resolve，但记录日志
                            console.log(`Book with ISBN ${bookData.isbn} already exists, returning existing book`);
                            resolve(row);
                        }
                        else {
                            reject(err);
                        }
                    });
                }
                else {
                    reject(err);
                }
            }
            else {
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
        });
    });
};
exports.createBook = createBook;
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(sql, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db_1.default.get(sql, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
};
const getAllBooks = async () => {
    const rows = await dbAll(`SELECT * FROM books ORDER BY updatedAt DESC`);
    const booksWithTags = await Promise.all(rows.map(async (row) => {
        const tags = await (0, exports.getBookTags)(row.id);
        return { ...row, tags };
    }));
    return booksWithTags;
};
exports.getAllBooks = getAllBooks;
const getBook = async (id) => {
    const row = await dbGet(`SELECT * FROM books WHERE id = ?`, [id]);
    if (!row)
        return null;
    const tags = await (0, exports.getBookTags)(id);
    return { ...row, tags };
};
exports.getBook = getBook;
const updateBookStatus = async (id, status) => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db_1.default.run(`UPDATE books SET status = ?, updatedAt = ? WHERE id = ?`, [status, now, id], function (err) {
            if (err)
                reject(err);
            else
                (0, exports.getBook)(id).then(resolve).catch(reject);
        });
    });
};
exports.updateBookStatus = updateBookStatus;
const updateBookProgress = async (id, currentPage) => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db_1.default.run(`UPDATE books SET currentPage = ?, updatedAt = ? WHERE id = ?`, [currentPage, now, id], function (err) {
            if (err)
                reject(err);
            else
                (0, exports.getBook)(id).then(resolve).catch(reject);
        });
    });
};
exports.updateBookProgress = updateBookProgress;
const incrementReadCount = async (id) => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db_1.default.run(`UPDATE books SET readCount = readCount + 1, status = 'read', updatedAt = ? WHERE id = ?`, [now, id], function (err) {
            if (err)
                reject(err);
            else
                (0, exports.getBook)(id).then(resolve).catch(reject);
        });
    });
};
exports.incrementReadCount = incrementReadCount;
const deleteBook = async (id) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(`DELETE FROM books WHERE id = ?`, [id], function (err) {
            if (err)
                reject(err);
            else
                resolve(this.changes !== undefined && this.changes > 0);
        });
    });
};
exports.deleteBook = deleteBook;
const createTag = async (name, color = '#3B82F6') => {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        db_1.default.run(`INSERT INTO tags (id, name, color, createdAt) VALUES (?, ?, ?, ?)`, [id, name, color, now], function (err) {
            if (err)
                reject(err);
            else
                resolve({ id, name, color, createdAt: now });
        });
    });
};
exports.createTag = createTag;
const getTags = async () => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM tags ORDER BY name`, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.getTags = getTags;
const addTagToBook = async (bookId, tagId) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(`INSERT OR IGNORE INTO book_tags (bookId, tagId) VALUES (?, ?)`, [bookId, tagId], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.addTagToBook = addTagToBook;
const removeTagFromBook = async (bookId, tagId) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(`DELETE FROM book_tags WHERE bookId = ? AND tagId = ?`, [bookId, tagId], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.removeTagFromBook = removeTagFromBook;
const getBookTags = async (bookId) => {
    return dbAll(`SELECT t.* FROM tags t JOIN book_tags bt ON t.id = bt.tagId WHERE bt.bookId = ?`, [bookId]);
};
exports.getBookTags = getBookTags;
const getBooksByTag = async (tagId) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT b.* FROM books b JOIN book_tags bt ON b.id = bt.bookId WHERE bt.tagId = ?`, [tagId], async (err, rows) => {
            if (err)
                reject(err);
            else {
                const booksWithTags = await Promise.all(rows.map(async (row) => {
                    const tags = await (0, exports.getBookTags)(row.id);
                    return { ...row, tags };
                }));
                resolve(booksWithTags);
            }
        });
    });
};
exports.getBooksByTag = getBooksByTag;
const getBooksByAuthor = async (author) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM books WHERE author LIKE ? ORDER BY publishedDate`, [`%${author}%`], async (err, rows) => {
            if (err)
                reject(err);
            else {
                const booksWithTags = await Promise.all(rows.map(async (row) => {
                    const tags = await (0, exports.getBookTags)(row.id);
                    return { ...row, tags };
                }));
                resolve(booksWithTags);
            }
        });
    });
};
exports.getBooksByAuthor = getBooksByAuthor;
const getBooksByDecade = async (decade) => {
    const startYear = Math.floor(decade / 10) * 10;
    const endYear = startYear + 9;
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM books WHERE publishedDate LIKE ? ORDER BY publishedDate`, [`${startYear}%`], async (err, rows) => {
            if (err)
                reject(err);
            else {
                const booksWithTags = await Promise.all(rows.map(async (row) => {
                    const tags = await (0, exports.getBookTags)(row.id);
                    return { ...row, tags };
                }));
                resolve(booksWithTags);
            }
        });
    });
};
exports.getBooksByDecade = getBooksByDecade;
