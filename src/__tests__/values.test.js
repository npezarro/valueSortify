import { describe, it, expect } from 'vitest';
import { ALL_VALUES } from '../values';

describe('ALL_VALUES', () => {
  it('contains exactly 83 values', () => {
    expect(ALL_VALUES).toHaveLength(83);
  });

  it('has sequential IDs from 1 to 83', () => {
    const ids = ALL_VALUES.map((v) => v.id);
    const expected = Array.from({ length: 83 }, (_, i) => i + 1);
    expect(ids).toEqual(expected);
  });

  it('has unique IDs', () => {
    const ids = ALL_VALUES.map((v) => v.id);
    expect(new Set(ids).size).toBe(83);
  });

  it('has unique names', () => {
    const names = ALL_VALUES.map((v) => v.name);
    expect(new Set(names).size).toBe(83);
  });

  it('every value has required fields', () => {
    for (const value of ALL_VALUES) {
      expect(value).toHaveProperty('id');
      expect(value).toHaveProperty('name');
      expect(value).toHaveProperty('description');
      expect(typeof value.id).toBe('number');
      expect(typeof value.name).toBe('string');
      expect(typeof value.description).toBe('string');
    }
  });

  it('no value has empty name or description', () => {
    for (const value of ALL_VALUES) {
      expect(value.name.trim().length).toBeGreaterThan(0);
      expect(value.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('names are uppercase', () => {
    for (const value of ALL_VALUES) {
      expect(value.name).toBe(value.name.toUpperCase());
    }
  });

  it('descriptions start with "to "', () => {
    for (const value of ALL_VALUES) {
      expect(value.description.startsWith('to ')).toBe(true);
    }
  });
});
