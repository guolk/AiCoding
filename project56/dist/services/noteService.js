"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopicStats = exports.getNotesByTopic = exports.getAllTopics = exports.getNoteTopics = exports.clearNoteTopics = exports.removeTopicFromNote = exports.addTopicToNote = exports.deleteNote = exports.updateNote = exports.getBookChapters = exports.getNotesByChapter = exports.getBookHighlights = exports.getBookNotes = exports.getNote = exports.createNote = void 0;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../database/db"));
const bookService_1 = require("./bookService");
const createNote = async (bookId, type, content, pageNumber, chapter, topics) => {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        db_1.default.run(`INSERT INTO notes (id, bookId, type, content, pageNumber, chapter, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, bookId, type, content, pageNumber || null, chapter || null, now, now], async function (err) {
            if (err)
                reject(err);
            else {
                if (topics && topics.length > 0) {
                    await Promise.all(topics.map(topic => (0, exports.addTopicToNote)(id, topic)));
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
        });
    });
};
exports.createNote = createNote;
const getNote = async (id) => {
    return new Promise((resolve, reject) => {
        db_1.default.get(`SELECT * FROM notes WHERE id = ?`, [id], async (err, row) => {
            if (err)
                reject(err);
            else if (!row)
                resolve(null);
            else {
                const topics = await (0, exports.getNoteTopics)(id);
                resolve({ ...row, topics });
            }
        });
    });
};
exports.getNote = getNote;
const getBookNotes = async (bookId) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM notes WHERE bookId = ? ORDER BY pageNumber, createdAt`, [bookId], async (err, rows) => {
            if (err)
                reject(err);
            else {
                const notesWithTopics = await Promise.all(rows.map(async (row) => {
                    const topics = await (0, exports.getNoteTopics)(row.id);
                    return { ...row, topics };
                }));
                resolve(notesWithTopics);
            }
        });
    });
};
exports.getBookNotes = getBookNotes;
const getBookHighlights = async (bookId) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM notes WHERE bookId = ? AND type = 'highlight' ORDER BY pageNumber`, [bookId], async (err, rows) => {
            if (err)
                reject(err);
            else {
                const notesWithTopics = await Promise.all(rows.map(async (row) => {
                    const topics = await (0, exports.getNoteTopics)(row.id);
                    return { ...row, topics };
                }));
                resolve(notesWithTopics);
            }
        });
    });
};
exports.getBookHighlights = getBookHighlights;
const getNotesByChapter = async (bookId, chapter) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT * FROM notes WHERE bookId = ? AND chapter = ? ORDER BY pageNumber`, [bookId, chapter], async (err, rows) => {
            if (err)
                reject(err);
            else {
                const notesWithTopics = await Promise.all(rows.map(async (row) => {
                    const topics = await (0, exports.getNoteTopics)(row.id);
                    return { ...row, topics };
                }));
                resolve(notesWithTopics);
            }
        });
    });
};
exports.getNotesByChapter = getNotesByChapter;
const getBookChapters = async (bookId) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT DISTINCT chapter FROM notes WHERE bookId = ? AND chapter IS NOT NULL ORDER BY chapter`, [bookId], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows.map(row => row.chapter));
        });
    });
};
exports.getBookChapters = getBookChapters;
const updateNote = async (id, content, pageNumber, chapter, topics) => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db_1.default.run(`UPDATE notes SET content = ?, pageNumber = ?, chapter = ?, updatedAt = ? WHERE id = ?`, [content, pageNumber || null, chapter || null, now, id], async function (err) {
            if (err)
                reject(err);
            else {
                if (topics !== undefined) {
                    await (0, exports.clearNoteTopics)(id);
                    await Promise.all(topics.map(topic => (0, exports.addTopicToNote)(id, topic)));
                }
                const updatedNote = await (0, exports.getNote)(id);
                resolve(updatedNote);
            }
        });
    });
};
exports.updateNote = updateNote;
const deleteNote = async (id) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(`DELETE FROM notes WHERE id = ?`, [id], function (err) {
            if (err)
                reject(err);
            else
                resolve(this.changes !== undefined && this.changes > 0);
        });
    });
};
exports.deleteNote = deleteNote;
const addTopicToNote = async (noteId, topic) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(`INSERT OR IGNORE INTO note_topics (noteId, topic) VALUES (?, ?)`, [noteId, topic], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.addTopicToNote = addTopicToNote;
const removeTopicFromNote = async (noteId, topic) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(`DELETE FROM note_topics WHERE noteId = ? AND topic = ?`, [noteId, topic], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.removeTopicFromNote = removeTopicFromNote;
const clearNoteTopics = async (noteId) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(`DELETE FROM note_topics WHERE noteId = ?`, [noteId], (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.clearNoteTopics = clearNoteTopics;
const getNoteTopics = async (noteId) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT topic FROM note_topics WHERE noteId = ?`, [noteId], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows.map(row => row.topic));
        });
    });
};
exports.getNoteTopics = getNoteTopics;
const getAllTopics = async () => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT DISTINCT topic FROM note_topics ORDER BY topic`, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows.map(row => row.topic));
        });
    });
};
exports.getAllTopics = getAllTopics;
const getNotesByTopic = async (topic) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT n.* FROM notes n JOIN note_topics nt ON n.id = nt.noteId WHERE nt.topic = ? ORDER BY n.createdAt`, [topic], async (err, rows) => {
            if (err)
                reject(err);
            else {
                const notesWithTopics = await Promise.all(rows.map(async (row) => {
                    const topics = await (0, exports.getNoteTopics)(row.id);
                    const book = await (0, bookService_1.getBook)(row.bookId);
                    return { ...row, topics, bookTitle: book?.title };
                }));
                resolve(notesWithTopics);
            }
        });
    });
};
exports.getNotesByTopic = getNotesByTopic;
const getTopicStats = async () => {
    return new Promise((resolve, reject) => {
        db_1.default.all(`SELECT 
        nt.topic,
        COUNT(DISTINCT nt.noteId) as noteCount,
        COUNT(DISTINCT n.bookId) as bookCount
       FROM note_topics nt
       JOIN notes n ON nt.noteId = n.id
       GROUP BY nt.topic
       ORDER BY noteCount DESC`, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.getTopicStats = getTopicStats;
