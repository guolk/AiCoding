const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, './library.db');
const db = new sqlite3.Database(dbPath);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/books', (req, res) => {
  console.log('GET /api/books called');
  db.all(`SELECT * FROM books ORDER BY updatedAt DESC`, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Returning', rows.length, 'books');
      res.json(rows);
    }
  });
});

app.post('/api/books/isbn/:isbn', async (req, res) => {
  console.log('POST /api/books/isbn called with:', req.params.isbn);
  try {
    const { default: axios } = await import('axios');
    const { v4: uuidv4 } = await import('uuid');
    
    const cleanIsbn = req.params.isbn.replace(/[-\s]/g, '');
    console.log('Fetching from Open Library...');
    
    const response = await axios.get(`https://openlibrary.org/api/books`, {
      params: {
        bibkeys: `ISBN:${cleanIsbn}`,
        format: 'json',
        jscmd: 'data'
      },
      timeout: 15000
    });

    const key = `ISBN:${cleanIsbn}`;
    const bookData = response.data[key];

    if (!bookData) {
      console.log('No book found');
      return res.status(404).json({ error: 'Book not found with this ISBN' });
    }

    console.log('Book found:', bookData.title);
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const coverUrl = bookData.cover?.medium || 
      (bookData.identifiers?.isbn_13?.[0] 
        ? `https://covers.openlibrary.org/b/isbn/${bookData.identifiers.isbn_13[0]}-M.jpg`
        : bookData.identifiers?.isbn_10?.[0]
          ? `https://covers.openlibrary.org/b/isbn/${bookData.identifiers.isbn_10[0]}-M.jpg`
          : null);

    db.run(
      `INSERT INTO books (id, isbn, title, author, publisher, publishedDate, description, coverUrl, pageCount, status, readCount, currentPage, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        cleanIsbn,
        bookData.title || 'Unknown Title',
        bookData.authors?.map((a) => a.name).join(', ') || null,
        bookData.publishers?.[0]?.name || null,
        bookData.publish_date || null,
        typeof bookData.description === 'string' ? bookData.description : bookData.description?.value || null,
        coverUrl,
        bookData.number_of_pages || null,
        'want_to_read',
        0,
        0,
        now,
        now
      ],
      function(err) {
        if (err) {
          console.error('Insert error:', err);
          res.status(500).json({ error: err.message });
        } else {
          console.log('Book inserted successfully');
          db.get(`SELECT * FROM books WHERE id = ?`, [id], (err, row) => {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              res.status(201).json(row);
            }
          });
        }
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
