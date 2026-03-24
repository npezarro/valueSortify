import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const exitVariants = {
  veryImportant: { x: -300, opacity: 0, scale: 0.8 },
  important: { y: -200, opacity: 0, scale: 0.8 },
  notImportant: { x: 300, opacity: 0, scale: 0.8 },
};

export function SingleCardView({ unsortedValues, onSort, totalValues }) {
  const [exitDirection, setExitDirection] = useState(null);
  const sortTimeoutRef = useRef(null);

  const currentIndex = 0;

  const currentValue = unsortedValues[currentIndex];

  const handleSort = useCallback(
    (category) => {
      if (!currentValue) return;
      setExitDirection(category);
      // Clear any pending sort timeout
      if (sortTimeoutRef.current) clearTimeout(sortTimeoutRef.current);
      // Small delay to let exit animation start
      sortTimeoutRef.current = setTimeout(() => {
        onSort(currentValue.id, category);
        setExitDirection(null);
        sortTimeoutRef.current = null;
      }, 150);
    },
    [currentValue, onSort],
  );

  // Clean up sort timeout on unmount
  useEffect(() => {
    return () => {
      if (sortTimeoutRef.current) clearTimeout(sortTimeoutRef.current);
    };
  }, []);

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
        <p className="text-lg font-display font-medium text-ink mb-1">All values sorted!</p>
        <p className="text-sm text-ink/50 font-body">
          Proceed to ranking to order your values within each category.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress counter */}
      <div className="mb-6 text-center">
        <span className="text-sm font-medium text-ink/50 font-body" aria-live="polite">
          {unsortedValues.length - currentIndex} remaining
        </span>
        <div className="w-48 bg-sky/50 rounded-full h-1.5 mt-2" role="progressbar" aria-valuenow={totalValues - unsortedValues.length} aria-valuemin={0} aria-valuemax={totalValues} aria-label="Sorting progress">
          <div
            className="bg-ember h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${((totalValues - unsortedValues.length) / totalValues) * 100}%`,
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
              className="w-full bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl p-6 md:p-8 shadow-card"
            >
              <h3 className="text-xl md:text-2xl font-display font-bold text-ink mb-2 text-center">
                {currentValue.name}
              </h3>
              <p className="text-sm md:text-base text-ink/50 text-center leading-relaxed font-body">
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
              className="w-full bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl p-6 md:p-8 shadow-card absolute"
            >
              <h3 className="text-xl md:text-2xl font-display font-bold text-ink mb-2 text-center">
                {currentValue.name}
              </h3>
              <p className="text-sm md:text-base text-ink/50 text-center leading-relaxed font-body">
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
          className="flex flex-col items-center gap-1 py-3 px-4 rounded-full bg-ember/10 text-ember border-2 border-ember/20 hover:bg-ember/20 hover:border-ember/40 transition-all font-medium font-body active:scale-95"
        >
          <span className="text-sm md:text-base">Very Important</span>
          <kbd className="text-[10px] md:text-xs bg-ember/20 text-ember px-1.5 py-0.5 rounded font-mono">
            Q
          </kbd>
        </button>
        <button
          onClick={() => handleSort('important')}
          aria-label="Sort as Important (keyboard shortcut W)"
          className="flex flex-col items-center gap-1 py-3 px-4 rounded-full bg-moss/10 text-moss border-2 border-moss/20 hover:bg-moss/20 hover:border-moss/40 transition-all font-medium font-body active:scale-95"
        >
          <span className="text-sm md:text-base">Important</span>
          <kbd className="text-[10px] md:text-xs bg-moss/20 text-moss px-1.5 py-0.5 rounded font-mono">
            W
          </kbd>
        </button>
        <button
          onClick={() => handleSort('notImportant')}
          aria-label="Sort as Not Important (keyboard shortcut E)"
          className="flex flex-col items-center gap-1 py-3 px-4 rounded-full bg-sky/30 text-ink/50 border-2 border-sky/50 hover:bg-sky/50 hover:border-sky/70 transition-all font-medium font-body active:scale-95"
        >
          <span className="text-sm md:text-base">Not Important</span>
          <kbd className="text-[10px] md:text-xs bg-sky/50 text-ink/60 px-1.5 py-0.5 rounded font-mono">
            E
          </kbd>
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-ink/40 mt-4 text-center font-body">
        Use <kbd className="bg-sand px-1 rounded font-mono">Q</kbd>{' '}
        <kbd className="bg-sand px-1 rounded font-mono">W</kbd>{' '}
        <kbd className="bg-sand px-1 rounded font-mono">E</kbd> keys for quick sorting
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
  totalValues: PropTypes.number.isRequired,
};
