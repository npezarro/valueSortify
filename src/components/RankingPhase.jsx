import { useState } from 'react';
import PropTypes from 'prop-types';
import { Reorder, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { DraggableCard } from './DraggableCard';
import { moveCard as moveCardFn } from '../lib/sorting';

const CATEGORIES = [
  { key: 'veryImportant', label: 'Very Important', color: 'bg-green-500' },
  { key: 'important', label: 'Important', color: 'bg-blue-500' },
  { key: 'notImportant', label: 'Not Important', color: 'bg-gray-400' },
];

function RankingGroup({ title, color, categoryKey, values, onReorder, onMove }) {
  if (values.length === 0) return null;

  const otherCategories = CATEGORIES.filter((c) => c.key !== categoryKey);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-4 h-4 ${color} rounded`} aria-hidden="true" />
        <h3 className="text-base md:text-lg font-medium text-gray-900">
          {title}
        </h3>
        <span className="text-sm text-gray-400 ml-auto">{values.length}</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Drag to reorder, or use dots to move between categories
      </p>
      <Reorder.Group
        axis="y"
        values={values}
        onReorder={onReorder}
        className="space-y-2"
        role="list"
        aria-label={`${title} values, drag to reorder`}
      >
        <AnimatePresence>
          {values.map((value) => (
            <DraggableCard
              key={value.id}
              value={value}
              colorDot={color}
              currentCategory={categoryKey}
              otherCategories={otherCategories}
              onMove={onMove}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}

export function RankingPhase({ state, save, reset }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const totalRanked =
    state.veryImportant.length + state.important.length + state.notImportant.length;

  const handleMoveCard = (cardId, fromCategory, toCategory) => {
    const updates = moveCardFn(state, cardId, fromCategory, toCategory);
    if (updates) save(updates);
  };

  return (
    <div>
      {/* Reset button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          title="Start over"
        >
          <RotateCcw size={14} />
          Start Over
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {CATEGORIES.map((cat) => (
          <RankingGroup
            key={cat.key}
            title={cat.label}
            color={cat.color}
            categoryKey={cat.key}
            values={state[cat.key]}
            onReorder={(newOrder) => save({ [cat.key]: newOrder })}
            onMove={handleMoveCard}
          />
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => save({ phase: 1 })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Sorting
        </button>
        <button
          onClick={() => save({ phase: 3 })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm bg-gray-900 text-white hover:bg-gray-800 shadow-md transition-colors"
        >
          <Trophy size={16} />
          View Results
        </button>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="ranking-reset-title">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 id="ranking-reset-title" className="text-lg font-semibold text-gray-900 mb-2">Start Over?</h3>
            <p className="text-sm text-gray-600 mb-6">
              You&apos;ve ranked {totalRanked} values across 3 categories. This will clear all your progress and start from scratch.
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

RankingGroup.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  categoryKey: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(valuePropType).isRequired,
  onReorder: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
};

RankingPhase.propTypes = {
  state: PropTypes.shape({
    veryImportant: PropTypes.arrayOf(valuePropType).isRequired,
    important: PropTypes.arrayOf(valuePropType).isRequired,
    notImportant: PropTypes.arrayOf(valuePropType).isRequired,
  }).isRequired,
  save: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};
