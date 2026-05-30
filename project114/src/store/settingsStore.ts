import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings } from '../types';
import { defaultSettings } from '../utils/mockData';

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
    }),
    {
      name: 'energy-settings-storage',
    }
  )
);
