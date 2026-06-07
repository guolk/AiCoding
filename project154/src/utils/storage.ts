const PREFIX = 'cycle-route-';

export const setStorage = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(PREFIX + key, serializedValue);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(PREFIX + key);
    if (item === null) {
      return defaultValue ?? null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue ?? null;
  }
};

export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export const clearStorage = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export const getFavorites = (): string[] => {
  return getStorage<string[]>('favorites', []) || [];
};

export const setFavorites = (favorites: string[]): void => {
  setStorage('favorites', favorites);
};

export const toggleFavorite = (routeId: string): boolean => {
  const favorites = getFavorites();
  const index = favorites.indexOf(routeId);
  if (index > -1) {
    favorites.splice(index, 1);
    setFavorites(favorites);
    return false;
  } else {
    favorites.push(routeId);
    setFavorites(favorites);
    return true;
  }
};

export const isFavorite = (routeId: string): boolean => {
  const favorites = getFavorites();
  return favorites.includes(routeId);
};
