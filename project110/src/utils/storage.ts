export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
};

export const clearLocalStorage = (): void => {
  try {
    const keysToRemove = [
      'yoga_sequences',
      'practice_records',
      'pose_progress',
      'flexibility_tests',
      'meditation_scripts',
      'wellness_assessments',
    ];
    keysToRemove.forEach(key => window.localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing localStorage', error);
  }
};

export const STORAGE_KEYS = {
  SEQUENCES: 'yoga_sequences',
  PRACTICE_RECORDS: 'practice_records',
  POSE_PROGRESS: 'pose_progress',
  FLEXIBILITY_TESTS: 'flexibility_tests',
  MEDITATION_SCRIPTS: 'meditation_scripts',
  WELLNESS_ASSESSMENTS: 'wellness_assessments',
  APP_SETTINGS: 'app_settings',
};
