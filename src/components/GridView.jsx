import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';
import { ValueCard } from './ValueCard';

export function GridView({ unsortedValues, sortedValues, filter, categories, onSort, onUnsort }) {
  const displayValues =
    filter === 'remaining'
      ? unsortedValues
      : filter === 'veryImportant'
        ? sortedValues.veryImportant
        : filter === 'important'
          ? sortedValues.important
          : sortedValues.notImportant;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8" role="list" aria-label="Values to sort">
        <AnimatePresence mode="popLayout">
          {displayValues.map((value) =>
            filter === 'remaining' ? (
              <ValueCard
                key={value.id}
                value={value}
                showButtons
                onSort={onSort}
              />
            ) : (
              <ValueCard
                key={value.id}
                value={value}
                colorDot={categories.find((c) => c.key === filter)?.dotColor}
                showButtons={false}
                onSort={() => onUnsort(value.id)}
              />
            ),
          )}
        </AnimatePresence>
      </div>

      {filter !== 'remaining' && displayValues.length > 0 && (
        <p className="text-center text-xs text-ink/40 mb-4 font-body">
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
};
