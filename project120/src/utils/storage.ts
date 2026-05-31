const STORAGE_PREFIX = 'extreme_sports_';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    if (data === null) {
      return defaultValue;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
