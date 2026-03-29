import { Component } from 'react';
import PropTypes from 'prop-types';
import { RotateCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl p-8 max-w-md w-full shadow-card text-center">
            <h1 className="text-2xl font-display font-bold text-ink mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-ink/50 font-body mb-6">
              An unexpected error occurred. Your progress is saved in your browser — refreshing should restore it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm bg-ember text-white hover:bg-ember/90 shadow-card transition-colors font-body"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
