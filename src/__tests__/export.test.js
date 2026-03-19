import { describe, it, expect } from 'vitest';
import { buildCSV, buildJSONExport } from '../lib/export';

const v1 = { id: 1, name: 'ACCEPTANCE', description: 'to be accepted as I am' };
const v2 = { id: 2, name: 'ACCURACY', description: 'to be accurate in my opinions and beliefs' };
const v3 = { id: 3, name: 'ACHIEVEMENT', description: 'to have important accomplishments' };

const emptyState = {
  veryImportant: [],
  important: [],
  notImportant: [],
};

describe('buildCSV', () => {
  it('returns header row when all categories are empty', () => {
    const csv = buildCSV(emptyState);
    expect(csv).toBe('Rank,Category,Value,Description');
  });

  it('includes values from all three categories', () => {
    const state = {
      veryImportant: [v1],
      important: [v2],
      notImportant: [v3],
    };
    const csv = buildCSV(state);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(4); // header + 3 data rows
    expect(lines[0]).toBe('Rank,Category,Value,Description');
    expect(lines[1]).toBe('1,"Very Important","ACCEPTANCE","to be accepted as I am"');
    expect(lines[2]).toBe('1,"Important","ACCURACY","to be accurate in my opinions and beliefs"');
    expect(lines[3]).toBe('1,"Not Important","ACHIEVEMENT","to have important accomplishments"');
  });

  it('ranks values within each category starting at 1', () => {
    const state = {
      veryImportant: [v1, v2, v3],
      important: [],
      notImportant: [],
    };
    const csv = buildCSV(state);
    const lines = csv.split('\n');
    expect(lines[1]).toMatch(/^1,/);
    expect(lines[2]).toMatch(/^2,/);
    expect(lines[3]).toMatch(/^3,/);
  });

  it('quotes category, name, and description fields', () => {
    const state = {
      veryImportant: [{ id: 99, name: "GOD'S WILL", description: 'to seek and obey the will of God' }],
      important: [],
      notImportant: [],
    };
    const csv = buildCSV(state);
    const dataLine = csv.split('\n')[1];
    expect(dataLine).toContain('"Very Important"');
    expect(dataLine).toContain('"GOD\'S WILL"');
  });

  it('orders categories: Very Important, Important, Not Important', () => {
    const state = {
      veryImportant: [v1],
      important: [v2],
      notImportant: [v3],
    };
    const csv = buildCSV(state);
    const lines = csv.split('\n');
    expect(lines[1]).toContain('Very Important');
    expect(lines[2]).toContain('Important');
    expect(lines[3]).toContain('Not Important');
  });
});

describe('buildJSONExport', () => {
  it('includes all three categories', () => {
    const state = {
      veryImportant: [v1],
      important: [v2],
      notImportant: [v3],
    };
    const result = buildJSONExport(state, '2026-01-01T00:00:00.000Z');
    expect(result.veryImportant).toEqual([v1]);
    expect(result.important).toEqual([v2]);
    expect(result.notImportant).toEqual([v3]);
  });

  it('includes the provided timestamp', () => {
    const ts = '2026-03-18T12:00:00.000Z';
    const result = buildJSONExport(emptyState, ts);
    expect(result.timestamp).toBe(ts);
  });

  it('returns empty arrays for empty categories', () => {
    const result = buildJSONExport(emptyState, '2026-01-01T00:00:00.000Z');
    expect(result.veryImportant).toEqual([]);
    expect(result.important).toEqual([]);
    expect(result.notImportant).toEqual([]);
  });

  it('preserves value ordering', () => {
    const state = {
      veryImportant: [v3, v1, v2],
      important: [],
      notImportant: [],
    };
    const result = buildJSONExport(state, '2026-01-01T00:00:00.000Z');
    expect(result.veryImportant.map((v) => v.id)).toEqual([3, 1, 2]);
  });

  it('has exactly four keys', () => {
    const result = buildJSONExport(emptyState, '2026-01-01T00:00:00.000Z');
    expect(Object.keys(result)).toEqual(['veryImportant', 'important', 'notImportant', 'timestamp']);
  });
});
