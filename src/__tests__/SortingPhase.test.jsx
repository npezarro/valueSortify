import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { forwardRef } from 'react';

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
    setItem: vi.fn((key, val) => { store[key] = val; }),
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { SortingPhase } from '../components/SortingPhase';
import { ALL_VALUES } from '../values';

const makeValue = (id, name) => ({ id, name, description: `to do ${name.toLowerCase()}` });

const defaultState = {
  phase: 1,
  veryImportant: [makeValue(1, 'COURAGE')],
  important: [makeValue(2, 'WISDOM')],
  notImportant: [],
};

describe('SortingPhase', () => {
  beforeEach(() => { localStorageMock.clear(); });

  it('renders category counters', () => {
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByLabelText('Very Important: 1 values')).toBeInTheDocument();
    expect(screen.getByLabelText('Important: 1 values')).toBeInTheDocument();
    expect(screen.getByLabelText('Not Important: 0 values')).toBeInTheDocument();
  });

  it('shows view toggle button', () => {
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByLabelText('Switch to grid view')).toBeInTheDocument();
  });

  it('toggles to grid view on click', async () => {
    const user = userEvent.setup();
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByLabelText('Switch to grid view'));
    expect(screen.getByLabelText('Switch to card view')).toBeInTheDocument();
  });

  it('persists view mode to localStorage', async () => {
    const user = userEvent.setup();
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByLabelText('Switch to grid view'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('vs-view-mode', 'grid');
  });

  it('disables proceed button when values remain unsorted', () => {
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByText('Proceed to Ranking').closest('button')).toBeDisabled();
  });

  it('shows Start Over when values are sorted', () => {
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByText('Start Over')).toBeInTheDocument();
  });

  it('hides Start Over when nothing is sorted', () => {
    const emptyState = { phase: 1, veryImportant: [], important: [], notImportant: [] };
    render(<SortingPhase state={emptyState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.queryByText('Start Over')).not.toBeInTheDocument();
  });

  it('shows reset confirmation modal', async () => {
    const user = userEvent.setup();
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByText('Start Over'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/categorized 2 value/)).toBeInTheDocument();
  });

  it('calls reset when confirmed', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={reset} />);
    await user.click(screen.getByText('Start Over'));
    await user.click(screen.getByText('Reset'));
    expect(reset).toHaveBeenCalled();
  });

  it('closes modal on Cancel', async () => {
    const user = userEvent.setup();
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByText('Start Over'));
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders Proceed to Ranking button', () => {
    render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByText('Proceed to Ranking')).toBeInTheDocument();
  });

  describe('sorting completion announcement', () => {
    it('announces when all values are categorized', () => {
      const partialState = {
        phase: 1,
        veryImportant: ALL_VALUES.slice(0, 40),
        important: ALL_VALUES.slice(40, 80),
        notImportant: ALL_VALUES.slice(80, 82), // 1 remaining
      };
      const { rerender } = render(
        <SortingPhase state={partialState} save={vi.fn()} reset={vi.fn()} />
      );

      // No announcement yet
      expect(screen.queryByText('All values categorized. You can now proceed to ranking.')).not.toBeInTheDocument();

      // Complete the sorting
      const completeState = {
        phase: 1,
        veryImportant: ALL_VALUES.slice(0, 40),
        important: ALL_VALUES.slice(40, 80),
        notImportant: ALL_VALUES.slice(80),
      };
      rerender(
        <SortingPhase state={completeState} save={vi.fn()} reset={vi.fn()} />
      );

      expect(screen.getByText('All values categorized. You can now proceed to ranking.')).toBeInTheDocument();
    });

    it('does not announce when initially loaded with all sorted', () => {
      const completeState = {
        phase: 1,
        veryImportant: ALL_VALUES.slice(0, 40),
        important: ALL_VALUES.slice(40, 80),
        notImportant: ALL_VALUES.slice(80),
      };
      render(
        <SortingPhase state={completeState} save={vi.fn()} reset={vi.fn()} />
      );

      // Should not announce on initial load — only on transition
      expect(screen.queryByText('All values categorized. You can now proceed to ranking.')).not.toBeInTheDocument();
    });
  });

  describe('completion celebration', () => {
    const partialState = {
      phase: 1,
      veryImportant: ALL_VALUES.slice(0, 40),
      important: ALL_VALUES.slice(40, 80),
      notImportant: ALL_VALUES.slice(80, 82), // 1 remaining
    };
    const completeState = {
      phase: 1,
      veryImportant: ALL_VALUES.slice(0, 40),
      important: ALL_VALUES.slice(40, 80),
      notImportant: ALL_VALUES.slice(80),
    };

    it('shows celebration banner on completion transition', () => {
      const { rerender } = render(
        <SortingPhase state={partialState} save={vi.fn()} reset={vi.fn()} />
      );
      expect(screen.queryByText('Sorting complete!')).not.toBeInTheDocument();

      rerender(
        <SortingPhase state={completeState} save={vi.fn()} reset={vi.fn()} />
      );
      expect(screen.getByText('Sorting complete!')).toBeInTheDocument();
      expect(screen.getByText('Ready to rank your top priorities')).toBeInTheDocument();
    });

    it('does not show celebration on initial load with all sorted', () => {
      render(
        <SortingPhase state={completeState} save={vi.fn()} reset={vi.fn()} />
      );
      expect(screen.queryByText('Sorting complete!')).not.toBeInTheDocument();
    });

    it('dismisses celebration when dismiss button clicked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SortingPhase state={partialState} save={vi.fn()} reset={vi.fn()} />
      );
      rerender(
        <SortingPhase state={completeState} save={vi.fn()} reset={vi.fn()} />
      );
      expect(screen.getByText('Sorting complete!')).toBeInTheDocument();

      await user.click(screen.getByLabelText('Dismiss'));
      expect(screen.queryByText('Sorting complete!')).not.toBeInTheDocument();
    });

    it('celebration has status role for assistive tech', () => {
      const { rerender } = render(
        <SortingPhase state={partialState} save={vi.fn()} reset={vi.fn()} />
      );
      rerender(
        <SortingPhase state={completeState} save={vi.fn()} reset={vi.fn()} />
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('clears celebration when value is unsorted', () => {
      const { rerender } = render(
        <SortingPhase state={partialState} save={vi.fn()} reset={vi.fn()} />
      );
      rerender(
        <SortingPhase state={completeState} save={vi.fn()} reset={vi.fn()} />
      );
      expect(screen.getByText('Sorting complete!')).toBeInTheDocument();

      // Unsort one value
      rerender(
        <SortingPhase state={partialState} save={vi.fn()} reset={vi.fn()} />
      );
      expect(screen.queryByText('Sorting complete!')).not.toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    const getDistributionBar = () =>
      screen.getByRole('progressbar', { name: /values sorted/ });
    const queryDistributionBar = () =>
      screen.queryByRole('progressbar', { name: /values sorted/ });

    it('shows progress bar when values are sorted', () => {
      render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
      expect(getDistributionBar()).toBeInTheDocument();
    });

    it('hides progress bar when nothing is sorted', () => {
      const emptyState = { phase: 1, veryImportant: [], important: [], notImportant: [] };
      render(<SortingPhase state={emptyState} save={vi.fn()} reset={vi.fn()} />);
      expect(queryDistributionBar()).not.toBeInTheDocument();
    });

    it('displays correct aria values', () => {
      render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
      const bar = getDistributionBar();
      expect(bar).toHaveAttribute('aria-valuenow', '2');
      expect(bar).toHaveAttribute('aria-valuemax', String(ALL_VALUES.length));
      expect(bar).toHaveAttribute('aria-label', `2 of ${ALL_VALUES.length} values sorted`);
    });

    it('renders segments for non-empty categories only', () => {
      // defaultState: veryImportant=1, important=1, notImportant=0
      render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
      const bar = getDistributionBar();
      const segments = bar.querySelectorAll('div');
      // Only 2 segments — notImportant is empty so it's not rendered
      expect(segments).toHaveLength(2);
    });

    it('renders all three segments when all categories have values', () => {
      const fullState = {
        phase: 1,
        veryImportant: [makeValue(1, 'A')],
        important: [makeValue(2, 'B')],
        notImportant: [makeValue(3, 'C')],
      };
      render(<SortingPhase state={fullState} save={vi.fn()} reset={vi.fn()} />);
      const bar = getDistributionBar();
      const segments = bar.querySelectorAll('div');
      expect(segments).toHaveLength(3);
    });

    it('segment widths reflect category proportions', () => {
      const state = {
        phase: 1,
        veryImportant: ALL_VALUES.slice(0, 40),
        important: ALL_VALUES.slice(40, 60),
        notImportant: ALL_VALUES.slice(60, 70),
      };
      render(<SortingPhase state={state} save={vi.fn()} reset={vi.fn()} />);
      const bar = getDistributionBar();
      const segments = bar.querySelectorAll('div');
      const total = ALL_VALUES.length;
      expect(segments[0].style.width).toBe(`${(40 / total) * 100}%`);
      expect(segments[1].style.width).toBe(`${(20 / total) * 100}%`);
      expect(segments[2].style.width).toBe(`${(10 / total) * 100}%`);
    });
  });

  describe('search in grid view', () => {
    it('shows search input in grid view', async () => {
      const user = userEvent.setup();
      render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
      await user.click(screen.getByLabelText('Switch to grid view'));
      expect(screen.getByLabelText('Search values by name or description')).toBeInTheDocument();
    });

    it('does not show search input in card view', () => {
      render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
      expect(screen.queryByLabelText('Search values by name or description')).not.toBeInTheDocument();
    });

    it('shows clear button when search has text', async () => {
      const user = userEvent.setup();
      render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
      await user.click(screen.getByLabelText('Switch to grid view'));
      await user.type(screen.getByLabelText('Search values by name or description'), 'test');
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('clears search when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
      await user.click(screen.getByLabelText('Switch to grid view'));
      const input = screen.getByLabelText('Search values by name or description');
      await user.type(input, 'test');
      await user.click(screen.getByLabelText('Clear search'));
      expect(input).toHaveValue('');
    });

    it('clears search when switching to card view', async () => {
      const user = userEvent.setup();
      render(<SortingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
      await user.click(screen.getByLabelText('Switch to grid view'));
      await user.type(screen.getByLabelText('Search values by name or description'), 'test');
      await user.click(screen.getByLabelText('Switch to card view'));
      await user.click(screen.getByLabelText('Switch to grid view'));
      expect(screen.getByLabelText('Search values by name or description')).toHaveValue('');
    });
  });
});
