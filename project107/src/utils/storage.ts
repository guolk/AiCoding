export const STORAGE_KEYS = {
  THEME: 'theme',
  GAME_HISTORY: 'gameHistory',
  PREFERRED_LANGUAGE: 'preferredLanguage',
  USER_SETTINGS: 'userSettings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export function getStorageItem<T>(key: StorageKey, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: StorageKey, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeStorageItem(key: StorageKey): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}
