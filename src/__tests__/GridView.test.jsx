import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
