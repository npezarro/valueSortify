import { useState, useCallback } from 'react';

const STORAGE_KEY = 'valuesortify-session';

const DEFAULT_STATE = {
  phase: 1,
  veryImportant: [],
  important: [],
  notImportant: [],
};

export function useLocalStorage() {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_STATE;
  });

  const save = useCallback((updates) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  }, []);

  return { state, save, reset };
}
