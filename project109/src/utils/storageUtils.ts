const STORAGE_PREFIX = 'legaldoc_';

export const STORAGE_KEYS = {
  USER: `${STORAGE_PREFIX}user`,
  DOCUMENTS: `${STORAGE_PREFIX}documents`,
  LEGAL_DOCUMENTS: `${STORAGE_PREFIX}legal`,
  FAMILY_MEMBERS: `${STORAGE_PREFIX}family_members`,
  FAMILY_RECORDS: `${STORAGE_PREFIX}family_records`,
  BANK_ACCOUNTS: `${STORAGE_PREFIX}bank_accounts`,
  INSURANCE_POLICIES: `${STORAGE_PREFIX}insurance`,
  INVESTMENTS: `${STORAGE_PREFIX}investments`,
  EMERGENCY_CONTACTS: `${STORAGE_PREFIX}contacts`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  INITIALIZED: `${STORAGE_PREFIX}initialized`,
} as const;

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
}

export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage', error);
  }
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
