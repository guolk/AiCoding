const PREFIX = 'nomad-hub:';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`${PREFIX}${key}`, serialized);
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`${PREFIX}${key}`);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error('Storage load error:', e);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(`${PREFIX}${key}`);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
