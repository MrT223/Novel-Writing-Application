import { create } from 'zustand';
import type { AppSettings, Theme } from '@/types';
import { DEFAULT_SETTINGS } from '@/utils/constants';

export interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleTimeline: () => void;
  toggleZenMode: () => void;
  toggleFocusMode: () => void;
  toggleTypewriterMode: () => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'novel_writer_settings';

const loadSavedSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to parse settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
};

const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Apply data-theme to HTML tag
    document.documentElement.setAttribute('data-theme', settings.theme);
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initialSettings = loadSavedSettings();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', initialSettings.theme);
  }

  return {
    settings: initialSettings,

    updateSettings: (partial) => {
      const updated = { ...get().settings, ...partial };
      set({ settings: updated });
      saveSettings(updated);
    },

    setTheme: (theme: Theme) => {
      const updated = { ...get().settings, theme };
      set({ settings: updated });
      saveSettings(updated);
    },

    toggleTheme: () => {
      const current = get().settings.theme;
      const themes: Theme[] = ['light', 'dark', 'sepia'];
      const nextTheme = themes[(themes.indexOf(current) + 1) % themes.length];
      get().setTheme(nextTheme);
    },

    toggleSidebar: () => {
      get().updateSettings({ showSidebar: !get().settings.showSidebar });
    },

    toggleTimeline: () => {
      get().updateSettings({ showTimeline: !get().settings.showTimeline });
    },

    toggleZenMode: () => {
      get().updateSettings({ zenMode: !get().settings.zenMode });
    },

    toggleFocusMode: () => {
      get().updateSettings({ focusMode: !get().settings.focusMode });
    },

    toggleTypewriterMode: () => {
      get().updateSettings({ typewriterMode: !get().settings.typewriterMode });
    },

    resetToDefaults: () => {
      set({ settings: DEFAULT_SETTINGS });
      saveSettings(DEFAULT_SETTINGS);
    },
  };
});

