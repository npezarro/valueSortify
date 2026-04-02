import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildCSV, buildJSONExport, buildImageBlob } from '../lib/export';

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

describe('buildImageBlob', () => {
  let mockCtx;
  let mockCanvas;
  let toBlobCallback;

  beforeEach(() => {
    mockCtx = {
      scale: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 })),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
    };
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockCtx),
      toBlob: vi.fn((cb) => { toBlobCallback = cb; cb(new Blob(['mock'], { type: 'image/png' })); }),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return mockCanvas;
      return document.createElement.wrappedMethod
        ? document.createElement.wrappedMethod.call(document, tag)
        : Object.create(null);
    });
  });

  it('returns a PNG blob', async () => {
    const state = {
      veryImportant: [v1, v2],
      important: [v3],
      notImportant: [],
    };
    const blob = await buildImageBlob(state);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('creates a canvas with 2x dimensions for retina', async () => {
    const state = { veryImportant: [v1], important: [v2], notImportant: [] };
    await buildImageBlob(state);
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCtx.scale).toHaveBeenCalledWith(2, 2);
    expect(mockCanvas.width).toBeGreaterThan(0);
    expect(mockCanvas.height).toBeGreaterThan(0);
    // Width should be 2x the logical width (800)
    expect(mockCanvas.width).toBe(1600);
  });

  it('draws value names on the canvas', async () => {
    const state = {
      veryImportant: [v1],
      important: [],
      notImportant: [],
    };
    await buildImageBlob(state);
    const textCalls = mockCtx.fillText.mock.calls.map((c) => c[0]);
    expect(textCalls.some((t) => t === 'ACCEPTANCE')).toBe(true);
  });

  it('draws section headers', async () => {
    const state = {
      veryImportant: [v1],
      important: [v2],
      notImportant: [],
    };
    await buildImageBlob(state);
    const textCalls = mockCtx.fillText.mock.calls.map((c) => c[0]);
    expect(textCalls.some((t) => t.includes('Very Important'))).toBe(true);
    expect(textCalls.some((t) => t.includes('Important'))).toBe(true);
  });

  it('draws rank numbers', async () => {
    const state = {
      veryImportant: [v1, v2, v3],
      important: [],
      notImportant: [],
    };
    await buildImageBlob(state);
    const textCalls = mockCtx.fillText.mock.calls.map((c) => c[0]);
    expect(textCalls).toContain('1.');
    expect(textCalls).toContain('2.');
    expect(textCalls).toContain('3.');
  });

  it('limits to top 10 values per section', async () => {
    const manyValues = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `VALUE_${i + 1}`,
      description: `desc ${i + 1}`,
    }));
    const state = {
      veryImportant: manyValues,
      important: [],
      notImportant: [],
    };
    await buildImageBlob(state);
    const textCalls = mockCtx.fillText.mock.calls.map((c) => c[0]);
    // Should have ranks 1-10 but not 11-15
    expect(textCalls).toContain('10.');
    expect(textCalls).not.toContain('11.');
  });

  it('includes footer text', async () => {
    const state = { veryImportant: [v1], important: [], notImportant: [] };
    await buildImageBlob(state);
    const textCalls = mockCtx.fillText.mock.calls.map((c) => c[0]);
    expect(textCalls.some((t) => t.includes('ValueSortify'))).toBe(true);
  });

  it('handles empty categories gracefully', async () => {
    const state = { veryImportant: [], important: [], notImportant: [] };
    const blob = await buildImageBlob(state);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('calls toBlob with png mime type', async () => {
    const state = { veryImportant: [v1], important: [], notImportant: [] };
    await buildImageBlob(state);
    expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png');
  });
});
