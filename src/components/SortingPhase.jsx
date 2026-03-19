import { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Layers, LayoutGrid, CreditCard, RotateCcw } from 'lucide-react';
import { SingleCardView } from './SingleCardView';
import { GridView } from './GridView';
import { sortValue, unsortValue, getRemainingValues } from '../lib/sorting';

export function SortingPhase({ state, save, reset }) {
  const [filter, setFilter] = useState('remaining');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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

  const handleSort = (valueId, category) => {
    const updates = sortValue(state, valueId, category);
    if (updates) save(updates);
  };

  const handleUnsort = (valueId) => {
    save(unsortValue(state, valueId));
  };

  const canProceed = remaining.length === 0;

  const categories = [
    {
      key: 'veryImportant',
      label: 'Very Important',
      color: 'bg-green-500',
      dotColor: 'bg-green-500',
      items: state.veryImportant,
    },
    {
      key: 'important',
      label: 'Important',
      color: 'bg-blue-500',
      dotColor: 'bg-blue-500',
      items: state.important,
    },
    {
      key: 'notImportant',
      label: 'Not Important',
      color: 'bg-gray-400',
      dotColor: 'bg-gray-400',
      items: state.notImportant,
    },
  ];

  const toggleView = () => {
    const next = viewMode === 'card' ? 'grid' : 'card';
    setViewMode(next);
    try {
      localStorage.setItem('vs-view-mode', next);
    } catch { /* localStorage may be unavailable */ }
    // Reset filter when switching back to card view
    if (next === 'card') setFilter('remaining');
  };

  return (
    <div>
      {/* View toggle + reset */}
      <div className="flex justify-between mb-4">
        {sortedCount > 0 ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            title="Start over"
          >
            <RotateCcw size={14} />
            Start Over
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={toggleView}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          title={viewMode === 'card' ? 'Switch to grid view' : 'Switch to card view'}
        >
          {viewMode === 'card' ? (
            <>
              <LayoutGrid size={14} />
              Grid View
            </>
          ) : (
            <>
              <CreditCard size={14} />
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
            className={`bg-white border rounded-lg p-3 text-center transition-all ${
              viewMode === 'grid' && filter === cat.key
                ? 'border-gray-900 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            } ${viewMode === 'card' ? 'cursor-default' : ''}`}
          >
            <div className={`w-3 h-3 ${cat.color} rounded-full mx-auto mb-2`} aria-hidden="true" />
            <p className="text-xs md:text-sm font-medium text-gray-900">
              {cat.label}
            </p>
            <p className="text-lg font-bold text-gray-900">{cat.items.length}</p>
          </button>
        ))}
      </div>

      {/* View-specific content */}
      {viewMode === 'card' ? (
        <SingleCardView unsortedValues={remaining} onSort={handleSort} />
      ) : (
        <>
          {/* Filter indicator (grid only) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
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
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
          />
        </>
      )}

      {/* Proceed button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => save({ phase: 2 })}
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
            canProceed
              ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Proceed to Ranking
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="sorting-reset-title">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 id="sorting-reset-title" className="text-lg font-semibold text-gray-900 mb-2">Start Over?</h3>
            <p className="text-sm text-gray-600 mb-6">
              You&apos;ve categorized {sortedCount} value{sortedCount !== 1 ? 's' : ''}. This will clear all your progress and start from scratch.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { reset(); setShowResetConfirm(false); }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
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
