import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { ComplianceReport } from '../../shared/types.js';

interface ReportsViewProps {
  reports: ComplianceReport[];
  loading: boolean;
  onNavigateToChecker: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  loading,
  onNavigateToChecker,
}) => {
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(reports[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.domain.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = (report: ComplianceReport) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${report.id}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Auditable Compliance Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official immutable compliance certificates, statutory evidence records, and remediation action plans.
          </p>
        </div>

        <button
          onClick={onNavigateToChecker}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>Generate New Audit Report</span>
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs space-y-3">
          <p>No compliance reports saved yet.</p>
          <button
            onClick={onNavigateToChecker}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
          >
            Run an evaluation in Compliance Checker &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reports Sidebar / Master List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search saved reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {filteredReports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                const status = rep.decision.finalStatus;

                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-500 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{rep.id}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                          status === 'COMPLIANT'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : status === 'NON_COMPLIANT'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 line-clamp-1">{rep.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{new Date(rep.generatedAt).toLocaleDateString()}</span>
                      <span>Score: {rep.overallHealthScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Report Detail View (Printable) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            {selectedReport ? (
              <div className="space-y-6 text-xs text-slate-800">
                {/* Actions Toolbar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedReport.id}
                    </span>
                    <span className="text-slate-400 text-xs">Generated {new Date(selectedReport.generatedAt).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => handleExportJSON(selectedReport)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Report Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selectedReport.title}</h2>
                      <p className="text-slate-500">Domain: {selectedReport.domain} &middot; Evaluator: {selectedReport.evaluator}</p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-block px-3 py-1 rounded-lg font-bold text-xs uppercase border ${
                          selectedReport.decision.finalStatus === 'COMPLIANT'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : selectedReport.decision.finalStatus === 'NON_COMPLIANT'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {selectedReport.decision.finalStatus}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Severity: {selectedReport.decision.severity}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statutory Scope & Input Excerpt */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Evaluated Input Excerpt
                  </h4>
                  <p className="font-mono text-[11px] text-slate-700 whitespace-pre-line bg-white p-2.5 rounded border border-slate-200 max-h-36 overflow-y-auto">
                    {selectedReport.decision.fullInput}
                  </p>
                </div>

                {/* Deterministic Rules Evaluated Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Deterministic Rule Evidence Table
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Rule ID</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Severity</th>
                          <th className="py-2.5 px-3">Evidence / Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedReport.decision.rulesEvaluated.map((r) => (
                          <tr key={r.rule_id}>
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.rule_id}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`font-semibold text-[10px] px-1.5 py-0.2 rounded border ${
                                  r.status === 'PASS'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : r.status === 'FAIL'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[11px] font-semibold text-slate-600">{r.severity}</td>
                            <td className="py-2 px-3 text-[11px] text-slate-600">
                              {r.reason} {r.evidence && <span className="font-mono text-slate-800">[{r.evidence}]</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Explanation & Narrative */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Executive Summary & AI Compliance Explanation
                  </h4>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                    {selectedReport.decision.explanation}
                  </div>
                </div>

                {/* Actionable Remediation Plan */}
                {selectedReport.decision.recommendedRemediation.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Prioritized Remediation Guidance
                    </h4>
                    <div className="p-3.5 bg-red-50/50 border border-red-200 rounded-lg space-y-1.5">
                      {selectedReport.decision.recommendedRemediation.map((rem, i) => (
                        <div key={i} className="flex items-start space-x-2 text-red-900">
                          <span className="font-bold text-red-600">{i + 1}.</span>
                          <span>{rem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">Select a report from the sidebar to inspect.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
