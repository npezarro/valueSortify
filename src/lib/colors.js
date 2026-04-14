/**
 * Shared design system color tokens.
 * Single source of truth for colors used in exports (PDF, PNG) and canvas rendering.
 * Hex values must stay in sync with tailwind.config.js.
 */

export const DESIGN_TOKENS = {
  ink: '#1b1b1b',
  sand: '#f3efe6',
  ember: '#e85d2f',
  moss: '#436a5a',
  sky: '#c9d6df',
  cardBg: '#fafaf8',
  bg: '#efede7',
};

/** Parse a hex color string to an [R, G, B] tuple for jsPDF. */
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Pre-computed RGB tuples for PDF export. */
export const CATEGORY_COLORS = {
  veryImportant: { hex: DESIGN_TOKENS.ember, rgb: hexToRgb(DESIGN_TOKENS.ember) },
  important: { hex: DESIGN_TOKENS.moss, rgb: hexToRgb(DESIGN_TOKENS.moss) },
  notImportant: { hex: DESIGN_TOKENS.sky, rgb: hexToRgb(DESIGN_TOKENS.sky) },
};
