import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { forwardRef } from 'react';

vi.mock('framer-motion', () => {
  const MotionDiv = forwardRef(function MotionDiv(props, ref) {
    const { initial, animate, exit, transition, whileDrag, layout, ...rest } = props;
    return React.createElement('div', { ...rest, ref });
  });
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }) => children,
    Reorder: {
      Group: forwardRef(function RG({ values, onReorder, axis, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
      Item: forwardRef(function RI({ value, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
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
});
