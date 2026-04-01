import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';
import { ValueCard } from './ValueCard';

function getColumnCount(containerEl) {
  if (!containerEl) return 1;
  const children = containerEl.querySelectorAll('[role="listitem"]');
  if (children.length < 2) return 1;
  const firstTop = children[0].getBoundingClientRect().top;
  let cols = 0;
  for (const child of children) {
    if (child.getBoundingClientRect().top === firstTop) cols++;
    else break;
  }
  return cols || 1;
}

export function GridView({ unsortedValues, sortedValues, filter, categories, onSort, onUnsort, searchQuery = '' }) {
  const [focusIndex, setFocusIndex] = useState(-1);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);

  const categoryValues =
    filter === 'remaining'
      ? unsortedValues
      : filter === 'veryImportant'
        ? sortedValues.veryImportant
        : filter === 'important'
          ? sortedValues.important
          : sortedValues.notImportant;

  const displayValues = searchQuery
    ? categoryValues.filter((v) => {
        const q = searchQuery.toLowerCase();
        return v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
      })
    : categoryValues;

  // Reset focus when values change (sort action, filter change, search)
  useEffect(() => {
    setFocusIndex(-1);
  }, [filter, searchQuery, displayValues.length]);

  // Sync DOM focus with focusIndex
  useEffect(() => {
    if (focusIndex >= 0 && focusIndex < cardRefs.current.length) {
      cardRefs.current[focusIndex]?.focus();
    }
  }, [focusIndex]);

  // Resize cardRefs array when displayValues changes
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, displayValues.length);
  }, [displayValues.length]);

  const handleFocus = useCallback((e) => {
    const card = e.target.closest('[data-value-id]');
    if (!card) return;
    const id = Number(card.dataset.valueId);
    const idx = displayValues.findIndex((v) => v.id === id);
    if (idx >= 0 && idx !== focusIndex) setFocusIndex(idx);
  }, [displayValues, focusIndex]);

  const handleKeyDown = useCallback((e) => {
    const count = displayValues.length;
    if (count === 0) return;

    const cols = getColumnCount(gridRef.current);
    let next = focusIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        next = focusIndex < 0 ? 0 : Math.min(focusIndex + 1, count - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        next = focusIndex < 0 ? 0 : Math.max(focusIndex - 1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (focusIndex < 0) { next = 0; break; }
        next = Math.min(focusIndex + cols, count - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (focusIndex < 0) { next = 0; break; }
        next = Math.max(focusIndex - cols, 0);
        break;
      case 'Home':
        e.preventDefault();
        next = 0;
        break;
      case 'End':
        e.preventDefault();
        next = count - 1;
        break;
      case 'q':
      case 'Q':
        if (filter === 'remaining' && focusIndex >= 0 && focusIndex < count) {
          e.preventDefault();
          onSort(displayValues[focusIndex].id, 'veryImportant');
        }
        return;
      case 'w':
      case 'W':
        if (filter === 'remaining' && focusIndex >= 0 && focusIndex < count) {
          e.preventDefault();
          onSort(displayValues[focusIndex].id, 'important');
        }
        return;
      case 'e':
      case 'E':
        if (filter === 'remaining' && focusIndex >= 0 && focusIndex < count) {
          e.preventDefault();
          onSort(displayValues[focusIndex].id, 'notImportant');
        }
        return;
      default:
        return;
    }

    if (next !== focusIndex) {
      setFocusIndex(next);
    }
  }, [focusIndex, displayValues, filter, onSort]);

  return (
    <>
      {searchQuery && displayValues.length === 0 ? (
        <p className="text-center text-sm text-ink/40 font-body py-8">
          No values match &ldquo;{searchQuery}&rdquo;
        </p>
      ) : (
        <>
          {filter === 'remaining' && displayValues.length > 0 && (
            <p className="text-xs text-ink/40 font-body mb-2 text-center" aria-live="polite">
              Use arrow keys to navigate, <kbd className="px-1 py-0.5 bg-white/80 border border-black/10 rounded text-[10px] font-mono">Q</kbd> <kbd className="px-1 py-0.5 bg-white/80 border border-black/10 rounded text-[10px] font-mono">W</kbd> <kbd className="px-1 py-0.5 bg-white/80 border border-black/10 rounded text-[10px] font-mono">E</kbd> to sort focused card
            </p>
          )}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8"
            role="list"
            aria-label="Values to sort"
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
          >
            <AnimatePresence mode="popLayout">
              {displayValues.map((value, i) =>
                filter === 'remaining' ? (
                  <div key={value.id} role="listitem">
                    <ValueCard
                      ref={(el) => { cardRefs.current[i] = el; }}
                      value={value}
                      showButtons
                      onSort={onSort}
                      focused={focusIndex === i}
                      tabIndex={focusIndex === i || (focusIndex === -1 && i === 0) ? 0 : -1}
                    />
                  </div>
                ) : (
                  <div key={value.id} role="listitem">
                    <ValueCard
                      ref={(el) => { cardRefs.current[i] = el; }}
                      value={value}
                      colorDot={categories.find((c) => c.key === filter)?.dotColor}
                      showButtons={false}
                      onSort={() => onUnsort(value.id)}
                      focused={focusIndex === i}
                      tabIndex={focusIndex === i || (focusIndex === -1 && i === 0) ? 0 : -1}
                    />
                  </div>
                ),
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {filter !== 'remaining' && displayValues.length > 0 && (
        <p className="text-center text-xs text-ink/30 font-body mb-4">
          Switch to &quot;Show unsorted&quot; to move cards back
        </p>
      )}
    </>
  );
}

const valuePropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
});

GridView.propTypes = {
  unsortedValues: PropTypes.arrayOf(valuePropType).isRequired,
  sortedValues: PropTypes.shape({
    veryImportant: PropTypes.arrayOf(valuePropType),
    important: PropTypes.arrayOf(valuePropType),
    notImportant: PropTypes.arrayOf(valuePropType),
  }).isRequired,
  filter: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      dotColor: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onSort: PropTypes.func.isRequired,
  onUnsort: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
};
