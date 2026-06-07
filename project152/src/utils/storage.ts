export const STORAGE_KEYS = {
  PATENTS: 'ipms_patents',
  TRADEMARKS: 'ipms_trademarks',
  COPYRIGHTS: 'ipms_copyrights',
  COMPETITOR_PATENTS: 'ipms_competitor_patents',
  INFRINGEMENT_ASSESSMENTS: 'ipms_infringement_assessments',
  LICENSE_AGREEMENTS: 'ipms_license_agreements',
  TECHNOLOGY_TRANSFERS: 'ipms_technology_transfers',
  PLEDGE_FINANCINGS: 'ipms_pledge_financings',
  PATENT_VALUATIONS: 'ipms_patent_valuations',
  USER_SETTINGS: 'ipms_user_settings',
  THEME: 'ipms_theme',
} as const;

export function saveToStorage(key: string, data: unknown): void {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to localStorage with key "${key}":`, error);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading from localStorage with key "${key}":`, error);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage with key "${key}":`, error);
  }
}

export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
