import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  Download,
  BookmarkPlus,
  HelpCircle,
} from 'lucide-react';
import { ComplianceDecision, Policy } from '../../shared/types.js';

interface ComplianceCheckerViewProps {
  policies: Policy[];
  onEvaluate: (input: string, policyId?: string, source?: string) => Promise<ComplianceDecision>;
  onSaveReport: (decision: ComplianceDecision) => Promise<void>;
}

const PRESET_EXAMPLES = [
  {
    label: 'Compliant Password (Strong)',
    policyId: 'POL-PWD-001',
    text: `[SYSTEM CREDENTIAL PROVISIONING]
User identity: sarah.connor@acme-defense.internal
Service: Kerberos KDC
New password payload: "V#9xL@77qZ$kM2"
Entropy: 88.4 bits, no dictionary word present.`,
  },
  {
    label: 'Non-Compliant Password (Trivial)',
    policyId: 'POL-PWD-001',
    text: `[AUTH CHANGE LOG]
Username: john.doe
Updated password: "password123"
Status: pending sync`,
  },
  {
    label: 'PII Exposure (Plaintext SSN)',
    policyId: 'POL-PII-002',
    text: `[CUSTOMER ONBOARDING RECORD]
Applicant: Johnathan Miller
Date of Birth: 1984-07-12
Social Security Number: 123-45-6789
Verified by clerk: branch-agent-441`,
  },
  {
    label: 'Data Retention Violation (Indefinite)',
    policyId: 'POL-RET-003',
    text: `[DATA RETENTION POLICY DIRECTIVE v3]
Scope: Global Payment Ledger & Customer Billing Audits
Directive: All customer financial logs and transaction history shall be stored indefinitely in cold storage archives without periodic deletion or purge schedule.`,
  },
  {
    label: 'Access Control Breach (MFA Disabled)',
    policyId: 'POL-ACC-004',
    text: `[IAM POLICY AUDIT REPORT]
Account Name: root-devops-admin
Role: SuperAdmin (Full Administrative Privileges)
Multi-Factor Authentication (MFA): Disabled
Last Login: 2026-09-18T10:14:00Z from IP 192.168.1.104`,
  },
  {
    label: 'Ambiguous Payload (Needs Review)',
    policyId: 'POL-PII-002',
    text: `[SUPPORT TICKET #88412]
Customer stated: "Please check my profile reference REF-9941."
Attached identifier hash: "abf019c0de94".
No explicit national identifier or biometric parameters provided.`,
  },
];

