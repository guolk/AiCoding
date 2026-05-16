import React, { useState, useEffect } from 'react';
import { noteAPI } from '../api/client';
import { Note } from '../types';

const Notes: React.FC = () => {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const topicsRes = await noteAPI.getAllTopics();
      setTopics(topicsRes.data);
      
      const allNotesPromises = topicsRes.data.map(topic => noteAPI.getByTopic(topic));
      const allNotesResults = await Promise.all(allNotesPromises);
      
      const notesMap = new Map<string, Note>();
      allNotesResults.forEach(notesRes => {
        notesRes.data.forEach(note => {
          notesMap.set(note.id, note);
        });
      });
      
      setAllNotes(Array.from(notesMap.values()));
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const filteredNotes = selectedTopic === 'all' 
    ? allNotes 
    : allNotes.filter(note => note.topics?.includes(selectedTopic));

  const notesByType = {
    highlights: filteredNotes.filter(n => n.type === 'highlight'),
    notes: filteredNotes.filter(n => n.type === 'note'),
  };

  const notesByTopic = filteredNotes.reduce((acc, note) => {
    note.topics?.forEach(topic => {
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(note);
    });
    return acc;
  }, {} as Record<string, Note[]>);

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Notes & Highlights
          </h2>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Topic</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedTopic === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Notes ({filteredNotes.length})
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTopic === topic
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {topic} ({notesByTopic[topic]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {notesByType.highlights.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Highlights ({notesByType.highlights.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notesByType.highlights.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg cursor-pointer hover:bg-yellow-100"
                  onClick={() => setSelectedNote(note)}
                >
                  <p className="text-gray-700 line-clamp-3">{note.content}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {(note as any).bookTitle || 'Unknown Book'}
                      {note.pageNumber && ` • p. ${note.pageNumber}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {notesByType.notes.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Notes ({notesByType.notes.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notesByType.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedNote(note)}
                >
                  <p className="text-gray-700 line-clamp-3">{note.content}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {(note as any).bookTitle || 'Unknown Book'}
                      {note.pageNumber && ` • p. ${note.pageNumber}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedTopic !== 'all' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Topic Summary: "{selectedTopic}"
          </h3>
          <p className="text-gray-600 mb-4">
            Found {notesByTopic[selectedTopic]?.length || 0} notes across this topic.
            This topic appears in your notes from different books,
            helping you connect ideas across your reading.
          </p>
          <div className="space-y-3">
            {notesByTopic[selectedTopic]?.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg ${
                  note.type === 'highlight'
                    ? 'bg-yellow-50 border-l-4 border-yellow-400'
                    : 'bg-gray-50'
                }`}
              >
                <p className="text-gray-700">{note.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {(note as any).bookTitle || 'Unknown Book'}
                  {note.pageNumber && ` • p. ${note.pageNumber}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedNote && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {selectedNote.type}
              </h3>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{selectedNote.content}</p>
            <div className="space-y-2 text-sm text-gray-500">
              {(selectedNote as any).bookTitle && (
                <p>Book: {(selectedNote as any).bookTitle}</p>
              )}
              {selectedNote.pageNumber && <p>Page: {selectedNote.pageNumber}</p>}
              {selectedNote.chapter && <p>Chapter: {selectedNote.chapter}</p>}
              {selectedNote.topics && selectedNote.topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedNote.topics.map((topic, i) => (
                    <span key={i} className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {allNotes.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl">📝</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No notes yet</h3>
          <p className="mt-1 text-gray-500">
            Start adding notes and highlights to your books to see them here!
          </p>
        </div>
      )}
    </div>
  );
};

export default Notes;
