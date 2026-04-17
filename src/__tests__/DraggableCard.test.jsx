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

import { DraggableCard } from '../components/DraggableCard';

const mockValue = { id: 1, name: 'COURAGE', description: 'to act bravely in the face of fear' };

const otherCategories = [
  { key: 'important', label: 'Important', color: 'bg-moss' },
  { key: 'notImportant', label: 'Not Important', color: 'bg-sky' },
];

describe('DraggableCard', () => {
  it('renders value name and description', () => {
    render(<DraggableCard value={mockValue} />);
    expect(screen.getByText('COURAGE')).toBeInTheDocument();
    expect(screen.getByText('to act bravely in the face of fear')).toBeInTheDocument();
  });

  it('renders color dot when provided', () => {
    const { container } = render(<DraggableCard value={mockValue} colorDot="bg-ember" />);
    expect(container.querySelector('.bg-ember')).toBeInTheDocument();
  });

  it('renders move buttons when all move props are provided', () => {
    render(
      <DraggableCard
        value={mockValue}
        currentCategory="veryImportant"
        otherCategories={otherCategories}
        onMove={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Move COURAGE to Important')).toBeInTheDocument();
    expect(screen.getByLabelText('Move COURAGE to Not Important')).toBeInTheDocument();
  });

  it('does not render move buttons when move props are missing', () => {
    render(<DraggableCard value={mockValue} />);
    expect(screen.queryAllByLabelText(/Move COURAGE/)).toHaveLength(0);
  });

  it('calls onMove with correct args for first category', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(
      <DraggableCard
        value={mockValue}
        currentCategory="veryImportant"
        otherCategories={otherCategories}
        onMove={onMove}
      />
    );
    await user.click(screen.getByLabelText('Move COURAGE to Important'));
    expect(onMove).toHaveBeenCalledWith(1, 'veryImportant', 'important');
  });

  it('calls onMove with correct args for second category', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(
      <DraggableCard
        value={mockValue}
        currentCategory="veryImportant"
        otherCategories={otherCategories}
        onMove={onMove}
      />
    );
    await user.click(screen.getByLabelText('Move COURAGE to Not Important'));
    expect(onMove).toHaveBeenCalledWith(1, 'veryImportant', 'notImportant');
  });

  it('renders category initial on move buttons', () => {
    render(
      <DraggableCard
        value={mockValue}
        currentCategory="veryImportant"
        otherCategories={otherCategories}
        onMove={vi.fn()}
      />
    );
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  it('renders drag handle', () => {
    const { container } = render(<DraggableCard value={mockValue} />);
    expect(container.querySelector('.cursor-grab')).toBeInTheDocument();
  });

  describe('keyboard reorder', () => {
    it('shows position in aria-label when reorder props are provided', () => {
      render(
        <DraggableCard
          value={mockValue}
          onMoveUp={vi.fn()}
          onMoveDown={vi.fn()}
          position={0}
          total={3}
        />
      );
      expect(screen.getByLabelText('Reorder COURAGE, position 1 of 3. Use arrow keys to move')).toBeInTheDocument();
    });

    it('falls back to drag label without reorder props', () => {
      render(<DraggableCard value={mockValue} />);
      expect(screen.getByLabelText('Drag to reorder COURAGE')).toBeInTheDocument();
    });

    it('calls onMoveUp on ArrowUp keypress', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      render(
        <DraggableCard
          value={mockValue}
          onMoveUp={onMoveUp}
          onMoveDown={vi.fn()}
          position={1}
          total={3}
        />
      );
      const grip = screen.getByLabelText(/Reorder COURAGE/);
      grip.focus();
      await user.keyboard('{ArrowUp}');
      expect(onMoveUp).toHaveBeenCalledOnce();
    });

    it('calls onMoveDown on ArrowDown keypress', async () => {
      const user = userEvent.setup();
      const onMoveDown = vi.fn();
      render(
        <DraggableCard
          value={mockValue}
          onMoveUp={vi.fn()}
          onMoveDown={onMoveDown}
          position={0}
          total={3}
        />
      );
      const grip = screen.getByLabelText(/Reorder COURAGE/);
      grip.focus();
      await user.keyboard('{ArrowDown}');
      expect(onMoveDown).toHaveBeenCalledOnce();
    });

    it('does not call onMoveUp when at first position', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      render(
        <DraggableCard
          value={mockValue}
          onMoveUp={onMoveUp}
          onMoveDown={vi.fn()}
          position={0}
          total={3}
        />
      );
      const grip = screen.getByLabelText(/Reorder COURAGE/);
      grip.focus();
      await user.keyboard('{ArrowUp}');
      expect(onMoveUp).not.toHaveBeenCalled();
    });

    it('does not call onMoveDown when at last position', async () => {
      const user = userEvent.setup();
      const onMoveDown = vi.fn();
      render(
        <DraggableCard
          value={mockValue}
          onMoveUp={vi.fn()}
          onMoveDown={onMoveDown}
          position={2}
          total={3}
        />
      );
      const grip = screen.getByLabelText(/Reorder COURAGE/);
      grip.focus();
      await user.keyboard('{ArrowDown}');
      expect(onMoveDown).not.toHaveBeenCalled();
    });

    it('has sortable roledescription when reorder enabled', () => {
      render(
        <DraggableCard
          value={mockValue}
          onMoveUp={vi.fn()}
          onMoveDown={vi.fn()}
          position={0}
          total={2}
        />
      );
      const grip = screen.getByLabelText(/Reorder COURAGE/);
      expect(grip).toHaveAttribute('aria-roledescription', 'sortable');
    });

    it('does not reorder with single item', async () => {
      const onMoveUp = vi.fn();
      const onMoveDown = vi.fn();
      render(
        <DraggableCard
          value={mockValue}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          position={0}
          total={1}
        />
      );
      // With total=1, falls back to drag label (no keyboard reorder)
      expect(screen.getByLabelText('Drag to reorder COURAGE')).toBeInTheDocument();
    });
  });
});
