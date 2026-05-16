const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const OPEN_LIBRARY_API = 'https://openlibrary.org';
const COVERS_API = 'https://covers.openlibrary.org';

const dbPath = path.join(__dirname, './library.db');
const db = new sqlite3.Database(dbPath);

async function testOpenLibrary() {
  try {
    console.log('Testing Open Library API...');
    const cleanIsbn = '9780451524935';
    
    const response = await axios.get(`${OPEN_LIBRARY_API}/api/books`, {
      params: {
        bibkeys: `ISBN:${cleanIsbn}`,
        format: 'json',
        jscmd: 'data'
      },
      timeout: 10000
    });

    console.log('Response keys:', Object.keys(response.data));
    const key = `ISBN:${cleanIsbn}`;
    const bookData = response.data[key];
    
    if (!bookData) {
      console.log('No book data found');
      return null;
    }

    console.log('Book title:', bookData.title);
    
    const coverUrl = bookData.cover?.medium || 
      (bookData.identifiers?.isbn_13?.[0] 
        ? `${COVERS_API}/b/isbn/${bookData.identifiers.isbn_13[0]}-M.jpg`
        : bookData.identifiers?.isbn_10?.[0]
          ? `${COVERS_API}/b/isbn/${bookData.identifiers.isbn_10[0]}-M.jpg`
          : undefined);

    const result = {
      isbn: cleanIsbn,
      title: bookData.title || 'Unknown Title',
      author: bookData.authors?.map((a) => a.name).join(', '),
      publisher: bookData.publishers?.[0]?.name,
      publishedDate: bookData.publish_date,
      description: typeof bookData.description === 'string' 
        ? bookData.description 
        : bookData.description?.value,
      coverUrl,
      pageCount: bookData.number_of_pages
    };

    console.log('Parsed result:', result);
    return result;
  } catch (error) {
    console.error('Open Library API error:', error.message);
    return null;
  }
}

function testDatabaseInsert(bookData) {
  return new Promise((resolve, reject) => {
    console.log('Testing database insert...');
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
      function(err) {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          console.log('Insert successful, id:', id);
          resolve(id);
        }
      }
    );
  });
}

async function main() {
  try {
    const bookData = await testOpenLibrary();
    if (bookData) {
      await testDatabaseInsert(bookData);
      console.log('All tests passed!');
    }
  } catch (error) {
    console.error('Main test error:', error);
  } finally {
    db.close();
  }
}

main();
