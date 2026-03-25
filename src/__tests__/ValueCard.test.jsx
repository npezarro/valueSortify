import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { forwardRef } from 'react';

vi.mock('framer-motion', () => {
  const MotionDiv = forwardRef(function MotionDiv(props, ref) {
    const { initial, animate, exit, transition, whileDrag, layout, dragListener, dragControls, ...rest } = props;
    return React.createElement('div', { ...rest, ref });
  });
  return {
    motion: { div: MotionDiv, span: MotionDiv, li: MotionDiv, button: MotionDiv },
    AnimatePresence: ({ children }) => children,
    Reorder: {
      Group: forwardRef(function RG({ values, onReorder, axis, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
      Item: forwardRef(function RI({ value, dragListener, dragControls, layout, initial, animate, exit, whileDrag, transition, ...rest }, ref) { return React.createElement('div', { ...rest, ref }); }),
    },
    useDragControls: () => ({ start: () => {} }),
  };
});

import { ValueCard } from '../components/ValueCard';

const mockValue = { id: 1, name: 'COURAGE', description: 'to act bravely in the face of fear' };

describe('ValueCard', () => {
  it('renders name and description', () => {
    render(<ValueCard value={mockValue} />);
    expect(screen.getByText('COURAGE')).toBeInTheDocument();
    expect(screen.getByText('to act bravely in the face of fear')).toBeInTheDocument();
  });

  it('hides sort buttons by default', () => {
    render(<ValueCard value={mockValue} />);
    expect(screen.queryByText('Very Important')).not.toBeInTheDocument();
  });

  it('shows sort buttons when showButtons is true', () => {
    render(<ValueCard value={mockValue} showButtons onSort={() => {}} />);
    expect(screen.getByText('Very Important')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Not Important')).toBeInTheDocument();
  });

  it('calls onSort with veryImportant when button clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<ValueCard value={mockValue} showButtons onSort={onSort} />);
    await user.click(screen.getByLabelText('Sort COURAGE as Very Important'));
    expect(onSort).toHaveBeenCalledWith(1, 'veryImportant');
  });

  it('calls onSort with important when button clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<ValueCard value={mockValue} showButtons onSort={onSort} />);
    await user.click(screen.getByLabelText('Sort COURAGE as Important'));
    expect(onSort).toHaveBeenCalledWith(1, 'important');
  });

  it('calls onSort with notImportant when button clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<ValueCard value={mockValue} showButtons onSort={onSort} />);
    await user.click(screen.getByLabelText('Sort COURAGE as Not Important'));
    expect(onSort).toHaveBeenCalledWith(1, 'notImportant');
  });

  it('renders color dot when provided', () => {
    const { container } = render(<ValueCard value={mockValue} colorDot="bg-ember" />);
    const dot = container.querySelector('.bg-ember');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render color dot when not provided', () => {
    const { container } = render(<ValueCard value={mockValue} />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });
});
