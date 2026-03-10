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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
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
        <p className="text-center text-xs text-gray-400 mb-4">
          Switch to &quot;Show unsorted&quot; to move cards back
        </p>
      )}
    </>
  );
}
