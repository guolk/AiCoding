import type { AppState } from '@/types';

const STORAGE_KEY = 'aquarium_manager_state';

export const loadState = (): Partial<AppState> | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return null;
  }
};

export const saveState = (state: Partial<AppState>): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

export const clearState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
