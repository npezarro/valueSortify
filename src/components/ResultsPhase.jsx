import { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Download, ChevronDown, RotateCcw, Trophy } from 'lucide-react';
import { buildCSV, buildJSONExport } from '../lib/export';

function ResultGroup({ title, color, borderColor, bgColor, textColor, values }) {
  if (values.length === 0) return null;

  return (
    <div className={`border rounded-lg p-4 md:p-6 ${borderColor} ${bgColor}`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${textColor}`}>
        <div className={`w-4 h-4 ${color} rounded`} aria-hidden="true" />
        {title}
        <span className="text-sm font-normal opacity-70">({values.length})</span>
      </h3>
      <ol className="space-y-2">
        {values.map((value, index) => (
          <li key={value.id} className="flex items-start gap-3">
            <span className={`text-sm font-bold mt-0.5 w-6 text-right shrink-0 ${textColor} opacity-60`}>
              {index + 1}.
            </span>
            <div>
              <span className={`font-medium text-sm ${textColor}`}>{value.name}</span>
              <span className="text-xs text-gray-500 ml-2">{value.description}</span>
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

    addSection('Very Important Values', state.veryImportant, [34, 197, 94]);
    addSection('Important Values', state.important, [59, 130, 246]);
    addSection('Not Important Values', state.notImportant, [107, 114, 128]);

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
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="text-yellow-500" size={24} />
          Your Personal Values Hierarchy
        </h2>
        <p className="text-gray-500 mb-6">
          Below are all your values ranked from most important to least important.
        </p>

        <div className="space-y-6">
          <ResultGroup
            title="Very Important Values"
            values={state.veryImportant}
            color="bg-green-500"
            borderColor="border-green-200"
            bgColor="bg-green-50"
            textColor="text-green-800"
          />
          <ResultGroup
            title="Important Values"
            values={state.important}
            color="bg-blue-500"
            borderColor="border-blue-200"
            bgColor="bg-blue-50"
            textColor="text-blue-800"
          />
          <ResultGroup
            title="Not Important Values"
            values={state.notImportant}
            color="bg-gray-400"
            borderColor="border-gray-200"
            bgColor="bg-gray-50"
            textColor="text-gray-700"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => save({ phase: 2 })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Ranking
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            Start Over
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              aria-expanded={showExport}
              aria-haspopup="true"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm bg-gray-900 text-white hover:bg-gray-800 shadow-md transition-colors"
            >
              <Download size={16} aria-hidden="true" />
              Export
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            {showExport && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1" role="menu" aria-label="Export options">
                <button
                  onClick={() => { exportCSV(); setShowExport(false); }}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => { exportPDF(); setShowExport(false); }}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => { exportJSON(); setShowExport(false); }}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