export const ComplianceCheckerView: React.FC<ComplianceCheckerViewProps> = ({
  policies,
  onEvaluate,
  onSaveReport,
}) => {
  const [inputText, setInputText] = useState(PRESET_EXAMPLES[0].text);
  const [targetPolicyId, setTargetPolicyId] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<ComplianceDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportSaved, setReportSaved] = useState(false);
  const [expandedTraceStep, setExpandedTraceStep] = useState<number | null>(4); // Step 4 (Deterministic rules) expanded by default
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunEvaluation = async () => {
    if (!inputText.trim()) {
      setError('Please provide text or upload a document to evaluate.');
      return;
    }
    setError(null);
    setLoading(true);
    setReportSaved(false);

    try {
      const result = await onEvaluate(
        inputText,
        targetPolicyId === 'ALL' ? undefined : targetPolicyId,
        fileName ? 'file_upload' : 'direct_text'
      );
      setDecision(result);
    } catch (err: any) {
      setError(err.message || 'Compliance evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setInputText(content || '');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        setInputText(content || '');
      };
      reader.readAsText(file);
    }
  };

  const handleSaveReportClick = async () => {
    if (!decision) return;
    try {
      await onSaveReport(decision);
      setReportSaved(true);
    } catch (err: any) {
      alert('Failed to save report: ' + err.message);
    }
  };

  const handleExportJSON = () => {
    if (!decision) return;
    const blob = new Blob([JSON.stringify(decision, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_decision_${decision.id}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Interactive Compliance Checker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit text, configurations, or documents to execute the 8-stage zero-trust deterministic + AI compliance workflow.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            LLM Non-Override Guaranteed
          </span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Quick-Load Test Scenarios
          </span>
          <span className="text-[11px] text-slate-400">Click to populate workspace</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_EXAMPLES.map((preset, idx) => (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              onClick={() => {
                setInputText(preset.text);
                setTargetPolicyId(preset.policyId);
                setFileName(null);
                setDecision(null);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-xs font-medium text-slate-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form & Scope Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-semibold text-slate-700">Policy Scope:</label>
              <select
                value={targetPolicyId}
                onChange={(e) => setTargetPolicyId(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 py-1.5 px-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="ALL">Auto-Detect Applicable Policies ({policies.length} Active)</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.json,.csv,.md,.log"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{fileName ? `Uploaded: ${fileName}` : 'Upload Document'}</span>
              </button>
              {fileName && (
                <button
                  onClick={() => {
                    setFileName(null);
                    setInputText('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Text Area with Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500"
          >
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste text, log entries, credential records, or drag & drop a file (.txt, .json, .csv, .log)..."
              className="w-full p-4 text-xs font-mono text-slate-800 bg-slate-50/30 focus:outline-none resize-y leading-relaxed"
            />
            <div className="bg-slate-100/80 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>
                {inputText.length} characters &middot; {inputText.split('\n').length} lines
              </span>
              <span>Supported: TXT, JSON, Markdown, Logs</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setInputText('');
                setFileName(null);
                setDecision(null);
              }}
              className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Input</span>
            </button>

            <button
              id="btn-run-agent"
              onClick={handleRunEvaluation}
              disabled={loading}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
                loading
                  ? 'bg-emerald-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Agent Workflow...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Compliance Agent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Decision Results Display */}
      {decision && (
        <div className="space-y-6 pt-2">
          {/* Prominent Status Banner */}
          <div
            className={`rounded-2xl p-6 border shadow-sm transition-all ${
              decision.finalStatus === 'COMPLIANT'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : decision.finalStatus === 'NON_COMPLIANT'
                ? 'bg-red-950 text-white border-red-800'
                : 'bg-amber-950 text-white border-amber-800'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
                    decision.finalStatus === 'COMPLIANT'
                      ? 'bg-emerald-500/30 border border-emerald-400/40 text-emerald-300'
                      : decision.finalStatus === 'NON_COMPLIANT'
                      ? 'bg-red-500/30 border border-red-400/40 text-red-300'
                      : 'bg-amber-500/30 border border-amber-400/40 text-amber-300'
                  }`}
                >
                  {decision.finalStatus === 'COMPLIANT' ? (
                    <ShieldCheck className="w-7 h-7 text-emerald-300" />
                  ) : decision.finalStatus === 'NON_COMPLIANT' ? (
                    <ShieldAlert className="w-7 h-7 text-red-300" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-amber-300" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300">
                      Audit Ref: {decision.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-200">
                      Latency: {decision.latencyMs}ms
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-200">
                      Reasoning: {decision.modelUsed}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight">
                    FINAL STATUS:{' '}
                    <span
                      className={
                        decision.finalStatus === 'COMPLIANT'
                          ? 'text-emerald-300'
                          : decision.finalStatus === 'NON_COMPLIANT'
                          ? 'text-red-300'
                          : 'text-amber-300'
                      }
                    >
                      {decision.finalStatus}
                    </span>
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {decision.deterministicSummary}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                <button
                  id="btn-save-report"
                  onClick={handleSaveReportClick}
                  disabled={reportSaved}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    reportSaved
                      ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{reportSaved ? 'Report Saved' : 'Save Report'}</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Human Review Callout Box if required */}
            {decision.humanReviewRequired && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs text-amber-100 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200">Human Review Mandatory:</strong>{' '}
                  {decision.humanReviewReason ||
                    'Deterministic criteria were inconclusive or ambiguous in the provided text. A compliance officer must manually audit the payload.'}
                </div>
              </div>
            )}
          </div>

          {/* 8-Step Interactive Agent Execution Trace */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>8-Step Agent Execution Trace</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Step-by-step audit record from input parsing to deterministic evaluation & audit logging
                </p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                Total Latency: <strong>{decision.latencyMs}ms</strong>
              </span>
            </div>

            <div className="space-y-2">
              {decision.executionTrace.map((step) => {
                const isExpanded = expandedTraceStep === step.step;
                return (
                  <div
                    key={step.step}
                    className="border border-slate-200 rounded-lg overflow-hidden text-xs transition-colors"
                  >
                    <button
                      onClick={() => setExpandedTraceStep(isExpanded ? null : step.step)}
                      className="w-full px-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {step.step}
                        </span>
                        <span className="font-semibold text-slate-900">{step.name}</span>
                        <span className="text-slate-500 text-[11px] hidden sm:inline">
                          &mdash; {step.outputSummary}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400 font-mono flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.latencyMs}ms
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                        <p className="text-slate-600 text-xs">{step.description}</p>
                        <div className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px] overflow-x-auto">
                          <pre>{JSON.stringify(step.details || { output: step.outputSummary }, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clear Distinction: Deterministic Rule Results vs AI Explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Deterministic Evaluation Table */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase">
                      Deterministic Core
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Rule Evaluation Registry</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated algorithmically without LLM hallucination or override
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {decision.rulesEvaluated.length} rules checked
                </span>
              </div>

              <div className="space-y-3">
                {decision.rulesEvaluated.map((r) => (
                  <div
                    key={r.rule_id}
                    className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                      r.status === 'PASS'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : r.status === 'FAIL'
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">{r.rule_id}</span>
                          <span className="font-medium text-slate-800">{r.rule_name}</span>
                          {r.isMandatory && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Mandatory
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                          r.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : r.status === 'FAIL'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <p className="text-slate-700 text-xs">{r.reason}</p>

                    {r.evidence && (
                      <div className="bg-white/80 p-2 rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                        <span className="text-slate-400 mr-1 font-sans font-semibold">Evidence:</span>
                        {r.evidence}
                      </div>
                    )}

                    {r.status !== 'PASS' && (
                      <div className="text-[11px] text-red-800 bg-red-100/60 p-2 rounded border border-red-200">
                        <strong>Remediation:</strong> {r.remediation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation & Remediation Narrative */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900 uppercase flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Narrative</span>
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">Explanation & Remediation</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Natural language interpretation synthesized by {decision.modelUsed}
                </p>
              </div>

              <div className="prose prose-sm text-xs text-slate-700 space-y-3 leading-relaxed">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line">
                  {decision.explanation}
                </div>

                {/* Recommended Remediation Summary */}
                {decision.recommendedRemediation.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Required Corrective Actions:
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                      {decision.recommendedRemediation.map((rem, i) => (
                        <li key={i}>{rem}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
