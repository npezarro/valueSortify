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
    useDragControls: () => ({ start: () => {} }),
  };
});

import { ResultsPhase } from '../components/ResultsPhase';

const makeValue = (id, name) => ({ id, name, description: `to do ${name.toLowerCase()}` });

const defaultState = {
  veryImportant: [makeValue(1, 'COURAGE'), makeValue(2, 'LOVE')],
  important: [makeValue(3, 'WISDOM')],
  notImportant: [makeValue(4, 'FAME')],
};

describe('ResultsPhase', () => {
  it('renders all three result group headings', () => {
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByText('Very Important Values')).toBeInTheDocument();
    expect(screen.getByText('Important Values')).toBeInTheDocument();
    expect(screen.getByText('Not Important Values')).toBeInTheDocument();
  });

  it('renders all values', () => {
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getAllByText('COURAGE')).toHaveLength(1);
    expect(screen.getAllByText('LOVE')).toHaveLength(1);
    expect(screen.getAllByText('WISDOM')).toHaveLength(1);
    expect(screen.getAllByText('FAME')).toHaveLength(1);
  });

  it('shows value counts per group', () => {
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('hides empty groups', () => {
    const state = { ...defaultState, notImportant: [] };
    render(<ResultsPhase state={state} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.queryByText('Not Important Values')).not.toBeInTheDocument();
  });

  it('calls save with phase 2 on Back to Ranking click', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(<ResultsPhase state={defaultState} save={save} reset={vi.fn()} />);
    await user.click(screen.getByText('Back to Ranking'));
    expect(save).toHaveBeenCalledWith({ phase: 2 });
  });

  it('opens and closes export dropdown', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByText('Export'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
  });

  it('sets aria-expanded on export trigger', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /Export/ });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows reset confirmation modal', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByText('Start Over'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/ranked 4 values/)).toBeInTheDocument();
  });

  it('calls reset on confirm', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={reset} />);
    await user.click(screen.getByText('Start Over'));
    await user.click(screen.getByText('Reset'));
    expect(reset).toHaveBeenCalled();
  });

  it('closes modal on Cancel', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByText('Start Over'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows numbered ranking in each group', () => {
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    const ones = screen.getAllByText('1.');
    expect(ones.length).toBeGreaterThanOrEqual(3); // one per group
  });
});
