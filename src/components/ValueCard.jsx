import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export const ValueCard = forwardRef(function ValueCard({ value, onSort, showButtons = false, colorDot, focused = false, tabIndex }, ref) {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      tabIndex={tabIndex}
      data-value-id={value.id}
      className={`bg-white/80 backdrop-blur-sm border rounded-2xl p-3 md:p-4 shadow-card min-h-[80px] flex flex-col justify-center outline-none transition-all ${
        focused ? 'border-ember ring-2 ring-ember/30' : 'border-black/5 focus-visible:ring-2 focus-visible:ring-ember/30 focus-visible:border-ember'
      }`}
    >
      <div className="flex items-start gap-2">
        {colorDot && (
          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${colorDot}`} aria-hidden="true" />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-body font-medium text-ink mb-1 text-sm md:text-base leading-tight">
            {value.name}
          </h4>
          <p className="text-xs md:text-sm text-ink/50 leading-tight font-body">
            {value.description}
          </p>
        </div>
      </div>
      {showButtons && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onSort(value.id, 'veryImportant')}
            aria-label={`Sort ${value.name} as Very Important`}
            className="flex-1 text-xs py-1.5 px-2 rounded-full bg-ember/10 text-ember border border-ember/20 hover:bg-ember/20 transition-colors font-medium font-body"
          >
            Very Important
          </button>
          <button
            onClick={() => onSort(value.id, 'important')}
            aria-label={`Sort ${value.name} as Important`}
            className="flex-1 text-xs py-1.5 px-2 rounded-full bg-moss/10 text-moss border border-moss/20 hover:bg-moss/20 transition-colors font-medium font-body"
          >
            Important
          </button>
          <button
            onClick={() => onSort(value.id, 'notImportant')}
            aria-label={`Sort ${value.name} as Not Important`}
            className="flex-1 text-xs py-1.5 px-2 rounded-full bg-sky/30 text-ink/50 border border-sky/50 hover:bg-sky/50 transition-colors font-medium font-body"
          >
            Not Important
          </button>
        </div>
      )}
    </motion.div>
  );
});

ValueCard.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onSort: PropTypes.func,
  showButtons: PropTypes.bool,
  colorDot: PropTypes.string,
  focused: PropTypes.bool,
  tabIndex: PropTypes.number,
};
