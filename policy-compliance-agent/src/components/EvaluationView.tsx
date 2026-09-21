import React, { useState } from 'react';
import {
  BarChart3,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Search,
  Filter,
  Eye,
  Info,
  Layers,
} from 'lucide-react';
import { EvaluationMetrics, EvaluationResultRow } from '../../shared/types.js';

interface EvaluationViewProps {
  metrics: EvaluationMetrics | null;
  loading: boolean;
  onRunSuite: () => Promise<void>;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ metrics, loading, onRunSuite }) => {
  const [running, setRunning] = useState(false);
  const [filterResult, setFilterResult] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<EvaluationResultRow | null>(null);

  const handleRunClick = async () => {
    setRunning(true);
    try {
      await onRunSuite();
    } catch (err: any) {
      alert('Suite execution error: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  const filteredRows = (metrics?.resultsTable || []).filter((row) => {
    const matchesFilter = filterResult === 'ALL' || row.result === filterResult;
    const matchesSearch =
      row.testCaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.expected.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.actual.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Automated Evaluation Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Benchmark the compliance agent against the verified synthetic test suite to evaluate accuracy, precision, recall, and rule parity.
          </p>
        </div>

        <button
          id="btn-run-eval-suite"
          onClick={handleRunClick}
          disabled={running || loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all self-start sm:self-auto ${
            running || loading
              ? 'bg-emerald-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99]'
          }`}
        >
          {running ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Executing Evaluation Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Automated Evaluation Suite</span>
            </>
          )}
        </button>
      </div>

      {metrics && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Overall Accuracy
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold text-emerald-600">{metrics.accuracy}%</span>
                <span className="text-xs text-slate-500">
                  ({metrics.passCount}/{metrics.totalTestCases})
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Exact expected vs actual matches</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Precision
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.precision}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">True Violations / Total Detected</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Recall
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.recall}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">True Violations / Expected</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                F1 Score
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.f1Score}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Harmonic mean of precision & recall</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Needs Review Rate
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold text-amber-600">{metrics.needsReviewRate}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Dispatched to human review</p>
            </div>
          </div>

          {/* Confusion Matrix & Rule Accuracy Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Confusion Matrix Card */}
            <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Confusion Matrix (Violation Detection)
                </h3>
                <span className="text-[11px] text-slate-400">Binary Classification</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <div className="text-[11px] text-emerald-800 font-semibold">True Positives (TP)</div>
                  <div className="text-xl font-bold text-emerald-900 mt-1">
                    {metrics.confusionMatrix.truePositives}
                  </div>
                  <div className="text-[10px] text-emerald-700">Correctly identified non-compliant</div>
                </div>

                <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                  <div className="text-[11px] text-red-800 font-semibold">False Positives (FP)</div>
                  <div className="text-xl font-bold text-red-900 mt-1">
                    {metrics.confusionMatrix.falsePositives}
                  </div>
                  <div className="text-[10px] text-red-700">Compliant misclassified as violation</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-700 font-semibold">False Negatives (FN)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {metrics.confusionMatrix.falseNegatives}
                  </div>
                  <div className="text-[10px] text-slate-500">Missed violations</div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <div className="text-[11px] text-emerald-800 font-semibold">True Negatives (TN)</div>
                  <div className="text-xl font-bold text-emerald-900 mt-1">
                    {metrics.confusionMatrix.trueNegatives}
                  </div>
                  <div className="text-[10px] text-emerald-700">Correctly confirmed compliant</div>
                </div>
              </div>
            </div>

            {/* Rule-Level Accuracy Breakdown */}
            <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Rule-Level Parity & Accuracy
                </h3>
                <span className="text-[11px] text-slate-400">Deterministic Rule Assertions</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {Object.entries(metrics.ruleLevelAccuracy).map(([ruleId, acc]) => (
                  <div
                    key={ruleId}
                    className="p-2 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <span className="font-mono text-[11px] font-semibold text-slate-700">{ruleId}</span>
                    <span
                      className={`font-bold text-[11px] ${
                        acc === 100 ? 'text-emerald-600' : acc >= 80 ? 'text-amber-600' : 'text-red-600'
                      }`}
                    >
                      {acc}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comprehensive Evaluation Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                  Evaluation Comparison Table
                </h3>
                <span className="text-slate-400">({filteredRows.length} cases shown)</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search test cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-2 py-1 rounded border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center space-x-1 border border-slate-200 rounded p-0.5 bg-slate-50">
                  <button
                    onClick={() => setFilterResult('ALL')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      filterResult === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    All ({metrics.resultsTable.length})
                  </button>
                  <button
                    onClick={() => setFilterResult('PASS')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      filterResult === 'PASS' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    Pass ({metrics.passCount})
                  </button>
                  <button
                    onClick={() => setFilterResult('FAIL')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      filterResult === 'FAIL' ? 'bg-red-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    Fail ({metrics.failCount})
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Test Case</th>
                    <th className="py-3 px-4">Scenario Description</th>
                    <th className="py-3 px-4">Expected Status</th>
                    <th className="py-3 px-4">Actual Agent Status</th>
                    <th className="py-3 px-4">Verdict</th>
                    <th className="py-3 px-4">Rule Accuracy</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRows.map((row) => (
                    <tr key={row.testCaseId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {row.testCaseId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{row.title}</div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          {row.tag.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-semibold text-slate-700">
                          {row.expected}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            row.actual === 'COMPLIANT'
                              ? 'text-emerald-700'
                              : row.actual === 'NON_COMPLIANT'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {row.actual}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            row.result === 'PASS'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                          }`}
                        >
                          {row.result === 'PASS' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                          <span>{row.result}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        <span className={row.ruleMatchAccuracy === 100 ? 'text-emerald-600' : 'text-amber-600'}>
                          {row.ruleMatchAccuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRow(row)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600"
                          title="Inspect evaluation details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Row Details Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>Evaluation Details: {selectedRow.testCaseId}</span>
              </h3>
              <button
                onClick={() => setSelectedRow(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-semibold text-slate-600">Scenario Title:</span>
                <p className="text-slate-900 font-medium mt-0.5">{selectedRow.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold">Expected Status:</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedRow.expected}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Actual Status:</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedRow.actual}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-600">Expected Rule Violations:</span>
                <div className="mt-1 flex flex-wrap gap-1 font-mono text-[11px]">
                  {selectedRow.expectedViolations.length === 0 ? (
                    <span className="text-slate-400">None (Compliant)</span>
                  ) : (
                    selectedRow.expectedViolations.map((v) => (
                      <span key={v} className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded">
                        {v}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-600">Actual Rule Violations Detected:</span>
                <div className="mt-1 flex flex-wrap gap-1 font-mono text-[11px]">
                  {selectedRow.actualViolations.length === 0 ? (
                    <span className="text-slate-400">None (Compliant)</span>
                  ) : (
                    selectedRow.actualViolations.map((v) => (
                      <span key={v} className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded">
                        {v}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-600">Deterministic Engine Explanation:</span>
                <p className="mt-1 p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedRow.explanation}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
