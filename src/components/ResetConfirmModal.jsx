import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

export function ResetConfirmModal({ titleId, message, onConfirm, onCancel }) {
  const handleClose = useCallback(() => onCancel(), [onCancel]);
  const trapRef = useFocusTrap(handleClose);

  return (
    <div
      ref={trapRef}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full shadow-card">
        <h3 id={titleId} className="text-lg font-display font-semibold text-ink mb-2">Start Over?</h3>
        <p className="text-sm text-ink/60 mb-6 font-body">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            autoFocus
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-ink/70 bg-white border border-black/5 rounded-full hover:bg-sand transition-colors font-body"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-full hover:bg-destructive/90 transition-colors font-body"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

ResetConfirmModal.propTypes = {
  titleId: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
