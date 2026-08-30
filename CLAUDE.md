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
- `ResultsPhase.jsx` — Phase 3 display + summary header + export (PDF / CSV / JSON)
- `hooks/useLocalStorage.js` — Persistence hook

## Key Behaviors
- **Q/W/E hotkeys:** In SingleCardView, Q=Important, W=Unsure, E=Not Important. Documented in UI.
- **Category counter buttons in GridView:** Disabled in card mode (no-op in that context). In grid mode they filter visible cards.
- **Cross-category card movement:** Colored dot buttons in RankingPhase move cards between categories.
- **Focus visible rings:** All interactive elements have explicit `:focus-visible` outlines (added April 2026 — no browser-default reliance).
- **Reset/Start Over:** Available in all phases with confirmation dialog. Clears localStorage.
- **Print layout (Ctrl+P) on Results:** `index.css` defines print-media rules and `print:hidden` utility classes used across `App.jsx`/`ResultsPhase.jsx` to hide screen-only chrome (header, phase instructions, progress bar, Back/Start Over/Export action row) when printing. `ResultsPhase` renders a print-only provenance line ("Personal Values Card Sort · Generated <date>") so a printed copy of the ranked hierarchy reads as an intentional handout. PR #152.

## Gotchas
- **Category counter buttons in card mode:** `SortingPhase` toggles view mode. Counter buttons are rendered in both modes but must be `disabled` in card mode — clicking them does nothing (handler early-returns). Keyboard and screen reader users must not be able to reach non-interactive buttons. PR #139.
- **DOMPurify:** Added after PostCSS/XSS audit (April 2026). Any new feature that renders user-supplied or externally sourced strings must sanitize through DOMPurify.
- **localStorage key:** `valuesortify-session`. If the schema changes, bump the key or add a migration in `useLocalStorage.js` — old sessions will break silently otherwise.
- **Session normalization:** `normalizeState()` in `useLocalStorage.js` coerces stored session data on load — missing category arrays default to `[]`, non-integer phase defaults to `1`, non-object values fall back to `DEFAULT_STATE`. When adding new schema fields, update `normalizeState()` to handle them; otherwise new fields will be silently dropped on load.
- **Export menu option order:** The `exportOptions` array in `ResultsPhase.jsx` (CSV, PDF, Image, JSON, Copy as text) is order-significant — `menuItemsRef` indices and keyboard navigation tests rely on it. Reordering breaks tests. Append new options at the END to keep existing indices stable; note that any "last item" / wrap-around keyboard-nav tests assert the final entry, so adding an option means updating those.
- **Empty results guard:** `ResultsPhase` branches on `totalRanked === 0`. When nothing is ranked (e.g. a restored/normalized session with empty category arrays, or navigating back to phase 3 with nothing sorted), it renders a "Nothing ranked yet" empty state with a "Start Sorting" button (`save({ phase: 1 })`) instead of the ranked-hierarchy intro, the (all-empty) result groups, and the Export menu. This prevents a broken-looking results screen and an Export that downloads empty files. Both paths keep the same heading; regression tests live under `describe('empty state ...')` in `ResultsPhase.test.jsx`.
- **Copy as text:** Uses `navigator.clipboard.writeText` (async) guarded by a `navigator.clipboard?.writeText` check; on failure it surfaces `exportError`, on success a transient `role="status"` "Copied to clipboard!" message that auto-clears after 2s. Plain-text builder is `buildPlainText(state)` in `lib/export.js` (markdown-style list, omits empty categories).
- **Results summary header:** When `totalRanked > 0`, `ResultsPhase` renders an at-a-glance summary callout ("Your top value" + total ranked count) above the intro paragraph and the ranked groups. `topValue = state.veryImportant[0] || state.important[0] || state.notImportant[0]`, so it falls back through the priority order and is always defined in the non-empty branch (a user who sorted only into Important/Not Important still gets a top value). It is NOT rendered in the empty-state branch. **Test gotcha:** the #1 value now appears TWICE in the DOM (summary callout + ranked list), so any test that counts occurrences of the top value with `getAllByText` must expect 2, not 1 (see the `renders all values` and `summary header` tests in `ResultsPhase.test.jsx`).

## Cross-Cutting Rules (added 2026-06-27)

Synced from `~/repos/agentGuidance/guidance/testing.md` for the testing/CI concerns that apply to this repo (Vitest suite in `src/__tests__/` + GitHub Actions CI). The Stack/CI/Commands sections above already note Vitest and Node 22 CI; these add the rules that protect the suite.

### Testing & CI (testing.md)

- **Pin Node.js to 22 in CI** (current LTS). Don't use `node-version: 'lts/*'` — it can shift unexpectedly. Node 20 reached EOL on 2026-04-30. (CI already pins 22; keep it.)
- **`package-lock.json` must be committed** for `npm ci` + `cache: npm` to work in GitHub Actions. If it lands in `.gitignore`, the cache step fails and `npm ci` refuses to run.
- **Test glob quoting on GitHub Actions:** Single-quoted globs like `'src/**/*.test.js'` do NOT expand on GHA (`globstar` is off by default). Use a flat glob or let Vitest find tests via its config (the current `npm run test` → `vitest run` relies on config discovery — keep it).
- **Mock at boundaries** (localStorage, DOM APIs, timers, jsPDF/export libs) — not the unit under test. Reset mocks between tests with `beforeEach(() => vi.clearAllMocks())`.
- **Write a regression test for every bug fix** — one that fails without the fix and passes with it. Co-locate new tests in `src/__tests__/` following the existing `*.test.js`/`*.test.jsx` convention.

## Cross-Cutting Rules — Deployment (added 2026-08-01)

Synced from `~/repos/agentGuidance/guidance/deployment.md`. This repo has a live deploy target (the `dist/` bundle published to pezant-tools — see the Deploy section above), but the timing and verification rules that protect that deploy were not recorded here. Testing/CI rules are already covered in the section above and are not repeated.

### Deploy & Verify (deployment.md)

- **Deploy after every change to a deployed app.** If you commit a change here, publish it in the same session — do not accumulate undeployed commits. Vite emits content-hashed asset filenames on every build, so a published `index.html` from an older build references chunk names that no longer exist and the app renders blank or half-dead. If you deliberately batch and skip the deploy, record the pending deploy in `context.md` so the next session knows.
- **Pre-deploy checklist:** changes committed and pushed via PR, `npm run build` succeeds, `npm run test` passes, `npm run lint` is clean, `package-lock.json` committed, and `context.md` updated with the deployment intent.
- **Verify the bytes, not the status code.** "It built clean" is not "it works," and a 200 only proves that *something* is at the URL — a CDN will serve a stale cached object of the right size while the status check passes. After publishing, fetch the deployed `index.html` cache-busted and assert it references the hashed filenames this build actually produced (compare against `dist/assets/`), then request one of those hashed assets and assert a *final* 200 — follow redirects, because a 301 to a path that 404s looks like success until you follow it.
- **The static host is CDN-fronted with a short edge cache, so a post-deploy `curl` can validate the OLD deploy** and report success. Check the cache-status response header (want a miss/bypass/expired, not a hit) or bypass the edge before believing any post-deploy check.
- **Exercise a real user path before declaring done.** Load the deployed app and complete a Sort → Rank → Results pass rather than only curling the document root: the HTML shell can return 200 while a stale or missing chunk kills every interaction. Never hand it to the user with "done, try it out" unverified.
- **If any post-deploy check fails, do not move on.** Diagnose and fix before calling the deploy complete, then update `context.md` with the final deployment status and anything observed.
