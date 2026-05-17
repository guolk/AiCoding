import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, RaceGoal, TrainingPlan, RunRecord, InjuryRecord, CheckListItem, UserProfile, TrainingDay } from '../types';
import { loadState, saveState } from '../utils/storage';

type AppAction =
  | { type: 'SET_RACE_GOAL'; payload: RaceGoal | null }
  | { type: 'SET_TRAINING_PLAN'; payload: TrainingPlan | null }
  | { type: 'UPDATE_TRAINING_DAY'; payload: { dayId: string; updates: Partial<TrainingDay> } }
  | { type: 'ADD_RUN_RECORD'; payload: RunRecord }
  | { type: 'UPDATE_RUN_RECORD'; payload: RunRecord }
  | { type: 'DELETE_RUN_RECORD'; payload: string }
  | { type: 'ADD_INJURY'; payload: InjuryRecord }
  | { type: 'UPDATE_INJURY'; payload: InjuryRecord }
  | { type: 'SET_CHECKLIST'; payload: CheckListItem[] }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  raceGoal: null,
  trainingPlan: null,
  runRecords: [],
  injuries: [],
  checkList: [],
  userProfile: null
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_RACE_GOAL':
      return { ...state, raceGoal: action.payload };
    case 'SET_TRAINING_PLAN':
      return { ...state, trainingPlan: action.payload };
    case 'UPDATE_TRAINING_DAY':
      if (!state.trainingPlan) return state;
      return {
        ...state,
        trainingPlan: {
          ...state.trainingPlan,
          days: state.trainingPlan.days.map(day =>
            day.id === action.payload.dayId ? { ...day, ...action.payload.updates } : day
          )
        }
      };
    case 'ADD_RUN_RECORD':
      return { ...state, runRecords: [action.payload, ...state.runRecords] };
    case 'UPDATE_RUN_RECORD':
      return {
        ...state,
        runRecords: state.runRecords.map(r =>
          r.id === action.payload.id ? action.payload : r
        )
      };
    case 'DELETE_RUN_RECORD':
      return {
        ...state,
        runRecords: state.runRecords.filter(r => r.id !== action.payload)
      };
    case 'ADD_INJURY':
      return { ...state, injuries: [action.payload, ...state.injuries] };
    case 'UPDATE_INJURY':
      return {
        ...state,
        injuries: state.injuries.map(i =>
          i.id === action.payload.id ? action.payload : i
        )
      };
    case 'SET_CHECKLIST':
      return { ...state, checkList: action.payload };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
    }
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
