import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: () => { store = {}; localStorageMock.getItem.mockClear(); localStorageMock.setItem.mockClear(); },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { WelcomeTour } from '../components/WelcomeTour';

describe('WelcomeTour', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders the welcome dialog', () => {
    render(<WelcomeTour onDismiss={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Value Sort')).toBeInTheDocument();
  });

  it('displays all three phases', () => {
    render(<WelcomeTour onDismiss={() => {}} />);
    expect(screen.getByText('1. Sort')).toBeInTheDocument();
    expect(screen.getByText('2. Rank')).toBeInTheDocument();
    expect(screen.getByText('3. Results')).toBeInTheDocument();
  });

  it('displays phase descriptions', () => {
    render(<WelcomeTour onDismiss={() => {}} />);
    expect(screen.getByText(/Categorize 83 values/)).toBeInTheDocument();
    expect(screen.getByText(/Drag to reorder/)).toBeInTheDocument();
    expect(screen.getByText(/personal values hierarchy/)).toBeInTheDocument();
  });

  it('displays tips about view modes and keyboard shortcuts', () => {
    render(<WelcomeTour onDismiss={() => {}} />);
    expect(screen.getByText('Tips')).toBeInTheDocument();
    expect(screen.getByText(/Card view/)).toBeInTheDocument();
    expect(screen.getByText(/Grid view/)).toBeInTheDocument();
    // Keyboard shortcut keys
    const kbdElements = screen.getAllByText(/^[QWE]$/);
    expect(kbdElements).toHaveLength(3);
  });

  it('calls onDismiss and sets localStorage when "Let\'s Start" is clicked', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<WelcomeTour onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: /let's start/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('vs-onboarding-seen', '1');
  });

  it('auto-focuses the start button', () => {
    render(<WelcomeTour onDismiss={() => {}} />);
    expect(screen.getByRole('button', { name: /let's start/i })).toHaveFocus();
  });

  it('has proper aria attributes on dialog', () => {
    render(<WelcomeTour onDismiss={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'welcome-title');
  });

  describe('hasSeenOnboarding', () => {
    it('returns false when localStorage has no value', () => {
      expect(WelcomeTour.hasSeenOnboarding()).toBe(false);
    });

    it('returns true when localStorage has "1"', () => {
      localStorageMock.setItem('vs-onboarding-seen', '1');
      localStorageMock.getItem.mockImplementation((key) =>
        key === 'vs-onboarding-seen' ? '1' : null,
      );
      expect(WelcomeTour.hasSeenOnboarding()).toBe(true);
    });
  });

  describe('markOnboardingSeen', () => {
    it('sets localStorage value', () => {
      localStorageMock.setItem.mockClear();
      WelcomeTour.markOnboardingSeen();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('vs-onboarding-seen', '1');
    });
  });
});
