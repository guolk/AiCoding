import React, { useState, useEffect } from 'react';
import { listAPI, bookAPI } from '../api/client';
import { ReadingList, Book } from '../types';

const ReadingLists: React.FC = () => {
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<ReadingList | null>(null);
  const [newList, setNewList] = useState({ name: '', description: '', isPublic: false });
  const [selectedList, setSelectedList] = useState<ReadingList | null>(null);
  const [bookToAdd, setBookToAdd] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [listsRes, booksRes] = await Promise.all([
        listAPI.getAll(),
        bookAPI.getAll(),
      ]);
      setLists(listsRes.data);
      setBooks(booksRes.data);
    } catch (error) {
      console.error('Failed to load reading lists:', error);
    }
  };

  const handleCreateList = async () => {
    try {
      await listAPI.create(newList.name, newList.description, newList.isPublic);
      setShowCreateModal(false);
      setNewList({ name: '', description: '', isPublic: false });
      loadData();
    } catch (error) {
      window.alert('Failed to create reading list.');
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reading list?')) return;
    try {
      await listAPI.delete(id);
      loadData();
    } catch (error) {
      window.alert('Failed to delete reading list.');
    }
  };

  const handleAddBook = async (listId: string) => {
    if (!bookToAdd) return;
    try {
      await listAPI.addBook(listId, bookToAdd);
      setBookToAdd('');
      loadData();
    } catch (error) {
      window.alert('Failed to add book to list.');
    }
  };

  const handleRemoveBook = async (listId: string, bookId: string) => {
    try {
      await listAPI.removeBook(listId, bookId);
      loadData();
    } catch (error) {
      window.alert('Failed to remove book from list.');
    }
  };

  const handleRegenerateToken = async (list: ReadingList) => {
    try {
      await listAPI.regenerateToken(list.id);
      const updatedList = await listAPI.get(list.id);
      if (updatedList.data) {
        setShowShareModal(updatedList.data);
      }
    } catch (error) {
      window.alert('Failed to regenerate share token.');
    }
  };

  const getShareLink = (list: ReadingList) => {
    return `${window.location.origin}/shared/${list.shareToken}`;
  };

  const booksNotInList = (list: ReadingList) => {
    const bookIdsInList = new Set(list.books?.map(b => b.id) || []);
    return books.filter(b => !bookIdsInList.has(b.id));
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Reading Lists
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <div key={list.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{list.name}</h3>
                  {list.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{list.description}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  {list.isPublic ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Private
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {list.books?.length || 0} books
                </span>
                <div className="flex space-x-2">
                  {list.isPublic && (
                    <button
                      onClick={() => setShowShareModal(list)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Share
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedList(selectedList?.id === list.id ? null : list)}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    {selectedList?.id === list.id ? 'Close' : 'View'}
                  </button>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {selectedList?.id === list.id && (
              <div className="border-t border-gray-200 p-4">
                <div className="mb-4 flex space-x-2">
                  <select
                    value={bookToAdd}
                    onChange={(e) => setBookToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select a book to add...</option>
                    {booksNotInList(list).map((book) => (
                      <option key={book.id} value={book.id}>{book.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddBook(list.id)}
                    disabled={!bookToAdd}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                
                {list.books && list.books.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {list.books.map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="h-8 w-6 object-cover rounded" />
                          ) : (
                            <span className="text-lg">📖</span>
                          )}
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                            {book.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveBook(list.id, book.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No books in this list yet</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {lists.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl">📚</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No reading lists yet</h3>
          <p className="mt-1 text-gray-500">Create your first reading list to organize your books!</p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Reading List</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Summer Reading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newList.description}
                  onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What's this list about?"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newList.isPublic}
                  onChange={(e) => setNewList({ ...newList, isPublic: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Make this list public (shareable with others)
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                disabled={!newList.name}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share Reading List</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with others so they can view your reading list:
            </p>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                readOnly
                value={getShareLink(showShareModal)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(getShareLink(showShareModal))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Anyone with this link can view your reading list. To revoke access, regenerate the token below.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => handleRegenerateToken(showShareModal)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Regenerate Share Token
              </button>
              <button
                onClick={() => setShowShareModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingLists;
