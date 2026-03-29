import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../components/ErrorBoundary';

function ThrowingChild() {
  throw new Error('Test error');
}

function GoodChild() {
  return <p>Working content</p>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Working content')).toBeDefined();
  });

  it('renders fallback UI when a child throws', () => {
    // Suppress console.error from React error boundary logging
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText(/Your progress is saved/)).toBeDefined();
    expect(screen.getByRole('button', { name: /Reload Page/ })).toBeDefined();
    spy.mockRestore();
  });

  it('calls window.location.reload when Reload Page is clicked', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: /Reload Page/ }));
    expect(reloadMock).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
