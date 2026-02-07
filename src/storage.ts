import type { MindMapData, Theme } from './types';

const STORAGE_KEY = 'mindmap-data';
const THEME_KEY = 'mindmap-theme';

export const saveToStorage = (data: MindMapData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadFromStorage = (): MindMapData | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const loadTheme = (): Theme | null => {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
};

export const detectSystemTheme = (): Theme => {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return 'light';
  }
  return 'dark';
};
