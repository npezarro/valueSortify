import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from '../hooks/useFocusTrap';

function TestModal({ onClose }) {
  const ref = useFocusTrap(onClose);
  return (
    <div ref={ref} role="dialog" aria-modal="true">
      <button data-testid="first">First</button>
      <button data-testid="second">Second</button>
      <button data-testid="third">Third</button>
    </div>
  );
}

function SingleButtonModal({ onClose }) {
  const ref = useFocusTrap(onClose);
  return (
    <div ref={ref} role="dialog" aria-modal="true">
      <button data-testid="only">Only</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TestModal onClose={onClose} />);
    screen.getByTestId('first').focus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('wraps focus from last to first on Tab', () => {
    render(<TestModal onClose={vi.fn()} />);
    const first = screen.getByTestId('first');
    const third = screen.getByTestId('third');
    third.focus();
    fireEvent.keyDown(third, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  it('wraps focus from first to last on Shift+Tab', () => {
    render(<TestModal onClose={vi.fn()} />);
    const first = screen.getByTestId('first');
    const third = screen.getByTestId('third');
    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(third);
  });

  it('does not wrap focus between middle elements', () => {
    render(<TestModal onClose={vi.fn()} />);
    const first = screen.getByTestId('first');
    const second = screen.getByTestId('second');
    second.focus();
    fireEvent.keyDown(second, { key: 'Tab' });
    // Should not move focus (browser handles normal Tab)
    expect(document.activeElement).toBe(second);
  });

  it('wraps focus on single button with Tab', () => {
    render(<SingleButtonModal onClose={vi.fn()} />);
    const only = screen.getByTestId('only');
    only.focus();
    fireEvent.keyDown(only, { key: 'Tab' });
    expect(document.activeElement).toBe(only);
  });

  it('restores focus to previously focused element on unmount', () => {
    const outer = document.createElement('button');
    outer.textContent = 'Outside';
    document.body.appendChild(outer);
    outer.focus();
    expect(document.activeElement).toBe(outer);

    const { unmount } = render(<TestModal onClose={vi.fn()} />);
    unmount();
    expect(document.activeElement).toBe(outer);

    document.body.removeChild(outer);
  });

  it('skips disabled buttons in focus cycle', () => {
    function ModalWithDisabled({ onClose }) {
      const ref = useFocusTrap(onClose);
      return (
        <div ref={ref} role="dialog">
          <button data-testid="a">A</button>
          <button data-testid="b" disabled>B</button>
          <button data-testid="c">C</button>
        </div>
      );
    }
    render(<ModalWithDisabled onClose={vi.fn()} />);
    const a = screen.getByTestId('a');
    const c = screen.getByTestId('c');
    c.focus();
    fireEvent.keyDown(c, { key: 'Tab' });
    expect(document.activeElement).toBe(a);
  });
});
