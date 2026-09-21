import React, { useState } from 'react';
import {
  Database,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { Policy, SyntheticTestCase } from '../../shared/types.js';

interface SyntheticGeneratorViewProps {
  policies: Policy[];
  testCases: SyntheticTestCase[];
  loading: boolean;
  onGenerate: (params: {
    policyId?: string;
    count?: number;
    compliantPct?: number;
    nonCompliantPct?: number;
    edgeCasesCount?: number;
  }) => Promise<void>;
  onReset: () => Promise<void>;
  onNavigateToEvaluation: () => void;
}

export const SyntheticGeneratorView: React.FC<SyntheticGeneratorViewProps> = ({
  policies,
  testCases,
  loading,
  onGenerate,
  onReset,
  onNavigateToEvaluation,
}) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('ALL');
  const [recordCount, setRecordCount] = useState<number>(10);
  const [compliantPct, setCompliantPct] = useState<number>(50);
  const [edgeCasesCount, setEdgeCasesCount] = useState<number>(2);
  const [generating, setGenerating] = useState(false);

  // Filter state for records table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const nonCompliantPct = Math.max(0, 100 - compliantPct);

  const handleGenerateClick = async () => {
    setGenerating(true);
    try {
      await onGenerate({
        policyId: selectedPolicyId,
        count: recordCount,
        compliantPct,
        nonCompliantPct,
        edgeCasesCount,
      });
    } catch (err: any) {
      alert('Generation error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyInput = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(testCases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthetic_compliance_testcases_${Date.now()}.json`;
    a.click();
  };

  const filteredCases = testCases.filter((tc) => {
    const matchesSearch =
      tc.test_case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.policy_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || tc.expected_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>Synthetic Compliance Data Generator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Synthesize realistic boundary scenarios, edge cases, and policy violations without exposing real personal information.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-export-cases"
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-950">Zero Real PII Guarantee:</span>
          <p className="text-amber-800 leading-relaxed">
            All records generated or benchmarked in this system are strictly synthetic test patterns (e.g. simulated tokens, mock SSNs, test credential hashes). No genuine user data is processed or stored.
          </p>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Synthetic Parameter Configuration</span>
          </h2>
          <span className="text-xs text-slate-400">Total in Database: {testCases.length} records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Target Policy */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Target Policy:</label>
            <select
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ALL">All Active Policies (Distributed)</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          {/* Number of Records */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Records to Generate:</span>
              <span className="text-emerald-700">{recordCount}</span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              value={recordCount}
              onChange={(e) => setRecordCount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Compliant vs Non-Compliant Ratio */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Compliant Ratio:</span>
              <span className="text-emerald-700">{compliantPct}% ({nonCompliantPct}% Violations)</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={compliantPct}
              onChange={(e) => setCompliantPct(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Edge Cases Count */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Edge Cases / Boundary:</span>
              <span className="text-amber-700">{edgeCasesCount}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              value={edgeCasesCount}
              onChange={(e) => setEdgeCasesCount(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={onNavigateToEvaluation}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Go to Evaluation Suite with current dataset &rarr;</span>
          </button>

          <button
            id="btn-generate-synthetic"
            onClick={handleGenerateClick}
            disabled={generating}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
              generating
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99]'
            }`}
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Records...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Synthetic Records</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dataset Explorer / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            <input
              type="text"
              placeholder="Search records by ID, title, payload snippet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 py-1.5 px-3 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ALL">All Statuses ({testCases.length})</option>
              <option value="COMPLIANT">Compliant Only</option>
              <option value="NON_COMPLIANT">Non-Compliant Only</option>
              <option value="NEEDS_REVIEW">Needs Review Only</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Test Case ID</th>
                <th className="py-3 px-4">Scenario / Title</th>
                <th className="py-3 px-4">Expected Status</th>
                <th className="py-3 px-4">Expected Violations</th>
                <th className="py-3 px-4">Input Payload Excerpt</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCases.map((tc) => (
                <tr key={tc.test_case_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {tc.test_case_id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{tc.title}</div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">{tc.policy_id}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {tc.tag.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        tc.expected_status === 'COMPLIANT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : tc.expected_status === 'NON_COMPLIANT'
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {tc.expected_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {tc.expected_violations.length === 0 ? (
                      <span className="text-slate-400 font-mono text-[11px]">None (Compliant)</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {tc.expected_violations.map((v) => (
                          <span
                            key={v}
                            className="font-mono text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-semibold"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px] text-slate-600">
                    {tc.input}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleCopyInput(tc.test_case_id, tc.input)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="Copy payload to clipboard"
                    >
                      {copiedId === tc.test_case_id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
