import { useState } from 'react';
import PropTypes from 'prop-types';
import { Reorder, AnimatePresence } from 'framer-motion';
import { ResetConfirmModal } from './ResetConfirmModal';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { DraggableCard } from './DraggableCard';
import { moveCard as moveCardFn } from '../lib/sorting';

const CATEGORIES = [
  { key: 'veryImportant', label: 'Very Important', color: 'bg-ember' },
  { key: 'important', label: 'Important', color: 'bg-moss' },
  { key: 'notImportant', label: 'Not Important', color: 'bg-sky' },
];

function RankingGroup({ title, color, categoryKey, values, onReorder, onMove }) {
  if (values.length === 0) return null;

  const otherCategories = CATEGORIES.filter((c) => c.key !== categoryKey);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl p-4 md:p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-4 h-4 ${color} rounded`} aria-hidden="true" />
        <h3 className="text-base md:text-lg font-display font-medium text-ink">
          {title}
        </h3>
        <span className="text-sm text-ink/40 ml-auto font-body">{values.length}</span>
      </div>
      <p className="text-xs text-ink/40 mb-4 font-body">
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink/40 hover:text-ink/60 transition-colors font-body"
          title="Start over"
        >
          <RotateCcw size={14} aria-hidden="true" />
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm bg-white/80 backdrop-blur-sm border border-black/5 text-ink/70 hover:bg-white transition-colors font-body"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Sorting
        </button>
        <button
          onClick={() => save({ phase: 3 })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm bg-ember text-white hover:bg-ember/90 shadow-card transition-colors font-body"
        >
          <Trophy size={16} aria-hidden="true" />
          View Results
        </button>
      </div>

      {showResetConfirm && (
        <ResetConfirmModal
          titleId="ranking-reset-title"
          message={`You've ranked ${totalRanked} values across 3 categories. This will clear all your progress and start from scratch.`}
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
