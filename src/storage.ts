import type { MindMapData } from './types';

const STORAGE_KEY = 'mindmap-data';

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
