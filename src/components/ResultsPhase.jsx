import { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Download, ChevronDown, RotateCcw, Trophy } from 'lucide-react';
import { buildCSV, buildJSONExport } from '../lib/export';

function ResultGroup({ title, color, borderColor, bgColor, textColor, values }) {
  if (values.length === 0) return null;

  return (
    <div className={`border rounded-2xl p-4 md:p-6 ${borderColor} ${bgColor} backdrop-blur-sm`}>
      <h3 className={`text-lg font-display font-semibold mb-4 flex items-center gap-2 ${textColor}`}>
        <div className={`w-4 h-4 ${color} rounded`} aria-hidden="true" />
        {title}
        <span className="text-sm font-body font-normal opacity-70">({values.length})</span>
      </h3>
      <ol className="space-y-2">
        {values.map((value, index) => (
          <li key={value.id} className="flex items-start gap-3">
            <span className={`text-sm font-bold mt-0.5 w-6 text-right shrink-0 ${textColor} opacity-60 font-body`}>
              {index + 1}.
            </span>
            <div>
              <span className={`font-medium text-sm font-body ${textColor}`}>{value.name}</span>
              <span className="text-xs text-ink/50 ml-2 font-body">{value.description}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ResultsPhase({ state, save, reset }) {
  const [showExport, setShowExport] = useState(false);

  const exportJSON = () => {
    const data = buildJSONExport(state, new Date().toISOString());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    download(blob, 'personal-values-results.json');
  };

  const exportCSV = () => {
    const csv = buildCSV(state);
    const blob = new Blob([csv], { type: 'text/csv' });
    download(blob, 'personal-values-results.csv');
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { applyPlugin } = await import('jspdf-autotable');
    applyPlugin(jsPDF);

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Personal Values Assessment Results', 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

    let y = 60;
    const addSection = (title, values, rgb) => {
      if (values.length === 0) return;
      doc.setFontSize(16);
      doc.setTextColor(...rgb);
      doc.text(title, 20, y);
      y += 10;
      const body = values.map((v, i) => [(i + 1).toString(), v.name, v.description]);
      doc.autoTable({
        head: [['Rank', 'Value', 'Description']],
        body,
        startY: y,
        headStyles: { fillColor: rgb },
        margin: { left: 20, right: 20 },
      });
      y = doc.lastAutoTable.finalY + 15;
    };

    addSection('Very Important Values', state.veryImportant, [232, 93, 47]);
    addSection('Important Values', state.important, [67, 106, 90]);
    addSection('Not Important Values', state.notImportant, [201, 214, 223]);

    doc.save('personal-values-results.pdf');
  };

  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl p-6 mb-8 shadow-card">
        <h2 className="text-2xl font-display font-bold mb-2 flex items-center gap-3 text-ink">
          <Trophy className="text-ember" size={24} />
          Your Personal Values Hierarchy
        </h2>
        <p className="text-ink/50 mb-6 font-body">
          Below are all your values ranked from most important to least important.
        </p>

        <div className="space-y-6">
          <ResultGroup
            title="Very Important Values"
            values={state.veryImportant}
            color="bg-ember"
            borderColor="border-ember/20"
            bgColor="bg-ember/5"
            textColor="text-ink"
          />
          <ResultGroup
            title="Important Values"
            values={state.important}
            color="bg-moss"
            borderColor="border-moss/20"
            bgColor="bg-moss/5"
            textColor="text-ink"
          />
          <ResultGroup
            title="Not Important Values"
            values={state.notImportant}
            color="bg-sky"
            borderColor="border-sky/50"
            bgColor="bg-sky/10"
            textColor="text-ink/70"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => save({ phase: 2 })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm bg-white/80 backdrop-blur-sm border border-black/5 text-ink/70 hover:bg-white transition-colors font-body"
          >
            <ArrowLeft size={16} />
            Back to Ranking
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm bg-white/80 backdrop-blur-sm border border-black/5 text-ink/70 hover:bg-white transition-colors font-body"
          >
            <RotateCcw size={16} />
            Start Over
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              aria-expanded={showExport}
              aria-haspopup="true"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm bg-ember text-white hover:bg-ember/90 shadow-card transition-colors font-body"
            >
              <Download size={16} aria-hidden="true" />
              Export
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            {showExport && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm border border-black/5 rounded-2xl shadow-card z-10 py-1" role="menu" aria-label="Export options">
                <button
                  onClick={() => { exportCSV(); setShowExport(false); }}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm text-ink/70 hover:bg-sand font-body"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => { exportPDF(); setShowExport(false); }}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm text-ink/70 hover:bg-sand font-body"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => { exportJSON(); setShowExport(false); }}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm text-ink/70 hover:bg-sand font-body"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const valuePropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
});

ResultGroup.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(valuePropType).isRequired,
};

ResultsPhase.propTypes = {
  state: PropTypes.shape({
    veryImportant: PropTypes.arrayOf(valuePropType).isRequired,
    important: PropTypes.arrayOf(valuePropType).isRequired,
    notImportant: PropTypes.arrayOf(valuePropType).isRequired,
  }).isRequired,
  save: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};
