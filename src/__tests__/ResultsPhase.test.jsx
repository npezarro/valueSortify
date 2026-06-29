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

  it('shows a format description under each export option', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    expect(screen.getByText('Spreadsheet (Excel, Sheets)')).toBeInTheDocument();
    expect(screen.getByText('Formatted, printable document')).toBeInTheDocument();
    expect(screen.getByText('Shareable PNG snapshot')).toBeInTheDocument();
    expect(screen.getByText('Raw data for backup')).toBeInTheDocument();
  });

  it('includes the format description in each menu item accessible name', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    const csvItem = screen.getByRole('menuitem', { name: /Export as CSV/ });
    expect(csvItem).toHaveAccessibleName(/Spreadsheet/);
  });

  // ── Copy as text ──

  it('copies a plain-text summary to the clipboard on Copy as text click', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.click(screen.getByRole('menuitem', { name: /Copy as text/ }));
    expect(writeText).toHaveBeenCalledTimes(1);
    const text = writeText.mock.calls[0][0];
    expect(text).toContain('My Personal Values');
    expect(text).toContain('Very Important');
    expect(text).toContain('1. COURAGE');
    expect(text).toContain('WISDOM');
  });

  it('shows a confirmation after copying to clipboard', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.click(screen.getByRole('menuitem', { name: /Copy as text/ }));
    expect(await screen.findByText('Copied to clipboard!')).toBeInTheDocument();
  });

  it('shows an error when the clipboard write fails', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    });
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.click(screen.getByRole('menuitem', { name: /Copy as text/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not copy/);
    expect(screen.queryByText('Copied to clipboard!')).not.toBeInTheDocument();
  });

  // ── Export menu keyboard navigation (WCAG 2.1.1) ──

  it('focuses first menu item when export dropdown opens', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(document.activeElement).toHaveTextContent('Export as CSV');
  });

  it('ArrowDown moves focus to next menu item', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveTextContent('Export as PDF');
  });

  it('ArrowDown wraps from last to first menu item', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    // Navigate to last item (Copy as text is 5th, so 4 ArrowDown from CSV)
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(document.activeElement).toHaveTextContent('Copy as text');
    // Wrap around
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveTextContent('Export as CSV');
  });

  it('ArrowUp moves focus to previous menu item', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    // From first item, ArrowUp wraps to last
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toHaveTextContent('Copy as text');
  });

  it('Home key focuses first menu item', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(document.activeElement).toHaveTextContent('Export as Image');
    await user.keyboard('{Home}');
    expect(document.activeElement).toHaveTextContent('Export as CSV');
  });

  it('End key focuses last menu item', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.keyboard('{End}');
    expect(document.activeElement).toHaveTextContent('Copy as text');
  });

  it('Escape closes the export menu and returns focus to trigger', async () => {
    const user = userEvent.setup();
    render(<ResultsPhase state={defaultState} save={vi.fn()} reset={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /Export/ });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});
