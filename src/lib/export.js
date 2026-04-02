/**
 * Build CSV string from categorized values.
 */
export function buildCSV(state) {
  const rows = ['Rank,Category,Value,Description'];
  const addCategory = (values, category) => {
    values.forEach((v, i) => {
      rows.push(`${i + 1},"${category}","${v.name}","${v.description}"`);
    });
  };
  addCategory(state.veryImportant, 'Very Important');
  addCategory(state.important, 'Important');
  addCategory(state.notImportant, 'Not Important');
  return rows.join('\n');
}

/**
 * Build JSON export object from categorized values.
 */
export function buildJSONExport(state, timestamp) {
  return {
    veryImportant: state.veryImportant,
    important: state.important,
    notImportant: state.notImportant,
    timestamp,
  };
}

// Design system colors
const COLORS = {
  ink: '#1b1b1b',
  sand: '#f3efe6',
  ember: '#e85d2f',
  moss: '#436a5a',
  sky: '#c9d6df',
  cardBg: '#fafaf8',
  bg: '#efede7',
};

/**
 * Draw a rounded rectangle on a canvas context.
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Render the values summary to a canvas and return it as a PNG blob.
 * Shows top values from each category in a visually appealing card.
 */
export async function buildImageBlob(state) {
  const topCount = 10;
  const topVeryImportant = state.veryImportant.slice(0, topCount);
  const topImportant = state.important.slice(0, topCount);

  const sections = [
    { title: 'Very Important', values: topVeryImportant, color: COLORS.ember },
    { title: 'Important', values: topImportant, color: COLORS.moss },
  ];

  // Layout constants
  const W = 800;
  const PAD = 40;
  const SECTION_GAP = 28;
  const ROW_H = 32;
  const SECTION_HEADER_H = 44;
  const TITLE_H = 80;
  const FOOTER_H = 48;

  // Calculate height
  const sectionHeight = (vals) => SECTION_HEADER_H + vals.length * ROW_H + 16;
  const contentH = sections.reduce((h, s) => h + sectionHeight(s.values) + SECTION_GAP, 0) - SECTION_GAP;
  const H = TITLE_H + contentH + FOOTER_H + PAD * 2;

  const canvas = document.createElement('canvas');
  canvas.width = W * 2; // 2x for retina
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Card
  const cardX = PAD - 8;
  const cardY = PAD - 8;
  const cardW = W - (PAD - 8) * 2;
  const cardH = H - (PAD - 8) * 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.fillStyle = COLORS.cardBg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(27, 27, 27, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Title
  let y = PAD + 12;
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 26px Fraunces, Georgia, serif';
  ctx.fillText('My Personal Values', PAD + 12, y + 26);
  ctx.fillStyle = COLORS.ink + '66';
  ctx.font = '14px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), PAD + 12, y + 50);
  y += TITLE_H;

  // Sections
  for (const section of sections) {
    const sh = sectionHeight(section.values);
    const sectionX = PAD + 4;
    const sectionW = W - PAD * 2 - 8;

    // Section background
    roundRect(ctx, sectionX, y, sectionW, sh, 14);
    ctx.fillStyle = section.color + '0D'; // 5% opacity
    ctx.fill();
    ctx.strokeStyle = section.color + '33'; // 20% opacity
    ctx.lineWidth = 1;
    ctx.stroke();

    // Section header dot + title
    const headerY = y + 28;
    roundRect(ctx, sectionX + 16, headerY - 7, 14, 14, 4);
    ctx.fillStyle = section.color;
    ctx.fill();
    ctx.font = 'bold 16px Fraunces, Georgia, serif';
    ctx.fillStyle = section.color;
    ctx.fillText(`${section.title} (${section.values.length})`, sectionX + 38, headerY + 5);

    // Value rows
    let ry = y + SECTION_HEADER_H;
    section.values.forEach((val, i) => {
      const rowY = ry + i * ROW_H;
      // Rank number
      ctx.fillStyle = section.color + '99';
      ctx.font = 'bold 13px "IBM Plex Sans", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${i + 1}.`, sectionX + 36, rowY + 14);
      ctx.textAlign = 'left';
      // Value name
      ctx.fillStyle = section.color;
      ctx.font = '500 14px "IBM Plex Sans", system-ui, sans-serif';
      ctx.fillText(val.name, sectionX + 46, rowY + 14);
      // Description
      const nameWidth = ctx.measureText(val.name).width;
      ctx.fillStyle = COLORS.ink + '55';
      ctx.font = '12px "IBM Plex Sans", system-ui, sans-serif';
      const descX = sectionX + 46 + nameWidth + 10;
      const maxDescW = sectionX + sectionW - descX - 16;
      const desc = truncateText(ctx, val.description, maxDescW);
      ctx.fillText(desc, descX, rowY + 14);
    });

    y += sh + SECTION_GAP;
  }

  // Footer
  ctx.fillStyle = COLORS.ink + '33';
  ctx.font = '12px "IBM Plex Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Created with ValueSortify', W / 2, H - PAD + 4);
  ctx.textAlign = 'left';

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function truncateText(ctx, text, maxWidth) {
  if (maxWidth <= 0) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}
