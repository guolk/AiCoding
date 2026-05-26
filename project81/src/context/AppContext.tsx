import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, MoodRecord, JournalEntry, CBTSession, StrategyEffect } from '../types';
import { loadState, saveState, generateId } from '../utils/storage';

type AppAction =
  | { type: 'ADD_MOOD_RECORD'; payload: Omit<MoodRecord, 'id' | 'timestamp'> }
  | { type: 'DELETE_MOOD_RECORD'; payload: string }
  | { type: 'ADD_JOURNAL'; payload: Omit<JournalEntry, 'id' | 'timestamp'> }
  | { type: 'DELETE_JOURNAL'; payload: string }
  | { type: 'ADD_CBT_SESSION'; payload: Omit<CBTSession, 'id' | 'timestamp'> }
  | { type: 'ADD_STRATEGY'; payload: Omit<StrategyEffect, 'id' | 'timestamp'> }
  | { type: 'LOAD_STATE'; payload: AppState };

const AppContext = createContext<{
  state: AppState;
  addMoodRecord: (record: Omit<MoodRecord, 'id' | 'timestamp'>) => void;
  deleteMoodRecord: (id: string) => void;
  addJournal: (journal: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  deleteJournal: (id: string) => void;
  addCBTSession: (session: Omit<CBTSession, 'id' | 'timestamp'>) => void;
  addStrategy: (strategy: Omit<StrategyEffect, 'id' | 'timestamp'>) => void;
} | null>(null);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_MOOD_RECORD':
      return {
        ...state,
        moodRecords: [
          ...state.moodRecords,
          { ...action.payload, id: generateId(), timestamp: Date.now() }
        ]
      };
    case 'DELETE_MOOD_RECORD':
      return {
        ...state,
        moodRecords: state.moodRecords.filter(r => r.id !== action.payload)
      };
    case 'ADD_JOURNAL':
      return {
        ...state,
        journals: [
          ...state.journals,
          { ...action.payload, id: generateId(), timestamp: Date.now() }
        ]
      };
    case 'DELETE_JOURNAL':
      return {
        ...state,
        journals: state.journals.filter(j => j.id !== action.payload)
      };
    case 'ADD_CBT_SESSION':
      return {
        ...state,
        cbtSessions: [
          ...state.cbtSessions,
          { ...action.payload, id: generateId(), timestamp: Date.now() }
        ]
      };
    case 'ADD_STRATEGY':
      return {
        ...state,
        strategies: [
          ...state.strategies,
          { ...action.payload, id: generateId(), timestamp: Date.now() }
        ]
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    moodRecords: [],
    journals: [],
    cbtSessions: [],
    strategies: []
  });

  useEffect(() => {
    const savedState = loadState();
    dispatch({ type: 'LOAD_STATE', payload: savedState });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addMoodRecord = (record: Omit<MoodRecord, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_MOOD_RECORD', payload: record });
  };

  const deleteMoodRecord = (id: string) => {
    dispatch({ type: 'DELETE_MOOD_RECORD', payload: id });
  };

  const addJournal = (journal: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_JOURNAL', payload: journal });
  };

  const deleteJournal = (id: string) => {
    dispatch({ type: 'DELETE_JOURNAL', payload: id });
  };

  const addCBTSession = (session: Omit<CBTSession, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_CBT_SESSION', payload: session });
  };

  const addStrategy = (strategy: Omit<StrategyEffect, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_STRATEGY', payload: strategy });
  };

  return (
    <AppContext.Provider value={{ state, addMoodRecord, deleteMoodRecord, addJournal, deleteJournal, addCBTSession, addStrategy }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
