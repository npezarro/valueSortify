import PropTypes from 'prop-types';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';

export function DraggableCard({ value, colorDot, currentCategory, otherCategories, onMove }) {
  const controls = useDragControls();
  const hasMoveControls = currentCategory && otherCategories && onMove;

  return (
    <Reorder.Item
      value={value}
      layout
      dragListener={false}
      dragControls={controls}
      className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm cursor-default select-none"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{
        scale: 1.05,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        rotate: 1,
        zIndex: 50,
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-2">
        <div
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600 transition-colors mt-0.5 shrink-0"
        >
          <GripVertical size={16} />
        </div>
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
        {hasMoveControls && (
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {otherCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => onMove(value.id, currentCategory, cat.key)}
                className={`w-6 h-6 rounded-full ${cat.color} opacity-40 hover:opacity-100 hover:scale-110 transition-all`}
                title={`Move to ${cat.label}`}
              />
            ))}
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

DraggableCard.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  colorDot: PropTypes.string,
  currentCategory: PropTypes.string,
  otherCategories: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ),
  onMove: PropTypes.func,
};
