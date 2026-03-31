import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React, { forwardRef } from 'react';
import { axe } from 'jest-axe';

// Mock framer-motion (same pattern as other test files)
vi.mock('framer-motion', () => {
  const MotionDiv = forwardRef(function MotionDiv(props, ref) {
    const { initial: _i, animate: _a, exit: _e, transition: _t, whileDrag: _wd, layout: _l, dragListener: _dl, dragControls: _dc, ...rest } = props;
    return React.createElement('div', { ...rest, ref });
  });
  return {
    motion: { div: MotionDiv, span: MotionDiv, li: MotionDiv, button: MotionDiv },
    AnimatePresence: ({ children }) => children,
    Reorder: {
      Group: forwardRef(function RG({ values: _v, onReorder: _or, axis: _ax, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
      Item: forwardRef(function RI({ value: _v, dragListener: _dl, dragControls: _dc, layout: _l, initial: _i, animate: _a, exit: _e, whileDrag: _wd, transition: _t, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
    },
    useDragControls: () => ({ start: () => {} }),
  };
});

// Mock localStorage
const localStorageMock = { getItem: vi.fn(() => 'card'), setItem: vi.fn() };
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { ValueCard } from '../components/ValueCard';
import { DraggableCard } from '../components/DraggableCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GridView } from '../components/GridView';
import { SingleCardView } from '../components/SingleCardView';
import { SortingPhase } from '../components/SortingPhase';
import { RankingPhase } from '../components/RankingPhase';
import { ResultsPhase } from '../components/ResultsPhase';

const mockValue = { id: 1, name: 'COURAGE', description: 'to act bravely in the face of fear' };
const mockValue2 = { id: 2, name: 'HONESTY', description: 'to be honest and truthful' };
const mockValue3 = { id: 3, name: 'KINDNESS', description: 'to be kind and caring toward others' };

const mockCategories = [
  { key: 'veryImportant', label: 'Very Important', color: 'bg-ember', dotColor: 'bg-ember' },
  { key: 'important', label: 'Important', color: 'bg-moss', dotColor: 'bg-moss' },
  { key: 'notImportant', label: 'Not Important', color: 'bg-sky', dotColor: 'bg-sky' },
];

const mockState = {
  phase: 1,
  veryImportant: [mockValue],
  important: [mockValue2],
  notImportant: [mockValue3],
};

const emptyState = {
  phase: 1,
  veryImportant: [],
  important: [],
  notImportant: [],
};

describe('Accessibility (axe)', () => {
  describe('ValueCard', () => {
    it('has no a11y violations with minimal props', async () => {
      const { container } = render(<ValueCard value={mockValue} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations with sort buttons', async () => {
      const { container } = render(
        <ValueCard value={mockValue} showButtons onSort={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations with color dot', async () => {
      const { container } = render(
        <ValueCard value={mockValue} colorDot="bg-ember" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('DraggableCard', () => {
    it('has no a11y violations with basic props', async () => {
      const { container } = render(
        <div role="list">
          <DraggableCard value={mockValue} />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations with move controls', async () => {
      const otherCategories = [
        { key: 'important', label: 'Important', color: 'bg-moss' },
        { key: 'notImportant', label: 'Not Important', color: 'bg-sky' },
      ];
      const { container } = render(
        <div role="list">
          <DraggableCard
            value={mockValue}
            colorDot="bg-ember"
            currentCategory="veryImportant"
            otherCategories={otherCategories}
            onMove={() => {}}
          />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ErrorBoundary', () => {
    it('has no a11y violations when rendering children', async () => {
      const { container } = render(
        <ErrorBoundary>
          <p>Content loads fine</p>
        </ErrorBoundary>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations in error state', async () => {
      const ThrowError = () => { throw new Error('Test error'); };
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      spy.mockRestore();
    });
  });

  describe('GridView', () => {
    it('has no a11y violations with unsorted values', async () => {
      const { container } = render(
        <GridView
          unsortedValues={[mockValue, mockValue2]}
          sortedValues={emptyState}
          filter="remaining"
          categories={mockCategories}
          onSort={() => {}}
          onUnsort={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations with category filter', async () => {
      const { container } = render(
        <GridView
          unsortedValues={[]}
          sortedValues={mockState}
          filter="veryImportant"
          categories={mockCategories}
          onSort={() => {}}
          onUnsort={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations when empty', async () => {
      const { container } = render(
        <GridView
          unsortedValues={[]}
          sortedValues={emptyState}
          filter="remaining"
          categories={mockCategories}
          onSort={() => {}}
          onUnsort={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SingleCardView', () => {
    it('has no a11y violations with values to sort', async () => {
      const { container } = render(
        <SingleCardView
          unsortedValues={[mockValue, mockValue2]}
          onSort={() => {}}
          totalValues={3}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations when all sorted', async () => {
      const { container } = render(
        <SingleCardView
          unsortedValues={[]}
          onSort={() => {}}
          totalValues={3}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SortingPhase', () => {
    it('has no a11y violations in card view with unsorted values', async () => {
      const stateWithUnsorted = {
        ...emptyState,
        veryImportant: [mockValue],
      };
      const { container } = render(
        <SortingPhase state={stateWithUnsorted} save={() => {}} reset={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations when all values sorted', async () => {
      const { container } = render(
        <SortingPhase state={mockState} save={() => {}} reset={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('RankingPhase', () => {
    it('has no a11y violations with ranked values', async () => {
      const { container } = render(
        <RankingPhase state={mockState} save={() => {}} reset={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations with empty categories', async () => {
      const { container } = render(
        <RankingPhase state={emptyState} save={() => {}} reset={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ResultsPhase', () => {
    it('has no a11y violations with results', async () => {
      const { container } = render(
        <ResultsPhase state={mockState} save={() => {}} reset={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations with empty results', async () => {
      const { container } = render(
        <ResultsPhase state={emptyState} save={() => {}} reset={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
