import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDatabase } from './database/db';
import * as bookService from './services/bookService';
import * as readingService from './services/readingService';
import * as noteService from './services/noteService';
import * as listService from './services/listService';
import * as openLibraryService from './services/openLibraryService';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/books', async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await bookService.getBook(req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json(book);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create book' });
  }
});

app.post('/api/books/isbn/:isbn', async (req, res) => {
  try {
    const book = await bookService.createBookFromISBN(req.params.isbn);
    if (!book) {
      res.status(404).json({ error: 'Book not found with this ISBN' });
    } else {
      res.status(201).json(book);
    }
  } catch (error) {
    console.error('Error creating book from ISBN:', error);
    res.status(500).json({ 
      error: 'Failed to create book from ISBN',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.patch('/api/books/:id/status', async (req, res) => {
  try {
    const book = await bookService.updateBookStatus(req.params.id, req.body.status);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json(book);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update book status' });
  }
});

app.patch('/api/books/:id/progress', async (req, res) => {
  try {
    const book = await bookService.updateBookProgress(req.params.id, req.body.currentPage);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json(book);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const success = await bookService.deleteBook(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

app.get('/api/books/author/:author', async (req, res) => {
  try {
    const books = await bookService.getBooksByAuthor(req.params.author);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books by author' });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const tags = await bookService.getTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.post('/api/tags', async (req, res) => {
  try {
    const tag = await bookService.createTag(req.body.name, req.body.color);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

app.post('/api/books/:bookId/tags/:tagId', async (req, res) => {
  try {
    await bookService.addTagToBook(req.params.bookId, req.params.tagId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add tag to book' });
  }
});

app.delete('/api/books/:bookId/tags/:tagId', async (req, res) => {
  try {
    await bookService.removeTagFromBook(req.params.bookId, req.params.tagId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove tag from book' });
  }
});

app.get('/api/tags/:tagId/books', async (req, res) => {
  try {
    const books = await bookService.getBooksByTag(req.params.tagId);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books by tag' });
  }
});

app.post('/api/reading/sessions', async (req, res) => {
  try {
    const session = await readingService.startReadingSession(req.body.bookId, req.body.startPage);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start reading session' });
  }
});

app.patch('/api/reading/sessions/:id/end', async (req, res) => {
  try {
    const session = await readingService.endReadingSession(req.params.id, req.body.endPage);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
    } else {
      res.json(session);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to end reading session' });
  }
});

app.get('/api/books/:bookId/sessions', async (req, res) => {
  try {
    const sessions = await readingService.getBookReadingSessions(req.params.bookId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reading sessions' });
  }
});

app.get('/api/books/:bookId/active-session', async (req, res) => {
  try {
    const session = await readingService.getActiveReadingSession(req.params.bookId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
});

app.get('/api/books/:bookId/remaining-time', async (req, res) => {
  try {
    const time = await readingService.estimateRemainingTime(req.params.bookId);
    res.json({ remainingTimeMinutes: time });
  } catch (error) {
    res.status(500).json({ error: 'Failed to estimate remaining time' });
  }
});

app.get('/api/reading/stats', async (req, res) => {
  try {
    const stats = await readingService.getReadingStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reading stats' });
  }
});

app.get('/api/reading/annual-report/:year', async (req, res) => {
  try {
    const report = await readingService.generateAnnualReport(parseInt(req.params.year));
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate annual report' });
  }
});

app.get('/api/books/:bookId/notes', async (req, res) => {
  try {
    const notes = await noteService.getBookNotes(req.params.bookId);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await noteService.getNote(req.params.id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json(note);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const note = await noteService.createNote(
      req.body.bookId,
      req.body.type,
      req.body.content,
      req.body.pageNumber,
      req.body.chapter,
      req.body.topics
    );
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const note = await noteService.updateNote(
      req.params.id,
      req.body.content,
      req.body.pageNumber,
      req.body.chapter,
      req.body.topics
    );
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json(note);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const success = await noteService.deleteNote(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.get('/api/books/:bookId/chapters', async (req, res) => {
  try {
    const chapters = await noteService.getBookChapters(req.params.bookId);
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

app.get('/api/topics', async (req, res) => {
  try {
    const topics = await noteService.getAllTopics();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

app.get('/api/topics/:topic/notes', async (req, res) => {
  try {
    const notes = await noteService.getNotesByTopic(req.params.topic);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes by topic' });
  }
});

app.get('/api/reading-lists', async (req, res) => {
  try {
    const lists = await listService.getAllReadingLists();
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reading lists' });
  }
});

app.get('/api/reading-lists/:id', async (req, res) => {
  try {
    const list = await listService.getReadingList(req.params.id);
    if (!list) {
      res.status(404).json({ error: 'Reading list not found' });
    } else {
      res.json(list);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reading list' });
  }
});

app.get('/api/shared-lists/:token', async (req, res) => {
  try {
    const list = await listService.getReadingListByShareToken(req.params.token);
    if (!list) {
      res.status(404).json({ error: 'Shared list not found or not public' });
    } else {
      res.json(list);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared list' });
  }
});

app.post('/api/reading-lists', async (req, res) => {
  try {
    const list = await listService.createReadingList(
      req.body.name,
      req.body.description,
      req.body.isPublic
    );
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reading list' });
  }
});

app.put('/api/reading-lists/:id', async (req, res) => {
  try {
    const list = await listService.updateReadingList(
      req.params.id,
      req.body.name,
      req.body.description,
      req.body.isPublic
    );
    if (!list) {
      res.status(404).json({ error: 'Reading list not found' });
    } else {
      res.json(list);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reading list' });
  }
});

app.delete('/api/reading-lists/:id', async (req, res) => {
  try {
    const success = await listService.deleteReadingList(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Reading list not found' });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reading list' });
  }
});

app.post('/api/reading-lists/:listId/books/:bookId', async (req, res) => {
  try {
    await listService.addBookToReadingList(req.params.listId, req.params.bookId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add book to reading list' });
  }
});

app.delete('/api/reading-lists/:listId/books/:bookId', async (req, res) => {
  try {
    await listService.removeBookFromReadingList(req.params.listId, req.params.bookId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove book from reading list' });
  }
});

app.post('/api/reading-lists/:id/regenerate-token', async (req, res) => {
  try {
    const token = await listService.regenerateShareToken(req.params.id);
    if (!token) {
      res.status(404).json({ error: 'Reading list not found' });
    } else {
      res.json({ shareToken: token });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate share token' });
  }
});

app.get('/api/books/:bookId/similar', async (req, res) => {
  try {
    const books = await listService.getSimilarBooks(req.params.bookId);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch similar books' });
  }
});

app.get('/api/recommendations', async (req, res) => {
  try {
    const recommendations = await listService.getRecommendations(
      parseInt(req.query.limit as string) || 10
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

app.post('/api/books/:id/complete', async (req, res) => {
  try {
    await listService.addCompletedBook(
      req.params.id,
      req.body.rating,
      req.body.review
    );
    const book = await bookService.getBook(req.params.id);
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark book as completed' });
  }
});

app.get('/api/search/isbn/:isbn', async (req, res) => {
  try {
    const book = await openLibraryService.getBookByISBN(req.params.isbn);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json(book);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to search book by ISBN' });
  }
});

app.get('/api/search/books', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Query parameter required' });
      return;
    }
    const books = await openLibraryService.searchBooks(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search books' });
  }
});

// 生产环境静态文件服务（开发模式下注释）
// app.use(express.static(path.join(__dirname, '../client/build')));
//
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();

export default app;
