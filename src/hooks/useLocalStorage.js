import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'valuesortify-session';

const DEFAULT_STATE = {
  phase: 1,
  veryImportant: [],
  important: [],
  notImportant: [],
};

/**
 * Normalize a parsed session object against the current schema.
 *
 * JSON.parse can succeed on a structurally invalid session (an older schema
 * missing a category, a manual edit, a truncated write, or a non-object), and
 * the raw result was previously trusted as-is. A missing category array then
 * crashes the app on the first `state.<category>.length`/`.filter` access
 * (e.g. App.jsx render). Coerce every field back to a valid value so stale or
 * corrupt sessions degrade gracefully instead of breaking silently.
 */
function normalizeState(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ...DEFAULT_STATE };
  }
  return {
    phase: Number.isInteger(parsed.phase) ? parsed.phase : DEFAULT_STATE.phase,
    veryImportant: Array.isArray(parsed.veryImportant) ? parsed.veryImportant : [],
    important: Array.isArray(parsed.important) ? parsed.important : [],
    notImportant: Array.isArray(parsed.notImportant) ? parsed.notImportant : [],
  };
}

export function useLocalStorage() {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return normalizeState(JSON.parse(stored));
    } catch { /* localStorage may be unavailable */ }
    return { ...DEFAULT_STATE };
  });

  const [justSaved, setJustSaved] = useState(false);
  const timerRef = useRef(null);

  const save = useCallback((updates) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setJustSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustSaved(false), 1500);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  }, []);

  return { state, save, reset, justSaved };
}
