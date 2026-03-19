import { describe, it, expect } from 'vitest';
import { sortValue, unsortValue, moveCard, getRemainingValues } from '../lib/sorting';
import { ALL_VALUES } from '../values';

const emptyState = {
  veryImportant: [],
  important: [],
  notImportant: [],
};

const v1 = ALL_VALUES[0]; // ACCEPTANCE
const v2 = ALL_VALUES[1]; // ACCURACY
const v3 = ALL_VALUES[2]; // ACHIEVEMENT

describe('sortValue', () => {
  it('sorts a value into veryImportant', () => {
    const result = sortValue(emptyState, v1.id, 'veryImportant');
    expect(result.veryImportant).toEqual([v1]);
    expect(result.important).toEqual([]);
    expect(result.notImportant).toEqual([]);
  });

  it('sorts a value into important', () => {
    const result = sortValue(emptyState, v1.id, 'important');
    expect(result.important).toEqual([v1]);
  });

  it('sorts a value into notImportant', () => {
    const result = sortValue(emptyState, v1.id, 'notImportant');
    expect(result.notImportant).toEqual([v1]);
  });

  it('moves a value from one category to another', () => {
    const state = {
      veryImportant: [v1],
      important: [],
      notImportant: [],
    };
    const result = sortValue(state, v1.id, 'notImportant');
    expect(result.veryImportant).toEqual([]);
    expect(result.notImportant).toEqual([v1]);
  });

  it('appends to existing values in target category', () => {
    const state = {
      veryImportant: [v1],
      important: [],
      notImportant: [],
    };
    const result = sortValue(state, v2.id, 'veryImportant');
    expect(result.veryImportant).toEqual([v1, v2]);
  });

  it('returns null for non-existent value ID', () => {
    const result = sortValue(emptyState, 99999, 'veryImportant');
    expect(result).toBeNull();
  });

  it('removes value from all categories before adding', () => {
    const state = {
      veryImportant: [v1],
      important: [v2],
      notImportant: [v3],
    };
    const result = sortValue(state, v2.id, 'veryImportant');
    expect(result.veryImportant).toEqual([v1, v2]);
    expect(result.important).toEqual([]);
    expect(result.notImportant).toEqual([v3]);
  });

  it('does not mutate the original state', () => {
    const state = {
      veryImportant: [v1],
      important: [],
      notImportant: [],
    };
    sortValue(state, v2.id, 'veryImportant');
    expect(state.veryImportant).toEqual([v1]);
  });
});

describe('unsortValue', () => {
  it('removes value from veryImportant', () => {
    const state = {
      veryImportant: [v1, v2],
      important: [],
      notImportant: [],
    };
    const result = unsortValue(state, v1.id);
    expect(result.veryImportant).toEqual([v2]);
  });

  it('removes value from important', () => {
    const state = {
      veryImportant: [],
      important: [v1],
      notImportant: [],
    };
    const result = unsortValue(state, v1.id);
    expect(result.important).toEqual([]);
  });

  it('handles value not in any category', () => {
    const result = unsortValue(emptyState, v1.id);
    expect(result.veryImportant).toEqual([]);
    expect(result.important).toEqual([]);
    expect(result.notImportant).toEqual([]);
  });

  it('does not mutate the original state', () => {
    const state = {
      veryImportant: [v1],
      important: [],
      notImportant: [],
    };
    unsortValue(state, v1.id);
    expect(state.veryImportant).toEqual([v1]);
  });
});

describe('moveCard', () => {
  it('moves card from veryImportant to important', () => {
    const state = {
      veryImportant: [v1, v2],
      important: [v3],
      notImportant: [],
    };
    const result = moveCard(state, v1.id, 'veryImportant', 'important');
    expect(result.veryImportant).toEqual([v2]);
    expect(result.important).toEqual([v1, v3]);
  });

  it('prepends card to target category', () => {
    const state = {
      veryImportant: [v1],
      important: [v2, v3],
      notImportant: [],
    };
    const result = moveCard(state, v1.id, 'veryImportant', 'important');
    expect(result.important).toEqual([v1, v2, v3]);
  });

  it('returns null if card not found in source category', () => {
    const state = {
      veryImportant: [],
      important: [v2],
      notImportant: [],
    };
    const result = moveCard(state, v1.id, 'veryImportant', 'important');
    expect(result).toBeNull();
  });

  it('does not mutate the original state', () => {
    const state = {
      veryImportant: [v1],
      important: [v2],
      notImportant: [],
    };
    moveCard(state, v1.id, 'veryImportant', 'important');
    expect(state.veryImportant).toEqual([v1]);
    expect(state.important).toEqual([v2]);
  });
});

describe('getRemainingValues', () => {
  it('returns all values when none are sorted', () => {
    const remaining = getRemainingValues(emptyState);
    expect(remaining).toHaveLength(83);
  });

  it('excludes sorted values', () => {
    const state = {
      veryImportant: [v1],
      important: [v2],
      notImportant: [v3],
    };
    const remaining = getRemainingValues(state);
    expect(remaining).toHaveLength(80);
    expect(remaining.find((v) => v.id === v1.id)).toBeUndefined();
    expect(remaining.find((v) => v.id === v2.id)).toBeUndefined();
    expect(remaining.find((v) => v.id === v3.id)).toBeUndefined();
  });

  it('returns empty array when all values sorted', () => {
    const state = {
      veryImportant: ALL_VALUES.slice(0, 30),
      important: ALL_VALUES.slice(30, 60),
      notImportant: ALL_VALUES.slice(60),
    };
    const remaining = getRemainingValues(state);
    expect(remaining).toHaveLength(0);
  });

  it('preserves original order of remaining values', () => {
    const state = {
      veryImportant: [ALL_VALUES[1]], // remove id=2
      important: [],
      notImportant: [],
    };
    const remaining = getRemainingValues(state);
    expect(remaining[0].id).toBe(1);
    expect(remaining[1].id).toBe(3);
  });
});
