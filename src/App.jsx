import { ArrowDownWideNarrow, List, Trophy } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SortingPhase } from './components/SortingPhase';
import { RankingPhase } from './components/RankingPhase';
import { ResultsPhase } from './components/ResultsPhase';
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
  const { state, save, reset } = useLocalStorage();
  const phase = state.phase || 1;
  const info = PHASE_INFO[phase];
  const progress = (phase / 3) * 100;

  const sortedCount =
    state.veryImportant.length + state.important.length + state.notImportant.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Personal Values Card Sort
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Discover and prioritize what matters most to you
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Phase {phase} of 3
                {phase === 1 && ` — ${sortedCount}/${ALL_VALUES.length} sorted`}
              </span>
              <div className="bg-gray-200 rounded-full h-2 w-32" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Phase ${phase} of 3 progress`}>
                <div
                  className="bg-gray-900 h-2 rounded-full transition-all duration-300"
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
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <info.Icon className="text-gray-900 shrink-0 mt-0.5" size={20} aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold mb-1">{info.title}</h2>
              <p className="text-sm text-gray-500">{info.description}</p>
              {phase === 1 && (
                <div className="flex flex-wrap gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-500 rounded" aria-hidden="true" />
                    <span>Core values that define who you are</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-500 rounded" aria-hidden="true" />
                    <span>Values that matter but aren&apos;t central</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-gray-400 rounded" aria-hidden="true" />
                    <span>Values that don&apos;t resonate with you</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile progress */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Phase {phase}/3
              {phase === 1 && ` — ${sortedCount}/${ALL_VALUES.length}`}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Phase ${phase} of 3 progress`}>
              <div
                className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
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
    </div>
  );
}
