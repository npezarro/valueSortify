import { describe, it, expect } from 'vitest';
import { DESIGN_TOKENS, hexToRgb, CATEGORY_COLORS } from '../lib/colors';

describe('DESIGN_TOKENS', () => {
  it('contains all required color keys', () => {
    expect(DESIGN_TOKENS).toHaveProperty('ink');
    expect(DESIGN_TOKENS).toHaveProperty('sand');
    expect(DESIGN_TOKENS).toHaveProperty('ember');
    expect(DESIGN_TOKENS).toHaveProperty('moss');
    expect(DESIGN_TOKENS).toHaveProperty('sky');
    expect(DESIGN_TOKENS).toHaveProperty('cardBg');
    expect(DESIGN_TOKENS).toHaveProperty('bg');
  });

  it('has valid hex color format for all tokens', () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    for (const [key, value] of Object.entries(DESIGN_TOKENS)) {
      expect(value, `${key} should be a valid hex color`).toMatch(hexPattern);
    }
  });

  it('matches tailwind.config.js values', () => {
    expect(DESIGN_TOKENS.ink).toBe('#1b1b1b');
    expect(DESIGN_TOKENS.ember).toBe('#e85d2f');
    expect(DESIGN_TOKENS.moss).toBe('#436a5a');
    expect(DESIGN_TOKENS.sky).toBe('#c9d6df');
  });
});

describe('hexToRgb', () => {
  it('converts ember hex to correct RGB tuple', () => {
    expect(hexToRgb('#e85d2f')).toEqual([232, 93, 47]);
  });

  it('converts moss hex to correct RGB tuple', () => {
    expect(hexToRgb('#436a5a')).toEqual([67, 106, 90]);
  });

  it('converts sky hex to correct RGB tuple', () => {
    expect(hexToRgb('#c9d6df')).toEqual([201, 214, 223]);
  });

  it('handles black', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  it('handles white', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
  });
});

describe('CATEGORY_COLORS', () => {
  it('has entries for all three categories', () => {
    expect(CATEGORY_COLORS).toHaveProperty('veryImportant');
    expect(CATEGORY_COLORS).toHaveProperty('important');
    expect(CATEGORY_COLORS).toHaveProperty('notImportant');
  });

  it('each entry has hex and rgb properties', () => {
    for (const cat of Object.values(CATEGORY_COLORS)) {
      expect(cat).toHaveProperty('hex');
      expect(cat).toHaveProperty('rgb');
      expect(cat.rgb).toHaveLength(3);
    }
  });

  it('rgb values match hex values', () => {
    for (const cat of Object.values(CATEGORY_COLORS)) {
      expect(cat.rgb).toEqual(hexToRgb(cat.hex));
    }
  });

  it('veryImportant uses ember', () => {
    expect(CATEGORY_COLORS.veryImportant.hex).toBe(DESIGN_TOKENS.ember);
  });

  it('important uses moss', () => {
    expect(CATEGORY_COLORS.important.hex).toBe(DESIGN_TOKENS.moss);
  });

  it('notImportant uses sky', () => {
    expect(CATEGORY_COLORS.notImportant.hex).toBe(DESIGN_TOKENS.sky);
  });
});
