import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { ShowRecord, JokeFeedback, SelfEvaluation, VideoNote, AudienceType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedRecords } from '../data/seedData';
import { generateId } from '../utils/duration';

interface RecordContextType {
  records: ShowRecord[];
  addRecord: (record: Omit<ShowRecord, 'id' | 'createdAt'>) => string;
  updateRecord: (id: string, updates: Partial<ShowRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordById: (id: string) => ShowRecord | undefined;
  getRecordsByPerformance: (performanceId: string) => ShowRecord[];
  updateJokeFeedback: (recordId: string, feedback: JokeFeedback) => void;
  updateSelfEvaluation: (recordId: string, evaluation: SelfEvaluation) => void;
  addVideoNote: (recordId: string, note: Omit<VideoNote, 'id'>) => void;
  updateVideoNote: (recordId: string, noteId: string, updates: Partial<VideoNote>) => void;
  deleteVideoNote: (recordId: string, noteId: string) => void;
}

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export function RecordProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useLocalStorage<ShowRecord[]>('comedy_records', seedRecords);

  const addRecord = useCallback((record: Omit<ShowRecord, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newId = generateId();
    const newRecord: ShowRecord = {
      ...record,
      id: newId,
      createdAt: now,
    };
    setRecords(prev => [newRecord, ...prev]);
    return newId;
  }, [setRecords]);

  const updateRecord = useCallback((id: string, updates: Partial<ShowRecord>) => {
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  }, [setRecords]);

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, [setRecords]);

  const getRecordById = useCallback((id: string) => {
    return records.find(r => r.id === id);
  }, [records]);

  const getRecordsByPerformance = useCallback((performanceId: string) => {
    return records.filter(r => r.performanceId === performanceId);
  }, [records]);

  const updateJokeFeedback = useCallback((recordId: string, feedback: JokeFeedback) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        const existingIndex = r.jokeFeedbacks.findIndex(f => f.jokeId === feedback.jokeId);
        if (existingIndex >= 0) {
          const newFeedbacks = [...r.jokeFeedbacks];
          newFeedbacks[existingIndex] = feedback;
          return { ...r, jokeFeedbacks: newFeedbacks };
        }
        return { ...r, jokeFeedbacks: [...r.jokeFeedbacks, feedback] };
      })
    );
  }, [setRecords]);

  const updateSelfEvaluation = useCallback((recordId: string, evaluation: SelfEvaluation) => {
    setRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, selfEvaluation: evaluation } : r))
    );
  }, [setRecords]);

  const addVideoNote = useCallback((recordId: string, note: Omit<VideoNote, 'id'>) => {
    const newNote: VideoNote = {
      ...note,
      id: generateId(),
    };
    setRecords(prev =>
      prev.map(r =>
        r.id === recordId
          ? { ...r, videoNotes: [...r.videoNotes, newNote].sort((a, b) => a.timestamp - b.timestamp) }
          : r
      )
    );
  }, [setRecords]);

  const updateVideoNote = useCallback((recordId: string, noteId: string, updates: Partial<VideoNote>) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          videoNotes: r.videoNotes.map(n =>
            n.id === noteId ? { ...n, ...updates } : n
          ),
        };
      })
    );
  }, [setRecords]);

  const deleteVideoNote = useCallback((recordId: string, noteId: string) => {
    setRecords(prev =>
      prev.map(r =>
        r.id === recordId
          ? { ...r, videoNotes: r.videoNotes.filter(n => n.id !== noteId) }
          : r
      )
    );
  }, [setRecords]);

  return (
    <RecordContext.Provider value={{
      records,
      addRecord,
      updateRecord,
      deleteRecord,
      getRecordById,
      getRecordsByPerformance,
      updateJokeFeedback,
      updateSelfEvaluation,
      addVideoNote,
      updateVideoNote,
      deleteVideoNote,
    }}>
      {children}
    </RecordContext.Provider>
  );
}

export function useRecords() {
  const context = useContext(RecordContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordProvider');
  }
  return context;
}
