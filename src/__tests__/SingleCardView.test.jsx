import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React, { forwardRef } from 'react';

vi.mock('framer-motion', () => {
  const MotionDiv = forwardRef(function MotionDiv(props, ref) {
    const { initial, animate, exit, transition, whileDrag, layout, ...rest } = props;
    return React.createElement('div', { ...rest, ref });
  });
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }) => children,
    useDragControls: () => ({ start: () => {} }),
  };
});

import { SingleCardView } from '../components/SingleCardView';

const makeValue = (id, name) => ({ id, name, description: `to do ${name.toLowerCase()}` });

describe('SingleCardView', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it('renders current card name and description', () => {
    const values = [makeValue(1, 'COURAGE'), makeValue(2, 'HONESTY')];
    render(<SingleCardView unsortedValues={values} onSort={vi.fn()} totalValues={5} />);
    expect(screen.getByText('COURAGE')).toBeInTheDocument();
    expect(screen.getByText('to do courage')).toBeInTheDocument();
  });

  it('shows all sorted message when no values remain', () => {
    render(<SingleCardView unsortedValues={[]} onSort={vi.fn()} totalValues={5} />);
    expect(screen.getByText('All values sorted!')).toBeInTheDocument();
  });

  it('shows remaining count', () => {
    const values = [makeValue(1, 'COURAGE'), makeValue(2, 'HONESTY')];
    render(<SingleCardView unsortedValues={values} onSort={vi.fn()} totalValues={5} />);
    expect(screen.getByText('2 remaining')).toBeInTheDocument();
  });

  it('renders progress bar with correct aria attributes', () => {
    const values = [makeValue(1, 'COURAGE')];
    render(<SingleCardView unsortedValues={values} onSort={vi.fn()} totalValues={5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '4');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
  });

  it('calls onSort via veryImportant button after animation delay', async () => {
    const onSort = vi.fn();
    render(<SingleCardView unsortedValues={[makeValue(1, 'COURAGE')]} onSort={onSort} totalValues={5} />);
    await act(async () => { screen.getByText('Very Important').closest('button').click(); });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(onSort).toHaveBeenCalledWith(1, 'veryImportant');
  });

  it('calls onSort via important button', async () => {
    const onSort = vi.fn();
    render(<SingleCardView unsortedValues={[makeValue(1, 'COURAGE')]} onSort={onSort} totalValues={5} />);
    await act(async () => { screen.getByText('Important').closest('button').click(); });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(onSort).toHaveBeenCalledWith(1, 'important');
  });

  it('calls onSort via not important button', async () => {
    const onSort = vi.fn();
    render(<SingleCardView unsortedValues={[makeValue(1, 'COURAGE')]} onSort={onSort} totalValues={5} />);
    await act(async () => { screen.getByText('Not Important').closest('button').click(); });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(onSort).toHaveBeenCalledWith(1, 'notImportant');
  });

  it('responds to Q keyboard shortcut', async () => {
    const onSort = vi.fn();
    render(<SingleCardView unsortedValues={[makeValue(1, 'COURAGE')]} onSort={onSort} totalValues={5} />);
    await act(async () => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' })); });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(onSort).toHaveBeenCalledWith(1, 'veryImportant');
  });

  it('responds to W keyboard shortcut', async () => {
    const onSort = vi.fn();
    render(<SingleCardView unsortedValues={[makeValue(1, 'COURAGE')]} onSort={onSort} totalValues={5} />);
    await act(async () => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' })); });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(onSort).toHaveBeenCalledWith(1, 'important');
  });

  it('responds to E keyboard shortcut', async () => {
    const onSort = vi.fn();
    render(<SingleCardView unsortedValues={[makeValue(1, 'COURAGE')]} onSort={onSort} totalValues={5} />);
    await act(async () => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' })); });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(onSort).toHaveBeenCalledWith(1, 'notImportant');
  });

  it('renders three sort buttons with keyboard hints', () => {
    render(<SingleCardView unsortedValues={[makeValue(1, 'COURAGE')]} onSort={vi.fn()} totalValues={5} />);
    expect(screen.getByText('Very Important')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Not Important')).toBeInTheDocument();
  });
});
