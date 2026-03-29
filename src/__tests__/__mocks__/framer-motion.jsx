import { forwardRef } from 'react';

// Mock motion.div (and others) as plain divs, stripping framer-motion props
function createMotionComponent() {
  const Component = forwardRef(function MotionDiv(
    { initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileDrag: _whileDrag, layout: _layout, dragListener: _dragListener, dragControls: _dragControls, ...props },
    ref,
  ) {
    return <div ref={ref} {...props} />;
  });
  return Component;
}

const motionDiv = createMotionComponent();

export const motion = {
  div: motionDiv,
  span: motionDiv,
  li: motionDiv,
  button: motionDiv,
};

export function AnimatePresence({ children }) {
  return <>{children}</>;
}

// Reorder.Group renders a div, strips reorder-specific props
const ReorderGroup = forwardRef(function ReorderGroup(
  { values: _values, onReorder: _onReorder, axis: _axis, ...props },
  ref,
) {
  return <div ref={ref} {...props} />;
});

// Reorder.Item renders a div, strips reorder-specific props (including value)
const ReorderItem = forwardRef(function ReorderItem(
  { value: _value, dragListener: _dragListener, dragControls: _dragControls, layout: _layout, initial: _initial, animate: _animate, exit: _exit, whileDrag: _whileDrag, transition: _transition, ...props },
  ref,
) {
  return <div ref={ref} {...props} />;
});

export const Reorder = { Group: ReorderGroup, Item: ReorderItem };

export function useDragControls() {
  return { start: () => {} };
}
