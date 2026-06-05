import localforage from 'localforage';

localforage.config({
  name: 'ClassManager',
  version: 1.0,
  storeName: 'classManager',
  description: '班级管理系统本地存储'
});

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await localforage.getItem<T>(key);
      return value;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await localforage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async keys(): Promise<string[]> {
    try {
      return await localforage.keys();
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }
};

export const STORAGE_KEYS = {
  STUDENTS: 'students',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  GRADES: 'grades',
  BEHAVIORS: 'behaviors',
  GROUPS: 'groups',
  GROUP_MEMBERS: 'groupMembers',
  COMMUNICATIONS: 'communications',
  ANNOUNCEMENTS: 'announcements',
  LEAVES: 'leaves',
  HOME_VISITS: 'homeVisits',
  SETTINGS: 'settings'
} as const;

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const stored = localStorage.getItem(key);
  const value = stored ? JSON.parse(stored) : initialValue;

  const setValue = (newValue: T) => {
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setValue] as const;
};
