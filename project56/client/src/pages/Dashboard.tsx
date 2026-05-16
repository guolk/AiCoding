import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, readingAPI, searchAPI } from '../api/client';
import { Book, ReadingStats } from '../types';

const Dashboard: React.FC = () => {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isbnInput, setIsbnInput] = useState('');
  const [isAddingBook, setIsAddingBook] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksRes, statsRes, recRes] = await Promise.all([
        bookAPI.getAll(),
        readingAPI.getStats(),
        searchAPI.recommendations(5),
      ]);
      setRecentBooks(booksRes.data.slice(0, 5));
      setStats(statsRes.data);
      setRecommendations(recRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleAddBookByISBN = async () => {
    if (!isbnInput.trim()) return;
    setIsAddingBook(true);
    try {
      await bookAPI.createFromISBN(isbnInput.trim());
      setIsbnInput('');
      loadData();
      window.alert('✅ Book added successfully!');
    } catch (error: any) {
      console.error('Error adding book:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message;
      
      if (errorMessage === 'Book not found with this ISBN') {
        window.alert(
          '❌ Book not found in Open Library!\n\n' +
          'Suggestions:\n' +
          '1. Try a valid ISBN (e.g., 9780451524935 for 1984)\n' +
          '2. Check if the ISBN is correct\n' +
          '3. Use the "Add Book" button to add manually\n' +
          '\nTest ISBNs:\n' +
          '- 9780141439723 (Jane Eyre)\n' +
          '- 9780743273565 (The Great Gatsby)'
        );
      } else {
        window.alert(`❌ Failed to add book: ${errorMessage || 'Unknown error'}`);
      }
    } finally {
      setIsAddingBook(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'want_to_read': return 'bg-yellow-100 text-yellow-800';
      case 'reading': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-green-100 text-green-800';
      case 'abandoned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'want_to_read': return 'Want to Read';
      case 'reading': return 'Reading';
      case 'read': return 'Read';
      case 'abandoned': return 'Abandoned';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              placeholder="Enter ISBN to add book..."
              className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 px-4 py-2 border"
              onKeyPress={(e) => e.key === 'Enter' && handleAddBookByISBN()}
            />
            <button
              onClick={handleAddBookByISBN}
              disabled={isAddingBook}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isAddingBook ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{stats.totalBooks}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📖</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Currently Reading</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{stats.booksByStatus.reading}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Reading Streak</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{stats.currentStreak} days</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✓</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Books Read</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{stats.booksByStatus.read}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Added Books</h3>
          {recentBooks.length === 0 ? (
            <p className="text-gray-500">No books yet. Add your first book using the ISBN field above!</p>
          ) : (
            <div className="space-y-3">
              {recentBooks.map((book) => (
                <Link key={book.id} to={`/books/${book.id}`} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="h-12 w-8 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-8 bg-gray-200 rounded flex items-center justify-center text-xs">📖</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                    <p className="text-sm text-gray-500 truncate">{book.author || 'Unknown Author'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                    {getStatusLabel(book.status)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
          {recommendations.length === 0 ? (
            <p className="text-gray-500">Add some books to get personalized recommendations!</p>
          ) : (
            <div className="space-y-3">
              {recommendations.map((book, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="h-12 w-8 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-8 bg-gray-200 rounded flex items-center justify-center text-xs">📖</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                    <p className="text-sm text-gray-500 truncate">{book.author || 'Unknown Author'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
