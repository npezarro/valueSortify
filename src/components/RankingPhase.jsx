import PropTypes from 'prop-types';
import { Reorder } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import { DraggableCard } from './DraggableCard';

function RankingGroup({ title, color, values, onReorder }) {
  if (values.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-4 h-4 ${color} rounded`} />
        <h3 className="text-base md:text-lg font-medium text-gray-900">
          {title}
        </h3>
        <span className="text-sm text-gray-400 ml-auto">{values.length}</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Drag to reorder — most important at top
      </p>
      <Reorder.Group
        axis="y"
        values={values}
        onReorder={onReorder}
        className="space-y-2"
      >
        {values.map((value) => (
          <DraggableCard
            key={value.id}
            value={value}
            colorDot={color}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

export function RankingPhase({ state, save }) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RankingGroup
          title="Very Important"
          color="bg-green-500"
          values={state.veryImportant}
          onReorder={(newOrder) => save({ veryImportant: newOrder })}
        />
        <RankingGroup
          title="Important"
          color="bg-blue-500"
          values={state.important}
          onReorder={(newOrder) => save({ important: newOrder })}
        />
        <RankingGroup
          title="Not Important"
          color="bg-gray-400"
          values={state.notImportant}
          onReorder={(newOrder) => save({ notImportant: newOrder })}
        />
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
  values: PropTypes.arrayOf(valuePropType).isRequired,
  onReorder: PropTypes.func.isRequired,
};

RankingPhase.propTypes = {
  state: PropTypes.shape({
    veryImportant: PropTypes.arrayOf(valuePropType).isRequired,
    important: PropTypes.arrayOf(valuePropType).isRequired,
    notImportant: PropTypes.arrayOf(valuePropType).isRequired,
  }).isRequired,
  save: PropTypes.func.isRequired,
};
