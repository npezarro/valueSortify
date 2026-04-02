import { useState } from 'react';
import { ArrowDownWideNarrow, List, Trophy, Check } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SortingPhase } from './components/SortingPhase';
import { RankingPhase } from './components/RankingPhase';
import { ResultsPhase } from './components/ResultsPhase';
import { WelcomeTour } from './components/WelcomeTour';
import { ALL_VALUES } from './values';

const PHASE_INFO = {
  1: {
    title: 'Phase 1: Sort Your Values',
    description:
      'Sort each personal value into one of three categories based on how important it is to you.',
    Icon: ArrowDownWideNarrow,
  },
  2: {
    title: 'Phase 2: Rank Within Categories',
    description:
      'Drag values within each category to rank them. Place the most important values at the top.',
    Icon: List,
  },
  3: {
    title: 'Phase 3: Your Results',
    description:
      'Review your complete personal values hierarchy. Export or start over.',
    Icon: Trophy,
  },
};

export default function App() {
  const { state, save, reset, justSaved } = useLocalStorage();
  const phase = state.phase || 1;
  const info = PHASE_INFO[phase];
  const progress = (phase / 3) * 100;

  const sortedCount =
    state.veryImportant.length + state.important.length + state.notImportant.length;

  const [showTour, setShowTour] = useState(
    () => phase === 1 && sortedCount === 0 && !WelcomeTour.hasSeenOnboarding(),
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-ink">
                Personal Values Card Sort
              </h1>
              <p className="text-ink/50 mt-1 text-sm md:text-base font-body">
                Discover and prioritize what matters most to you
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-sm text-ink/50 font-body">
                Phase {phase} of 3
                {phase === 1 && ` — ${sortedCount}/${ALL_VALUES.length} sorted`}
              </span>
              {justSaved && (
                <span className="flex items-center gap-1 text-xs text-moss font-body animate-fade-in" role="status">
                  <Check size={12} aria-hidden="true" />
                  Saved
                </span>
              )}
              <div className="bg-sky/50 rounded-full h-2 w-32" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Phase ${phase} of 3 progress`}>
                <div
                  className="bg-ember h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Phase instructions */}
        <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl p-5 mb-6 shadow-card">
          <div className="flex items-start gap-3">
            <info.Icon className="text-ember shrink-0 mt-0.5" size={20} aria-hidden="true" />
            <div>
              <h2 className="text-lg font-display font-semibold mb-1 text-ink">{info.title}</h2>
              <p className="text-sm text-ink/50 font-body">{info.description}</p>
              {phase === 1 && (
                <div className="flex flex-wrap gap-4 mt-3 text-xs font-body">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-ember rounded" aria-hidden="true" />
                    <span className="text-ink/60">Core values that define who you are</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-moss rounded" aria-hidden="true" />
                    <span className="text-ink/60">Values that matter but aren&apos;t central</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-sky rounded" aria-hidden="true" />
                    <span className="text-ink/60">Values that don&apos;t resonate with you</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile progress */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/50 font-body">
              Phase {phase}/3
              {phase === 1 && ` — ${sortedCount}/${ALL_VALUES.length}`}
            </span>
            <div className="flex-1 bg-sky/50 rounded-full h-1.5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Phase ${phase} of 3 progress`}>
              <div
                className="bg-ember h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Phase content */}
        <div aria-live="polite">
          {phase === 1 && <SortingPhase state={state} save={save} reset={reset} />}
          {phase === 2 && <RankingPhase state={state} save={save} reset={reset} />}
          {phase === 3 && <ResultsPhase state={state} save={save} reset={reset} />}
        </div>
      </main>

      {showTour && <WelcomeTour onDismiss={() => setShowTour(false)} />}
    </div>
  );
}
