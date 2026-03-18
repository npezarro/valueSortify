import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const exitVariants = {
  veryImportant: { x: -300, opacity: 0, scale: 0.8 },
  important: { y: -200, opacity: 0, scale: 0.8 },
  notImportant: { x: 300, opacity: 0, scale: 0.8 },
};

export function SingleCardView({ unsortedValues, onSort }) {
  const [exitDirection, setExitDirection] = useState(null);

  const currentIndex = 0;

  const currentValue = unsortedValues[currentIndex];

  const handleSort = useCallback(
    (category) => {
      if (!currentValue) return;
      setExitDirection(category);
      // Small delay to let exit animation start
      setTimeout(() => {
        onSort(currentValue.id, category);
        setExitDirection(null);
      }, 150);
    },
    [currentValue, onSort],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't capture if user is typing in an input
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      )
        return;

      switch (e.key.toLowerCase()) {
        case 'q':
          handleSort('veryImportant');
          break;
        case 'w':
          handleSort('important');
          break;
        case 'e':
          handleSort('notImportant');
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSort]);

  if (unsortedValues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <p className="text-lg font-medium text-gray-900 mb-1">All values sorted!</p>
        <p className="text-sm text-gray-500">
          Proceed to ranking to order your values within each category.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress counter */}
      <div className="mb-6 text-center">
        <span className="text-sm font-medium text-gray-500" aria-live="polite">
          {unsortedValues.length - currentIndex} remaining
        </span>
        <div className="w-48 bg-gray-200 rounded-full h-1.5 mt-2" role="progressbar" aria-valuenow={83 - unsortedValues.length} aria-valuemin={0} aria-valuemax={83} aria-label="Sorting progress">
          <div
            className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${((83 - unsortedValues.length) / 83) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Card display area */}
      <div className="relative w-full max-w-md mx-auto min-h-[200px] flex items-center justify-center mb-8" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          {currentValue && !exitDirection && (
            <motion.div
              key={currentValue.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-lg"
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
                {currentValue.name}
              </h3>
              <p className="text-sm md:text-base text-gray-500 text-center leading-relaxed">
                {currentValue.description}
              </p>
            </motion.div>
          )}
          {currentValue && exitDirection && (
            <motion.div
              key={`${currentValue.id}-exit`}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={exitVariants[exitDirection]}
              transition={{ duration: 0.2, ease: 'easeIn' }}
              className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-lg absolute"
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
                {currentValue.name}
              </h3>
              <p className="text-sm md:text-base text-gray-500 text-center leading-relaxed">
                {currentValue.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort buttons with hotkey labels */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        <button
          onClick={() => handleSort('veryImportant')}
          aria-label="Sort as Very Important (keyboard shortcut Q)"
          className="flex flex-col items-center gap-1 py-3 px-4 rounded-lg bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 hover:border-green-300 transition-all font-medium active:scale-95"
        >
          <span className="text-sm md:text-base">Very Important</span>
          <kbd className="text-[10px] md:text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-mono">
            Q
          </kbd>
        </button>
        <button
          onClick={() => handleSort('important')}
          aria-label="Sort as Important (keyboard shortcut W)"
          className="flex flex-col items-center gap-1 py-3 px-4 rounded-lg bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all font-medium active:scale-95"
        >
          <span className="text-sm md:text-base">Important</span>
          <kbd className="text-[10px] md:text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-mono">
            W
          </kbd>
        </button>
        <button
          onClick={() => handleSort('notImportant')}
          aria-label="Sort as Not Important (keyboard shortcut E)"
          className="flex flex-col items-center gap-1 py-3 px-4 rounded-lg bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all font-medium active:scale-95"
        >
          <span className="text-sm md:text-base">Not Important</span>
          <kbd className="text-[10px] md:text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono">
            E
          </kbd>
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Use <kbd className="bg-gray-100 px-1 rounded font-mono">Q</kbd>{' '}
        <kbd className="bg-gray-100 px-1 rounded font-mono">W</kbd>{' '}
        <kbd className="bg-gray-100 px-1 rounded font-mono">E</kbd> keys for quick sorting
      </p>
    </div>
  );
}

SingleCardView.propTypes = {
  unsortedValues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onSort: PropTypes.func.isRequired,
};
