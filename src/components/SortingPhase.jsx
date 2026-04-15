import { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Layers, LayoutGrid, CreditCard, RotateCcw, Search, X } from 'lucide-react';
import { ResetConfirmModal } from './ResetConfirmModal';
import { SingleCardView } from './SingleCardView';
import { GridView } from './GridView';
import { sortValue, unsortValue, getRemainingValues } from '../lib/sorting';
import { ALL_VALUES } from '../values';

export function SortingPhase({ state, save, reset }) {
  const [filter, setFilter] = useState('remaining');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [undoHistory, setUndoHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('vs-view-mode') || 'card';
    } catch { /* localStorage may be unavailable */
      return 'card';
    }
  });

  const remaining = getRemainingValues(state);
  const sortedCount =
    state.veryImportant.length + state.important.length + state.notImportant.length;

  // Announce to screen readers when all values are categorized.
  // Tracks transition from remaining > 0 to remaining === 0.
  const [sortingComplete, setSortingComplete] = useState(false);
  const prevRemainingRef = useRef(remaining.length);
  /* eslint-disable react-hooks/set-state-in-effect -- intentional: tracks remaining→0 transition for aria-live announcement */
  useEffect(() => {
    if (remaining.length === 0 && prevRemainingRef.current > 0) {
      setSortingComplete(true);
    } else if (remaining.length > 0) {
      setSortingComplete(false);
    }
    prevRemainingRef.current = remaining.length;
  }, [remaining.length]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSort = (valueId, category) => {
    const updates = sortValue(state, valueId, category);
    if (updates) {
      setUndoHistory((prev) => [...prev, { valueId, category }]);
      save(updates);
    }
  };

  const handleUndo = useCallback(() => {
    setUndoHistory((prev) => {
      if (prev.length === 0) return prev;
      const lastAction = prev[prev.length - 1];
      save(unsortValue(state, lastAction.valueId));
      return prev.slice(0, -1);
    });
  }, [state, save]);

  const handleUnsort = (valueId) => {
    save(unsortValue(state, valueId));
  };

  const canProceed = remaining.length === 0;

  const categories = [
    {
      key: 'veryImportant',
      label: 'Very Important',
      color: 'bg-ember',
      dotColor: 'bg-ember',
      items: state.veryImportant,
    },
    {
      key: 'important',
      label: 'Important',
      color: 'bg-moss',
      dotColor: 'bg-moss',
      items: state.important,
    },
    {
      key: 'notImportant',
      label: 'Not Important',
      color: 'bg-sky',
      dotColor: 'bg-sky',
      items: state.notImportant,
    },
  ];

  const toggleView = () => {
    const next = viewMode === 'card' ? 'grid' : 'card';
    setViewMode(next);
    try {
      localStorage.setItem('vs-view-mode', next);
    } catch { /* localStorage may be unavailable */ }
    // Reset filter and search when switching back to card view
    if (next === 'card') {
      setFilter('remaining');
      setSearchQuery('');
    }
  };

  return (
    <div>
      {/* View toggle + reset */}
      <div className="flex justify-between mb-4">
        {sortedCount > 0 ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink/40 hover:text-ink/60 transition-colors font-body"
            title="Start over"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Start Over
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={toggleView}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink/60 bg-white/80 backdrop-blur-sm border border-black/5 rounded-full hover:bg-white transition-colors font-body"
          aria-label={viewMode === 'card' ? 'Switch to grid view' : 'Switch to card view'}
          title={viewMode === 'card' ? 'Switch to grid view' : 'Switch to card view'}
        >
          {viewMode === 'card' ? (
            <>
              <LayoutGrid size={14} aria-hidden="true" />
              Grid View
            </>
          ) : (
            <>
              <CreditCard size={14} aria-hidden="true" />
              Card View
            </>
          )}
        </button>
      </div>

      {/* Category counters */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              if (viewMode === 'card') return;
              setFilter(filter === cat.key ? 'remaining' : cat.key);
            }}
            aria-label={`${cat.label}: ${cat.items.length} values`}
            aria-pressed={viewMode === 'grid' ? filter === cat.key : undefined}
            className={`bg-white/80 backdrop-blur-sm border rounded-2xl p-3 text-center transition-all ${
              viewMode === 'grid' && filter === cat.key
                ? 'border-ink shadow-card'
                : 'border-black/5 hover:border-black/10'
            } ${viewMode === 'card' ? 'cursor-default' : ''}`}
          >
            <div className={`w-3 h-3 ${cat.color} rounded-full mx-auto mb-2`} aria-hidden="true" />
            <p className="text-xs md:text-sm font-medium text-ink font-body">
              {cat.label}
            </p>
            <p className="text-lg font-display font-bold text-ink">{cat.items.length}</p>
          </button>
        ))}
      </div>

      {/* View-specific content */}
      {viewMode === 'card' ? (
        <SingleCardView unsortedValues={remaining} onSort={handleSort} onUndo={handleUndo} canUndo={undoHistory.length > 0} totalValues={ALL_VALUES.length} />
      ) : (
        <>
          {/* Search + filter indicator (grid only) */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search values..."
              aria-label="Search values by name or description"
              className="w-full pl-9 pr-8 py-2 text-sm font-body text-ink bg-white/80 backdrop-blur-sm border border-black/5 rounded-full focus-visible:outline-none focus-visible:border-ink/20 focus-visible:ring-1 focus-visible:ring-ink/10 placeholder:text-ink/30 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-ink/50" aria-hidden="true" />
              <span className="text-sm text-ink/60 font-body">
                {filter === 'remaining'
                  ? `${remaining.length} values to sort`
                  : `${
                      filter === 'veryImportant'
                        ? state.veryImportant.length
                        : filter === 'important'
                          ? state.important.length
                          : state.notImportant.length
                    } in ${categories.find((c) => c.key === filter)?.label}`}
              </span>
            </div>
            {filter !== 'remaining' && (
              <button
                onClick={() => setFilter('remaining')}
                className="text-sm text-ember hover:text-ember/80 font-medium font-body"
              >
                Show unsorted
              </button>
            )}
          </div>

          <GridView
            unsortedValues={remaining}
            sortedValues={state}
            filter={filter}
            categories={categories}
            onSort={handleSort}
            onUnsort={handleUnsort}
            searchQuery={searchQuery}
          />
        </>
      )}

      {/* Screen reader announcement for sorting completion */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {sortingComplete && 'All values categorized. You can now proceed to ranking.'}
      </div>

      {/* Proceed button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => save({ phase: 2 })}
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all font-body ${
            canProceed
              ? 'bg-ember text-white hover:bg-ember/90 shadow-card'
              : 'bg-sky/50 text-ink/30 cursor-not-allowed'
          }`}
        >
          Proceed to Ranking
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>

      {showResetConfirm && (
        <ResetConfirmModal
          titleId="sorting-reset-title"
          message={`You've categorized ${sortedCount} value${sortedCount !== 1 ? 's' : ''}. This will clear all your progress and start from scratch.`}
          onConfirm={() => { reset(); setShowResetConfirm(false); }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}

const valuePropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
});

SortingPhase.propTypes = {
  state: PropTypes.shape({
    phase: PropTypes.number,
    veryImportant: PropTypes.arrayOf(valuePropType).isRequired,
    important: PropTypes.arrayOf(valuePropType).isRequired,
    notImportant: PropTypes.arrayOf(valuePropType).isRequired,
  }).isRequired,
  save: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};
