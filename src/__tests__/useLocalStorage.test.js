import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const STORAGE_KEY = 'valuesortify-session';

const DEFAULT_STATE = {
  phase: 1,
  veryImportant: [],
  important: [],
  notImportant: [],
};

// Must mock localStorage before importing the hook
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = String(val); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _store: () => store,
    _reset: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock._reset();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('returns default state when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.state).toEqual(DEFAULT_STATE);
  });

  it('loads existing state from localStorage', () => {
    const saved = { phase: 2, veryImportant: [{ id: 1, name: 'A' }], important: [], notImportant: [] };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(saved));

    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.state).toEqual(saved);
  });

  it('returns default state when localStorage has invalid JSON', () => {
    localStorageMock.setItem(STORAGE_KEY, 'not-json{{{');

    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.state).toEqual(DEFAULT_STATE);
  });

  it('fills in missing category arrays from a partial/older-schema session', () => {
    // Older schema or truncated write missing `important` and `notImportant`.
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ phase: 2, veryImportant: [{ id: 1, name: 'A' }] }));

    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.state).toEqual({
      phase: 2,
      veryImportant: [{ id: 1, name: 'A' }],
      important: [],
      notImportant: [],
    });
  });

  it('coerces non-array category fields to empty arrays', () => {
    localStorageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({ phase: 1, veryImportant: 'corrupt', important: null, notImportant: 5 })
    );

    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.state.veryImportant).toEqual([]);
    expect(result.current.state.important).toEqual([]);
    expect(result.current.state.notImportant).toEqual([]);
  });

  it('falls back to default phase when phase is missing or non-integer', () => {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ phase: 'two', veryImportant: [], important: [], notImportant: [] }));

    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.state.phase).toBe(1);
  });

  it('returns default state when stored JSON is not an object', () => {
    // Valid JSON that parses to a non-object (array / primitive) must not be trusted.
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));

    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.state).toEqual(DEFAULT_STATE);
  });

  it('save merges updates into current state and persists', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.save({ phase: 2 });
    });

    expect(result.current.state.phase).toBe(2);
    expect(result.current.state.veryImportant).toEqual([]);

    const persisted = JSON.parse(localStorageMock._store()[STORAGE_KEY]);
    expect(persisted.phase).toBe(2);
    expect(persisted.veryImportant).toEqual([]);
  });

  it('save preserves fields not included in the update', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.save({ veryImportant: [{ id: 1, name: 'TEST' }] });
    });

    expect(result.current.state.phase).toBe(1);
    expect(result.current.state.veryImportant).toEqual([{ id: 1, name: 'TEST' }]);
  });

  it('sequential saves accumulate correctly', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.save({ veryImportant: [{ id: 1, name: 'A' }] });
    });
    act(() => {
      result.current.save({ phase: 2 });
    });

    expect(result.current.state).toEqual({
      phase: 2,
      veryImportant: [{ id: 1, name: 'A' }],
      important: [],
      notImportant: [],
    });
  });

  it('reset clears localStorage and restores default state', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.save({ phase: 3, veryImportant: [{ id: 1, name: 'X' }] });
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual(DEFAULT_STATE);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('save writes to localStorage with the correct key', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.save({ phase: 2 });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.any(String)
    );
  });
});
