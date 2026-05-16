"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const dbPath = path_1.default.join(__dirname, '../../library.db');
const db = new sqlite3_1.default.Database(dbPath);
const seedData = async () => {
    console.log('开始初始化数据库...');
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          isbn TEXT UNIQUE,
          title TEXT NOT NULL,
          author TEXT,
          publisher TEXT,
          publishedDate TEXT,
          description TEXT,
          coverUrl TEXT,
          pageCount INTEGER,
          status TEXT CHECK(status IN ('want_to_read', 'reading', 'read', 'abandoned')) DEFAULT 'want_to_read',
          readCount INTEGER DEFAULT 0,
          currentPage INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          color TEXT DEFAULT '#3B82F6',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            db.run(`
        CREATE TABLE IF NOT EXISTS book_tags (
          bookId TEXT,
          tagId TEXT,
          PRIMARY KEY (bookId, tagId),
          FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
          FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);
            db.run(`
        CREATE TABLE IF NOT EXISTS reading_sessions (
          id TEXT PRIMARY KEY,
          bookId TEXT NOT NULL,
          startTime DATETIME NOT NULL,
          endTime DATETIME,
          startPage INTEGER NOT NULL,
          endPage INTEGER,
          pagesRead INTEGER DEFAULT 0,
          duration INTEGER DEFAULT 0,
          FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
        )
      `);
            db.run(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          bookId TEXT NOT NULL,
          type TEXT CHECK(type IN ('highlight', 'note')) NOT NULL,
          content TEXT NOT NULL,
          pageNumber INTEGER,
          chapter TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
        )
      `);
            db.run(`
        CREATE TABLE IF NOT EXISTS note_topics (
          noteId TEXT,
          topic TEXT,
          PRIMARY KEY (noteId, topic),
          FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE
        )
      `);
            db.run(`
        CREATE TABLE IF NOT EXISTS reading_lists (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          isPublic BOOLEAN DEFAULT 0,
          shareToken TEXT UNIQUE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            db.run(`
        CREATE TABLE IF NOT EXISTS reading_list_books (
          listId TEXT,
          bookId TEXT,
          addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (listId, bookId),
          FOREIGN KEY (listId) REFERENCES reading_lists(id) ON DELETE CASCADE,
          FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
        )
      `);
            db.run(`
        CREATE TABLE IF NOT EXISTS read_history (
          id TEXT PRIMARY KEY,
          bookId TEXT NOT NULL,
          completedDate DATETIME,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5),
          review TEXT,
          FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
        )
      `, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    });
    console.log('数据库表创建完成！');
    console.log('清除旧数据...');
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM book_tags', (err) => {
            if (err)
                reject(err);
            else {
                db.run('DELETE FROM tags', (err) => {
                    if (err)
                        reject(err);
                    else {
                        db.run('DELETE FROM note_topics', (err) => {
                            if (err)
                                reject(err);
                            else {
                                db.run('DELETE FROM notes', (err) => {
                                    if (err)
                                        reject(err);
                                    else {
                                        db.run('DELETE FROM reading_sessions', (err) => {
                                            if (err)
                                                reject(err);
                                            else {
                                                db.run('DELETE FROM reading_list_books', (err) => {
                                                    if (err)
                                                        reject(err);
                                                    else {
                                                        db.run('DELETE FROM reading_lists', (err) => {
                                                            if (err)
                                                                reject(err);
                                                            else {
                                                                db.run('DELETE FROM read_history', (err) => {
                                                                    if (err)
                                                                        reject(err);
                                                                    else {
                                                                        db.run('DELETE FROM books', (err) => {
                                                                            if (err)
                                                                                reject(err);
                                                                            else
                                                                                resolve();
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
                            }
                        });
                    }
                });
            }
        });
    });
    console.log('插入测试书籍数据...');
    const books = [
        {
            id: (0, uuid_1.v4)(),
            isbn: '9780141439518',
            title: '傲慢与偏见',
            author: '简·奥斯汀',
            publisher: 'Penguin Classics',
            publishedDate: '2003-04-01',
            description: '《傲慢与偏见》是英国女小说家简·奥斯汀的代表作。小说讲述了乡绅之女伊丽莎白·班内特的爱情故事。这部作品以日常生活为素材，以反当时社会上流行的感伤小说的内容和矫揉造作的写作方法，生动地反映了18世纪末到19世纪初处于保守和闭塞状态下的英国乡镇生活和世态人情。',
            coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg',
            pageCount: 432,
            status: 'read',
            readCount: 1,
            currentPage: 432
        },
        {
            id: (0, uuid_1.v4)(),
            isbn: '9787020002208',
            title: '百年孤独',
            author: '加西亚·马尔克斯',
            publisher: '人民文学出版社',
            publishedDate: '1987-08-01',
            description: '《百年孤独》是哥伦比亚作家加西亚·马尔克斯的代表作，也是拉丁美洲魔幻现实主义文学的代表作，被誉为"再现拉丁美洲历史社会图景的鸿篇巨著"。描写了布恩迪亚家族七代人的传奇故事，以及加勒比海沿岸小镇马孔多的百年兴衰。',
            coverUrl: 'https://covers.openlibrary.org/b/isbn/9787020002208-M.jpg',
            pageCount: 360,
            status: 'reading',
            readCount: 0,
            currentPage: 156
        },
        {
            id: (0, uuid_1.v4)(),
            isbn: '9787506351438',
            title: '活着',
            author: '余华',
            publisher: '作家出版社',
            publishedDate: '2012-08-01',
            description: '《活着》是作家余华的代表作之一，讲述了在大时代背景下，随着内战、三反五反、大跃进、文化大革命等社会变革，徐福贵的人生和家庭不断经受着苦难，到了最后所有亲人都先后离他而去，仅剩下年老的他和一头老牛相依为命。',
            coverUrl: 'https://covers.openlibrary.org/b/isbn/9787506351438-M.jpg',
            pageCount: 191,
            status: 'want_to_read',
            readCount: 0,
            currentPage: 0
        },
        {
            id: (0, uuid_1.v4)(),
            isbn: '9787532725135',
            title: '追风筝的人',
            author: '卡勒德·胡赛尼',
            publisher: '上海人民出版社',
            publishedDate: '2006-05-01',
            description: '《追风筝的人》是阿富汗斯坦作家卡勒德·胡赛尼的第一部小说。小说以第一人称的角度讲述了阿米尔的故事。风筝，风筝是象征性的，它既可以是亲情、友情、爱情，也可以是正直、善良、诚实。对阿米尔来说，风筝隐喻他人格中必不可少的部分，只有追到了，他才能成为健全的人。',
            coverUrl: 'https://covers.openlibrary.org/b/isbn/9787532725135-M.jpg',
            pageCount: 362,
            status: 'read',
            readCount: 1,
            currentPage: 362
        },
        {
            id: (0, uuid_1.v4)(),
            isbn: '9787544270877',
            title: '小王子',
            author: '圣埃克苏佩里',
            publisher: '上海译文出版社',
            publishedDate: '2007-03-01',
            description: '《小王子》是法国作家安托万·德·圣埃克苏佩里于1942年写成的著名儿童文学短篇小说。本书的主人公是来自外星球的小王子。书中以一位飞行员作为故事叙述者，讲述了小王子从自己星球出发前往地球的过程中，所经历的各种历险。',
            coverUrl: 'https://covers.openlibrary.org/b/isbn/9787544270877-M.jpg',
            pageCount: 97,
            status: 'reading',
            readCount: 0,
            currentPage: 45
        },
        {
            id: (0, uuid_1.v4)(),
            isbn: '9780261102385',
            title: '人类简史',
            author: '尤瓦尔·赫拉利',
            publisher: '中信出版社',
            publishedDate: '2014-11-01',
            description: '《人类简史：从动物到上帝》是以色列历史学家尤瓦尔·赫拉利的作品。该书讲述了人类从石器时代至21世纪的演化与发展史，并将人类历史分为四个阶段：认知革命、农业革命、人类的融合统一与科学革命。',
            coverUrl: 'https://covers.openlibrary.org/b/isbn/9780261102385-M.jpg',
            pageCount: 440,
            status: 'want_to_read',
            readCount: 0,
            currentPage: 0
        },
        {
            id: (0, uuid_1.v4)(),
            isbn: '9787536692938',
            title: '三体',
            author: '刘慈欣',
            publisher: '重庆出版社',
            publishedDate: '2008-01-01',
            description: '《三体》是刘慈欣创作的系列长篇科幻小说，由《三体》、《三体Ⅱ·黑暗森林》、《三体Ⅲ·死神永生》组成。作品讲述了地球人类文明和三体文明的信息交流、生死搏杀及两个文明在宇宙中的兴衰历程。',
            coverUrl: 'https://covers.openlibrary.org/b/isbn/9787536692938-M.jpg',
            pageCount: 302,
            status: 'abandoned',
            readCount: 0,
            currentPage: 78
        }
    ];
    for (const book of books) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO books (id, isbn, title, author, publisher, publishedDate, description, coverUrl, pageCount, status, readCount, currentPage, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [book.id, book.isbn, book.title, book.author, book.publisher, book.publishedDate, book.description, book.coverUrl, book.pageCount, book.status, book.readCount, book.currentPage], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('插入标签数据...');
    const tags = [
        { id: (0, uuid_1.v4)(), name: '经典文学', color: '#EF4444' },
        { id: (0, uuid_1.v4)(), name: '科幻', color: '#3B82F6' },
        { id: (0, uuid_1.v4)(), name: '历史', color: '#10B981' },
        { id: (0, uuid_1.v4)(), name: '哲学', color: '#F59E0B' },
        { id: (0, uuid_1.v4)(), name: '外国文学', color: '#8B5CF6' },
        { id: (0, uuid_1.v4)(), name: '中国文学', color: '#EC4899' }
    ];
    for (const tag of tags) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO tags (id, name, color) VALUES (?, ?, ?)`, [tag.id, tag.name, tag.color], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('建立书籍-标签关联...');
    const bookTagRelations = [
        [books[0].id, tags[0].id],
        [books[0].id, tags[4].id],
        [books[1].id, tags[0].id],
        [books[1].id, tags[4].id],
        [books[2].id, tags[0].id],
        [books[2].id, tags[5].id],
        [books[3].id, tags[4].id],
        [books[4].id, tags[0].id],
        [books[4].id, tags[3].id],
        [books[5].id, tags[1].id],
        [books[5].id, tags[2].id],
        [books[6].id, tags[1].id],
        [books[6].id, tags[5].id]
    ];
    for (const [bookId, tagId] of bookTagRelations) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO book_tags (bookId, tagId) VALUES (?, ?)`, [bookId, tagId], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('插入阅读会话数据...');
    const now = new Date();
    const sessions = [
        {
            id: (0, uuid_1.v4)(),
            bookId: books[1].id,
            startTime: new Date(now.getTime() - 86400000 * 3).toISOString(),
            endTime: new Date(now.getTime() - 86400000 * 3 + 3600000).toISOString(),
            startPage: 0,
            endPage: 45,
            pagesRead: 45,
            duration: 3600
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[1].id,
            startTime: new Date(now.getTime() - 86400000 * 2).toISOString(),
            endTime: new Date(now.getTime() - 86400000 * 2 + 4200000).toISOString(),
            startPage: 45,
            endPage: 100,
            pagesRead: 55,
            duration: 4200
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[1].id,
            startTime: new Date(now.getTime() - 86400000).toISOString(),
            endTime: new Date(now.getTime() - 86400000 + 3300000).toISOString(),
            startPage: 100,
            endPage: 156,
            pagesRead: 56,
            duration: 3300
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[4].id,
            startTime: new Date(now.getTime() - 86400000 * 5).toISOString(),
            endTime: new Date(now.getTime() - 86400000 * 5 + 2700000).toISOString(),
            startPage: 0,
            endPage: 45,
            pagesRead: 45,
            duration: 2700
        }
    ];
    for (const session of sessions) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO reading_sessions (id, bookId, startTime, endTime, startPage, endPage, pagesRead, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [session.id, session.bookId, session.startTime, session.endTime, session.startPage, session.endPage, session.pagesRead, session.duration], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('插入笔记数据...');
    const notes = [
        {
            id: (0, uuid_1.v4)(),
            bookId: books[0].id,
            type: 'highlight',
            content: '傲慢让别人无法来爱我，偏见让我无法去爱别人。',
            pageNumber: 58,
            chapter: '第三章'
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[0].id,
            type: 'note',
            content: '伊丽莎白的独立思考和对爱情的坚持让人敬佩。在当时的社会背景下，女性能够有这样的思想非常难得。',
            pageNumber: 120,
            chapter: '第六章'
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[1].id,
            type: 'highlight',
            content: '生命中曾经有过的所有灿烂，原来终究，都需要用寂寞来偿还。',
            pageNumber: 286,
            chapter: '第十章'
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[1].id,
            type: 'note',
            content: '魔幻现实主义的手法太精彩了，布恩迪亚家族的命运循环让人唏嘘。',
            pageNumber: 189,
            chapter: '第七章'
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[3].id,
            type: 'highlight',
            content: '为你，千千万万遍。',
            pageNumber: 67,
            chapter: '第五章'
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[4].id,
            type: 'highlight',
            content: '所有的大人都曾经是小孩，虽然，只有少数的人记得。',
            pageNumber: 12,
            chapter: '第一章'
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[4].id,
            type: 'note',
            content: '小王子的旅程其实是每个人成长的寓言，狐狸教会了他什么是爱。',
            pageNumber: 45,
            chapter: '第四章'
        }
    ];
    for (const note of notes) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO notes (id, bookId, type, content, pageNumber, chapter) VALUES (?, ?, ?, ?, ?, ?)`, [note.id, note.bookId, note.type, note.content, note.pageNumber, note.chapter], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('建立笔记主题关联...');
    const noteTopics = [
        [notes[0].id, '爱情'],
        [notes[0].id, '人性'],
        [notes[1].id, '女性主义'],
        [notes[2].id, '人生'],
        [notes[2].id, '孤独'],
        [notes[3].id, '魔幻现实主义'],
        [notes[4].id, '友情'],
        [notes[4].id, '救赎'],
        [notes[5].id, '成长'],
        [notes[5].id, '童真'],
        [notes[6].id, '爱']
    ];
    for (const [noteId, topic] of noteTopics) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO note_topics (noteId, topic) VALUES (?, ?)`, [noteId, topic], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('插入书单数据...');
    const readingLists = [
        {
            id: (0, uuid_1.v4)(),
            name: '2024年必读书单',
            description: '2024年我计划阅读的经典文学作品精选',
            isPublic: true,
            shareToken: crypto.randomUUID().replace(/-/g, '').slice(0, 16)
        },
        {
            id: (0, uuid_1.v4)(),
            name: '科幻爱好者必读',
            description: '科幻小说爱好者不可错过的经典作品',
            isPublic: false
        },
        {
            id: (0, uuid_1.v4)(),
            name: '我的哲学书单',
            description: '关于人生与思考的书籍',
            isPublic: true,
            shareToken: crypto.randomUUID().replace(/-/g, '').slice(0, 16)
        }
    ];
    for (const list of readingLists) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO reading_lists (id, name, description, isPublic, shareToken) VALUES (?, ?, ?, ?, ?)`, [list.id, list.name, list.description, list.isPublic ? 1 : 0, list.shareToken || null], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('建立书单-书籍关联...');
    const listBookRelations = [
        [readingLists[0].id, books[0].id],
        [readingLists[0].id, books[2].id],
        [readingLists[0].id, books[3].id],
        [readingLists[1].id, books[5].id],
        [readingLists[1].id, books[6].id],
        [readingLists[2].id, books[1].id],
        [readingLists[2].id, books[4].id]
    ];
    for (const [listId, bookId] of listBookRelations) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO reading_list_books (listId, bookId) VALUES (?, ?)`, [listId, bookId], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('插入阅读历史数据...');
    const readHistories = [
        {
            id: (0, uuid_1.v4)(),
            bookId: books[0].id,
            completedDate: new Date(now.getTime() - 86400000 * 30).toISOString(),
            rating: 5,
            review: '经典永不过时，奥斯汀的文笔太精妙了！'
        },
        {
            id: (0, uuid_1.v4)(),
            bookId: books[3].id,
            completedDate: new Date(now.getTime() - 86400000 * 60).toISOString(),
            rating: 5,
            review: '非常感人的故事，关于救赎与友情。'
        }
    ];
    for (const history of readHistories) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO read_history (id, bookId, completedDate, rating, review) VALUES (?, ?, ?, ?, ?)`, [history.id, history.bookId, history.completedDate, history.rating, history.review], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    console.log('');
    console.log('✅ 测试数据初始化完成！');
    console.log('');
    console.log('📚 书籍数量:', books.length, '本');
    console.log('🏷️  标签数量:', tags.length, '个');
    console.log('📖 阅读会话:', sessions.length, '次');
    console.log('📝 笔记数量:', notes.length, '条');
    console.log('📋 书单数量:', readingLists.length, '个');
    db.close();
};
seedData().catch(console.error);
