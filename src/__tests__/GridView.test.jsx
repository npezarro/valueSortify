import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

import { GridView } from '../components/GridView';

const makeValue = (id, name) => ({ id, name, description: `to do ${name.toLowerCase()}` });

const categories = [
  { key: 'veryImportant', label: 'Very Important', dotColor: 'bg-ember' },
  { key: 'important', label: 'Important', dotColor: 'bg-moss' },
  { key: 'notImportant', label: 'Not Important', dotColor: 'bg-sky' },
];

const defaultProps = {
  unsortedValues: [makeValue(1, 'COURAGE'), makeValue(2, 'HONESTY')],
  sortedValues: {
    veryImportant: [makeValue(3, 'LOVE')],
    important: [makeValue(4, 'WISDOM')],
    notImportant: [makeValue(5, 'FAME')],
  },
  categories,
  onSort: vi.fn(),
  onUnsort: vi.fn(),
};

describe('GridView', () => {
  it('renders unsorted values when filter is remaining', () => {
    render(<GridView {...defaultProps} filter="remaining" />);
    expect(screen.getByText('COURAGE')).toBeInTheDocument();
    expect(screen.getByText('HONESTY')).toBeInTheDocument();
    expect(screen.queryByText('LOVE')).not.toBeInTheDocument();
  });

  it('renders veryImportant values when filter matches', () => {
    render(<GridView {...defaultProps} filter="veryImportant" />);
    expect(screen.getByText('LOVE')).toBeInTheDocument();
    expect(screen.queryByText('COURAGE')).not.toBeInTheDocument();
  });

  it('renders important values when filter matches', () => {
    render(<GridView {...defaultProps} filter="important" />);
    expect(screen.getByText('WISDOM')).toBeInTheDocument();
  });

  it('renders notImportant values when filter matches', () => {
    render(<GridView {...defaultProps} filter="notImportant" />);
    expect(screen.getByText('FAME')).toBeInTheDocument();
  });

  it('shows sort buttons for unsorted values', () => {
    render(<GridView {...defaultProps} filter="remaining" />);
    // Each unsorted value gets 3 sort buttons
    expect(screen.getAllByRole('button', { name: /Very Important/ })).toHaveLength(2);
  });

  it('shows hint text for non-remaining filters with values', () => {
    render(<GridView {...defaultProps} filter="veryImportant" />);
    expect(screen.getByText(/Switch to/)).toBeInTheDocument();
  });

  it('does not show hint text for remaining filter', () => {
    render(<GridView {...defaultProps} filter="remaining" />);
    expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument();
  });

  it('has list role with accessible label', () => {
    render(<GridView {...defaultProps} filter="remaining" />);
    expect(screen.getByRole('list', { name: 'Values to sort' })).toBeInTheDocument();
  });

  it('renders list items', () => {
    render(<GridView {...defaultProps} filter="remaining" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  describe('search filtering', () => {
    it('filters by value name', () => {
      render(<GridView {...defaultProps} filter="remaining" searchQuery="cour" />);
      expect(screen.getByText('COURAGE')).toBeInTheDocument();
      expect(screen.queryByText('HONESTY')).not.toBeInTheDocument();
    });

    it('filters by description', () => {
      render(<GridView {...defaultProps} filter="remaining" searchQuery="honesty" />);
      expect(screen.getByText('HONESTY')).toBeInTheDocument();
      expect(screen.queryByText('COURAGE')).not.toBeInTheDocument();
    });

    it('is case-insensitive', () => {
      render(<GridView {...defaultProps} filter="remaining" searchQuery="COURAGE" />);
      expect(screen.getByText('COURAGE')).toBeInTheDocument();
    });

    it('shows empty state when no values match', () => {
      render(<GridView {...defaultProps} filter="remaining" searchQuery="zzzzz" />);
      expect(screen.getByText(/No values match/)).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('shows all values when searchQuery is empty', () => {
      render(<GridView {...defaultProps} filter="remaining" searchQuery="" />);
      expect(screen.getByText('COURAGE')).toBeInTheDocument();
      expect(screen.getByText('HONESTY')).toBeInTheDocument();
    });

    it('filters sorted category values too', () => {
      render(<GridView {...defaultProps} filter="veryImportant" searchQuery="lov" />);
      expect(screen.getByText('LOVE')).toBeInTheDocument();
    });

    it('shows empty state for sorted category with no match', () => {
      render(<GridView {...defaultProps} filter="veryImportant" searchQuery="zzz" />);
      expect(screen.getByText(/No values match/)).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    const threeValues = {
      ...defaultProps,
      unsortedValues: [makeValue(1, 'COURAGE'), makeValue(2, 'HONESTY'), makeValue(3, 'LOVE')],
    };

    beforeEach(() => {
      threeValues.onSort = vi.fn();
      threeValues.onUnsort = vi.fn();
    });

    function getGrid() {
      return screen.getByRole('list', { name: 'Values to sort' });
    }

    it('shows keyboard hint for unsorted values', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      expect(screen.getByText(/arrow keys/i)).toBeInTheDocument();
    });

    it('does not show keyboard hint for sorted filter', () => {
      render(<GridView {...threeValues} filter="veryImportant" />);
      expect(screen.queryByText(/arrow keys/i)).not.toBeInTheDocument();
    });

    it('focuses first card on ArrowRight when no card focused', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      fireEvent.keyDown(getGrid(), { key: 'ArrowRight' });
      const card = screen.getByText('COURAGE').closest('[data-value-id]');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('moves focus right with ArrowRight', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // focus index 0
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // focus index 1
      const card = screen.getByText('HONESTY').closest('[data-value-id]');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('moves focus left with ArrowLeft', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 0
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 1
      fireEvent.keyDown(grid, { key: 'ArrowLeft' });  // 0
      const card = screen.getByText('COURAGE').closest('[data-value-id]');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('does not move past first card with ArrowLeft', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 0
      fireEvent.keyDown(grid, { key: 'ArrowLeft' });  // still 0
      const card = screen.getByText('COURAGE').closest('[data-value-id]');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('does not move past last card with ArrowRight', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 0
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 1
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 2
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // still 2
      const card = screen.getByText('LOVE').closest('[data-value-id]');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('jumps to first card on Home', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 0
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 1
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // 2
      fireEvent.keyDown(grid, { key: 'Home' });
      const card = screen.getByText('COURAGE').closest('[data-value-id]');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('jumps to last card on End', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'End' });
      const card = screen.getByText('LOVE').closest('[data-value-id]');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('sorts focused card as veryImportant with Q key', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // focus COURAGE (id=1)
      fireEvent.keyDown(grid, { key: 'q' });
      expect(threeValues.onSort).toHaveBeenCalledWith(1, 'veryImportant');
    });

    it('sorts focused card as important with W key', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // focus COURAGE (id=1)
      fireEvent.keyDown(grid, { key: 'w' });
      expect(threeValues.onSort).toHaveBeenCalledWith(1, 'important');
    });

    it('sorts focused card as notImportant with E key', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // focus COURAGE (id=1)
      fireEvent.keyDown(grid, { key: 'e' });
      expect(threeValues.onSort).toHaveBeenCalledWith(1, 'notImportant');
    });

    it('does not sort with Q/W/E when no card is focused', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      fireEvent.keyDown(getGrid(), { key: 'q' });
      expect(threeValues.onSort).not.toHaveBeenCalled();
    });

    it('does not sort with Q/W/E on non-remaining filter', () => {
      render(<GridView {...threeValues} filter="veryImportant" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // focus first
      fireEvent.keyDown(grid, { key: 'q' });
      expect(threeValues.onSort).not.toHaveBeenCalled();
    });

    it('applies roving tabindex (only focused card has tabindex 0)', () => {
      render(<GridView {...threeValues} filter="remaining" />);
      const grid = getGrid();
      fireEvent.keyDown(grid, { key: 'ArrowRight' }); // focus first
      const cards = screen.getAllByRole('listitem').map(li => li.querySelector('[data-value-id]'));
      expect(cards[0]).toHaveAttribute('tabindex', '0');
      expect(cards[1]).toHaveAttribute('tabindex', '-1');
      expect(cards[2]).toHaveAttribute('tabindex', '-1');
    });
  });
});
