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
      className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl p-3 md:p-4 shadow-card cursor-default select-none"
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
          role="button"
          tabIndex={0}
          aria-label={`Drag to reorder ${value.name}`}
          onPointerDown={(e) => controls.start(e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              controls.start(e);
            }
          }}
          className="cursor-grab active:cursor-grabbing touch-none text-ink/40 hover:text-ink/60 transition-colors mt-0.5 shrink-0"
        >
          <GripVertical size={16} aria-hidden="true" />
        </div>
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
        {hasMoveControls && (
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {otherCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => onMove(value.id, currentCategory, cat.key)}
                className={`w-6 h-6 rounded-full ${cat.color} opacity-40 hover:opacity-100 hover:scale-110 transition-all`}
                aria-label={`Move ${value.name} to ${cat.label}`}
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
