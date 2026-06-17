# valueSortify — CLAUDE.md

Personal values card sort app (83 values, three phases: Sort → Rank → Results). Deployed via pezant-tools (see privateContext/infrastructure.md).

## Stack
- React 18 + Vite 6, Tailwind CSS 3, Framer Motion 11
- State: localStorage (`valuesortify-session` key)
- DOMPurify for XSS sanitization on any user-facing string rendering
- Export: jsPDF + autoTable (PDF), native Blob (CSV/JSON)
- Testing: Vitest 2
- Linting: ESLint 9 flat config, PropTypes on all components

## Commands
```bash
npm run dev       # local dev server
npm run build     # production build → dist/
npm run test      # vitest run
npm run lint      # eslint src/
```

## CI
GitHub Actions (`.github/workflows/ci.yml`) — Node 22, npm ci, lint, test, build. Runs on push/PR to main.

## Deploy
`npm run build` produces `dist/`. Deploy = copy `dist/` to pezant-tools (see privateContext/infrastructure.md). No build step on the server; pezant-tools serves static assets and injects SEO tags, nav bar, and Wouter routing patches.

## Component Map
- `App.jsx` — Shell: header, phase instructions, progress bar
- `SortingPhase.jsx` — Phase 1 controller, view mode toggle (single-card / grid)
  - `SingleCardView.jsx` — One card at a time, Q/W/E hotkeys (default view)
  - `GridView.jsx` — Grid of all cards with category filter buttons
  - `ValueCard.jsx` — Individual card with sort buttons
- `RankingPhase.jsx` — Phase 2 drag-to-reorder within categories; keyboard reorder supported
  - `DraggableCard.jsx` — Reorderable card with drag handle
- `ResultsPhase.jsx` — Phase 3 display + export (PDF / CSV / JSON)
- `hooks/useLocalStorage.js` — Persistence hook

## Key Behaviors
- **Q/W/E hotkeys:** In SingleCardView, Q=Important, W=Unsure, E=Not Important. Documented in UI.
- **Category counter buttons in GridView:** Disabled in card mode (no-op in that context). In grid mode they filter visible cards.
- **Cross-category card movement:** Colored dot buttons in RankingPhase move cards between categories.
- **Focus visible rings:** All interactive elements have explicit `:focus-visible` outlines (added April 2026 — no browser-default reliance).
- **Reset/Start Over:** Available in all phases with confirmation dialog. Clears localStorage.

## Gotchas
- **Category counter buttons in card mode:** `SortingPhase` toggles view mode. Counter buttons are rendered in both modes but must be `disabled` in card mode — clicking them does nothing (handler early-returns). Keyboard and screen reader users must not be able to reach non-interactive buttons. PR #139.
- **DOMPurify:** Added after PostCSS/XSS audit (April 2026). Any new feature that renders user-supplied or externally sourced strings must sanitize through DOMPurify.
- **localStorage key:** `valuesortify-session`. If the schema changes, bump the key or add a migration in `useLocalStorage.js` — old sessions will break silently otherwise.
- **Session normalization:** `normalizeState()` in `useLocalStorage.js` coerces stored session data on load — missing category arrays default to `[]`, non-integer phase defaults to `1`, non-object values fall back to `DEFAULT_STATE`. When adding new schema fields, update `normalizeState()` to handle them; otherwise new fields will be silently dropped on load.
