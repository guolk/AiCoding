import { AppState, RunRecord, TrainingPlan, RaceGoal, InjuryRecord, CheckListItem, UserProfile } from '../types';

const STORAGE_KEY = 'marathon-tracker-data';

const defaultState: AppState = {
  raceGoal: null,
  trainingPlan: null,
  runRecords: [],
  injuries: [],
  checkList: [],
  userProfile: null
};

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return defaultState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return defaultState;
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

export const saveRaceGoal = (goal: RaceGoal): void => {
  const state = loadState();
  state.raceGoal = goal;
  saveState(state);
};

export const saveTrainingPlan = (plan: TrainingPlan): void => {
  const state = loadState();
  state.trainingPlan = plan;
  saveState(state);
};

export const addRunRecord = (record: RunRecord): void => {
  const state = loadState();
  state.runRecords.unshift(record);
  saveState(state);
};

export const updateRunRecord = (record: RunRecord): void => {
  const state = loadState();
  const index = state.runRecords.findIndex(r => r.id === record.id);
  if (index !== -1) {
    state.runRecords[index] = record;
  }
  saveState(state);
};

export const deleteRunRecord = (id: string): void => {
  const state = loadState();
  state.runRecords = state.runRecords.filter(r => r.id !== id);
  saveState(state);
};

export const addInjury = (injury: InjuryRecord): void => {
  const state = loadState();
  state.injuries.unshift(injury);
  saveState(state);
};

export const updateInjury = (injury: InjuryRecord): void => {
  const state = loadState();
  const index = state.injuries.findIndex(i => i.id === injury.id);
  if (index !== -1) {
    state.injuries[index] = injury;
  }
  saveState(state);
};

export const saveCheckList = (items: CheckListItem[]): void => {
  const state = loadState();
  state.checkList = items;
  saveState(state);
};

export const saveUserProfile = (profile: UserProfile): void => {
  const state = loadState();
  state.userProfile = profile;
  saveState(state);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
