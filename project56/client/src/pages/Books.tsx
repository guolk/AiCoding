import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, tagAPI } from '../api/client';
import { Book, Tag, BookStatus } from '../types';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksRes, tagsRes] = await Promise.all([
        bookAPI.getAll(),
        tagAPI.getAll(),
      ]);
      setBooks(booksRes.data);
      setTags(tagsRes.data);
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const handleAddBook = async () => {
    try {
      if (newBook.isbn) {
        await bookAPI.createFromISBN(newBook.isbn);
      } else {
        await bookAPI.create({ title: newBook.title, author: newBook.author });
      }
      setShowAddModal(false);
      setNewBook({ title: '', author: '', isbn: '' });
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
          '3. Leave ISBN empty to add manually\n' +
          '\nTest ISBNs:\n' +
          '- 9780141439723 (Jane Eyre)\n' +
          '- 9780743273565 (The Great Gatsby)'
        );
      } else {
        window.alert(`❌ Failed to add book: ${errorMessage || 'Unknown error'}`);
      }
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus;
    const matchesTag = filterTag === 'all' || book.tags?.some((t) => t.id === filterTag);
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesTag && matchesSearch;
  });

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

  const getProgress = (book: Book) => {
    if (!book.pageCount) return 0;
    return Math.round((book.currentPage / book.pageCount) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Library
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Book
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="want_to_read">Want to Read</option>
          <option value="reading">Reading</option>
          <option value="read">Read</option>
          <option value="abandoned">Abandoned</option>
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <Link
            key={book.id}
            to={`/books/${book.id}`}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="flex">
              <div className="w-24 flex-shrink-0">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center text-3xl">📖</div>
                )}
              </div>
              <div className="flex-1 p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">{book.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{book.author || 'Unknown Author'}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                    {getStatusLabel(book.status)}
                  </span>
                </div>
                {book.status === 'reading' && book.pageCount && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{getProgress(book)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${getProgress(book)}%` }}
                      />
                    </div>
                  </div>
                )}
                {book.tags && book.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {book.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl">📚</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No books found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your filters or add a new book.</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Book</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN (optional - automatically fetches book info)
                </label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="978-0-000-00000-0"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">or</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Author name"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBook}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
