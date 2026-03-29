import { describe, it, expect, vi } from 'vitest';
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
      Item: forwardRef(function RI({ value: _v, dragListener: _dl, dragControls: _dc, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
    },
    useDragControls: () => ({ start: () => {} }),
  };
});

import { RankingPhase } from '../components/RankingPhase';

const makeValue = (id, name) => ({ id, name, description: `to do ${name.toLowerCase()}` });

const defaultState = {
  veryImportant: [makeValue(1, 'COURAGE'), makeValue(2, 'LOVE')],
  important: [makeValue(3, 'WISDOM')],
  notImportant: [makeValue(4, 'FAME')],
};

describe('RankingPhase', () => {
  it('renders all three category group headings', () => {
    render(<RankingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByText('Very Important')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Not Important')).toBeInTheDocument();
  });

  it('renders values within their groups', () => {
    render(<RankingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByText('COURAGE')).toBeInTheDocument();
    expect(screen.getByText('LOVE')).toBeInTheDocument();
    expect(screen.getByText('WISDOM')).toBeInTheDocument();
    expect(screen.getByText('FAME')).toBeInTheDocument();
  });

  it('shows group count badges', () => {
    render(<RankingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides empty groups', () => {
    const state = { ...defaultState, notImportant: [] };
    render(<RankingPhase state={state} save={vi.fn()} reset={vi.fn()} />);
    // Only "Very Important" and "Important" headings should exist (in RankingGroup)
    // "Not Important" heading should not render
    const headings = screen.queryAllByText('Not Important');
    expect(headings).toHaveLength(0);
  });

  it('calls save with phase 1 on Back to Sorting click', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(<RankingPhase state={defaultState} save={save} reset={vi.fn()} />);
    await user.click(screen.getByText('Back to Sorting'));
    expect(save).toHaveBeenCalledWith({ phase: 1 });
  });

  it('calls save with phase 3 on View Results click', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(<RankingPhase state={defaultState} save={save} reset={vi.fn()} />);
    await user.click(screen.getByText('View Results'));
    expect(save).toHaveBeenCalledWith({ phase: 3 });
  });

  it('shows reset confirmation modal', async () => {
    const user = userEvent.setup();
    render(<RankingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByText('Start Over'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/ranked 4 values/)).toBeInTheDocument();
  });

  it('calls reset on confirm', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<RankingPhase state={defaultState} save={vi.fn()} reset={reset} />);
    await user.click(screen.getByText('Start Over'));
    await user.click(screen.getByText('Reset'));
    expect(reset).toHaveBeenCalled();
  });

  it('closes modal on Cancel', async () => {
    const user = userEvent.setup();
    render(<RankingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByText('Start Over'));
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows drag instruction text', () => {
    render(<RankingPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getAllByText(/Drag to reorder/).length).toBeGreaterThan(0);
  });
});
