import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export function ValueCard({ value, onSort, showButtons = false, colorDot }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm min-h-[80px] flex flex-col justify-center"
    >
      <div className="flex items-start gap-2">
        {colorDot && (
          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${colorDot}`} />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base leading-tight">
            {value.name}
          </h4>
          <p className="text-xs md:text-sm text-gray-500 leading-tight">
            {value.description}
          </p>
        </div>
      </div>
      {showButtons && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onSort(value.id, 'veryImportant')}
            className="flex-1 text-xs py-1.5 px-2 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors font-medium"
          >
            Very Important
          </button>
          <button
            onClick={() => onSort(value.id, 'important')}
            className="flex-1 text-xs py-1.5 px-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors font-medium"
          >
            Important
          </button>
          <button
            onClick={() => onSort(value.id, 'notImportant')}
            className="flex-1 text-xs py-1.5 px-2 rounded-md bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors font-medium"
          >
            Not Important
          </button>
        </div>
      )}
    </motion.div>
  );
}

ValueCard.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onSort: PropTypes.func,
  showButtons: PropTypes.bool,
  colorDot: PropTypes.string,
};
