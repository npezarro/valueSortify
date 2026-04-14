import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside a container element while mounted.
 * Restores focus to the previously focused element on unmount.
 * Calls onClose when Escape is pressed.
 *
 * @param {Function} [onClose] - Called when the user presses Escape
 * @returns {import('react').RefObject<HTMLDivElement>} Ref to attach to the dialog container
 */
export function useFocusTrap(onClose) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const container = containerRef.current;
    if (!container) return;

    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hidden && getComputedStyle(el).display !== 'none'
      );

    // Focus the first focusable element (unless autoFocus already handled it)
    const focusable = getFocusable();
    if (focusable.length && !container.contains(document.activeElement)) {
      focusable[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [onClose]);

  return containerRef;
}
