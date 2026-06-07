export function getStorage(key: string): any {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error getting storage for key "${key}":`, error);
    return null;
  }
}

export function setStorage(key: string, value: any): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting storage for key "${key}":`, error);
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing storage for key "${key}":`, error);
  }
}
