import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { forwardRef } from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const MotionDiv = forwardRef(function MotionDiv(props, ref) {
    const { initial: _i, animate: _a, exit: _e, transition: _t, whileDrag: _wd, layout: _l, ...rest } = props;
    return React.createElement('div', { ...rest, ref });
  });
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }) => children,
    Reorder: {
      Group: forwardRef(function RG({ values: _v, onReorder: _or, axis: _ax, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
      Item: forwardRef(function RI({ value: _v, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
    },
    useDragControls: () => ({ start: () => {} }),
  };
});

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = String(val); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: () => {
      store = {};
      localStorageMock.getItem.mockClear();
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();
    },
    _setRaw: (key, val) => { store[key] = val; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import App from '../App';
import { ALL_VALUES } from '../values';

describe('App', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // ── Header ──────────────────────────────────────────

  it('renders the app title', () => {
    // Mark onboarding seen to suppress tour
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.getByText('Personal Values Card Sort')).toBeInTheDocument();
  });

  it('shows phase 1 of 3 initially', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.getByText(/Phase 1 of 3/)).toBeInTheDocument();
  });

  // ── Progress tracking ───────────────────────────────

  it('displays sorted count as 0/total in phase 1', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.getByText(new RegExp(`0/${ALL_VALUES.length} sorted`))).toBeInTheDocument();
  });

  it('calculates sorted count from all three categories', () => {
    const saved = {
      phase: 1,
      veryImportant: [{ id: 1, name: 'A', description: 'a' }],
      important: [{ id: 2, name: 'B', description: 'b' }, { id: 3, name: 'C', description: 'c' }],
      notImportant: [{ id: 4, name: 'D', description: 'd' }],
    };
    localStorageMock._setRaw('valuesortify-session', JSON.stringify(saved));
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.getByText(new RegExp(`4/${ALL_VALUES.length} sorted`))).toBeInTheDocument();
  });

  // ── Phase rendering ─────────────────────────────────

  it('shows phase 1 instructions by default', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.getByText('Phase 1: Sort Your Values')).toBeInTheDocument();
  });

  it('renders phase 2 when state.phase is 2', () => {
    const saved = {
      phase: 2,
      veryImportant: [{ id: 1, name: 'A', description: 'a' }],
      important: [],
      notImportant: [],
    };
    localStorageMock._setRaw('valuesortify-session', JSON.stringify(saved));
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.getByText('Phase 2: Rank Within Categories')).toBeInTheDocument();
  });

  it('renders phase 3 when state.phase is 3', () => {
    const saved = {
      phase: 3,
      veryImportant: [{ id: 1, name: 'A', description: 'a' }],
      important: [{ id: 2, name: 'B', description: 'b' }],
      notImportant: [{ id: 3, name: 'C', description: 'c' }],
    };
    localStorageMock._setRaw('valuesortify-session', JSON.stringify(saved));
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.getByText('Phase 3: Your Results')).toBeInTheDocument();
  });

  // ── Progress bar ────────────────────────────────────

  it('renders a progress bar with correct aria attributes', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    // Phase 1 = 33.3%
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(1);
    const bar = progressBars[0];
    expect(bar).toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('progress bar shows ~33% for phase 1', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    const bar = screen.getAllByRole('progressbar')[0];
    const val = parseFloat(bar.getAttribute('aria-valuenow'));
    expect(val).toBeCloseTo(33.33, 0);
  });

  it('progress bar shows ~67% for phase 2', () => {
    localStorageMock._setRaw('valuesortify-session', JSON.stringify({
      phase: 2, veryImportant: [{ id: 1, name: 'A', description: 'a' }], important: [], notImportant: [],
    }));
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    const bar = screen.getAllByRole('progressbar')[0];
    const val = parseFloat(bar.getAttribute('aria-valuenow'));
    expect(val).toBeCloseTo(66.67, 0);
  });

  // ── Phase 1 color legend ────────────────────────────

  it('shows category color legend in phase 1', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.getByText(/Core values that define who you are/)).toBeInTheDocument();
    expect(screen.getByText(/Values that matter but aren't central/)).toBeInTheDocument();
    expect(screen.getByText(/Values that don't resonate with you/)).toBeInTheDocument();
  });

  it('does not show color legend in phase 2', () => {
    localStorageMock._setRaw('valuesortify-session', JSON.stringify({
      phase: 2, veryImportant: [{ id: 1, name: 'A', description: 'a' }], important: [], notImportant: [],
    }));
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.queryByText(/Core values that define who you are/)).not.toBeInTheDocument();
  });

  // ── Welcome tour ────────────────────────────────────

  it('shows welcome tour for first-time users in phase 1', () => {
    render(<App />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Value Sort')).toBeInTheDocument();
  });

  it('does not show welcome tour when onboarding was already seen', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not show welcome tour when values already sorted', () => {
    localStorageMock._setRaw('valuesortify-session', JSON.stringify({
      phase: 1,
      veryImportant: [{ id: 1, name: 'A', description: 'a' }],
      important: [],
      notImportant: [],
    }));
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not show welcome tour in phase 2', () => {
    localStorageMock._setRaw('valuesortify-session', JSON.stringify({
      phase: 2, veryImportant: [{ id: 1, name: 'A', description: 'a' }], important: [], notImportant: [],
    }));
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('dismisses welcome tour when clicking start button', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByText(/Let's Start/));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // ── aria-live region ────────────────────────────────

  it('wraps phase content in an aria-live region', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  // ── Skip-to-content link (WCAG 2.4.1) ────────────

  it('renders a skip-to-content link as the first focusable element', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    const skipLink = screen.getByText('Skip to content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.tagName).toBe('A');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('skip link target exists on main element', () => {
    localStorageMock._setRaw('vs-onboarding-seen', '1');
    render(<App />);
    const main = document.getElementById('main-content');
    expect(main).toBeInTheDocument();
    expect(main.tagName).toBe('MAIN');
    expect(main).toHaveAttribute('tabindex', '-1');
  });
});
