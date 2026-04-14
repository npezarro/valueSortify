import PropTypes from 'prop-types';
import { ArrowDownWideNarrow, List, Trophy, LayoutGrid, CreditCard, Keyboard, ArrowRight } from 'lucide-react';
import { useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

const STORAGE_KEY = 'vs-onboarding-seen';

function hasSeenOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markOnboardingSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch { /* localStorage may be unavailable */ }
}

const phases = [
  {
    Icon: ArrowDownWideNarrow,
    title: 'Sort',
    description: 'Categorize 83 values as Very Important, Important, or Not Important',
    color: 'text-ember',
    bg: 'bg-ember/10',
  },
  {
    Icon: List,
    title: 'Rank',
    description: 'Drag to reorder values within each category by priority',
    color: 'text-moss',
    bg: 'bg-moss/10',
  },
  {
    Icon: Trophy,
    title: 'Results',
    description: 'See your personal values hierarchy and export it',
    color: 'text-ink',
    bg: 'bg-sky/30',
  },
];

export function WelcomeTour({ onDismiss }) {
  const handleStart = () => {
    markOnboardingSeen();
    onDismiss();
  };
  const handleClose = useCallback(() => handleStart(), [onDismiss]);
  const trapRef = useFocusTrap(handleClose);

  return (
    <div ref={trapRef} className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-md w-full shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-sand px-6 pt-6 pb-4 text-center">
          <h2 id="welcome-title" className="text-2xl font-display font-bold text-ink">
            Welcome to Value Sort
          </h2>
          <p className="text-sm text-ink/50 font-body mt-1">
            Discover what matters most to you in three steps
          </p>
        </div>

        {/* Phases */}
        <div className="px-6 py-5 space-y-3">
          {phases.map((phase, i) => (
            <div key={phase.title} className="flex items-start gap-3">
              <div className={`${phase.bg} rounded-full p-2 shrink-0`}>
                <phase.Icon size={16} className={phase.color} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-ink">
                  {i + 1}. {phase.title}
                </p>
                <p className="text-xs text-ink/50 font-body">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="px-6 pb-5">
          <div className="bg-sand/60 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-display font-semibold text-ink/70 uppercase tracking-wide">
              Tips
            </p>
            <div className="flex items-center gap-2 text-xs text-ink/60 font-body">
              <CreditCard size={14} className="shrink-0 text-ink/40" aria-hidden="true" />
              <span><strong>Card view</strong> shows one value at a time for focused sorting</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ink/60 font-body">
              <LayoutGrid size={14} className="shrink-0 text-ink/40" aria-hidden="true" />
              <span><strong>Grid view</strong> lets you see and search all values at once</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ink/60 font-body">
              <Keyboard size={14} className="shrink-0 text-ink/40" aria-hidden="true" />
              <span>
                Use <kbd className="px-1 py-0.5 bg-white/80 border border-black/10 rounded text-[10px] font-mono">Q</kbd>{' '}
                <kbd className="px-1 py-0.5 bg-white/80 border border-black/10 rounded text-[10px] font-mono">W</kbd>{' '}
                <kbd className="px-1 py-0.5 bg-white/80 border border-black/10 rounded text-[10px] font-mono">E</kbd> keys for quick sorting
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            autoFocus
            onClick={handleStart}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-ember text-white rounded-full font-medium text-sm hover:bg-ember/90 transition-colors shadow-card font-body"
          >
            Let&apos;s Start
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

WelcomeTour.hasSeenOnboarding = hasSeenOnboarding;
WelcomeTour.markOnboardingSeen = markOnboardingSeen;

WelcomeTour.propTypes = {
  onDismiss: PropTypes.func.isRequired,
};
