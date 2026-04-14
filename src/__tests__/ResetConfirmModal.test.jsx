import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetConfirmModal } from '../components/ResetConfirmModal';

const defaultProps = {
  titleId: 'test-reset-title',
  message: 'This will clear 5 values.',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ResetConfirmModal', () => {
  it('renders title and message', () => {
    render(<ResetConfirmModal {...defaultProps} />);
    expect(screen.getByText('Start Over?')).toBeInTheDocument();
    expect(screen.getByText('This will clear 5 values.')).toBeInTheDocument();
  });

  it('has correct dialog role and aria attributes', () => {
    render(<ResetConfirmModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'test-reset-title');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ResetConfirmModal {...defaultProps} onCancel={onCancel} />);
    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onConfirm when Reset is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ResetConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    await user.click(screen.getByText('Reset'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('closes on Escape via focus trap', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ResetConfirmModal {...defaultProps} onCancel={onCancel} />);
    screen.getByText('Cancel').focus();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('traps Tab focus: Reset wraps to Cancel', () => {
    render(<ResetConfirmModal {...defaultProps} />);
    const cancel = screen.getByText('Cancel');
    const reset = screen.getByText('Reset');

    // Tab from Reset (last) wraps to Cancel (first)
    reset.focus();
    fireEvent.keyDown(reset, { key: 'Tab' });
    expect(document.activeElement).toBe(cancel);
  });

  it('traps Shift+Tab: Cancel wraps to Reset', () => {
    render(<ResetConfirmModal {...defaultProps} />);
    const cancel = screen.getByText('Cancel');
    const reset = screen.getByText('Reset');

    cancel.focus();
    fireEvent.keyDown(cancel, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(reset);
  });
});
