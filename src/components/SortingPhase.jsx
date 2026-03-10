import { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Layers, LayoutGrid, CreditCard } from 'lucide-react';
import { ALL_VALUES } from '../values';
import { SingleCardView } from './SingleCardView';
import { GridView } from './GridView';

export function SortingPhase({ state, save }) {
  const [filter, setFilter] = useState('remaining');
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('vs-view-mode') || 'card';
    } catch { /* localStorage may be unavailable */
      return 'card';
    }
  });

  const sortedIds = new Set([
    ...state.veryImportant.map((v) => v.id),
    ...state.important.map((v) => v.id),
    ...state.notImportant.map((v) => v.id),
  ]);
  const remaining = ALL_VALUES.filter((v) => !sortedIds.has(v.id));

  const handleSort = (valueId, category) => {
    const value = ALL_VALUES.find((v) => v.id === valueId);
    if (!value) return;

    const updates = {
      veryImportant: state.veryImportant.filter((v) => v.id !== valueId),
      important: state.important.filter((v) => v.id !== valueId),
      notImportant: state.notImportant.filter((v) => v.id !== valueId),
    };

    updates[category] = [...updates[category], value];
    save(updates);
  };

  const handleUnsort = (valueId) => {
    save({
      veryImportant: state.veryImportant.filter((v) => v.id !== valueId),
      important: state.important.filter((v) => v.id !== valueId),
      notImportant: state.notImportant.filter((v) => v.id !== valueId),
    });
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
      {/* View toggle */}
      <div className="flex justify-end mb-4">
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
            className={`bg-white border rounded-lg p-3 text-center transition-all ${
              viewMode === 'grid' && filter === cat.key
                ? 'border-gray-900 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            } ${viewMode === 'card' ? 'cursor-default' : ''}`}
          >
            <div className={`w-3 h-3 ${cat.color} rounded-full mx-auto mb-2`} />
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
};
