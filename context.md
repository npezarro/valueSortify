# context.md
Last Updated: 2026-03-10 — Added ESLint, PropTypes, and scaffold cleanup

## Current State

- **What works**: All three phases functional — sorting, ranking (drag reorder), results with PDF/CSV/JSON export
- **What's deployed**: Built assets copied to `/var/www/pezant-tools/Example Projects/ValueSortify/` and served via pezant-tools PM2 process
- **Live URL**: https://pezant.ca/tools/ValueSortify/
- **Key feature**: Single-card view (default) with Q/W/E hotkeys for fast sorting, grid view toggle available

## Architecture

- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS 3
- **Animation**: Framer Motion 11
- **State**: localStorage (`valuesortify-session` key)
- **Data**: 83 personal values from established card sort methodology
- **Export**: jsPDF + autoTable for PDF, native Blob for CSV/JSON

### Deploy Contract

Build produces `dist/` which must be copied to `/var/www/pezant-tools/Example Projects/ValueSortify/`. The pezant-tools server injects SEO tags, nav bar, and Wouter routing patches. A GitHub Action could automate this but manual copy works for now.

### Component Structure

- `App.jsx` — Shell with header, phase instructions, progress bar
- `SortingPhase.jsx` — Phase 1 controller with view mode toggle
  - `SingleCardView.jsx` — One card at a time with Q/W/E hotkeys (default)
  - `GridView.jsx` — Classic grid of all cards with category filters
  - `ValueCard.jsx` — Individual value card with sort buttons
- `RankingPhase.jsx` — Phase 2 drag-to-reorder within categories
  - `DraggableCard.jsx` — Reorderable card with drag handle
- `ResultsPhase.jsx` — Phase 3 results display + export
- `hooks/useLocalStorage.js` — State persistence hook
- `values.js` — 83 personal values data

## Linting

- **ESLint 9** with flat config (`eslint.config.js`) — React, React Hooks, React Refresh plugins
- **PropTypes** on all components (prop-types package)
- `npm run lint` / `npm run lint:fix` scripts available
- Currently passing with zero warnings

## Open Work

- [ ] CI/CD: GitHub Action to build and deploy to pezant-tools on push
- [ ] Drag-and-drop in Phase 1 grid view (deferred — single-card view solves the UX better)

## Environment Notes

- **Deploy target**: `/var/www/pezant-tools/Example Projects/ValueSortify/`
- **PM2 process**: `pezant-tools` on port 3003 (serves the app)
- **Build command**: `npm run build` in this repo

## Active Branch

`agent/lint-types`
