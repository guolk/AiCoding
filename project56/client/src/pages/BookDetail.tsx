import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI, tagAPI, readingAPI, noteAPI } from '../api/client';
import { Book, Tag, ReadingSession, Note, BookStatus } from '../types';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeSession, setActiveSession] = useState<ReadingSession | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sessionStartPage, setSessionStartPage] = useState(0);
  const [sessionEndPage, setSessionEndPage] = useState(0);
  const [newNote, setNewNote] = useState({ type: 'note' as 'note' | 'highlight', content: '', pageNumber: 0, chapter: '', topics: '' });

  useEffect(() => {
    if (id) {
      loadBookData();
    }
  }, [id]);

  const loadBookData = async () => {
    if (!id) return;
    try {
      const [bookRes, tagsRes, sessionsRes, notesRes, activeSessionRes, timeRes] = await Promise.all([
        bookAPI.get(id),
        tagAPI.getAll(),
        readingAPI.getBookSessions(id),
        noteAPI.getBookNotes(id),
        readingAPI.getActiveSession(id),
        readingAPI.estimateRemainingTime(id),
      ]);
      setBook(bookRes.data);
      setTags(tagsRes.data);
      setSessions(sessionsRes.data);
      setNotes(notesRes.data);
      setActiveSession(activeSessionRes.data);
      setEstimatedTime(timeRes.data.remainingTimeMinutes);
    } catch (error) {
      console.error('Failed to load book data:', error);
    }
  };

  const handleUpdateStatus = async (status: BookStatus) => {
    if (!id) return;
    try {
      await bookAPI.updateStatus(id, status);
      loadBookData();
    } catch (error) {
      window.alert('Failed to update status.');
    }
  };

  const handleUpdateProgress = async (currentPage: number) => {
    if (!id) return;
    try {
      await bookAPI.updateProgress(id, currentPage);
      loadBookData();
    } catch (error) {
      window.alert('Failed to update progress.');
    }
  };

  const handleStartSession = async () => {
    if (!id) return;
    try {
      await readingAPI.startSession(id, sessionStartPage);
      setShowSessionModal(false);
      loadBookData();
    } catch (error) {
      window.alert('Failed to start reading session.');
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      await readingAPI.endSession(activeSession.id, sessionEndPage);
      setShowSessionModal(false);
      loadBookData();
    } catch (error) {
      window.alert('Failed to end reading session.');
    }
  };

  const handleAddTag = async (tagId: string) => {
    if (!id) return;
    try {
      await tagAPI.addToBook(id, tagId);
      loadBookData();
    } catch (error) {
      window.alert('Failed to add tag.');
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!id) return;
    try {
      await tagAPI.removeFromBook(id, tagId);
      loadBookData();
    } catch (error) {
      window.alert('Failed to remove tag.');
    }
  };

  const handleCreateNote = async () => {
    if (!id) return;
    try {
      const topicsArray = newNote.topics.split(',').map(t => t.trim()).filter(t => t);
      await noteAPI.create({
        bookId: id,
        type: newNote.type,
        content: newNote.content,
        pageNumber: newNote.pageNumber || undefined,
        chapter: newNote.chapter || undefined,
        topics: topicsArray.length > 0 ? topicsArray : undefined,
      });
      setShowNoteModal(false);
      setNewNote({ type: 'note', content: '', pageNumber: 0, chapter: '', topics: '' });
      loadBookData();
    } catch (error) {
      window.alert('Failed to create note.');
    }
  };

  const handleDeleteBook = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await bookAPI.delete(id);
      navigate('/books');
    } catch (error) {
      window.alert('Failed to delete book.');
    }
  };

  if (!book) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const getProgress = () => {
    if (!book.pageCount) return 0;
    return Math.round((book.currentPage / book.pageCount) * 100);
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-start md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-32 w-24 object-cover rounded-lg shadow" />
            ) : (
              <div className="h-32 w-24 bg-gray-200 rounded-lg shadow flex items-center justify-center text-4xl">📖</div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
              <p className="text-lg text-gray-500">{book.author || 'Unknown Author'}</p>
              {book.publisher && <p className="text-sm text-gray-400">{book.publisher}</p>}
              {book.pageCount && <p className="text-sm text-gray-400">{book.pageCount} pages</p>}
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col space-y-2">
          <button
            onClick={handleDeleteBook}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Delete Book
          </button>
        </div>
      </div>

      {book.description && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 whitespace-pre-line">{book.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reading Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['want_to_read', 'reading', 'read', 'abandoned'] as BookStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      book.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'want_to_read' ? 'Want to Read' : status === 'reading' ? 'Reading' : status === 'read' ? 'Read' : 'Abandoned'}
                  </button>
                ))}
              </div>
            </div>
            {book.pageCount && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress: {book.currentPage} / {book.pageCount} ({getProgress()}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max={book.pageCount}
                  value={book.currentPage}
                  onChange={(e) => handleUpdateProgress(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
            {estimatedTime !== null && estimatedTime > 0 && (
              <p className="text-sm text-gray-500">
                Estimated time remaining: ~{Math.round(estimatedTime / 60)} minutes
              </p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reading Sessions</h3>
          <div className="mb-4">
            {activeSession ? (
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-800">Active Session in Progress</p>
                <p className="text-sm text-blue-600">Started on {new Date(activeSession.startTime).toLocaleString()}</p>
                <p className="text-sm text-blue-600">Start page: {activeSession.startPage}</p>
                <div className="mt-3 flex space-x-2">
                  <input
                    type="number"
                    value={sessionEndPage}
                    onChange={(e) => setSessionEndPage(parseInt(e.target.value))}
                    placeholder="End page"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={handleEndSession}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    End Session
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSessionStartPage(book.currentPage);
                  setShowSessionModal(true);
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Start New Reading Session
              </button>
            )}
          </div>
          {sessions.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pages {session.startPage} → {session.endPage || '...'}
                    </p>
                  </div>
                  {session.duration > 0 && (
                    <span className="text-sm text-gray-600">{formatDuration(session.duration)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {book.tags?.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-2 text-xs hover:opacity-75"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags
            .filter((t) => !book.tags?.some((bt) => bt.id === t.id))
            .map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag.id)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                + {tag.name}
              </button>
            ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Notes & Highlights</h3>
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Add Note
          </button>
        </div>
        {notes.length === 0 ? (
          <p className="text-gray-500">No notes yet. Start adding your thoughts and highlights!</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg ${
                  note.type === 'highlight' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {note.type === 'highlight' ? 'Highlight' : 'Note'}
                  </span>
                  {note.pageNumber && (
                    <span className="text-xs text-gray-400">p. {note.pageNumber}</span>
                  )}
                </div>
                <p className="text-gray-700">{note.content}</p>
                {note.chapter && (
                  <p className="text-xs text-gray-400 mt-2">Chapter: {note.chapter}</p>
                )}
                {note.topics && note.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.topics.map((topic, i) => (
                      <span key={i} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showSessionModal && !activeSession && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Start Reading Session</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Page</label>
              <input
                type="number"
                value={sessionStartPage}
                onChange={(e) => setSessionStartPage(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSession}
                className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
              >
                Start Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Note</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="note">Note</option>
                  <option value="highlight">Highlight</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Your note or highlight text..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Number</label>
                  <input
                    type="number"
                    value={newNote.pageNumber}
                    onChange={(e) => setNewNote({ ...newNote, pageNumber: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                  <input
                    type="text"
                    value={newNote.chapter}
                    onChange={(e) => setNewNote({ ...newNote, chapter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Chapter 1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topics (comma separated)</label>
                <input
                  type="text"
                  value={newNote.topics}
                  onChange={(e) => setNewNote({ ...newNote, topics: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., philosophy, stoicism, mindfulness"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
