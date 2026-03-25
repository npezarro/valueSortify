import React, { forwardRef } from 'react';

// Mock motion.div (and others) as plain divs, stripping framer-motion props
function createMotionComponent() {
  const Component = forwardRef(function MotionDiv(
    { initial, animate, exit, transition, whileDrag, layout, dragListener, dragControls, ...props },
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
  { values, onReorder, axis, ...props },
  ref,
) {
  return <div ref={ref} {...props} />;
});

// Reorder.Item renders a div, strips reorder-specific props (including value)
const ReorderItem = forwardRef(function ReorderItem(
  { value, dragListener, dragControls, layout, initial, animate, exit, whileDrag, transition, ...props },
  ref,
) {
  return <div ref={ref} {...props} />;
});

export const Reorder = { Group: ReorderGroup, Item: ReorderItem };

export function useDragControls() {
  return { start: () => {} };
}
